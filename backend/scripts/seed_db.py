import csv
from datetime import datetime
from contextlib import suppress

from loot.models import Player, Wishlist, Item, ClassPrio, IndividualPrio, Raid, Boss, RaidDay, LootHistory


def populate_from_csv(cls, filename):
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            cls.objects.create(**row).save()


def populate_raid_days(filename):
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            RaidDay.objects.create(
                id=row['id'],
                name=row['name'],
                raid_id=row['raid_id'],
                date=datetime.strptime(row['date'], '%m-%d-%Y').date(),
            ).save()


def populate_players(playerfilename, attendancefilename):
    with open(playerfilename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            Player.objects.create(
                id=row['id'],
                name=row['name'],
                notes=row['notes'],
                player_class=Player.Classes[row['class'].upper().replace(" ", "_")],
                role=Player.Roles[row['role'].upper().replace(" ", "_")],
                rank=Player.Ranks[row['rank'].upper().replace(" ", "_")],
            ).save()

    player_columns = [f'player_{x}' for x in range(1, 46)]
    with open(attendancefilename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            raid_day = RaidDay.objects.get(id=row['id'])
            for column in player_columns:
                player_name = row[column]
                with suppress(Player.DoesNotExist):
                    player = Player.objects.get(name=player_name)
                    player.attendance.add(raid_day)


def populate_items(itemfilename, bosslootfilename):
    default_raid = Raid.objects.all()[0]
    with open(itemfilename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                category = Item.Categories[row['category'].upper().replace(" ", "_")]
            except KeyError:
                category = ''

            try:
                tier = int(row['tier'])
            except ValueError:
                tier = None

            Item.objects.create(
                id=row['id'],
                name=row['name'],
                type=row['type'],
                tier=tier,
                category=category,
                notes=row['notes'],
                raid=default_raid,
            ).save()

    with open(bosslootfilename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            item = Item.objects.get(id=row['item_id'])
            boss = Boss.objects.get(id=row['boss_id'])
            item.raid = boss.raid
            item.save()
            item.bosses.add(boss)


def populate_wishlist(filename):
    wishlist_columns = [f'wishlist_{x}' for x in range(1, 15)]
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            player = Player.objects.get(name=row['name'])
            for index, column in enumerate(wishlist_columns):
                item_name = row[column]
                if item_name:
                    item = Item.objects.get(name=item_name)
                    Wishlist.objects.create(player=player, item=item, priority=(index + 1)).save()


def populate_loot_history(filename):
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            LootHistory.objects.create(
                raid_day=RaidDay.objects.get(name=row['raid_day_name']),
                item=Item.objects.get(name=row['item']),
                player=Player.objects.get(name=row['player']),
            ).save()


def populate_prios(filename):
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            item = Item.objects.get(name=row['name'])
            for n in (1, 2, 3, 4, 5):
                column = f'individual_prio_{n}'
                if row[column]:
                    IndividualPrio.objects.create(
                        item=item,
                        player=Player.objects.get(name=row[column]),
                        prio=n,
                    ).save()
            for n in (1, 2, 3, 4):
                column = f'class_prio_{n}'
                if row[column]:
                    ClassPrio.objects.create(
                        item=item,
                        class_name=row[column],
                        prio=n,
                    ).save()


def run():
    print('Populating Raids')
    populate_from_csv(Raid, 'seed_data/raid.csv')

    print('Populating Bosses')
    populate_from_csv(Boss, 'seed_data/bosses.csv')

    print('Populating Raid Days')
    populate_raid_days('seed_data/attendance.csv')

    print('Populating Players')
    populate_players('seed_data/players.csv', 'seed_data/attendance.csv')

    print('Populating Items')
    populate_items('seed_data/items.csv', 'seed_data/bossloot.csv')

    print('Populating Wishlists')
    populate_wishlist('seed_data/players.csv')

    print('Populating Loot History')
    populate_loot_history('seed_data/loot_history.csv')

    print('Populating Prios')
    populate_prios('seed_data/items.csv')
