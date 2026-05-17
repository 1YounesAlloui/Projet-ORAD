from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentUpdateSerializer
from users.models import Patient

class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return AppointmentUpdateSerializer
        return AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        base_queryset = Appointment.objects.select_related('patient__user', 'doctor__user')
        role = getattr(user, 'role', '')
        
        if role == 'PATIENT':
            return base_queryset.filter(patient__user=user).order_by('-appointment_date', '-appointment_time')
        elif role == 'DOCTOR':
            # Doctors only see appointments forwarded to them (or already handled)
            return base_queryset.filter(doctor__user=user).exclude(status='PENDING_PATIENT').order_by('-appointment_date', '-appointment_time')
        elif role in ['ADMIN', 'ASSISTANT'] or user.is_superuser:
            return base_queryset.order_by('-appointment_date', '-appointment_time')
        return Appointment.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        role = getattr(user, 'role', '')
        
        if role == 'PATIENT':
            serializer.save(patient=user.patient_profile)
        elif role == 'ADMIN' or user.is_superuser:
            patient_id = self.request.data.get('patient')
            if not patient_id:
                # If admin didn't specify patient, try using a patient profile if they have one,
                # otherwise raise error
                if hasattr(user, 'patient_profile'):
                    serializer.save(patient=user.patient_profile)
                    return
                raise PermissionDenied("Admin must specify a patient ID.")
            try:
                from django.db.models import Q
                patient = Patient.objects.filter(Q(pk=patient_id) | Q(user_id=patient_id)).first()
                if not patient:
                    raise Patient.DoesNotExist
            except Patient.DoesNotExist:
                raise PermissionDenied("Selected patient does not exist.")
            serializer.save(patient=patient)
        else:
            raise PermissionDenied("Only patients and admins can book appointments.")

    def update(self, request, *args, **kwargs):
        user = request.user
        role = getattr(user, 'role', '')
        instance = self.get_object()

        # Enforce role-based status transition checks if not ADMIN/superuser
        if not (role == 'ADMIN' or user.is_superuser):
            new_status = request.data.get('status')
            if new_status:
                if role == 'PATIENT':
                    raise PermissionDenied("Patients cannot change appointment status.")
                elif role == 'ASSISTANT':
                    # Assistant can transition from PENDING_PATIENT to EN_ATTENTE or REJECTED
                    if instance.status != 'PENDING_PATIENT' or new_status not in ['EN_ATTENTE', 'REJECTED']:
                        raise PermissionDenied("Assistants can only process new pending patient requests.")
                elif role == 'DOCTOR':
                    # Doctor can transition from EN_ATTENTE to APPROVED or REJECTED
                    if instance.status != 'EN_ATTENTE' or new_status not in ['APPROVED', 'REJECTED']:
                        raise PermissionDenied("Doctors can only approve/reject appointments that are 'En Attente'.")

        return super().update(request, *args, **kwargs)
