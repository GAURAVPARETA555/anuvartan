from django.urls import path
from .views import HospitalListCreateView

urlpatterns = [
    path("", HospitalListCreateView.as_view(), name="hospital-list"),
]