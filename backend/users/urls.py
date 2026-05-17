from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, CurrentUserView, LogoutView, AdminStatsView, UserManagementViewSet

router = DefaultRouter()
router.register(r'user-management', UserManagementViewSet, basename='user-management')


urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
] + router.urls
