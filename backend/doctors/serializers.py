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

    class Meta:
        model = Doctor
        fields = ('id', 'user', 'specialty', 'experience_years', 'consultation_fee', 'bio', 'availabilities')
