from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GastoComunViewSet

router = DefaultRouter()
router.register(r'', GastoComunViewSet)

urlpatterns = [
    # Aquí se agregarán las rutas para la gestión de gastos comunes
    path('', include(router.urls)),
]
