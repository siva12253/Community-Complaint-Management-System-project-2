from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdministrator(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_staff or request.user.is_superuser)
        )


class IsComplaintOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or request.user.role == "admin" or obj.reporter_id == request.user.id


class IsCommentOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or request.user.role == "admin" or obj.author_id == request.user.id
