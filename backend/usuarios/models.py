from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    """
    Modelo de usuario personalizado con roles de administrador y residente.
    """
    ROLES = (
        ('admin', 'Administrador'),
        ('residente', 'Residente'),
    )
    rol = models.CharField(max_length=10, choices=ROLES, default='residente')
    telefono = models.CharField(max_length=15, blank=True, null=True)
    numero_residencia = models.CharField(max_length=10, blank=True, null=True)
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.username})"
