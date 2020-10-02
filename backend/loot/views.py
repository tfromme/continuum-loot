from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import generics, viewsets
from rest_framework.response import Response

from .serializers import (PlayerSerializer, ItemSerializer, RaidSerializer,
                          RaidDaySerializer, LootHistorySerializer, CurrentUserSerializer)
from .models import Player, Item, Raid, RaidDay, LootHistory


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


class LogoutViewSet(generics.CreateAPIView):

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response(status=204)
