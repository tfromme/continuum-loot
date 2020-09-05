import sqlite3
from contextlib import contextmanager

from utils import str_to_date
from models import Player, User, Item, Raid, RaidDay, LootHistoryLine


def load_players():
    with get_db() as db:
        db_rows = {table_name: {row['id']: dict(row) for row in db.execute(f'SELECT * FROM {table_name}')}
                   for table_name in ('players', 'attendance', 'wishlist')}

    players = {id: Player(id, row['name'], row['notes'], row['class'], row['role'], row['rank'])
               for id, row in db_rows['players'].items()}

    for row in db_rows['wishlist'].values():
        players[row['player_id']].wishlist.append((row['priority'], row['item_id']))

    for row in db_rows['attendance'].values():
        players[row['player_id']].attendance.append(row['raid_day_id'])

    users = {id: User(id, row['name'], row['password_hash'], row['permission_level'])
             for id, row in db_rows['players'].items()}

    return players, users


def load_items():
    with get_db() as db:
        db_rows = {table_name: {row['id']: dict(row) for row in db.execute(f'SELECT * FROM {table_name}')}
                   for table_name in ('items', 'individual_prio', 'class_prio', 'bosses', 'boss_loot', 'raid')}

    items = {id: Item(id, row['name'], row['type'], row['tier'], row['notes'])
             for id, row in db_rows['items'].items()}

    for row in db_rows['boss_loot'].values():
        items[row['item_id']].bosses.append(db_rows['bosses'][row['boss_id']]['name'])
        items[row['item_id']].raid = db_rows['bosses'][row['boss_id']]['raid_id']

    for row in db_rows['class_prio'].values():
        items[row['item_id']].class_prio.append((row['prio'], row['class'], row['set_by_player_id']))

    for row in db_rows['individual_prio'].values():
        items[row['item_id']].individual_prio.append((row['prio'], row['player_id'], row['set_by_player_id']))

    return items


def load_raids_and_raid_days():
    with get_db() as db:
        db_rows = {table_name: {row['id']: dict(row) for row in db.execute(f'SELECT * FROM {table_name}')}
                   for table_name in ('raid', 'raid_days', 'bosses')}

    raids = {id: Raid(id, row['name'], row['short_name']) for id, row in db_rows['raid'].items()}

    for row in db_rows['bosses'].values():
        raids[row['raid_id']].bosses.append(row['name'])

    raid_days = {id: RaidDay(id, str_to_date(row['date']), row['name'], raids[row['raid_id']])
                 for id, row in db_rows['raid_days'].items()}

    return raids, raid_days


def load_loot_history():
    with get_db() as db:
        db_rows = {row['id']: dict(row) for row in db.execute('SELECT * FROM loot_history')}

    return {id: LootHistoryLine(id, row['raid_day_id'], row['item_id'], row['player_id'])
            for id, row in db_rows.items()}


def new_user(name, password_hash, permission_level, notes, className, role, rank):
    with get_db() as db:
        db.execute('INSERT INTO players (name, password_hash, permission_level, notes, class, role, rank) '
                   'VALUES (?, ?, ?, ?, ?, ?, ?)',
                   (name, password_hash, permission_level, notes, className, role, rank))
        db.connection.commit()
        last_row = [dict(row) for row in db.execute('SELECT * FROM players ORDER BY id DESC LIMIT 1')][0]

    return User(last_row['id'], last_row['name'], last_row['password_hash'], last_row['permission_level'])


def set_password_hash(player_id, password_hash):
    with get_db() as db:
        db.execute('UPDATE players SET password_hash = ? WHERE id = ?', (password_hash, player_id))
        db.connection.commit()
        last_row = [dict(row) for row in db.execute('SELECT * FROM players WHERE id = ?', (player_id,))][0]

    return User(last_row['id'], last_row['name'], last_row['password_hash'], last_row['permission_level'])


@contextmanager
def get_db():
    conn = sqlite3.connect('contloot.db')
    conn.row_factory = sqlite3.Row
    db = conn.cursor()
    try:
        yield db
        conn.commit()
    finally:
        conn.close()
