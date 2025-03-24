from rest_framework import serializers
from .models import Notificacion

class NotificacionSerializer(serializers.ModelSerializer):
    tiempo_relativo = serializers.SerializerMethodField()
    
    class Meta:
        model = Notificacion
        fields = ['id', 'usuario', 'tipo', 'titulo', 'mensaje', 'fecha_creacion', 
                 'leida', 'objeto_id', 'objeto_tipo', 'tiempo_relativo']
    
    def get_tiempo_relativo(self, obj):
        """Retorna el tiempo en formato relativo (ej: 'hace 5 minutos')"""
        from django.utils import timezone
        from datetime import timedelta
        
        ahora = timezone.now()
        diff = ahora - obj.fecha_creacion
        
        if diff < timedelta(minutes=1):
            return "justo ahora"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"hace {minutes} {'minuto' if minutes == 1 else 'minutos'}"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"hace {hours} {'hora' if hours == 1 else 'horas'}"
        elif diff < timedelta(days=30):
            days = diff.days
            return f"hace {days} {'día' if days == 1 else 'días'}"
        else:
            return obj.fecha_creacion.strftime("%d/%m/%Y")
