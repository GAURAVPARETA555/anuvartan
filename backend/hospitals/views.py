from django.shortcuts import render
from rest_framework import generics,permissions
from .models import Hospital
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .serializers import HospitalSerializer
# Create your views here.
class HospitalListCreateView(generics.ListCreateAPIView):
    queryset=Hospital.objects.all()
    serializer_class=HospitalSerializer
    permission_classes=[IsAuthenticatedOrReadOnly]