import logging
import json
from django.shortcuts import render
from rest_framework import generics,permissions

logger = logging.getLogger(__name__)
from .models import Case,ChatMessage
from users.models import User
from .serializers import CaseSerializer,ChatMessageSerializer
from users.permissions import IsPatient,IsNurse,IsDoctor
from hospitals.models import Hospital
from rest_framework.exceptions import PermissionDenied
from rest_framework import serializers
import random
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.generics import UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from .services.ai_service import AIService,AIServiceError
from .services.prompt_builder import PromptBuilder
from .services.response_parser import ResponseParser,ResponseParserError
from .services.response_validator import ResponseValidator,ResponseValidationError
import traceback
# Create your views here.
# Case API
class CreateCaseView(generics.CreateAPIView):
    serializer_class=CaseSerializer
    permission_classes=[permissions.IsAuthenticated,IsPatient]
    def perform_create(self,serializer):  
        
        hospital=serializer.validated_data.get('hospital')
        #get any any available nurse
        nurse = User.objects.filter(role='NURSE',hospitals=hospital)
        if not nurse.exists():
          raise serializers.ValidationError(
            "No nurse available in this hospital."
        )
        nurse = random.choice(nurse)
        # patient auto-attached to case
        serializer.save(patient=self.request.user,assigned_nurse=nurse,hospital=hospital)

#send message API 
class SendMessageView(generics.CreateAPIView):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

#Get messages of a case
class CaseMessagesView(generics.ListAPIView):
    serializer_class=ChatMessageSerializer
    permission_classes=[permissions.IsAuthenticated]
    def get_queryset(self):
        case_id=self.kwargs['case_id']
        user = self.request.user
        case = get_object_or_404(Case, id=case_id)
        if user not in [case.patient, case.assigned_nurse, case.assigned_doctor]:
           raise PermissionDenied("Not allowed.")       
        return ChatMessage.objects.filter(case_id=case_id).order_by('created_at')
    
#Nurse api
class NurseCaseListView(generics.ListAPIView):
    serializer_class=CaseSerializer
    permission_classes=[permissions.IsAuthenticated,IsNurse]
    def get_queryset(self):
        user=self.request.user
        # only nurse can see
        if user.role !='NURSE':
            return Case.objects.none()
        return Case.objects.filter(status='OPEN', assigned_nurse=self.request.user,
        ).order_by('-created_at')

class PatientCaseListView(generics.ListAPIView):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def get_queryset(self):
        return Case.objects.filter(patient=self.request.user).order_by('-created_at')
    

class CaseDetailView(RetrieveAPIView):
    queryset= Case.objects.all()
    serializer_class=CaseSerializer
    permission_classes=[permissions.IsAuthenticated]
    def get_object(self):
        case = super().get_object()
        user=self.request.user 
        if user not in [case.patient ,case.assigned_nurse,case.assigned_doctor]:
            raise PermissionDenied("Not allowed.")
        return case

class EscalateCaseView(UpdateAPIView):

    permission_classes = [IsAuthenticated, IsNurse]
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    lookup_field = "id"

    def update(self, request, *args, **kwargs):

        case = self.get_object()

        doctor = User.objects.filter(
            role="DOCTOR",
          hospitals=case.hospital
        ).first()

        if not doctor:
            doctor = User.objects.filter(role="DOCTOR").first()

        if not doctor:
            return Response({"error": "No doctor available"}, status=400)

        case.assigned_doctor = doctor
        case.status = "ESCALATED"
        case.save()

        return Response({"message": "Case escalated"})

class DoctorCasesView(generics.ListAPIView):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_queryset(self):
        user = self.request.user
        if user.role != "DOCTOR":
            return Case.objects.none()
        return Case.objects.filter(assigned_doctor=user).order_by("-created_at")

class DoctorUpdateCaseView(UpdateAPIView):

    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
    queryset = Case.objects.all()

    def perform_update(self, serializer):

        case = self.get_object()

        if self.request.user != case.assigned_doctor:
            raise PermissionDenied("Not your case")

        serializer.save()



class CloseCaseView(UpdateAPIView):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated, IsDoctor]
    lookup_field = "id"

    def update(self, request, *args, **kwargs):
        case = self.get_object()

        # ✅ 1. Only assigned doctor can close
        if request.user != case.assigned_doctor:
            raise PermissionDenied("Not your case")

        # ✅ 2. Prevent double closing
        if case.status == "CLOSED":
            return Response({"error": "Case already closed"}, status=400)

        # ✅ 3. Require prescription & capture diagnosis if provided
        prescription = request.data.get("prescription")
        diagnosis = request.data.get("diagnosis")
        if not prescription:
            return Response({"error": "Prescription is required"}, status=400)

        # ✅ 4. Business logic
        case.prescription = prescription
        if diagnosis:
            case.diagnosis = diagnosis
        case.status = "CLOSED"
        case.save()

        return Response({
            "message": "Case closed successfully",
            "case_id": case.id,
            "status": case.status
        })
    
class AIExplainCaseView(APIView):
    permission_classes=[permissions.IsAuthenticated]
    def post(self,request,id):
        user=request.user
        case=get_object_or_404(Case,id=id)
        if user not in [case.patient, case.assigned_nurse, case.assigned_doctor]:
            raise PermissionDenied("Not allowed.")
        if not case.diagnosis :
            return Response(
           {
             "error":
            "Diagnosis not available."
            },status=400)
        if not case.prescription:
            return Response(
           {
             "error":
            "Prescription not available."
            },status=400)
        case_context={
        "title":case.title,
        "description":case.description,
        "diagnosis":case.diagnosis, 
        "prescription":case.prescription
        }
        if case.ai_explanation:
            return Response({"success":True,
                "analysis":case.ai_explanation,"cached":True})
        prompt=PromptBuilder.build_explanation_prompt(case_context)
        try:
            analysis = AIService.generate_explanation_groq(prompt)
            analysis = ResponseParser.parse_json(analysis)
            analysis = ResponseValidator.validate_response(analysis)
            case.ai_explanation = analysis
            case.save(update_fields=["ai_explanation"])
            return Response({"success": True, "analysis": analysis})
        except AIServiceError as e:
            logger.error("AI Service Error in AIExplainCaseView: %s", e)
            return Response({
                "success": False,
                "message": "AI service unavailable. Please try again later.",
            }, status=503)
        except ResponseParserError as e:
            logger.error("Response Parser Error in AIExplainCaseView: %s", e)
            return Response({
                "success": False,
                "message": "Failed to parse AI response. Please try again later.",
            }, status=502)
        except ResponseValidationError as e:
            logger.error("Response Validation Error in AIExplainCaseView: %s", e)
            return Response({
                "success": False,
                "message": "Invalid response format from AI service.",
            }, status=502)
        except Exception as e:
            logger.exception("Unexpected error in AIExplainCaseView")
            return Response({
                "success": False,
                "message": "An unexpected server error occurred.",
            }, status=500)


# -----------------------------------------------------------------------
# NEW VIEW: AIChatView
# POST  case/<id>/ai-chat/
# Permissions: IsAuthenticated + IsPatient (only the case's own patient)
# -----------------------------------------------------------------------
class AIChatView(APIView):
    """
    AI Intake Chat endpoint.

    The patient sends one message at a time.  This view:
      1. Saves the patient's message as a ChatMessage (sender="patient").
      2. Loads all ChatMessage rows for this case in order -- this is the
         "conversation history" the AI needs so it remembers what was already asked.
      3. Prepends a system prompt that defines the AI's role and rules.
      4. Calls Groq with the tool schema attached (tool_choice="auto").
      5a. If Groq replies with text  -> saves an AI ChatMessage, returns
             {"reply": "<text>", "summary_ready": false}
      5b. If Groq calls submit_triage_summary tool -> saves the tool's
             structured arguments into case.ai_summary (JSONField), saves
             a closing ChatMessage, returns
             {"reply": "<closing text>", "summary_ready": true}

    The frontend uses "summary_ready" to know when to show the patient
    "Your information has been collected" and stop the chat input.
    The nurse dashboard uses case.ai_summary to read the structured intake.
    """
    permission_classes = [IsAuthenticated, IsPatient]

    def post(self, request, id):
        user = request.user
        case = get_object_or_404(Case, id=id)

        # Only the case's own patient may use this endpoint.
        if user != case.patient:
            raise PermissionDenied("Only the patient of this case can use AI intake chat.")

        # Case status check: Only prevent chat if case is CLOSED
        if case.status == "CLOSED":
            return Response({"error": "Case is closed. Communication is disabled."}, status=400)

        patient_message = request.data.get("message", "").strip()
        if not patient_message:
            return Response({"error": "Message cannot be empty."}, status=400)

        # ------------------------------------------------------------------
        # Step 1: Persist the patient's message so it becomes part of history.
        # ------------------------------------------------------------------
        ChatMessage.objects.create(
            case=case,
            sender="patient",
            message=patient_message,
        )

        # ------------------------------------------------------------------
        # Step 2: Rebuild the full conversation history from the database.
        # ------------------------------------------------------------------
        db_messages = ChatMessage.objects.filter(case=case).order_by("created_at")

        # ------------------------------------------------------------------
        # Step 3: Prepend the system prompt with full case context.
        # ------------------------------------------------------------------
        system_prompt = PromptBuilder.build_triage_chat_system_prompt(
            case_title=case.title,
            case_description=case.description,
            case_status=case.status,
            assigned_nurse=case.assigned_nurse.username if case.assigned_nurse else None,
            assigned_doctor=case.assigned_doctor.username if case.assigned_doctor else None,
            existing_summary=case.ai_summary,
            diagnosis=case.diagnosis,
            prescription=case.prescription,
        )
        messages = [{"role": "system", "content": system_prompt}]

        for msg in db_messages:
            if msg.sender == "patient":
                messages.append({"role": "user", "content": msg.message})
            elif msg.sender == "ai":
                messages.append({"role": "assistant", "content": msg.message})
            elif msg.sender == "nurse":
                nurse_name = msg.case.assigned_nurse.username if msg.case.assigned_nurse else "Nurse"
                messages.append({"role": "user", "content": f"[NURSE MESSAGE from {nurse_name}]: {msg.message}"})
            elif msg.sender == "doctor":
                doctor_name = msg.case.assigned_doctor.username if msg.case.assigned_doctor else "Doctor"
                messages.append({"role": "user", "content": f"[DOCTOR MESSAGE from {doctor_name}]: {msg.message}"})

        # ------------------------------------------------------------------
        # Step 4: Call Groq with tool calling enabled.
        # ------------------------------------------------------------------
        try:
            result = AIService.chat_with_tools_groq(messages)
        except AIServiceError as e:
            logger.error("AI Service Error in AIChatView: %s", e)
            return Response(
                {"success": False, "message": "AI service unavailable. Please try again later."},
                status=503,
            )
        except Exception as e:
            logger.exception("Unexpected error in AIChatView")
            return Response(
                {"success": False, "message": "An unexpected server error occurred."},
                status=500,
            )

        # ------------------------------------------------------------------
        # Step 5a: AI replied with a plain text response.
        # ------------------------------------------------------------------
        if result["type"] == "message":
            ai_text = result["content"]
            ChatMessage.objects.create(
                case=case,
                sender="ai",
                message=ai_text,
            )
            return Response({
                "reply": ai_text,
                "summary_ready": bool(case.ai_summary),
                "ai_summary": case.ai_summary
            })

        # ------------------------------------------------------------------
        # Step 5b: AI called submit_triage_summary (creates or updates summary).
        # ------------------------------------------------------------------
        if result["type"] == "tool_call" and result["name"] == "submit_triage_summary":
            args = result["arguments"]

            # Merge / update existing ai_summary
            if case.ai_summary and isinstance(case.ai_summary, dict):
                merged_summary = dict(case.ai_summary)
                merged_summary.update(args)
                if "new_updates" in args and isinstance(args["new_updates"], list):
                    prev_updates = case.ai_summary.get("new_updates", [])
                    if isinstance(prev_updates, list):
                        merged_summary["new_updates"] = list(dict.fromkeys(prev_updates + args["new_updates"]))
                case.ai_summary = merged_summary
            else:
                case.ai_summary = args

            severity = args.get("severity_assessment", "low")
            if severity in ["low", "medium", "high", "critical"]:
                case.severity = severity
            case.save(update_fields=["ai_summary", "severity"])
            if severity == "critical":
                closing = (
                    "⚠️ Based on what you've described, this sounds urgent. "
                    "Please seek immediate medical attention or go to the emergency "
                    "room now. Your case has been flagged as critical and a nurse "
                    "has been alerted."
                )
            else:
                summary_txt = args.get("summary_text", "")
                if summary_txt:
                    closing = f"Thank you. I have updated your case summary for the care team: '{summary_txt}'. You may continue communicating here at any time."
                else:
                    closing = "Thank you. I have updated your triage information for your care team. Please stay available."

            ChatMessage.objects.create(
                case=case,
                sender="ai",
                message=closing,
            )

            return Response({
                "reply": closing,
                "summary_ready": True,
                "ai_summary": case.ai_summary
            })

        # Fallback: should never reach here unless the API returns an unexpected type.
        return Response({"error": "Unexpected AI response type."}, status=502)


class HumanChatMessageView(APIView):
    """
    Human Case Chat endpoint: POST /api/triage/case/<case_id>/chat/
    Permissions: IsAuthenticated
    Allowed: Patient, Assigned Nurse, Assigned Doctor
    Status Check: Case must NOT be CLOSED
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, case_id):
        case = get_object_or_404(Case, id=case_id)
        user = request.user

        # 1. Check permission against case assignment
        allowed = [case.patient, case.assigned_nurse, case.assigned_doctor]
        allowed = [u for u in allowed if u is not None]
        if user not in allowed:
            raise PermissionDenied("You are not authorized to communicate in this case chat.")

        # 2. Check case status
        if case.status == "CLOSED":
            return Response(
                {"error": "Case is closed. Communication is disabled."},
                status=400,
            )

        message_text = request.data.get("message", "").strip()
        if not message_text:
            return Response({"error": "Message cannot be empty."}, status=400)

        # 3. Determine sender role
        user_role = getattr(user, "role", "PATIENT").lower()
        if user_role not in ["patient", "nurse", "doctor"]:
            user_role = "patient"

        # 4. Save ChatMessage
        msg = ChatMessage.objects.create(
            case=case,
            sender=user_role,
            message=message_text,
        )

        serializer = ChatMessageSerializer(msg, context={"request": request})
        return Response(serializer.data, status=201)