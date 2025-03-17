from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo de usuario.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = ('id', 'username', 'password', 'password2', 'email', 'first_name', 
                  'last_name', 'rol', 'telefono', 'numero_residencia')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = Usuario.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            rol=validated_data.get('rol', 'residente'),
            telefono=validated_data.get('telefono', ''),
            numero_residencia=validated_data.get('numero_residencia', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UsuarioUpdateSerializer(serializers.ModelSerializer):
    """
    Serializador para actualizar usuarios.
    """
    class Meta:
        model = Usuario
        fields = ('first_name', 'last_name', 'email', 'telefono', 'numero_residencia')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }
