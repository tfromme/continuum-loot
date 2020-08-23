import sqlite3
from contextlib import contextmanager

from models import Player, Item, Raid, RaidDay, LootHistoryLine


def pull_from_database():
    with get_db() as db:
        db_rows = {table_name: {row['id']: dict(row) for row in db.execute(f'SELECT * FROM {table_name}')}
                   for table_name in ('players', 'attendance', 'wishlist', 'loot_history',
                                      'items', 'individual_prio', 'class_prio',
                                      'raid', 'raid_days', 'bosses', 'boss_loot')}

    players = {id: Player(id, row['name'], row['notes'], row['class'], row['role'], row['rank'])
               for id, row in db_rows['players'].items()}

    items = {id: Item(id, row['name'], row['type'], row['tier'], row['notes'])
             for id, row in db_rows['items'].items()}

    for row in db_rows['boss_loot'].values():
        items[row['item_id']].bosses.append(db_rows['bosses'][row['boss_id']])

    print(items[list(items.keys())[0]])


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


pull_from_database()
