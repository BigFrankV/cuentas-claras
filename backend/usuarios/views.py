from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Usuario
from .serializers import UsuarioSerializer, UsuarioUpdateSerializer

from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

class RegistroUsuarioView(generics.CreateAPIView):
    """
    Vista para registrar nuevos usuarios.
    Solo los administradores pueden registrar usuarios.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Verificar si el usuario autenticado es un administrador
        if self.request.user.rol != 'admin':
            raise permissions.PermissionDenied("Solo los administradores pueden registrar usuarios")
        serializer.save()

class UsuarioListView(generics.ListAPIView):
    """
    Vista para listar todos los usuarios.
    Solo los administradores pueden ver la lista de usuarios.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Verificar si el usuario autenticado es un administrador
        if self.request.user.rol != 'admin':
            raise permissions.PermissionDenied("Solo los administradores pueden ver la lista de usuarios")
        return Usuario.objects.all()

class UsuarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para ver, actualizar y eliminar un usuario específico.
    Los usuarios solo pueden ver y actualizar su propio perfil.
    Los administradores pueden ver, actualizar y eliminar cualquier usuario.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UsuarioUpdateSerializer
        return UsuarioSerializer
    
    def get_object(self):
        obj = super().get_object()
        # Verificar si el usuario autenticado es el propietario del perfil o un administrador
        if self.request.user.id != obj.id and self.request.user.rol != 'admin':
            raise permissions.PermissionDenied("No tienes permiso para acceder a este perfil")
        return obj
    
    def destroy(self, request, *args, **kwargs):
        # Verificar si el usuario autenticado es un administrador
        if self.request.user.rol != 'admin':
            raise permissions.PermissionDenied("Solo los administradores pueden eliminar usuarios")
        return super().destroy(request, *args, **kwargs)

class PerfilUsuarioView(APIView):
    """
    Vista para obtener el perfil del usuario autenticado.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cambiar_password(request):
    """
    Vista para cambiar la contraseña del usuario autenticado.
    """
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    # Verificar que se proporcionaron ambas contraseñas
    if not old_password or not new_password:
        return Response(
            {"error": "Debes proporcionar la contraseña actual y la nueva contraseña"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar que la contraseña actual sea correcta
    if not authenticate(username=user.username, password=old_password):
        return Response(
            {"error": "La contraseña actual es incorrecta"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Establecer la nueva contraseña
    user.set_password(new_password)
    user.save()
    
    return Response({"message": "Contraseña actualizada correctamente"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estadisticas_usuarios(request):
    """
    Vista para obtener estadísticas de usuarios.
    Solo los administradores pueden ver estas estadísticas.
    """
    # Verificar si el usuario es administrador
    if request.user.rol != 'admin':
        return Response(
            {"error": "Solo los administradores pueden ver estadísticas de usuarios"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Obtener conteos de usuarios
    total_usuarios = Usuario.objects.count()
    total_admins = Usuario.objects.filter(rol='admin').count()
    total_residentes = Usuario.objects.filter(rol='residente').count()
    
    return Response({
        'total_usuarios': total_usuarios,
        'total_admins': total_admins,
        'total_residentes': total_residentes
    })
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_residentes(request):
    """
    Vista para listar todos los usuarios residentes.
    Solo los administradores pueden ver esta lista.
    """
    if request.user.rol != 'admin':
        return Response(
            {"error": "Solo los administradores pueden ver la lista de residentes"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    residentes = Usuario.objects.filter(rol='residente')
    serializer = UsuarioSerializer(residentes, many=True)
    return Response(serializer.data)