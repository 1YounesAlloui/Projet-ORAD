from rest_framework import serializers
from .models import Appointment
from doctors.serializers import DoctorSerializer
from users.serializers import UserSerializer
from users.models import Patient

class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Patient
        fields = ('id', 'user', 'date_of_birth', 'address', 'medical_history')


class AppointmentSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='doctor', read_only=True)
    consultation_id = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('patient', 'status', 'created_at', 'updated_at')

    def get_consultation_id(self, obj):
        try:
            return obj.consultation.id
        except Exception:
            return None

    def validate(self, data):
        doctor = data.get('doctor')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')

        if doctor and appointment_date and appointment_time:
            # Check for existing appointments (pending or confirmed)
            conflicts = Appointment.objects.filter(
                doctor=doctor,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                status__in=['PENDING_PATIENT', 'EN_ATTENTE', 'APPROVED']
            )
            if self.instance: # If updating an existing appointment
                conflicts = conflicts.exclude(pk=self.instance.pk)
                
            if conflicts.exists():
                raise serializers.ValidationError("The doctor already has an appointment scheduled for this date and time.")
        
        return data

class AppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ('status', 'notes')
