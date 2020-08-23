import csv
import sqlite3


def create_tables(c):
    c.execute('CREATE TABLE players (id integer primary key, name text, salt text, '
              'password_hash text, notes text, class text, role text, rank text)')
    c.execute('CREATE TABLE items (id integer primary key, name text, type text, '
              'tier integer, notes text)')
    c.execute('CREATE TABLE raid (id integer primary key, name text, short_name text)')
    c.execute('CREATE TABLE bosses (id integer primary key, name text, raid_id integer, '
              'FOREIGN KEY(raid_id) REFERENCES raid(id))')
    c.execute('CREATE TABLE boss_loot (id integer primary key, item_id integer, boss_id integer, '
              'FOREIGN KEY(item_id) REFERENCES items(id), FOREIGN KEY(boss_id) REFERENCES bosses(id))')
    c.execute('CREATE TABLE wishlist (id integer primary key, priority integer, '
              'player_id integer, item_id integer, '
              'FOREIGN KEY(player_id) REFERENCES players(id), '
              'FOREIGN KEY(item_id) REFERENCES items(id))')
    c.execute('CREATE TABLE class_prio (id integer primary key, item_id integer, '
              'class text, prio integer, set_by_player_id integer, '
              'FOREIGN KEY(item_id) REFERENCES items(id), '
              'FOREIGN KEY(set_by_player_id) REFERENCES players(id))')
    c.execute('CREATE TABLE individual_prio (id integer primary key, item_id integer, '
              'player_id integer, prio integer, set_by_player_id integer, '
              'FOREIGN KEY(item_id) REFERENCES items(id), '
              'FOREIGN KEY(player_id) REFERENCES players(id), '
              'FOREIGN KEY(set_by_player_id) REFERENCES players(id))')
    c.execute('CREATE TABLE raid_days (id integer primary key, date text, name text, '
              'raid_id integer, FOREIGN KEY(raid_id) REFERENCES raid(id))')
    c.execute('CREATE TABLE loot_history (id integer primary key, raid_day_id integer, '
              'item_id integer, player_id integer, '
              'FOREIGN KEY(raid_day_id) REFERENCES raid_day(id), '
              'FOREIGN KEY(item_id) REFERENCES items(id), '
              'FOREIGN KEY(player_id) REFERENCES players(id))')
    c.execute('CREATE TABLE attendance (id integer primary key, raid_day_id integer, '
              'player_id integer, FOREIGN KEY(raid_day_id) REFERENCES raid_day(id), '
              'FOREIGN KEY(player_id) REFERENCES players(id))')


def populate_raid(c, filename):
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            c.execute('INSERT INTO raid VALUES (?, ?, ?)',
                      (row['id'], row['name'], row['short_name']))


def populate_bosses(c, filename):
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            c.execute('INSERT INTO bosses VALUES (?, ?, ?)',
                      (row['id'], row['name'], row['raid_id']))


def populate_items(c, filename):
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            c.execute('INSERT INTO items VALUES (?, ?, ?, ?, ?)',
                      (row['id'], row['name'], row['type'], row['tier'], row['notes']))


def populate_boss_loot(c, filename):
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            c.execute('INSERT INTO boss_loot VALUES (?, ?, ?)',
                      (row['id'], row['item_id'], row['boss_id']))


if __name__ == '__main__':
    conn = sqlite3.connect('contloot.db')
    c = conn.cursor()

    create_tables(c)
    populate_raid(c, 'data/raid.csv')
    populate_bosses(c, 'data/bosses.csv')
    populate_items(c, 'data/items.csv')
    populate_boss_loot(c, 'data/bossloot.csv')

    conn.commit()
    conn.close()
