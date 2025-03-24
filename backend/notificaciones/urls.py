from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificacionViewSet

router = DefaultRouter()
router.register(r'notificaciones', NotificacionViewSet, basename='notificaciones')

urlpatterns = [
    path('', include(router.urls)),
]
