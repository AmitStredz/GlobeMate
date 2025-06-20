from django.db import migrations

def load_initial_data(apps, schema_editor):
    District = apps.get_model('user_auth', 'District')

    DISTRICTS = [
        ('TVM', 'Thiruvananthapuram'),
        ('KLM', 'Kollam'),
        ('PTA', 'Pathanamthitta'),
        ('ALP', 'Alappuzha'),
        ('KTM', 'Kottayam'),
        ('IDK', 'Idukki'),
        ('EKM', 'Ernakulam'),
        ('TSR', 'Thrissur'),
        ('PLK', 'Palakkad'),
        ('MLP', 'Malappuram'),
        ('KKD', 'Kozhikode'),
        ('WYD', 'Wayanad'),
        ('KGD', 'Kasaragod'),
        ('KNR', 'Kannur'),
    ]


    for code, name in DISTRICTS:
        District.objects.get_or_create(code=code, name=name)


class Migration(migrations.Migration):

    dependencies = [
        ('user_auth', '0001_initial'),  # Adjust if you renamed initial migration
    ]

    operations = [
        migrations.RunPython(load_initial_data),
    ]
