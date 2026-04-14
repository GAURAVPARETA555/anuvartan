from django.db import models
from django.contrib.auth.models import AbstractUser
from hospitals.models import Hospital
# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
          ('PATIENT', 'Patient'),
    ('NURSE', 'Nurse'),
    ('DOCTOR', 'Doctor'),
    )
    role = models.CharField(max_length=10,choices=ROLE_CHOICES)
    phone= models.CharField(max_length=15, null=True,blank=True)
    hospitals=models.ForeignKey(Hospital, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True)
    def __str__(self):
        return self.username

