from django.db import models
from usuarios.models import Usuario
from model_utils import FieldTracker


# Create your models here.

class Multa(models.Model):
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('pagada', 'Pagada'),
        ('anulada', 'Anulada'),
    )
    
    residente = models.ForeignKey(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name='multas',
        limit_choices_to={'rol': 'residente'}
    )
    motivo = models.CharField(max_length=100)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=10, choices=ESTADOS, default='pendiente')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_pago = models.DateTimeField(null=True, blank=True)
    tracker = FieldTracker(fields=['estado'])

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = 'Multa'
        verbose_name_plural = 'Multas'
    
    def __str__(self):
        return f"Multa {self.id} - {self.residente.username} - {self.motivo} - {self.estado}"
