from django.contrib import admin
from .models import GastoComun

# Register your models here.
@admin.register(GastoComun)
class GastoComunAdmin(admin.ModelAdmin):
    list_display = ('id', 'residente', 'concepto', 'monto', 'estado', 'fecha_emision', 'fecha_vencimiento')
    list_filter = ('estado', 'fecha_emision', 'fecha_vencimiento')
    search_fields = ('residente__username', 'residente__first_name', 'residente__last_name', 'concepto')
    date_hierarchy = 'fecha_emision'
    list_per_page = 20
