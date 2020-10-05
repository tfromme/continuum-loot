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
    path('api/getCurrentUser', views.CurrentUserViewSet.as_view(), name='current_user'),
    path('api/updatePlayer', views.UpdatePlayerViewSet.as_view(), name='update_player'),
    path('api/updateItem', views.UpdateItemViewSet.as_view(), name='update_item'),
    path('api/updateLootHistory', views.UpdateLootHistoryViewSet.as_view(), name='update_loot_history'),
    path('api/addLootHistory', views.AddLootHistoryViewSet.as_view(), name='add_loot_history'),
    path('api/deleteLootHistory', views.DeleteLootHistoryViewSet.as_view(), name='delete_loot_history'),
    path('api/uploadAttendance', views.UploadAttendanceViewSet.as_view(), name='upload_attendance'),
    path('api/uploadLootHistory', views.UploadLootHistoryViewSet.as_view(), name='upload_loot_history'),
    path('api/', include(router.urls)),
    path('login', views.LoginViewSet.as_view(), name='login'),
    path('signup', views.SignupViewSet.as_view(), name='signup'),
    path('logout', views.LogoutViewSet.as_view(), name='logout'),
]
