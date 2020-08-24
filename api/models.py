from datetime import date as date_obj
from typing import Dict, List, Tuple


class Player:

    def __init__(self, id: int, name: str, notes: str, player_class: str, role: str, rank: str):
        self.id: int = id
        self.name: str = name
        self.notes: str = notes
        self.player_class: str = player_class
        self.role: str = role
        self.rank: str = rank
        self.wishlist: List[Tuple[int, int]] = []  # List of (prio, item id) tuples
        self.attendance: List[int] = []  # List of raid ids attended

    def __str__(self):
        return f"<Player {self.id}: {self.name}>"


class Item:

    def __init__(self, id: int, name: str, type: str, tier: str, notes: str):
        self.id: int = id
        self.name: str = name
        self.type: str = type
        self.tier: str = tier
        self.notes: str = notes
        self.bosses: List[str] = []
        self.class_prio: List[Tuple[int, str]] = []  # List of (prio, class) tuples
        self.individual_prio: List[Tuple[int, int]] = []  # List of (prio, player id) tuples

    def __str__(self):
        return f"<Item {self.id}: {self.name}>"


class Raid:

    def __init__(self, id: int, name: str, short_name: str):
        self.id: int = id
        self.name: str = name
        self.short_name: str = short_name
        self.bosses: List[str] = []

    def __str__(self):
        return f"<Raid {self.id}: {self.name}>"


class RaidDay:

    def __init__(self, id: int, date: date_obj, name: str, raid: Raid):
        self.id: int = id
        self.date: date_obj = date
        self.name: str = name
        self.raid: Raid = raid

    def __str__(self):
        return f"<RaidDay {self.id}: {self.name}>"

    def __hash__(self):
        return hash(self.id)

    def __eq__(self, other):
        return self.id == other.id


class LootHistoryLine:

    def __init__(self, id: int, raid_day: int, item: int, player: int):
        self.id: int = id
        self.raid_day: int = raid_day
        self.item: int = item
        self.player: int = player

    def __str__(self):
        return f"<LootHistoryLine {self.id}: Item {self.item} to Player {self.player}>"
