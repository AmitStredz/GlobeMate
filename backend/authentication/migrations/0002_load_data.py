# Generated by Django 5.2.2 on 2025-06-19 05:23

from django.db import migrations , models

def load_data(apps, schema_editor):
    Geography = apps.get_model('authentication', 'Geography')
    District = apps.get_model('authentication', 'District')

    DISTRICTS = [
        # (code, name, sw_longitude, sw_latitude, ne_longitude, ne_latitude)
        ('TVM', 'Thiruvananthapuram', 76.84, 8.28, 77.33, 8.85),
        ('KLM', 'Kollam', 76.43, 8.74, 77.13, 9.07),
        ('PTA', 'Pathanamthitta', 76.45, 9.10, 77.25, 9.65),
        ('ALP', 'Alappuzha', 76.20, 9.23, 76.57, 9.60),
        ('KTM', 'Kottayam', 76.27, 9.25, 76.81, 9.76),
        ('IDK', 'Idukki', 76.65, 9.30, 77.30, 10.20),
        ('EKM', 'Ernakulam', 76.08, 9.62, 76.69, 10.26),
        ('TSR', 'Thrissur', 75.88, 10.15, 76.50, 10.70),
        ('PLK', 'Palakkad', 76.38, 10.40, 76.92, 11.15),
        ('MLP', 'Malappuram', 75.93, 10.70, 76.48, 11.30),
        ('KKD', 'Kozhikode', 75.63, 11.15, 76.12, 11.65),
        ('WYD', 'Wayanad', 75.82, 11.48, 76.25, 11.98),
        ('KGD', 'Kasaragod', 74.85, 12.20, 75.42, 12.70),
        ('KNR', 'Kannur', 75.15, 11.67, 75.72, 12.28),
    ]

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
    
    for code, name, sw_lon, sw_lat, ne_lon, ne_lat in DISTRICTS:
        District.objects.get_or_create(
            code=code,
            name=name,
            sw_longitude=sw_lon,
            sw_latitude=sw_lat,
            ne_longitude=ne_lon,
            ne_latitude=ne_lat,
        )
    

    for code, name, api_code in GEOGRAPHIES:
        Geography.objects.get_or_create(
            code=code,
            defaults={'name': name, 'api_code': api_code}
        )
        
class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(load_data),

    ]
