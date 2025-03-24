from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notificacion
from multas.models import Multa
from gastocomun.models import GastoComun
from usuarios.models import Usuario
from model_utils.fields import FieldTracker

# Ejemplo para Multas
@receiver(post_save, sender=Multa)
@receiver(post_save, sender=Multa)
def crear_notificacion_multa(sender, instance, created, **kwargs):
    if created:
        # Notificación para el residente
        Notificacion.objects.create(
            usuario=instance.residente,
            tipo='multa_creada',
            titulo='Nueva multa registrada',
            mensaje=f'Se ha registrado una multa por {instance.motivo} por un valor de ${instance.precio}.',
            objeto_id=instance.id,
            objeto_tipo='multa'
        )
        
        # Notificación para administradores
        admins = Usuario.objects.filter(rol='admin')
        for admin in admins:
            Notificacion.objects.create(
                usuario=admin,
                tipo='multa_creada',
                titulo='Nueva multa generada',
                mensaje=f'Se ha generado una multa para {instance.residente.username} por {instance.motivo}.',
                objeto_id=instance.id,
                objeto_tipo='multa'
            )
    elif instance.estado == 'pagada' and instance.tracker.has_changed('estado'):
        # Si el estado cambió a pagada
        # Notificación para el residente
        Notificacion.objects.create(
            usuario=instance.residente,
            tipo='multa_pagada',
            titulo='Multa pagada correctamente',
            mensaje=f'Su multa por {instance.motivo} ha sido registrada como pagada.',
            objeto_id=instance.id,
            objeto_tipo='multa'
        )
        
        # Notificación para administradores
        admins = Usuario.objects.filter(rol='admin')
        for admin in admins:
            Notificacion.objects.create(
                usuario=admin,
                tipo='multa_pagada',
                titulo='Multa pagada por residente',
                mensaje=f'La multa de {instance.residente.username} por {instance.motivo} ha sido pagada.',
                objeto_id=instance.id,
                objeto_tipo='multa'
            )
    elif instance.estado == 'anulada' and instance.tracker.has_changed('estado'):
        # Si el estado cambió a anulada
        # Notificación para el residente
        Notificacion.objects.create(
            usuario=instance.residente,
            tipo='multa_anulada',
            titulo='Multa anulada',
            mensaje=f'Su multa por {instance.motivo} ha sido anulada.',
            objeto_id=instance.id,
            objeto_tipo='multa'
        )


# Ejemplo para Gastos Comunes@receiver(post_save, sender=GastoComun)
def crear_notificacion_gasto_comun(sender, instance, created, **kwargs):
    if created:
        # Notificación para el residente
        Notificacion.objects.create(
            usuario=instance.residente,
            tipo='gasto_creado',
            titulo='Nuevo gasto común registrado',
            mensaje=f'Se ha registrado un gasto común por ${instance.monto} correspondiente a {instance.concepto}.',
            objeto_id=instance.id,
            objeto_tipo='gasto_comun'
        )
        
        # Notificación para administradores
        admins = Usuario.objects.filter(rol='admin')
        for admin in admins:
            Notificacion.objects.create(
                usuario=admin,
                tipo='gasto_creado',
                titulo='Nuevo gasto común generado',
                mensaje=f'Se ha generado un gasto común para {instance.residente.username} por ${instance.monto}.',
                objeto_id=instance.id,
                objeto_tipo='gasto_comun'
            )
    elif instance.estado == 'pagado' and instance.tracker.has_changed('estado'):
        # Si el estado cambió a pagado
        # Notificación para el residente
        Notificacion.objects.create(
            usuario=instance.residente,
            tipo='gasto_pagado',
            titulo='Gasto común pagado correctamente',
            mensaje=f'Su gasto común por {instance.concepto} ha sido registrado como pagado.',
            objeto_id=instance.id,
            objeto_tipo='gasto_comun'
        )
        
        # Notificación para administradores
        admins = Usuario.objects.filter(rol='admin')
        for admin in admins:
            Notificacion.objects.create(
                usuario=admin,
                tipo='gasto_pagado',
                titulo='Gasto común pagado por residente',
                mensaje=f'El gasto común de {instance.residente.username} por {instance.concepto} ha sido pagado.',
                objeto_id=instance.id,
                objeto_tipo='gasto_comun'
            )
            
    # También podrías agregar una notificación para gastos vencidos
    # Esto podría hacerse en un task programado, no solo en el signal
