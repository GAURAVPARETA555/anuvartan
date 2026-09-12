from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from hospitals.models import Hospital
from triage.models import Case, ChatMessage
from unittest.mock import patch

User = get_user_model()

class SharedCaseConversationTests(TestCase):
    def setUp(self):
        self.hospital = Hospital.objects.create(
            name="Central Hospital",
            address="123 Main St",
            city="City Center",
            state="State",
            zip_code="12345",
            phone_number="555-0199"
        )
        
        self.patient = User.objects.create_user(
            username="patient1",
            password="password123",
            role="PATIENT"
        )
        self.patient_b = User.objects.create_user(
            username="patient2",
            password="password123",
            role="PATIENT"
        )
        self.nurse = User.objects.create_user(
            username="nurse1",
            password="password123",
            role="NURSE",
            hospitals=self.hospital
        )
        
        self.doctor = User.objects.create_user(
            username="doctor1",
            password="password123",
            role="DOCTOR",
            hospitals=self.hospital
        )

        self.case = Case.objects.create(
            patient=self.patient,
            assigned_nurse=self.nurse,
            assigned_doctor=self.doctor,
            hospital=self.hospital,
            title="Persistent Fever",
            description="Patient has fever for 2 days.",
            status="OPEN"
        )
        
        self.client = APIClient()

    @patch("triage.views.AIService.chat_with_tools_groq")
    def test_initial_ai_chat_creates_patient_and_ai_messages(self, mock_groq):
        mock_groq.return_value = {
            "type": "message",
            "content": "How high is your temperature?"
        }
        self.client.force_authenticate(user=self.patient)
        
        response = self.client.post(f"/api/triage/case/{self.case.id}/ai-chat/", {"message": "I have fever"})
        self.assertEqual(response.status_code, 200)
        
        messages = ChatMessage.objects.filter(case=self.case).order_by("created_at")
        self.assertEqual(messages.count(), 2)
        self.assertEqual(messages[0].sender, "patient")
        self.assertEqual(messages[0].message, "I have fever")
        self.assertEqual(messages[1].sender, "ai")
        self.assertEqual(messages[1].message, "How high is your temperature?")

    @patch("triage.views.AIService.chat_with_tools_groq")
    def test_ai_remains_available_after_summary_creation(self, mock_groq):
        # Set existing initial summary
        self.case.ai_summary = {
            "chief_complaint": "Fever",
            "duration": "2 days",
            "severity_assessment": "medium",
            "symptoms": ["fever"],
            "summary_text": "Patient has 2-day fever."
        }
        self.case.save()

        mock_groq.return_value = {
            "type": "tool_call",
            "name": "submit_triage_summary",
            "arguments": {
                "chief_complaint": "Persistent fever",
                "symptoms": ["fever", "weakness"],
                "severity_assessment": "medium",
                "summary_text": "Updated triage: fever persisting.",
                "new_updates": ["Fever persists after 4 days"]
            }
        }
        
        self.client.force_authenticate(user=self.patient)
        response = self.client.post(f"/api/triage/case/{self.case.id}/ai-chat/", {"message": "My fever is still 102F today."})
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get("summary_ready"))
        
        # Verify case.ai_summary was updated dynamically
        self.case.refresh_from_db()
        self.assertIn("Fever persists after 4 days", self.case.ai_summary.get("new_updates", []))
        
        # Verify AI messages continue to be stored in the same conversation
        ai_msgs = ChatMessage.objects.filter(case=self.case, sender="ai")
        self.assertTrue(ai_msgs.exists())

    def test_nurse_and_doctor_use_same_chat_thread(self):
        # Nurse sends message
        self.client.force_authenticate(user=self.nurse)
        resp_nurse = self.client.post(f"/api/triage/case/{self.case.id}/chat/", {"message": "Please record temperature."})
        self.assertEqual(resp_nurse.status_code, 201)

        # Doctor sends message
        self.client.force_authenticate(user=self.doctor)
        resp_doc = self.client.post(f"/api/triage/case/{self.case.id}/chat/", {"message": "Take paracetamol."})
        self.assertEqual(resp_doc.status_code, 201)

        # Fetch messages as Patient
        self.client.force_authenticate(user=self.patient)
        resp_msgs = self.client.get(f"/api/triage/messages/{self.case.id}/")
        self.assertEqual(resp_msgs.status_code, 200)
        
        senders = [m["sender"] for m in resp_msgs.data]
        self.assertIn("nurse", senders)
        self.assertIn("doctor", senders)

    def test_closed_case_disables_chat(self):
        self.case.status = "CLOSED"
        self.case.prescription = "Rest and fluids"
        self.case.save()

        self.client.force_authenticate(user=self.patient)
        resp = self.client.post(f"/api/triage/case/{self.case.id}/ai-chat/", {"message": "Hello?"})
        self.assertEqual(resp.status_code, 400)

    def test_unauthorized_patient_cannot_access_other_case(self):
        self.client.force_authenticate(user=self.patient_b)
        resp = self.client.post(f"/api/triage/case/{self.case.id}/ai-chat/", {"message": "Hacking?"})
        self.assertEqual(resp.status_code, 403)
