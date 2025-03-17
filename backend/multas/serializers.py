from rest_framework import serializers
from .models import Multa
from usuarios.serializers import UsuarioSerializer

class MultaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Multa
        fields = ['id', 'residente', 'motivo', 'descripcion', 'precio', 'estado', 'fecha_creacion', 'fecha_pago']
        read_only_fields = ['fecha_creacion']

class MultaDetalleSerializer(serializers.ModelSerializer):
    residente = UsuarioSerializer(read_only=True)
    
    class Meta:
        model = Multa
        fields = ['id', 'residente', 'motivo', 'descripcion', 'precio', 'estado', 'fecha_creacion', 'fecha_pago']
        read_only_fields = ['fecha_creacion']
