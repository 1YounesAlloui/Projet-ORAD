from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Patient
from doctors.models import Doctor
from appointments.models import Appointment
from core.permissions import IsAdminUser
from .serializers import UserSerializer, RegisterSerializer, AdminUserUpdateSerializer

from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os

@csrf_exempt
def create_superuser_view(request):
    secret_token = os.environ.get('ADMIN_CREATION_TOKEN', 'SECRET123')
    provided_token = request.GET.get('token')
    
    if not provided_token or provided_token != secret_token:
        return JsonResponse({"error": "Unauthorized. Invalid or missing secret token."}, status=403)
        
    User = get_user_model()
    username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@gmail.com')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin1234')
    
    if User.objects.filter(username=username).exists():
        return JsonResponse({"message": f"Superuser '{username}' already exists."}, status=200)
        
    try:
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            role='ADMIN'
        )
        return JsonResponse({"message": f"Superuser '{username}' created successfully."}, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Failed to create superuser: {str(e)}"}, status=500)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class CurrentUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        # Django superusers default to PATIENT role — override to ADMIN
        if request.user.is_superuser and data.get('role') != 'ADMIN':
            data = dict(data)
            data['role'] = 'ADMIN'
        return Response(data)

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class AdminStatsView(APIView):
    permission_classes = (IsAdminUser,)

    def get(self, request):
        from consultations.models import Consultation
        total_patients = Patient.objects.count()
        total_doctors = Doctor.objects.count()
        total_consultations = Consultation.objects.count()
        
        # Appointment stats
        total_appointments = Appointment.objects.count()
        pending = Appointment.objects.filter(status='PENDING_PATIENT').count()
        en_attente = Appointment.objects.filter(status='EN_ATTENTE').count()
        approved = Appointment.objects.filter(status='APPROVED').count()
        rejected = Appointment.objects.filter(status='REJECTED').count()

        return Response({
            'total_users': total_patients + total_doctors + 1, # +1 for admin
            'total_patients': total_patients,
            'total_doctors': total_doctors,
            'total_consultations': total_consultations,
            'appointments': {
                'total': total_appointments,
                'pending_patient': pending,
                'en_attente': en_attente,
                'approved': approved,
                'rejected': rejected
            }
        })

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = RegisterSerializer
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return UserSerializer
        elif self.action in ['update', 'partial_update']:
            return AdminUserUpdateSerializer
        return RegisterSerializer
