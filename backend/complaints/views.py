from django.db import transaction
from django.db.models import Q
from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Category, Complaint, ComplaintComment, ComplaintHistory, Notification
from .permissions import IsAdministrator, IsCommentOwnerOrAdmin, IsComplaintOwnerOrAdmin
from .serializers import (
    CategorySerializer,
    CommentSerializer,
    ComplaintSerializer,
    ComplaintStatusSerializer,
    NotificationSerializer,
    ProfileSerializer,
    RegistrationSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    queryset = Category.objects.filter(is_active=True)


class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated, IsComplaintOwnerOrAdmin]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    search_fields = ["title", "description", "location", "category__name"]
    ordering_fields = ["created_at", "updated_at", "status", "title"]

    def get_queryset(self):
        queryset = Complaint.objects.select_related("category", "reporter").prefetch_related("comments__author", "history")
        if self.request.user.role != "admin" and not self.request.user.is_staff:
            queryset = queryset.filter(reporter=self.request.user)
        status_filter = self.request.query_params.get("status")
        category_filter = self.request.query_params.get("category")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if category_filter:
            queryset = queryset.filter(category_id=category_filter)
        return queryset

    def perform_create(self, serializer):
        complaint = serializer.save(reporter=self.request.user)
        ComplaintHistory.objects.create(
            complaint=complaint,
            status=complaint.status,
            note="Complaint submitted",
            changed_by=self.request.user,
        )

    def update(self, request, *args, **kwargs):
        if request.user.role != "admin" and not request.user.is_staff:
            raise PermissionDenied("Only administrators can edit complaint details.")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if request.user.role != "admin" and not request.user.is_staff:
            raise PermissionDenied("Only administrators can edit complaint details.")
        return super().partial_update(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def comments(self, request, pk=None):
        complaint = self.get_object()
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(complaint=complaint, author=request.user)
        if complaint.reporter_id != request.user.id:
            Notification.objects.create(
                recipient=complaint.reporter,
                complaint=complaint,
                title="New comment on your report",
                message=f"{request.user.get_full_name() or request.user.username} added an update to “{complaint.title}”.",
            )
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class AdminComplaintViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated, IsAdministrator]
    search_fields = ["title", "description", "location", "category__name", "reporter__username"]
    ordering_fields = ["created_at", "updated_at", "status", "title"]
    queryset = Complaint.objects.select_related("category", "reporter").prefetch_related("comments__author", "history")

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return ComplaintStatusSerializer
        return ComplaintSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    @transaction.atomic
    def perform_update(self, serializer):
        complaint = self.get_object()
        old_status = complaint.status
        updated = serializer.save()
        if old_status != updated.status:
            label = updated.get_status_display()
            ComplaintHistory.objects.create(
                complaint=updated,
                status=updated.status,
                note=f"Status updated to {label}",
                changed_by=self.request.user,
            )
            Notification.objects.create(
                recipient=updated.reporter,
                complaint=updated,
                title="Your complaint status changed",
                message=f"“{updated.title}” is now {label.lower()}.",
            )


class NotificationViewSet(mixins.ListModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).select_related("complaint")

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"detail": "Notifications marked as read."})
