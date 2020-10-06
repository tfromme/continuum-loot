from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Player, Item, Wishlist, Boss, ClassPrio, IndividualPrio, Raid, RaidDay, LootHistory


# Sub-serializer for PlayerSerializer
class WishlistSerializer(serializers.ModelSerializer):
    prio = serializers.IntegerField(source='priority')

    class Meta:
        model = Wishlist
        fields = ['item_id', 'prio']


class PlayerSerializer(serializers.ModelSerializer):
    wishlist = WishlistSerializer(many=True)

    class Meta:
        model = Player
        fields = ['id', 'name', 'notes', 'class', 'role', 'rank', 'attendance', 'wishlist']


# Oh reserved keywords, how I love thee
PlayerSerializer._declared_fields['class'] = serializers.CharField(source='player_class')


# Sub-serializer for ItemSerializer and RaidSerializer
class BossSerializer(serializers.RelatedField):

    class Meta:
        model = Boss

    def to_representation(self, value):
        return value.name


# Sub-serializer for ItemSerializer
class ClassPrioSerializer(serializers.ModelSerializer):

    class Meta:
        model = ClassPrio
        fields = ['class', 'prio', 'set_by']


# Oh reserved keywords, how I love thee
ClassPrioSerializer._declared_fields['class'] = serializers.CharField(source='class_name')


# Sub-serializer for ItemSerializer
class IndividualPrioSerializer(serializers.ModelSerializer):

    class Meta:
        model = IndividualPrio
        fields = ['player_id', 'prio', 'set_by']


class ItemSerializer(serializers.ModelSerializer):
    bosses = BossSerializer(queryset=Boss.objects.all(), many=True)
    class_prio = ClassPrioSerializer(source='class_prios', many=True)
    individual_prio = IndividualPrioSerializer(source='individual_prios', many=True)
    link = serializers.ReadOnlyField()

    class Meta:
        model = Item
        fields = ['id', 'name', 'type', 'tier', 'category', 'notes', 'raid',
                  'bosses', 'class_prio', 'individual_prio', 'link']


class RaidSerializer(serializers.ModelSerializer):
    bosses = BossSerializer(queryset=Boss.objects.all(), many=True)

    class Meta:
        model = Raid
        fields = ['id', 'name', 'short_name', 'bosses']


class RaidDaySerializer(serializers.ModelSerializer):

    class Meta:
        model = RaidDay
        fields = ['id', 'name', 'date', 'raid_id']


class LootHistorySerializer(serializers.ModelSerializer):

    class Meta:
        model = LootHistory
        fields = ['id', 'item_id', 'player_id', 'raid_day_id']


class CurrentUserSerializer(serializers.ModelSerializer):
    player = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['player']

    def get_player(self, user):
        permission_level = 0

        if user.is_superuser:
            permission_level = 2
        elif len(user.groups.all()) > 0:  # Only group is LC rn
            permission_level = 1

        return {'id': user.player.id, 'name': user.player.name, 'permission_level': permission_level}
