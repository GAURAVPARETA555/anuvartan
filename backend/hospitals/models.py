from django.db import models

# Create your models here.
class Hospital(models.Model):
    name=models.CharField(max_length=255)
    address=models.CharField(max_length=255)
    city=models.CharField(max_length=100)
    state=models.CharField(max_length=100)
    zip_code=models.CharField(max_length=20)
    phone_number=models.CharField(max_length=20)

    def __str__(self):
        return self.name