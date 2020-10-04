from datetime import date
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from .models import Player, LootHistory, Raid, RaidDay, Item, Boss, ClassPrio, IndividualPrio, Wishlist


class GetTests(APITestCase):

    def setUp(self):
        bwl = Raid.objects.create(id=1, name="Blackwing Lair", short_name="BWL")
        aq = Raid.objects.create(id=2, name="Ahn'Qiraj", short_name="AQ")
        vael = Boss.objects.create(id=1, name="Vaelestrasz", raid=bwl)
        huhu = Boss.objects.create(id=2, name="Huhuran", raid=aq)
        bwl1 = RaidDay.objects.create(id=50, name="BWL 1", date=date(2020, 2, 18), raid=bwl)
        aq1 = RaidDay.objects.create(id=60, name="AQ 1", date=date(2020, 8, 9), raid=aq)

        sulf = Item.objects.create(id=10, name="Sulfuras", type="Weapon", category=Item.Categories.CASTER, raid=bwl)
        sulf.bosses.add(vael)

        tear = Item.objects.create(id=20, name="Nelth's Tear", type="Trinket",
                                   category=Item.Categories.CASTER, raid=aq, notes="yikes")
        tear.bosses.add(vael)
        tear.bosses.add(huhu)

        nes = Player.objects.create(id=100, name="Nesingtick", player_class=Player.Classes.HUNTER,
                                    role=Player.Roles.DPS, rank=Player.Ranks.OFFICER, notes="yikes")
        morb = Player.objects.create(id=200, name="Morbidmind", player_class=Player.Classes.WARLOCK,
                                     role=Player.Roles.DPS, rank=Player.Ranks.GM)
        nes.attendance.add(bwl1)
        nes.attendance.add(aq1)

        ClassPrio.objects.create(item=sulf, class_name="Shaman", prio=1)
        ClassPrio.objects.create(item=sulf, class_name="Paladin", prio=2)
        ClassPrio.objects.create(item=tear, class_name="Hunters", prio=1)
        IndividualPrio.objects.create(item=sulf, player=nes, prio=1)
        Wishlist.objects.create(player=morb, item=tear, priority=1)
        Wishlist.objects.create(player=morb, item=sulf, priority=2)

        LootHistory.objects.create(id=1, raid_day=bwl1, item=sulf, player=nes)
        LootHistory.objects.create(id=2, raid_day=aq1, item=tear, player=morb)

        super().setUp()

    def test_get_players(self):
        response = self.client.get('/api/getPlayers/')
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(
            response.data,
            [
                {
                    'id': 100,
                    'name': 'Nesingtick',
                    'class': 'HN',
                    'role': 'D',
                    'rank': 70,
                    'notes': 'yikes',
                    'attendance': [50, 60],
                    'wishlist': [],
                },
                {
                    'id': 200,
                    'name': 'Morbidmind',
                    'class': 'WL',
                    'role': 'D',
                    'rank': 80,
                    'notes': '',
                    'attendance': [],
                    'wishlist': [{'item_id': 20, 'prio': 1}, {'item_id': 10, 'prio': 2}],
                },
            ])

    def test_get_items(self):
        response = self.client.get('/api/getItems/')
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(
            response.data,
            [
                {
                    'id': 10,
                    'name': 'Sulfuras',
                    'type': 'Weapon',
                    'tier': None,
                    'category': 'CS',
                    'notes': '',
                    'raid': 1,
                    'bosses': ['Vaelestrasz'],
                    'class_prio': [
                        {'class': 'Shaman', 'prio': 1, 'set_by': None},
                        {'class': 'Paladin', 'prio': 2, 'set_by': None},
                    ],
                    'individual_prio': [{'player_id': 100, 'prio': 1, 'set_by': None}],
                },
                {
                    'id': 20,
                    'name': "Nelth's Tear",
                    'type': 'Trinket',
                    'tier': None,
                    'category': 'CS',
                    'notes': 'yikes',
                    'raid': 2,
                    'bosses': ['Vaelestrasz', 'Huhuran'],
                    'class_prio': [{'class': 'Hunters', 'prio': 1, 'set_by': None}],
                    'individual_prio': [],
                },
            ]
        )

    def test_get_raids(self):
        response = self.client.get('/api/getRaids/')
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(
            response.data,
            [
                {
                    'id': 1,
                    'name': 'Blackwing Lair',
                    'short_name': 'BWL',
                    'bosses': ['Vaelestrasz'],
                },
                {
                    'id': 2,
                    'name': "Ahn'Qiraj",
                    'short_name': 'AQ',
                    'bosses': ['Huhuran'],
                },
            ]
        )

    def test_get_raid_days(self):
        response = self.client.get('/api/getRaidDays/')
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(
            response.data,
            [
                {
                    'id': 50,
                    'name': 'BWL 1',
                    'raid_id': 1,
                    'date': '2020-02-18',
                },
                {
                    'id': 60,
                    'name': 'AQ 1',
                    'raid_id': 2,
                    'date': '2020-08-09',
                },
            ]
        )

    def test_get_loot_history(self):
        response = self.client.get('/api/getLootHistory/')
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(
            response.data,
            [
                {
                    'id': 1,
                    'item_id': 10,
                    'player_id': 100,
                    'raid_day_id': 50,
                },
                {
                    'id': 2,
                    'item_id': 20,
                    'player_id': 200,
                    'raid_day_id': 60,
                },
            ]
        )


class LoginTests(APITestCase):

    def test_signup_new_player(self):
        self.assertEqual(Player.objects.count(), 0)
        self.assertEqual(User.objects.count(), 0)

        data = {'new': True,
                'player_name': 'dAvId',
                'class': 'Paladin',
                'role': 'Healer',
                'password': 'test_password',
                }
        response = self.client.post('/signup', data, format='json')
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.data['player']['name'], 'David')
        self.assertEqual(response.data['player']['permission_level'], 0)

        self.assertEqual(Player.objects.count(), 1)
        self.assertEqual(User.objects.count(), 1)

        player = Player.objects.get(name='David')
        self.assertEqual(player.player_class, Player.Classes.PALADIN)
        self.assertEqual(player.role, Player.Roles.HEALER)

        user = User.objects.get(username='david')

        self.assertEqual(player.user, user)

    def test_signup_old_player(self):

        Player.objects.create(
            id=5,
            name='David',
            player_class=Player.Classes.HUNTER,
            role=Player.Roles.DPS,
        )

        self.assertEqual(Player.objects.count(), 1)
        self.assertEqual(User.objects.count(), 0)

        data = {'new': False,
                'player_id': 5,
                'password': 'test_password',
                }

        response = self.client.post('/signup', data, format='json')
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.data['player']['id'], 5)
        self.assertEqual(response.data['player']['name'], 'David')
        self.assertEqual(response.data['player']['permission_level'], 0)

        self.assertEqual(Player.objects.count(), 1)
        self.assertEqual(User.objects.count(), 1)

        player = Player.objects.get(name='David')
        user = User.objects.get(username='david')
        self.assertEqual(player.user, user)

    def test_login(self):
        data = {'new': True,
                'player_name': 'dAvId',
                'class': 'Paladin',
                'role': 'Healer',
                'password': 'test_password',
                }
        response = self.client.post('/signup', data, format='json')
        self.assertEqual(response.status_code, 200)

        data = {'player_name': 'David', 'password': 'test_password'}

        response = self.client.post('/login', data, format='json')
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.data['player']['name'], 'David')
        self.assertEqual(response.data['player']['permission_level'], 0)


"""
class LootHistoryTests(APITestCase):

    def setUp(self):
        bwl = Raid.objects.create(id=1, name="Blackwing Lair", short_name="BWL")
        aq = Raid.objects.create(id=2, name="Ahn'Qiraj", short_name="AQ")
        Item.objects.create(id=10, name="item 10", type="t", category=Item.Categories.CASTER, raid=bwl)
        Item.objects.create(id=20, name="item 20", type="u", category=Item.Categories.CASTER, raid=aq)
        Player.objects.create(id=100, name="Nesingtick")
        Player.objects.create(id=200, name="Morbidmind")
        RaidDay.objects.create(id=50, name="BWL 1", date=date(2020, 2, 18), raid=bwl)
        RaidDay.objects.create(id=60, name="AQ 1", date=date(2020, 8, 9), raid=aq)

        User.objects.create_user('nesingtick', password='test_password')

        super().setUp()

    def test_add_loot_history(self):
        self.assertEqual(LootHistory.objects.count(), 0)

        data = {'item_id': 10,
                'player_id': 100,
                'raid_day_id': 50,
                }
        self.client.login(username='nesingtick', password='test_password')
        response = self.client.post('/api/lootHistory/', data, format='json')
        print(response.content)
        self.assertEqual(response.status_code, 200)

        self.assertEqual(LootHistory.objects.count(), 1)
"""
