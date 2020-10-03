from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import generics, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

from .serializers import (PlayerSerializer, ItemSerializer, RaidSerializer,
                          RaidDaySerializer, LootHistorySerializer, CurrentUserSerializer)
from .models import Player, Item, Raid, RaidDay, LootHistory, Wishlist
from .permissions import IsUserOrAdmin


class CsrfExemptSessionAuthentication(SessionAuthentication):

    def enforce_csrf(self, request):
        return


class PlayerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Player.objects.all().order_by('name')
    serializer_class = PlayerSerializer


class ItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer


class RaidViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Raid.objects.all()
    serializer_class = RaidSerializer


class RaidDayViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RaidDay.objects.all()
    serializer_class = RaidDaySerializer


class LootHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LootHistory.objects.all()
    serializer_class = LootHistorySerializer


class SignupViewSet(generics.CreateAPIView):

    def post(self, request, *args, **kwargs):
        if request.data['new']:
            player_name = request.data['player_name']
            try:
                player = Player.objects.get(name__iexact=player_name)
            except Player.DoesNotExist:
                # Expected if player is truly new
                player_class = Player.Classes[request.data['class'].upper().replace(" ", "_")]
                role = Player.Roles[request.data['role'].upper().replace(" ", "_")]
                player = Player.objects.create(name=player_name.capitalize(),
                                               player_class=player_class,
                                               role=role)
        else:
            player = Player.objects.get(id=request.data['player_id'])

        if player.user is not None:
            return Response({'error': 'Character Already Signed Up'})

        user = User.objects.create_user(username=player.name.lower(),
                                        password=request.data['password'])

        user.is_active = True
        user.save()
        player.user = user
        player.save()
        login(request, user)
        return Response(CurrentUserSerializer(user).data)


class LoginViewSet(generics.CreateAPIView):

    def post(self, request, *args, **kwargs):
        username = request.data['player_name'].lower()
        password = request.data['password']

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return Response(CurrentUserSerializer(user).data)
        else:
            return Response({'error': 'Invalid Username or Password'})


class LogoutViewSet(generics.RetrieveAPIView):

    def get(self, request, *args, **kwargs):
        logout(request)
        return Response(status=204)


class CurrentUserViewSet(generics.RetrieveAPIView):

    def get(self, request, *args, **kwargs):
        if request.user is None:
            return Response({'player': None})
        else:
            return Response(CurrentUserSerializer(request.user).data)


class UpdatePlayerViewSet(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsUserOrAdmin]
    authentication_classes = [CsrfExemptSessionAuthentication, BasicAuthentication]

    def post(self, request, *args, **kwargs):
        print('hi')
        player = Player.objects.get(id=request.data['player']['id'])
        self.check_object_permissions(request, player)

        # Only Superuser can update name/class/rank/attendance
        if request.user.is_superuser:
            player.name = request.data['player']['name']
            player.player_class = Player.Classes[request.data['player']['class'].upper().replace(" ", "_")]
            player.rank = Player.Ranks[request.data['player']['rank'].upper().replace(" ", "_")]
            player.attendance.clear()
            for raid_day_id in request.data['player']['attendance']:
                player.attendance.add(RaidDay.objects.get(id=raid_day_id))

        player.notes = request.data['player']['notes']
        player.role = Player.Roles[request.data['player']['role'].upper().replace(" ", "_")]

        for wishlist in player.wishlist.all():
            wishlist_dict = {'item_id': wishlist.item_id, 'prio': wishlist.priority}
            if wishlist_dict not in request.data['player']['wishlist']:
                wishlist.delete()

        for wishlist_dict in request.data['player']['wishlist']:
            item_id = wishlist_dict['item_id']
            prio = wishlist_dict['prio']
            Wishlist.objects.get_or_create(player=player, item_id=item_id, priority=prio)

        player.save()
        return Response(status=204)
