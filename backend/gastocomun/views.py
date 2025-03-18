from django.shortcuts import render
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import GastoComun
from .serializers import GastoComunSerializer, GastoComunDetalleSerializer

# Create your views here.

class GastoComunViewSet(viewsets.ModelViewSet):
    queryset = GastoComun.objects.all()
    serializer_class = GastoComunSerializer
    
    def get_permissions(self):
        """
        - Los administradores pueden crear, editar y eliminar gastos comunes
        - Los residentes solo pueden ver sus propios gastos y pagarlos
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return GastoComunDetalleSerializer
        return GastoComunSerializer
    
    def get_queryset(self):
        """
        - Los administradores pueden ver todos los gastos comunes
        - Los residentes solo pueden ver sus propios gastos comunes
        """
        user = self.request.user
        if user.rol == 'admin':
            return GastoComun.objects.all()
        return GastoComun.objects.filter(residente=user)
    
    def perform_create(self, serializer):
        """Solo los administradores pueden crear gastos comunes"""
        if self.request.user.rol != 'admin':
            raise PermissionDenied("Solo los administradores pueden crear gastos comunes")
        serializer.save()
        
    def perform_update(self, serializer):
        """Solo los administradores pueden actualizar gastos comunes"""
        if self.request.user.rol != 'admin':
            raise PermissionDenied("Solo los administradores pueden actualizar gastos comunes")
        serializer.save()
        
    def perform_destroy(self, instance):
        """Solo los administradores pueden eliminar gastos comunes"""
        if self.request.user.rol != 'admin':
            raise PermissionDenied("Solo los administradores pueden eliminar gastos comunes")
        instance.delete()
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def pagar(self, request, pk=None):
        """
        Permite a un residente pagar un gasto común.
        Solo el residente asociado al gasto puede pagarlo.
        """
        gasto = self.get_object()
        
        # Verificar que el gasto pertenezca al usuario que hace la solicitud
        if request.user.rol != 'admin' and gasto.residente != request.user:
            return Response(
                {"error": "No tienes permiso para pagar este gasto común"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que el gasto esté pendiente
        if gasto.estado != 'pendiente':
            return Response(
                {"error": f"El gasto común no puede ser pagado porque su estado es {gasto.estado}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar estado y fecha de pago
        gasto.estado = 'pagado'
        gasto.fecha_pago = timezone.now()
        gasto.save()
        
        serializer = GastoComunDetalleSerializer(gasto)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def pendientes(self, request):
        """
        Retorna los gastos comunes pendientes del usuario actual o de todos los usuarios si es admin
        """
        user = request.user
        if user.rol == 'admin':
            queryset = GastoComun.objects.filter(estado='pendiente')
        else:
            queryset = GastoComun.objects.filter(residente=user, estado='pendiente')
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def pagados(self, request):
        """
        Retorna los gastos comunes pagados del usuario actual o de todos los usuarios si es admin
        """
        user = request.user
        if user.rol == 'admin':
            queryset = GastoComun.objects.filter(estado='pagado')
        else:
            queryset = GastoComun.objects.filter(residente=user, estado='pagado')
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def estadisticas(self, request):
        """
        Retorna estadísticas de gastos comunes (solo para administradores)
        """
        if request.user.rol != 'admin':
            raise PermissionDenied("Solo los administradores pueden ver estadísticas")
        
        total_gastos = GastoComun.objects.count()
        total_pendientes = GastoComun.objects.filter(estado='pendiente').count()
        total_pagados = GastoComun.objects.filter(estado='pagado').count()
        
        # Obtener el monto total de gastos pendientes y pagados
        from django.db.models import Sum
        monto_pendiente = GastoComun.objects.filter(estado='pendiente').aggregate(Sum('monto'))
        monto_pagado = GastoComun.objects.filter(estado='pagado').aggregate(Sum('monto'))
        
        return Response({
            'total_gastos': total_gastos,
            'total_pendientes': total_pendientes,
            'total_pagados': total_pagados,
            'monto_pendiente': monto_pendiente['monto__sum'] or 0,
            'monto_pagado': monto_pagado['monto__sum'] or 0
        })
