from django.db import models
from users.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment

class Consultation(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='consultation')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='consultations')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='consultations')
    symptoms = models.TextField()
    diagnosis = models.TextField()
    prescription = models.TextField()
    notes = models.TextField(blank=True, null=True)
    consultation_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Consultation for {self.patient} by Dr. {self.doctor.user.last_name} on {self.consultation_date}"
