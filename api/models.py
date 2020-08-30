from datetime import date as date_obj
from typing import Dict, List, Tuple

from utils import date_to_str


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
            'date': date_to_str(self.date),
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

    def to_dict(self):
        return {
            'id': self.id,
            'raid_day_id': self.raid_day,
            'item_id': self.item,
            'player_id': self.player,
        }

    def __str__(self):
        return f"<LootHistoryLine {self.id}: Item {self.item} to Player {self.player}>"
