from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register('getPlayers', views.PlayerViewSet)
router.register('getItems', views.ItemViewSet)
router.register('getRaids', views.RaidViewSet)
router.register('getRaidDays', views.RaidDayViewSet)
router.register('getLootHistory', views.LootHistoryViewSet)

urlpatterns = [
    path('api/getCurrentUser', views.CurrentUserViewSet.as_view(), name='currentUser'),
    path('api/', include(router.urls)),
    path('login', views.LoginViewSet.as_view(), name='login'),
    path('signup', views.SignupViewSet.as_view(), name='signup'),
    path('logout', views.LogoutViewSet.as_view(), name='logout'),
]
