# Generated by Django 3.1.2 on 2021-07-12 17:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('loot', '0014_auto_20201118_1745'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='category',
            field=models.CharField(choices=[('CS', 'Caster'), ('HL', 'Healer'), ('PH', 'Physical'), ('TN', 'Tank')], max_length=2),
        ),
        migrations.AlterField(
            model_name='player',
            name='player_class',
            field=models.CharField(choices=[('DR', 'Druid'), ('HN', 'Hunter'), ('MG', 'Mage'), ('PL', 'Paladin'), ('PR', 'Priest'), ('RG', 'Rogue'), ('SH', 'Shaman'), ('WL', 'Warlock'), ('WR', 'Warrior')], default='WR', max_length=2),
        ),
        migrations.AlterField(
            model_name='player',
            name='rank',
            field=models.IntegerField(choices=[(0, 'Inactive'), (10, 'Pug'), (20, 'Trial'), (30, 'Member'), (40, 'Veteran'), (47, 'Raider'), (50, 'Core Raider'), (60, 'Class Lead'), (70, 'Officer'), (80, 'GM')], default=20),
        ),
    ]
