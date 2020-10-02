from django.contrib import admin

from .models import Player, Wishlist, Item, ClassPrio, IndividualPrio, Raid, Boss, RaidDay, LootHistory


class WishlistInline(admin.TabularInline):
    model = Wishlist
    extra = 0


class PlayerAdmin(admin.ModelAdmin):
    list_display = ('name', 'player_class', 'role', 'rank')
    inlines = [WishlistInline]


class ClassPrioInline(admin.TabularInline):
    model = ClassPrio
    extra = 0


class IndividualPrioInline(admin.TabularInline):
    model = IndividualPrio
    extra = 0


class ItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'tier', 'category')
    inlines = [ClassPrioInline, IndividualPrioInline]


class BossInline(admin.TabularInline):
    model = Boss
    extra = 0


class RaidAdmin(admin.ModelAdmin):
    inlines = [BossInline]


class RaidDayAdmin(admin.ModelAdmin):
    list_display = ('name', 'raid', 'date')


class LootHistoryAdmin(admin.ModelAdmin):
    list_display = ('raid_day', 'item', 'player')


admin.site.register(Player, PlayerAdmin)
admin.site.register(Item, ItemAdmin)
admin.site.register(Raid, RaidAdmin)
admin.site.register(RaidDay, RaidDayAdmin)
admin.site.register(LootHistory, LootHistoryAdmin)
