from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import User 
class CustomTokenSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['user_id'] = self.user.id
        return data

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model=User 
        fields = ['username','email','password','role','phone','hospitals']
        extra_kwargs={
            'password':{'write_only':True}
        }
        
    def create(self,validated_data):
        user=User.objects.create_user(**validated_data)
        return user