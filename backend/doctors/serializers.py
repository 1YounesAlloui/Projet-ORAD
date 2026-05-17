from rest_framework import serializers
from .models import Doctor, Availability
from users.serializers import UserSerializer

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = '__all__'

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    availabilities = AvailabilitySerializer(many=True, read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = ('id', 'user', 'specialty', 'experience_years', 'consultation_fee', 'bio', 'availabilities', 'full_name')

    def get_full_name(self, obj):
        if obj.user.first_name and obj.user.last_name:
            return f"Dr. {obj.user.first_name} {obj.user.last_name}"
        elif obj.user.first_name:
            return f"Dr. {obj.user.first_name}"
        elif obj.user.last_name:
            return f"Dr. {obj.user.last_name}"
        return f"Dr. {obj.user.username}"
