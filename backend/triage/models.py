from email.policy import default
from django.db import models
from django.conf import settings
from users.models import User
from hospitals.models import Hospital
# Create your models here.
class Case(models.Model):
    STATUS_CHOICES = (
      ('OPEN', 'Open'),
    ('IN_PROGRESS', 'In Progress'),
    ('ESCALATED', 'Escalated'),
    ('CLOSED', 'Closed'),
    )
    SEVERITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    hospital = models.ForeignKey(
    Hospital,
    on_delete=models.CASCADE,
     null=True,
    blank=True
)
    patient = models.ForeignKey(settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,related_name='cases')
    assigned_nurse = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="nurse_cases")
    assigned_doctor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="doctor_cases")

    title = models.CharField(max_length=255)

    description = models.TextField()

    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES,default='low')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    
    ai_summary=models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    diagnosis = models.TextField(blank=True, null=True)
    prescription = models.TextField(blank=True, null=True)
    
    registration_notes = models.TextField(blank=True)
    visit_date = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Case {self.id} -{self.patient.username}"

# chatmessage model 

class ChatMessage(models.Model):
    SENDER_CHOICES = (
        ('patient', 'Patient'),
        ('ai', 'AI'),
        ('nurse', 'Nurse'),
        ('doctor', 'Doctor'),
    )
    case=models.ForeignKey(Case,on_delete=models.CASCADE,related_name='messages')
    sender=models.CharField(max_length=10,choices=SENDER_CHOICES)
    message=models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} - Case {self.case.id}"