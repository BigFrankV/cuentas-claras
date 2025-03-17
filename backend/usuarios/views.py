from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Usuario
from .serializers import UsuarioSerializer, UsuarioUpdateSerializer

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
