from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permite acceso solo a usuarios con rol de administrador.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'admin'
