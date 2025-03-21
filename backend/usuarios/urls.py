from django.urls import path
from .views import (
    RegistroUsuarioView,
    UsuarioListView,
    UsuarioDetailView,
    PerfilUsuarioView,
    cambiar_password,
    estadisticas_usuarios
)

urlpatterns = [
    path('registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('lista/', UsuarioListView.as_view(), name='lista-usuarios'),
    path('perfil/', PerfilUsuarioView.as_view(), name='perfil-usuario'),
    path('<int:pk>/', UsuarioDetailView.as_view(), name='detalle-usuario'),
    path('cambiar-password/', cambiar_password, name='cambiar-password'),
    path('estadisticas/', estadisticas_usuarios, name='estadisticas-usuarios'), 
]
