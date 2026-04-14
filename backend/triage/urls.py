from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import CaseDetailView, CloseCaseView, CreateCaseView, DoctorCasesView, PatientCaseListView,SendMessageView,CaseMessagesView,NurseCaseListView,EscalateCaseView, DoctorUpdateCaseView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('create-case/',CreateCaseView.as_view(),name='create-case'),
    path('send-message/',SendMessageView.as_view(),name='send-message'),
    path('messages/<int:case_id>/',CaseMessagesView.as_view(),name='case-messages'),
    path('nurse/cases/',NurseCaseListView.as_view(),name='case-messages'),
     path('create/', CreateCaseView.as_view(), name='create-case'),
    path('my-cases/', PatientCaseListView.as_view(), name='patient-cases'),
    path('case/<int:pk>/',CaseDetailView.as_view(),name='case-detail'),
    path("case/<int:id>/escalate/", EscalateCaseView.as_view()),
    path("doctor/cases/", DoctorCasesView.as_view(), name="doctor-cases"),
    path("case/<int:pk>/update/", DoctorUpdateCaseView.as_view()),
    path("case/<int:id>/close/", CloseCaseView.as_view()),
    
]
