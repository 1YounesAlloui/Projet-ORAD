from rest_framework import serializers
from .models import User, Patient
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    patient_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'is_active', 'patient_profile')

    def get_patient_profile(self, obj):
        if obj.role == 'PATIENT':
            try:
                profile = obj.patient_profile
                return {
                    'date_of_birth': profile.date_of_birth,
                    'address': profile.address,
                    'medical_history': profile.medical_history
                }
            except Exception:
                return None
        return None


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'is_active')


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password_confirm', 'email', 'first_name', 'last_name', 'role', 'phone_number')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role = validated_data.get('role', 'PATIENT')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=role,
            phone_number=validated_data.get('phone_number', '')
        )
        
        # Create corresponding profile
        if role == 'PATIENT':
            Patient.objects.create(user=user)
        elif role == 'DOCTOR':
            from doctors.models import Doctor
            Doctor.objects.create(user=user, specialty="General") # Default specialty

        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=False, allow_blank=True)
    email = serializers.EmailField(required=True)

    # Patient fields
    date_of_birth = serializers.DateField(required=False, write_only=True, allow_null=True)
    address = serializers.CharField(required=False, write_only=True, allow_blank=True)
    medical_history = serializers.CharField(required=False, write_only=True, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password_confirm', 'email', 'first_name', 'last_name', 'phone_number', 'date_of_birth', 'address', 'medical_history')

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, attrs):
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        if password or password_confirm:
            if password != password_confirm:
                raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        
        # Extract patient fields
        date_of_birth = validated_data.pop('date_of_birth', None)
        address = validated_data.pop('address', None)
        medical_history = validated_data.pop('medical_history', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            
        instance.save()
        
        # If the user is a Patient, update/create their Patient profile
        if instance.role == 'PATIENT':
            patient_profile, created = Patient.objects.get_or_create(user=instance)
            if date_of_birth is not None:
                patient_profile.date_of_birth = date_of_birth
            if address is not None:
                patient_profile.address = address
            if medical_history is not None:
                patient_profile.medical_history = medical_history
            patient_profile.save()
            
        return instance
