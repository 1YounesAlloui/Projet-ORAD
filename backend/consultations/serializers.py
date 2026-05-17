from rest_framework import serializers
from .models import Consultation
from appointments.serializers import PatientSerializer
from doctors.serializers import DoctorSerializer
from appointments.serializers import AppointmentSerializer

class ConsultationSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='doctor', read_only=True)
    appointment_details = AppointmentSerializer(source='appointment', read_only=True)

    class Meta:
        model = Consultation
        fields = '__all__'
        read_only_fields = ('patient', 'doctor', 'created_at')

    def validate(self, attrs):
        # Additional validation if needed, e.g. check if appointment is approved
        appointment = attrs.get('appointment')
        if appointment and appointment.status != 'APPROVED':
            raise serializers.ValidationError({"appointment": "Consultation can only be created for approved appointments."})
        return attrs
