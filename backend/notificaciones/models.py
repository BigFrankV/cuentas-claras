from django.db import models
from django.conf import settings

class Notificacion(models.Model):
    TIPO_CHOICES = [
        ('multa_creada', 'Multa Creada'),
        ('multa_pagada', 'Multa Pagada'),
        ('multa_anulada', 'Multa Anulada'),
        ('gasto_creado', 'Gasto Común Creado'),
        ('gasto_pagado', 'Gasto Común Pagado'),
        ('gasto_vencido', 'Gasto Común Vencido'),
        ('usuario_creado', 'Usuario Creado'),
        ('sistema', 'Sistema'),
    ]
    
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notificaciones',
        null=True,
        blank=True
    )
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=100)
    mensaje = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    leida = models.BooleanField(default=False)
    # Para vincular la notificación con el objeto relacionado (opcional)
    objeto_id = models.IntegerField(null=True, blank=True)
    objeto_tipo = models.CharField(max_length=50, null=True, blank=True)
    
    class Meta:
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"{self.titulo} - {self.fecha_creacion.strftime('%d/%m/%Y %H:%M')}"
