import csv
import json

with open('all_items.json') as f:
    all_item_list = json.loads(f.read())


with open('tbc_items.csv') as f:
    reader = csv.DictReader(f)
    csv_items = {row['name']: dict(row) for row in reader}


for item in all_item_list:
    if item['name'] in csv_items:
        csv_items[item['name']]['id'] = item['itemId']

with open('tbc_items.csv', 'w') as f:
    fieldnames = ['id', 'name', 'type', 'tier', 'notes', 'category']
    writer = csv.DictWriter(f, fieldnames=fieldnames)

    writer.writeheader()
    for row in csv_items.values():
        writer.writerow(row)
