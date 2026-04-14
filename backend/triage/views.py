from django.shortcuts import render
from rest_framework import generics,permissions
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

        # ✅ 3. Require prescription
        prescription = request.data.get("prescription")
        if not prescription:
            return Response({"error": "Prescription is required"}, status=400)

        # ✅ 4. Business logic
        case.prescription = prescription
        case.status = "CLOSED"
        case.save()

        return Response({
            "message": "Case closed successfully",
            "case_id": case.id,
            "status": case.status
        })