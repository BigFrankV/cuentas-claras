from rest_framework import serializers
from .models import GastoComun
from usuarios.serializers import UsuarioSerializer

class GastoComunSerializer(serializers.ModelSerializer):
    class Meta:
        model = GastoComun
        fields = ['id', 'residente', 'concepto', 'descripcion', 'monto', 'estado',
                 'fecha_emision', 'fecha_vencimiento', 'fecha_pago']
        read_only_fields = ['fecha_pago']
    
    def validate_residente(self, value):
        """Verificar que el residente tenga rol 'residente'"""
        if value.rol != 'residente':
            raise serializers.ValidationError(
                f"El usuario {value.username} no es un residente. Su rol es '{value.rol}'."
            )
        return value



class GastoComunDetalleSerializer(serializers.ModelSerializer):
    residente = UsuarioSerializer(read_only=True)
    
    class Meta:
        model = GastoComun
        fields = ['id', 'residente', 'concepto', 'descripcion', 'monto', 'estado', 
                 'fecha_emision', 'fecha_vencimiento', 'fecha_pago']
        read_only_fields = ['fecha_pago']
