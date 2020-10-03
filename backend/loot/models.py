from django.db import models
from django.contrib.auth.models import User


class Player(models.Model):

    class Classes(models.TextChoices):
        DRUID = 'DR'
        HUNTER = 'HN'
        MAGE = 'MG'
        PALADIN = 'PL'
        PRIEST = 'PR'
        ROGUE = 'RG'
        WARLOCK = 'WL'
        WARRIOR = 'WR'

    class Roles(models.TextChoices):
        DPS = 'D', 'DPS'
        TANK = 'T'
        HEALER = 'H'

    class Ranks(models.IntegerChoices):
        INACTIVE = 0
        PUG = 10
        TRIAL = 20
        MEMBER = 30
        VETERAN = 40
        CORE_RAIDER = 50
        CLASS_LEAD = 60
        OFFICER = 70
        GM = 80, 'GM'

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=20)
    notes = models.TextField()
    player_class = models.CharField(max_length=2, choices=Classes.choices, default=Classes.WARRIOR)
    role = models.CharField(max_length=1, choices=Roles.choices, default=Roles.DPS)
    rank = models.IntegerField(choices=Ranks.choices, default=Ranks.TRIAL)
    attendance = models.ManyToManyField('RaidDay')

    def __str__(self):
        return self.name


class Wishlist(models.Model):
    player = models.ForeignKey(Player, related_name='wishlist', on_delete=models.CASCADE)
    item = models.ForeignKey('Item', on_delete=models.CASCADE)
    priority = models.PositiveSmallIntegerField()

    def __str__(self):
        return f"{self.player.name} wants {self.item.name}"


class Item(models.Model):

    class Categories(models.TextChoices):
        CASTER = 'CS'
        HEALER = 'HL'
        PHYSICAL = 'PH'
        NATURE_RES = 'NR'

    name = models.CharField(max_length=20)
    type = models.CharField(max_length=20)
    tier = models.PositiveSmallIntegerField(null=True)
    category = models.CharField(max_length=2, choices=Categories.choices)
    notes = models.TextField()
    raid = models.ForeignKey('Raid', on_delete=models.CASCADE)
    bosses = models.ManyToManyField('Boss')

    def __str__(self):
        return self.name


class ClassPrio(models.Model):
    item = models.ForeignKey(Item, related_name='class_prios', on_delete=models.CASCADE)
    class_name = models.CharField(max_length=50)
    prio = models.PositiveSmallIntegerField()
    set_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f"{self.class_name} has prio {self.prio} on {self.item.name}"


class IndividualPrio(models.Model):
    item = models.ForeignKey(Item, related_name='individual_prios', on_delete=models.CASCADE)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    prio = models.PositiveSmallIntegerField()
    set_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f"{self.player.name} has prio {self.prio} on {self.item.name}"


class Raid(models.Model):
    name = models.CharField(max_length=30)
    short_name = models.CharField(max_length=10)

    def __str__(self):
        return self.short_name


class Boss(models.Model):
    name = models.CharField(max_length=30)
    raid = models.ForeignKey(Raid, related_name='bosses', on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class RaidDay(models.Model):
    name = models.CharField(max_length=30)
    date = models.DateField()
    raid = models.ForeignKey(Raid, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class LootHistory(models.Model):
    raid_day = models.ForeignKey(RaidDay, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.item} to {self.player}"