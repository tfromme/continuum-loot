from datetime import date as date_obj
from typing import Dict, List


class Player:

    def __init__(self, id: int, name: str, notes: str, player_class: str, role: str, rank: str):
        self.id: int = id
        self.name: str = name
        self.notes: str = notes
        self.player_class: str = player_class
        self.role: str = role
        self.rank: str = rank
        self.wishlist: List[Item] = []
        self.attendance: Dict[RaidDay, bool] = {}

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
        self.class_prio: List[str] = []
        self.individual_prio: List[Player] = []

    def __str__(self):
        return f"<Item {self.id}: {self.name}>"


class Raid:

    def __init__(self, id: int, name: str, short_name: str, bosses: List[str]):
        self.id: int = id
        self.name: str = name
        self.short_name: str = short_name
        self.bosses: List[str] = bosses

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

    def __init__(self, id: int, raid_day: RaidDay, item: Item, player: Player):
        self.id: int = id
        self.raid_day: RaidDay = raid_day
        self.item: Item = item
        self.player: Player = player

    def __str__(self):
        return f"<LootHistoryLine {self.id}: {self.item} to {self.player}>"
