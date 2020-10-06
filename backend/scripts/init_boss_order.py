import csv

from loot.models import Boss


# Only need to run if DB was seeded before migration 0007
def run():
    with open('seed_data/bosses.csv') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            boss = Boss.objects.get(id=row['id'])
            boss.order = row['order']
            boss.save()
