from django.shortcuts import render
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Multa
from .serializers import MultaSerializer, MultaDetalleSerializer
from django.db.models import Sum

# Create your views here.

class MultaViewSet(viewsets.ModelViewSet):
    queryset = Multa.objects.all()
    serializer_class = MultaSerializer
   
    def get_permissions(self):
        """
        - Los administradores pueden crear, editar y eliminar multas
        - Los residentes solo pueden ver sus propias multas y pagarlas
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
   
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MultaDetalleSerializer
        return MultaSerializer
   
    def get_queryset(self):
        """
        - Los administradores pueden ver todas las multas
        - Los residentes solo pueden ver sus propias multas
        """
        user = self.request.user
        if user.rol == 'admin':
            return Multa.objects.all()
        return Multa.objects.filter(residente=user)
   
    def perform_create(self, serializer):
        """Solo los administradores pueden crear multas"""
        if self.request.user.rol != 'admin':
            raise PermissionDenied("Solo los administradores pueden crear multas")
        serializer.save()
       
    def perform_update(self, serializer):
        """Solo los administradores pueden actualizar multas"""
        if self.request.user.rol != 'admin':
            raise PermissionDenied("Solo los administradores pueden actualizar multas")
        serializer.save()
       
    def perform_destroy(self, instance):
        """Solo los administradores pueden eliminar multas"""
        if self.request.user.rol != 'admin':
            raise PermissionDenied("Solo los administradores pueden eliminar multas")
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def estadisticas(self, request):
        """
        Retorna estadísticas de multas (solo para administradores)
        """
        if request.user.rol != 'admin':
            raise PermissionDenied("Solo los administradores pueden ver estadísticas")
        
        total_multas = Multa.objects.count()
        total_pendientes = Multa.objects.filter(estado='pendiente').count()
        total_pagadas = Multa.objects.filter(estado='pagada').count()
        total_anuladas = Multa.objects.filter(estado='anulada').count()
        
        # Obtener el monto total de multas pendientes y pagadas
        monto_pendiente = Multa.objects.filter(estado='pendiente').aggregate(Sum('precio'))
        monto_pagado = Multa.objects.filter(estado='pagada').aggregate(Sum('precio'))
        
        return Response({
            'total_multas': total_multas,
            'total_pendientes': total_pendientes,
            'total_pagadas': total_pagadas,
            'total_anuladas': total_anuladas,
            'monto_pendiente': monto_pendiente['precio__sum'] or 0,
            'monto_pagado': monto_pagado['precio__sum'] or 0
        })
   
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def pagar(self, request, pk=None):
        """
        Permite a un residente pagar una multa.
        Solo el residente asociado a la multa puede pagarla.
        """
        multa = self.get_object()
       
        # Verificar que la multa pertenezca al usuario que hace la solicitud
        if request.user.rol != 'admin' and multa.residente != request.user:
            return Response(
                {"error": "No tienes permiso para pagar esta multa"},
                status=status.HTTP_403_FORBIDDEN
            )
       
        # Verificar que la multa esté pendiente
        if multa.estado != 'pendiente':
            return Response(
                {"error": f"La multa no puede ser pagada porque su estado es {multa.estado}"},
                status=status.HTTP_400_BAD_REQUEST
            )
       
        # Actualizar estado y fecha de pago
        multa.estado = 'pagada'
        multa.fecha_pago = timezone.now()
        multa.save()
       
        serializer = MultaDetalleSerializer(multa)
        return Response(serializer.data)
   
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def anular(self, request, pk=None):
        """
        Permite a un administrador anular una multa.
        """
        multa = self.get_object()
       
        # Verificar que el usuario sea administrador
        if request.user.rol != 'admin':
            return Response(
                {"error": "Solo los administradores pueden anular multas"},
                status=status.HTTP_403_FORBIDDEN
            )
       
        # Verificar que la multa esté pendiente
        if multa.estado != 'pendiente':
            return Response(
                {"error": f"La multa no puede ser anulada porque su estado es {multa.estado}"},
                status=status.HTTP_400_BAD_REQUEST
            )
       
        # Actualizar estado
        multa.estado = 'anulada'
        multa.save()
       
        serializer = MultaDetalleSerializer(multa)
        return Response(serializer.data)
