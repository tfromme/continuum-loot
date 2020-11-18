# Generated by Django 3.1.2 on 2020-11-18 17:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('loot', '0013_auto_20201104_0533'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='category',
            field=models.CharField(choices=[('CS', 'Caster'), ('HL', 'Healer'), ('PH', 'Physical'), ('NR', 'Nature Res'), ('FR', 'Frost Res')], max_length=2),
        ),
    ]
