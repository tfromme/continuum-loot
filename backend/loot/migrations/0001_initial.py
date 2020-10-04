# Generated by Django 3.1.2 on 2020-10-02 15:52

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Boss',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=30)),
            ],
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20)),
                ('type', models.CharField(max_length=20)),
                ('tier', models.PositiveSmallIntegerField(null=True)),
                ('category', models.CharField(choices=[('CS', 'Caster'), ('HL', 'Healer'), ('PH', 'Physical'), ('NR', 'Nature Res')], max_length=2)),
                ('notes', models.TextField()),
                ('bosses', models.ManyToManyField(to='loot.Boss')),
            ],
        ),
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20)),
                ('notes', models.TextField()),
                ('player_class', models.CharField(choices=[('DR', 'Druid'), ('HN', 'Hunter'), ('MG', 'Mage'), ('PL', 'Paladin'), ('PR', 'Priest'), ('RG', 'Rogue'), ('WL', 'Warlock'), ('WR', 'Warrior')], default='WR', max_length=2)),
                ('role', models.CharField(choices=[('D', 'Dps'), ('T', 'Tank'), ('H', 'Healer')], default='D', max_length=1)),
                ('rank', models.IntegerField(choices=[(0, 'Inactive'), (10, 'Pug'), (20, 'Trial'), (30, 'Member'), (40, 'Veteran'), (50, 'Core Raider'), (60, 'Class Lead'), (70, 'Officer'), (80, 'Gm')], default=20)),
            ],
        ),
        migrations.CreateModel(
            name='Raid',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=30)),
                ('short_name', models.CharField(max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Wishlist',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('priority', models.PositiveSmallIntegerField()),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='loot.item')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='wishlist', to='loot.player')),
            ],
        ),
        migrations.CreateModel(
            name='RaidDay',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=30)),
                ('date', models.DateField()),
                ('raid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='loot.raid')),
            ],
        ),
        migrations.AddField(
            model_name='player',
            name='attendance',
            field=models.ManyToManyField(to='loot.RaidDay'),
        ),
        migrations.AddField(
            model_name='player',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, null=True),
        ),
        migrations.CreateModel(
            name='LootHistory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='loot.item')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='loot.player')),
                ('raid_day', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='loot.raidday')),
            ],
        ),
        migrations.AddField(
            model_name='item',
            name='raid',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='loot.raid'),
        ),
        migrations.CreateModel(
            name='IndividualPrio',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('prio', models.PositiveSmallIntegerField()),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='individual_prios', to='loot.item')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='loot.player')),
                ('set_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ClassPrio',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('class_name', models.CharField(max_length=50)),
                ('prio', models.PositiveSmallIntegerField()),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='class_prios', to='loot.item')),
                ('set_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='boss',
            name='raid',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bosses', to='loot.raid'),
        ),
    ]
