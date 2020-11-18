import csv

from loot.models import Item, ClassPrio, Raid, Boss, Player


def populate_items(filename):
    naxx_raid = Raid.objects.get(id=3)
    user = Player.objects.get(name__iexact='nesingtick').user
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            item = Item.objects.create(
                id=row['id'],
                name=row['name'],
                type=row['type'],
                tier=int(row['tier']),
                category='',
                notes='',
                raid=naxx_raid,
            )

            for boss_name in row['bosses'].split(';'):
                boss, _ = Boss.objects.get_or_create(name=boss_name, raid=naxx_raid, order=1)
                item.bosses.add(boss)

            for n in (1, 2):
                column = f'class_prio_{n}'
                if row[column]:
                    ClassPrio.objects.create(
                        item=item,
                        class_name=row[column],
                        prio=n,
                        set_by=user,
                    )


def run():
    Raid.objects.create(id=3, name='Naxxramas', short_name='Naxx')
    populate_items('seed_data/naxx_items.csv')
