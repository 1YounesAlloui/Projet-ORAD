from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.is_superuser or request.user.role == 'ADMIN'

class IsDoctorUser(permissions.BasePermission):
    """
    Allows access only to doctor users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'DOCTOR')

class IsPatientUser(permissions.BasePermission):
    """
    Allows access only to patient users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'PATIENT')

class IsDoctorOrAdmin(permissions.BasePermission):
    """
    Allows access to doctors or admins.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.is_superuser or request.user.role in ['DOCTOR', 'ADMIN']

class IsAssistantUser(permissions.BasePermission):
    """
    Allows access only to assistant users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ASSISTANT')

class IsAdminOrAssistant(permissions.BasePermission):
    """
    Allows access to admins or assistants.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'ASSISTANT'])
