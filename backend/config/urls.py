from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from complaints.views import (
    AdminComplaintViewSet,
    CategoryViewSet,
    ComplaintViewSet,
    NotificationViewSet,
    ProfileView,
    RegisterView,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("complaints", ComplaintViewSet, basename="complaint")
router.register("admin/complaints", AdminComplaintViewSet, basename="admin-complaint")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/profile/", ProfileView.as_view(), name="profile"),
    path("api/", include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
