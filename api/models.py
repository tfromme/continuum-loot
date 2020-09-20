from datetime import date as date_obj
from typing import Dict, List, Tuple

from utils import date_to_str_ui


class Player:

    def __init__(self, id: int, name: str, notes: str, player_class: str, role: str, rank: str):
        self.id = id
        self.name = name
        self.notes = notes
        self.player_class = player_class
        self.role = role
        self.rank = rank
        self.wishlist: List[Tuple[int, int]] = []  # List of (prio, item id) tuples
        self.attendance: List[int] = []  # List of raid ids attended

    @classmethod
    def from_dict(cls, data):
        new = cls(data['id'], data['name'], data['notes'], data['class'], data['role'], data['rank'])
        new.wishlist = [(line['prio'], line['item_id']) for line in data['wishlist']]
        new.attendance = data['attendance']
        return new

    @classmethod
    def from_db_rows(cls, player_row, wishlist_rows, attendance_rows):
        new = cls(player_row['id'], player_row['name'], player_row['notes'],
                  player_row['class'], player_row['role'], player_row['rank'])

        for row in wishlist_rows:
            new.wishlist.append((row['priority'], row['item_id']))

        for row in attendance_rows:
            new.attendance.append(row['raid_day_id'])

        return new

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'notes': self.notes,
            'class': self.player_class,
            'role': self.role,
            'rank': self.rank,
            'wishlist': [{'prio': prio, 'item_id': item_id} for prio, item_id in self.wishlist],
            'attendance': self.attendance,
        }

    def __str__(self):
        return f"<Player {self.id}: {self.name}>"


class User:

    def __init__(self, id: int, name: str, password_hash: str, permission_level: int):
        self.id = id
        self.name = name
        self.password_hash = password_hash
        self.permission_level = permission_level

    @classmethod
    def from_db_rows(cls, row):
        return cls(row['id'], row['name'], row['password_hash'], row['permission_level'])

    @property
    def exists(self):
        return self.password_hash != ''

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'permission_level': self.permission_level,
        }

    def __str__(self):
        return f"<User {self.id}: {self.name}>"


class Item:

    def __init__(self, id: int, name: str, type: str, tier: str, notes: str):
        self.id = id
        self.name = name
        self.type = type
        self.tier = tier
        self.notes = notes
        self.raid = -1
        self.bosses: List[str] = []
        self.class_prio: List[Tuple[int, str, int]] = []
        self.individual_prio: List[Tuple[int, int, int]] = []

    @classmethod
    def from_dict(cls, data):
        new = cls(data['id'], data['name'], data['type'], data['tier'], data['notes'])
        new.raid = data['raid']
        new.bosses = data['bosses']
        new.class_prio = [(prio['prio'], prio['class'], prio['set_by']) for prio in data['class_prio']]
        new.individual_prio = [(prio['prio'], prio['player_id'], prio['set_by']) for prio in data['individual_prio']]
        return new

    @classmethod
    def from_db_rows(cls, item_row, boss_rows, boss_loot_rows, class_prio_rows, individual_prio_rows):
        boss_row_dict = {row['id']: row for row in boss_rows}

        new = cls(item_row['id'], item_row['name'], item_row['type'], item_row['tier'], item_row['notes'])

        new.raid = boss_rows[0]['raid_id']
        for row in boss_loot_rows:
            new.bosses.append(boss_row_dict[row['boss_id']]['name'])

        for row in class_prio_rows:
            new.class_prio.append((row['prio'], row['class'], row['set_by_player_id']))

        for row in individual_prio_rows:
            new.individual_prio.append((row['prio'], row['player_id'], row['set_by_player_id']))

        return new

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'tier': self.tier,
            'notes': self.notes,
            'raid': self.raid,
            'bosses': self.bosses,
            'class_prio': [{'prio': prio, 'class': class_name, 'set_by': set_by}
                           for prio, class_name, set_by in self.class_prio],
            'individual_prio': [{'prio': prio, 'player_id': player, 'set_by': set_by}
                                for prio, player, set_by in self.individual_prio],
        }

    def __str__(self):
        return f"<Item {self.id}: {self.name}>"


class Raid:

    def __init__(self, id: int, name: str, short_name: str):
        self.id = id
        self.name = name
        self.short_name = short_name
        self.bosses: List[str] = []

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'short_name': self.short_name,
            'bosses': self.bosses,
        }

    def __str__(self):
        return f"<Raid {self.id}: {self.name}>"


class RaidDay:

    def __init__(self, id: int, date: date_obj, name: str, raid: Raid):
        self.id = id
        self.date = date
        self.name = name
        self.raid = raid

    def to_dict(self):
        return {
            'id': self.id,
            'date': date_to_str_ui(self.date),
            'name': self.name,
            'raid_id': self.raid.id,
        }

    def __str__(self):
        return f"<RaidDay {self.id}: {self.name}>"

    def __hash__(self):
        return hash(self.id)

    def __eq__(self, other):
        return self.id == other.id


class LootHistoryLine:

    def __init__(self, id: int, raid_day: int, item: int, player: int):
        self.id = id
        self.raid_day = raid_day
        self.item = item
        self.player = player

    @classmethod
    def from_dict(cls, data):
        return cls(data['id'], data['raid_day_id'], data['item_id'], data['player_id'])

    @classmethod
    def from_db_rows(cls, loot_history_row):
        return cls(loot_history_row['id'],
                   loot_history_row['raid_day_id'],
                   loot_history_row['item_id'],
                   loot_history_row['player_id'],
        )

    def to_dict(self):
        return {
            'id': self.id,
            'raid_day_id': self.raid_day,
            'item_id': self.item,
            'player_id': self.player,
        }

    def __str__(self):
        return f"<LootHistoryLine {self.id}: Item {self.item} to Player {self.player}>"
