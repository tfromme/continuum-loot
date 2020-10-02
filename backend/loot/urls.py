from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register('players', views.PlayerViewSet)
router.register('items', views.ItemViewSet)
router.register('raids', views.RaidViewSet)
router.register('raidDays', views.RaidDayViewSet)
router.register('lootHistory', views.LootHistoryViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('login', views.LoginViewSet.as_view(), name='login'),
    path('signup', views.SignupViewSet.as_view(), name='signup'),
    path('logout', views.LogoutViewSet.as_view(), name='logout'),
]
