from django.db import migrations


def load_initial_data(apps, schema_editor):
    """Load initial data for districts and geographies"""
    District = apps.get_model('preferences', 'District')
    Geography = apps.get_model('preferences', 'Geography')

    # Kerala Districts with bounding box coordinates
    DISTRICTS = [
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

    # Geography types for travel preferences
    GEOGRAPHIES = [
        ('BEACH', 'Beach & Coastal', 'beach', 'Coastal areas, beaches, and seaside locations'),
        ('HILL', 'Hills & Mountains', 'mountain', 'Hill stations, mountain peaks, and elevated areas'),
        ('FRST', 'Forests & Wildlife', 'forest', 'Forest areas, wildlife sanctuaries, and nature reserves'),
        ('LAKE', 'Lakes & Backwaters', 'lake', 'Lakes, backwaters, and water bodies'),
        ('HIST', 'Historical Sites', 'historical', 'Historical monuments, forts, and heritage sites'),
        ('SPRT', 'Spiritual Places', 'religious', 'Temples, churches, mosques, and spiritual destinations'),
        ('ADV', 'Adventure Sports', 'adventure', 'Adventure activities and sports destinations'),
        ('CULT', 'Cultural Sites', 'cultural', 'Cultural centers, art galleries, and local experiences'),
    ]
    
    # Create districts
    for code, name, sw_lon, sw_lat, ne_lon, ne_lat in DISTRICTS:
        District.objects.get_or_create(
            code=code,
            defaults={
                'name': name,
                'sw_longitude': sw_lon,
                'sw_latitude': sw_lat,
                'ne_longitude': ne_lon,
                'ne_latitude': ne_lat,
            }
        )
    
    # Create geographies
    for code, name, api_code, description in GEOGRAPHIES:
        Geography.objects.get_or_create(
            code=code,
            defaults={
                'name': name,
                'api_code': api_code,
                'description': description
            }
        )


class Migration(migrations.Migration):

    dependencies = [
        ('preferences', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(load_initial_data),
    ]
