from django.urls import path
from users.views import RegisterView
from rest_framework_simplejwt.views import TokenRefreshView
from .serializers import CustomTokenSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer

urlpatterns = [
    path('login/', CustomTokenView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/',RegisterView.as_view(),name='register'),
]
