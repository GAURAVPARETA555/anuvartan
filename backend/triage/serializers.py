from rest_framework import serializers
from .models import Case,ChatMessage
class CaseSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.username', read_only=True)
    
    class Meta:
        model=Case
        fields='__all__'
        read_only_fields=['patient', 'status','created_at','ai_summary']

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_role = serializers.SerializerMethodField()
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ["id", "case", "sender", "sender_role", "sender_name", "message", "created_at"]
        read_only_fields = ["sender", "created_at"]

    def get_sender_role(self, obj):
        return obj.sender.upper() if obj.sender else "UNKNOWN"

    def get_sender_name(self, obj):
        if obj.sender == "patient":
            return obj.case.patient.username
        elif obj.sender == "nurse" and obj.case.assigned_nurse:
            return obj.case.assigned_nurse.username
        elif obj.sender == "doctor" and obj.case.assigned_doctor:
            return obj.case.assigned_doctor.username
        elif obj.sender == "ai":
            return "Anuvartan AI Assistant"
        return obj.sender.capitalize()

    def validate(self, data):
        request = self.context.get("request")
        if not request:
            return data

        case = data.get("case")
        user = request.user

        # Prevent messaging after close
        if case.status == "CLOSED":
            raise serializers.ValidationError("Case is closed.")

        # Allowed users check
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