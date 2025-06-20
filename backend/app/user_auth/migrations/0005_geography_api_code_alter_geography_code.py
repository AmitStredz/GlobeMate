# Generated by Django 5.2.2 on 2025-06-18 16:02

from django.db import migrations, models

def load_geography_data(apps, schema_editor):
    Geography = apps.get_model('user_auth', 'Geography')

    GEOGRAPHIES = [
        ('FRST', 'Forest', 'natural.forest'),
        ('SEA', 'Sea', 'natural.water.sea'),
        ('SPR', 'Spring', 'natural.water.spring'),
        ('REEF', 'Reef', 'natural.water.reef'),
        ('HTSPR', 'Hot Spring', 'natural.water.hot_spring'),
        ('GEYSER', 'Geyser', 'natural.water.geyser'),
        ('WTR', 'Water Body', 'natural.water'),
        ('PEAK', 'Mountain Peak', 'natural.mountain.peak'),
        ('GLCR', 'Glacier', 'natural.mountain.glacier'),
        ('CLFF', 'Cliff', 'natural.mountain.cliff'),
        ('ROCK', 'Rock Formation', 'natural.mountain.rock'),
        ('CAVE', 'Cave Entrance', 'natural.mountain.cave_entrance'),
        ('MNTN', 'Mountain Region', 'natural.mountain'),
        ('DUNE', 'Sand Dune', 'natural.sand.dune'),
        ('SAND', 'Sandy Area', 'natural.sand'),
        ('PRTA', 'Protected Area', 'natural.protected_area'),
        ('NTLPRK', 'National Park', 'national_park'),
        ('NTRL', 'Natural Area', 'natural'),
    ]

    for code, name, api_code in GEOGRAPHIES:
        Geography.objects.get_or_create(
            code=code,
            defaults={'name': name, 'api_code': api_code}
        )
        
class Migration(migrations.Migration):

    dependencies = [
        ('user_auth', '0004_populate_district_coordinates'),
    ]

    operations = [
        migrations.AddField(
            model_name='geography',
            name='api_code',
            field=models.CharField(max_length=100, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='geography',
            name='code',
            field=models.CharField(max_length=30, primary_key=True, serialize=False, unique=True),
        ),
        migrations.RunPython(load_geography_data),
    ]
