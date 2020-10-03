import json
from datetime import datetime
from contextlib import suppress
from django.core.exceptions import PermissionDenied
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import generics, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

from .serializers import (PlayerSerializer, ItemSerializer, RaidSerializer,
                          RaidDaySerializer, LootHistorySerializer, CurrentUserSerializer)
from .models import Player, Item, Raid, RaidDay, LootHistory, Wishlist, ClassPrio, IndividualPrio
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

        if request.user.has_perm('loot.change_wishlist'):
            valid_ids = []
            for wishlist_dict in request.data['player']['wishlist']:
                w, _ = Wishlist.objects.get_or_create(
                    player=player,
                    item_id=wishlist_dict['item_id'],
                    priority=wishlist_dict['prio'],
                )
                valid_ids.append(w.id)

            for wishlist in player.wishlist.exclude(id__in=valid_ids):
                wishlist.delete()

        player.save()
        return Response(status=204)


class UpdateItemViewSet(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, BasicAuthentication]

    def post(self, request, *args, **kwargs):
        if not request.user.has_perm('loot.change_item'):
            raise PermissionDenied

        item = Item.objects.get(id=request.data['item']['id'])

        item.tier = request.data['item']['tier']
        item.category = Item.Categories[request.data['item']['category'].upper().replace(" ", "_")]
        item.notes = request.data['item']['notes']

        if request.user.has_perm('loot.change_classprio'):
            valid_ids = []
            for class_prio_dict in request.data['item']['class_prio']:
                cp, _ = ClassPrio.objects.get_or_create(
                    item=item,
                    class_name=class_prio_dict['class'],
                    prio=class_prio_dict['prio'],
                    defaults={'set_by': request.user},
                )
                valid_ids.append(cp.id)

            for class_prio in item.class_prios.exclude(id__in=valid_ids):
                class_prio.delete()

        if request.user.has_perm('loot.change_individualprio'):
            valid_ids = []
            for individual_prio_dict in request.data['item']['individual_prio']:
                ip, _ = IndividualPrio.objects.get_or_create(
                    item=item,
                    player_id=individual_prio_dict['player_id'],
                    prio=individual_prio_dict['prio'],
                    defaults={'set_by': request.user},
                )
                valid_ids.append(ip.id)

            for individual_prio in item.individual_prios.exclude(id__in=valid_ids):
                individual_prio.delete()

        item.save()
        return Response(status=204)


class UpdateLootHistoryViewSet(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, BasicAuthentication]

    def post(self, request, *args, **kwargs):
        if not request.user.has_perm('loot.change_loothistory'):
            raise PermissionDenied

        loot_history = LootHistory.objects.get(id=request.data['row']['id'])

        loot_history.raid_day_id = request.data['row']['raid_day_id']
        loot_history.item_id = request.data['row']['item_id']
        loot_history.player_id = request.data['row']['player_id']

        loot_history.save()
        return Response(status=204)


class AddLootHistoryViewSet(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, BasicAuthentication]

    def post(self, request, *args, **kwargs):
        if not request.user.has_perm('loot.add_loothistory'):
            raise PermissionDenied

        LootHistory.objects.create(
            raid_day_id=request.data['row']['raid_day_id'],
            item_id=request.data['row']['item_id'],
            player_id=request.data['row']['player_id'],
        )

        return Response(status=204)


class DeleteLootHistoryViewSet(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, BasicAuthentication]

    def post(self, request, *args, **kwargs):
        if not request.user.has_perm('loot.delete_loothistory'):
            raise PermissionDenied

        with suppress(LootHistory.DoesNotExist):
            LootHistory.objects.get(id=request.data['id']).delete()

        return Response(status=204)


class UploadAttendanceViewSet(generics.CreateAPIView):
    permission_classes = [IsAdminUser]
    authentication_classes = [CsrfExemptSessionAuthentication, BasicAuthentication]

    def post(self, request, *args, **kwargs):
        if request.data['raid_day_id'] == 'New':
            raid_day = RaidDay.objects.create(
                name=request.data['raid_day_name'],
                date=datetime.strptime(request.data['date'], '%Y-%m-%d').date(),
                raid_id=request.data['raid_id'],
            )
        else:
            raid_day = RaidDay.objects.get(id=request.data['raid_day_id'])

        player_names = request.data['data'].split(',')

        for player_name in player_names:
            try:
                player = Player.objects.get(name__iexact=player_name)
            except Player.DoesNotExist:
                player = Player.objects.create(name=player_name.capitalize())

            player.attendance.add(raid_day)
            player.save()

        return Response(status=204)


class UploadLootHistoryViewSet(generics.CreateAPIView):
    permission_classes = [IsAdminUser]
    authentication_classes = [CsrfExemptSessionAuthentication, BasicAuthentication]

    def post(self, request, *args, **kwargs):
        if request.data['raid_day_id'] == 'New':
            raid_day = RaidDay.objects.create(
                name=request.data['raid_day_name'],
                date=datetime.strptime(request.data['date'], '%Y-%m-%d').date(),
                raid_id=request.data['raid_id'],
            )
        else:
            raid_day = RaidDay.objects.get(id=request.data['raid_day_id'])

        json_data = json.loads(request.data['data'])
        for loot_history_data in json_data:
            # Strip server name
            player_name = loot_history_data['player'].split('-')[0]
            item_id = loot_history_data['itemID']
            is_disenchant = loot_history_data['response'] == 'Disenchant'

            if not is_disenchant:
                try:
                    player = Player.objects.get(name__iexact=player_name)
                except Player.DoesNotExist:
                    player = Player.objects.create(name=player_name.capitalize())

                item = Item.objects.get(id=item_id)

                LootHistory.objects.create(
                    raid_day=raid_day,
                    item=item,
                    player=player,
                )

                with suppress(Wishlist.DoesNotExist):
                    Wishlist.objects.get(player=player, item=item).delete()

                with suppress(IndividualPrio.DoesNotExist):
                    IndividualPrio.objects.get(player=player, item=item).delete()

        return Response(status=204)
