from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notificacion
from .serializers import NotificacionSerializer


from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import get_user_model


Usuario = get_user_model()

class NotificacionViewSet(viewsets.ModelViewSet):
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        usuario = self.request.user
        # Administradores ven todas las notificaciones
        if usuario.rol == 'admin':
            return Notificacion.objects.all()
        # Residentes solo ven sus notificaciones
        return Notificacion.objects.filter(usuario=usuario)
    
    @action(detail=False, methods=['post'])
    def marcar_como_leidas(self, request):
        usuario = request.user
        if usuario.rol == 'admin':
            Notificacion.objects.all().update(leida=True)
        else:
            Notificacion.objects.filter(usuario=usuario).update(leida=True)
        return Response({"mensaje": "Notificaciones marcadas como leídas"}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def marcar_como_leida(self, request, pk=None):
        try:
            notificacion = self.get_queryset().get(pk=pk)
            notificacion.leida = True
            notificacion.save()
            return Response({"mensaje": "Notificación marcada como leída"}, status=status.HTTP_200_OK)
        except Notificacion.DoesNotExist:
            return Response({"error": "Notificación no encontrada"}, status=status.HTTP_404_NOT_FOUND)

    # Añadir al NotificacionViewSet existente
    def perform_destroy(self, instance):
        """Solo el dueño de la notificación o un administrador puede eliminarla"""
        if self.request.user.rol != 'admin' and instance.usuario != self.request.user:
            raise PermissionDenied("No tienes permiso para eliminar esta notificación")
        instance.delete()
    # Añadir al NotificacionViewSet existente
    @action(detail=False, methods=['get'])
    def contador(self, request):
        usuario = request.user
        if usuario.rol == 'admin':
            no_leidas = Notificacion.objects.filter(leida=False).count()
        else:
            no_leidas = Notificacion.objects.filter(usuario=usuario, leida=False).count()
        
        return Response({"no_leidas": no_leidas}, status=status.HTTP_200_OK)
