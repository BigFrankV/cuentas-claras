from django.db import models
from usuarios.models import Usuario
from django.utils import timezone

# Create your models here.

class GastoComun(models.Model):
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
    )
    
    residente = models.ForeignKey(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name='gastos_comunes',
        limit_choices_to={'rol': 'residente'}
    )
    concepto = models.CharField(max_length=100)
    descripcion = models.TextField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=10, choices=ESTADOS, default='pendiente')
    fecha_emision = models.DateField(default=timezone.now)
    fecha_vencimiento = models.DateField()
    fecha_pago = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-fecha_emision']
        verbose_name = 'Gasto Común'
        verbose_name_plural = 'Gastos Comunes'
    
    def __str__(self):
        return f"Gasto Común {self.id} - {self.residente.username} - {self.concepto} - {self.estado}"
