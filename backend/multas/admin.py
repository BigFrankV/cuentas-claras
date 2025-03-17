from django.contrib import admin
from .models import Multa

# Register your models here.

@admin.register(Multa)
class MultaAdmin(admin.ModelAdmin):
    list_display = ('id', 'residente', 'motivo', 'precio', 'estado', 'fecha_creacion')
    list_filter = ('estado', 'fecha_creacion')
    search_fields = ('motivo', 'descripcion', 'residente__username', 'residente__first_name', 'residente__last_name')
    readonly_fields = ('fecha_creacion',)
    fieldsets = (
        ('Información de la Multa', {
            'fields': ('residente', 'motivo', 'descripcion', 'precio')
        }),
        ('Estado', {
            'fields': ('estado', 'fecha_creacion', 'fecha_pago')
        }),
    )
