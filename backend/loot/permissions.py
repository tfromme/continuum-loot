from rest_framework.permissions import BasePermission


class IsUserOrAdmin(BasePermission):

    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser or request.user == obj.user
