from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MultaViewSet

router = DefaultRouter()
router.register(r'', MultaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
