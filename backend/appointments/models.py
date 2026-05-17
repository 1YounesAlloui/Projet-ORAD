from django.db import models
from users.models import Patient
from doctors.models import Doctor

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('PENDING_PATIENT', 'Pending (Patient)'),
        ('EN_ATTENTE', 'En Attente (Assistant)'),
        ('APPROVED', 'Approved (Doctor)'),
        ('REJECTED', 'Rejected (Doctor)'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    
    # Detailed patient information for the appointment form
    patient_nom = models.CharField(max_length=100, default='')
    patient_prenom = models.CharField(max_length=100, default='')
    patient_age = models.IntegerField(default=0)
    patient_phone = models.CharField(max_length=20, default='')
    patient_state = models.CharField(max_length=100, default='')
    
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_PATIENT')
    reason = models.TextField(blank=True)
    notes = models.TextField(blank=True, help_text="Notes added by doctor post-consultation")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('doctor', 'appointment_date', 'appointment_time')

    def __str__(self):
        return f"{self.patient} with {self.doctor} on {self.appointment_date} at {self.appointment_time}"
