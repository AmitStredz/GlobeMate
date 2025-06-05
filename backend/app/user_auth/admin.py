from django.contrib import admin
from .models import Traveller, District, Geography

# Register your models here.

admin.site.register(Traveller)
admin.site.register(District)
admin.site.register(Geography)
