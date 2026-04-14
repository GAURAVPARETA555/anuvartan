from rest_framework import serializers
from .models import Case,ChatMessage
class CaseSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.username', read_only=True)
    
    class Meta:
        model=Case
        fields='__all__'
        read_only_fields=['patient', 'status','created_at','ai_summary']

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = "__all__"

    def validate(self, data):
        case = data.get("case")
        user = self.context["request"].user

        # ✅ 1. Prevent messaging after close
        if case.status == "CLOSED":
            raise serializers.ValidationError("Case is closed.")

        # ✅ 2. Allowed users check
        allowed = [
            case.patient,
            case.assigned_nurse,
            case.assigned_doctor
        ]

        allowed = [u for u in allowed if u is not None]

        if user not in allowed:
            raise serializers.ValidationError(
                "You are not allowed to message in this case."
            )

        return data