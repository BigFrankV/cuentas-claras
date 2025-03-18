from rest_framework import serializers
from .models import GastoComun
from usuarios.serializers import UsuarioSerializer

class GastoComunSerializer(serializers.ModelSerializer):
    class Meta:
        model = GastoComun
        fields = ['id', 'residente', 'concepto', 'descripcion', 'monto', 'estado', 
                 'fecha_emision', 'fecha_vencimiento', 'fecha_pago']
        read_only_fields = ['fecha_pago']

class GastoComunDetalleSerializer(serializers.ModelSerializer):
    residente = UsuarioSerializer(read_only=True)
    
    class Meta:
        model = GastoComun
        fields = ['id', 'residente', 'concepto', 'descripcion', 'monto', 'estado', 
                 'fecha_emision', 'fecha_vencimiento', 'fecha_pago']
        read_only_fields = ['fecha_pago']
