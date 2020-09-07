import csv
import sqlite3


def trim(lst):
    return [string.strip() for string in lst if string not in (None, '')]


def find_by_name(lst, name):
    return next((obj for obj in lst if obj['name'].lower() == name.lower()), None)


if __name__ == '__main__':
    with open('items.csv') as f:
        reader = csv.DictReader(f)
        items = [{
            'id': int(row['id']),
            'name': row['name'].strip(),
            'type': row['type'].strip(),
            'tier': int(row['tier']) if row['tier'] != '' else '',
            'notes': row['notes'].strip(),
            'individual_prio': trim([row['individual_prio_1'], row['individual_prio_2'],
                                     row['individual_prio_3'], row['individual_prio_4'], row['individual_prio_5']]),
            'class_prio': trim([row['class_prio_1'], row['class_prio_2'],
                                row['class_prio_3'], row['class_prio_4']]),
        } for row in reader]

    with open('players.csv') as f:
        reader = csv.DictReader(f)
        players = [{
            'id': int(row['id']),
            'name': row['name'].strip(),
            'class': row['class'].strip(),
            'role': row['role'].strip(),
            'rank': row['rank'].strip(),
            'notes': row['notes'].strip(),
            'wishlist': trim([row['wishlist_1'], row['wishlist_2'], row['wishlist_3'],
                              row['wishlist_4'], row['wishlist_5'], row['wishlist_6'], row['wishlist_7'],
                              row['wishlist_8'], row['wishlist_9'], row['wishlist_10'], row['wishlist_11'],
                              row['wishlist_12'], row['wishlist_13'], row['wishlist_14']]),
        } for row in reader]

    with open('attendance.csv') as f:
        reader = csv.DictReader(f)
        attendance = [{
            'id': int(row['id']),
            'raid_id': int(row['raid_id']),
            'name': row['name'].strip(),
            'date': row['date'].strip(),
            'attendance': trim([row['player_1'], row['player_2'], row['player_3'],
                                row['player_4'], row['player_5'], row['player_6'], row['player_7'],
                                row['player_8'], row['player_9'], row['player_10'], row['player_11'],
                                row['player_12'], row['player_13'], row['player_14'], row['player_15'],
                                row['player_16'], row['player_17'], row['player_18'], row['player_19'],
                                row['player_20'], row['player_21'], row['player_22'], row['player_23'],
                                row['player_24'], row['player_25'], row['player_26'], row['player_27'],
                                row['player_28'], row['player_29'], row['player_30'], row['player_31'],
                                row['player_32'], row['player_33'], row['player_34'], row['player_35'],
                                row['player_36'], row['player_37'], row['player_38'], row['player_39'],
                                row['player_40'], row['player_41'], row['player_42'], row['player_43'],
                                row['player_44'], row['player_45']]),
        } for row in reader]

    with open('loot_history.csv') as f:
        reader = csv.DictReader(f)
        loot_history = [{
            'id': int(row['id']),
            'raid_day': row['raid_day_name'].strip(),
            'player': row['player'].strip(),
            'item': row['item'].strip(),
        } for row in reader]

    for item in items:
        item['individual_prio'] = [find_by_name(players, name)['id']
                                   for name in item['individual_prio']]

    for player in players:
        player['wishlist'] = [find_by_name(items, name)['id']
                              for name in player['wishlist']]

    for raid in attendance:
        raid['attendance'] = [find_by_name(players, name)['id']
                              for name in raid['attendance']]

    for row in loot_history:
        row['raid_day'] = find_by_name(attendance, row['raid_day'])['id']
        row['player'] = find_by_name(players, row['player'])['id']
        row['item'] = find_by_name(items, row['item'])['id']

    conn = sqlite3.connect('../contloot.db')
    c = conn.cursor()

    i_prio_id = 1
    c_prio_id = 1
    for item in items:
        c.execute('INSERT INTO items VALUES (?, ?, ?, ?, ?)',
                  (item['id'], item['name'], item['type'], item['tier'], item['notes']))

        for i, player_id in enumerate(item['individual_prio']):
            c.execute('INSERT INTO individual_prio VALUES (?, ?, ?, ?, ?)',
                      (i_prio_id, item['id'], player_id, i + 1, 1))
            i_prio_id += 1

        for i, class_name in enumerate(item['class_prio']):
            c.execute('INSERT INTO class_prio VALUES (?, ?, ?, ?, ?)',
                      (c_prio_id, item['id'], class_name, i + 1, 1))
            c_prio_id += 1

    wishlist_id = 1
    for player in players:
        permission_level = 2 if int(player['id']) in (1, 2) else 0
        c.execute('INSERT INTO players VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                  (player['id'], player['name'], '', permission_level, player['notes'],
                   player['class'], player['role'], player['rank']))

        for i, item_id in enumerate(player['wishlist']):
            c.execute('INSERT INTO wishlist VALUES (?, ?, ?, ?)',
                      (wishlist_id, i + 1, player['id'], item_id))
            wishlist_id += 1

    attendance_id = 1
    for day in attendance:
        c.execute('INSERT INTO raid_days VALUES (?, ?, ?, ?)',
                  (day['id'], day['date'], day['name'], day['raid_id']))

        for player_id in day['attendance']:
            c.execute('INSERT INTO attendance VALUES (?, ?, ?)',
                      (attendance_id, day['id'], player_id))
            attendance_id += 1

    for line in loot_history:
        c.execute('INSERT INTO loot_history VALUES (?, ?, ?, ?)',
                  (line['id'], line['raid_day'], line['item'], line['player']))

    conn.commit()
    conn.close()
