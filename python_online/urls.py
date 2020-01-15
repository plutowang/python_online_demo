"""python_online URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from backend.views import CodeViewSet, RunCodeAPIView, index
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(prefix='code', viewset=CodeViewSet, basename='code')

API_V1 = [re_path(r'^run/$', RunCodeAPIView.as_view(), name='run')]
print(API_V1)
API_V1.extend(router.urls)
print(API_V1)

API_VERSION = [re_path(r'^v1/', include(API_V1))]

urlpatterns = [
    path('admin/', admin.site.urls, name='admin'),
    re_path(r'^api/', include(API_VERSION), name='api'),
    re_path(r'^$', index, name='home')
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if settings.DEBUG:
    import debug_toolbar
    urlpatterns.append(path('__debug__/', include(debug_toolbar.urls)))
