from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from django.http import HttpResponse
from .models import Consultation
from .serializers import ConsultationSerializer
from core.permissions import IsDoctorOrAdmin
from .pdf_generator import generate_consultation_pdf

class ConsultationViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultationSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsDoctorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        base_queryset = Consultation.objects.select_related('patient__user', 'doctor__user', 'appointment').all()

        if getattr(user, 'role', '') == 'ADMIN' or user.is_superuser:
            return base_queryset.order_by('-consultation_date', '-created_at')
        elif getattr(user, 'role', '') == 'DOCTOR':
            return base_queryset.filter(doctor__user=user).order_by('-consultation_date', '-created_at')
        elif getattr(user, 'role', '') == 'PATIENT':
            return base_queryset.filter(patient__user=user).order_by('-consultation_date', '-created_at')
        return Consultation.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        
        # If user is admin, they must provide doctor in the payload or we assign default?
        # Let's check how the serializer handles it. The doctor is in read_only_fields in Meta.
        # But wait! If the admin creates a consultation, they must specify the doctor and patient.
        # If a doctor creates it, we can auto-fill doctor from request.user.
        # Let's inspect the appointment details to auto-populate doctor and patient.
        appointment = serializer.validated_data.get('appointment')
        if not appointment:
            raise PermissionDenied("An appointment is required to create a consultation.")
            
        patient = appointment.patient
        doctor = appointment.doctor

        # Permission check: Doctors can only create consultations for their own appointments
        if getattr(user, 'role', '') == 'DOCTOR' and doctor.user != user:
            raise PermissionDenied("You can only create consultations for your own appointments.")

        serializer.save(patient=patient, doctor=doctor)

    @action(detail=True, methods=['get'], url_path='export-pdf')
    def export_pdf(self, request, pk=None):
        consultation = self.get_object()
        pdf_data = generate_consultation_pdf(consultation)
        
        filename = f"ordonnance_{consultation.id}.pdf"
        response = HttpResponse(pdf_data, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
