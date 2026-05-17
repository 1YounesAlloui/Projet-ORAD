from rest_framework import viewsets, permissions
from core.permissions import IsDoctorUser
from .models import Doctor, Availability
from .serializers import DoctorSerializer, AvailabilitySerializer

class DoctorViewSet(viewsets.ModelViewSet):
    """
    - List/Retrieve: public (patients browse doctors).
    - Update/Partial-Update: doctor-only (their own profile).
    """
    queryset = Doctor.objects.select_related('user').prefetch_related('availabilities').all()
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated(), IsDoctorUser()]
        return [permissions.AllowAny()]

    def get_object(self):
        obj = super().get_object()
        # Doctors can only edit their own profile
        if self.action in ['update', 'partial_update']:
            if obj.user != self.request.user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only edit your own profile.")
        return obj

class AvailabilityViewSet(viewsets.ModelViewSet):
    """
    Doctors can manage their own availabilities.
    """
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Doctors can only see their own availabilities
        if getattr(self.request.user, 'role', '') == 'DOCTOR':
            return Availability.objects.filter(doctor__user=self.request.user)
        return Availability.objects.none()

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctor_profile)
