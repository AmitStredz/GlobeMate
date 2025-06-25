from rest_framework import serializers
from .models import Traveller, District, Geography
from django.contrib.auth.hashers import make_password

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ['code', 'name']


class GeographySerializer(serializers.ModelSerializer):
    class Meta:
        model = Geography
        fields = ['code', 'api_code', 'name']


class TravellerSerializer(serializers.ModelSerializer):
    # Nested serializers to show detailed info
    preferred_districts = DistrictSerializer(many=True, read_only=True)
    preferred_geographies = GeographySerializer(many=True, read_only=True)

    class Meta:
        model = Traveller
        fields = [
            'id', 'username', 'age', 'gender',
            'preferred_districts', 'preferred_geographies',
            'email', 'is_verified'
        ]


class SignupSerializer(serializers.ModelSerializer):
    preferred_districts = serializers.SlugRelatedField(
        slug_field='code',queryset=District.objects.all(), many=True
    )
    preferred_geographies = serializers.SlugRelatedField(
        slug_field='code',queryset=Geography.objects.all(), many=True
    )
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Traveller
        fields = [
            'username', 'age', 'gender',
            'preferred_districts', 'preferred_geographies',
            'email', 'password'
        ]

    def validate_email(self, value):
        if Traveller.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def create(self, validated_data):
        districts = validated_data.pop('preferred_districts')
        geographies = validated_data.pop('preferred_geographies')
        password = validated_data.pop('password')

        traveller = Traveller.objects.create(
            **validated_data,
            password=make_password(password)  # Hash the password
        )
        traveller.preferred_districts.set(districts)
        traveller.preferred_geographies.set(geographies)
        traveller.save()
        return traveller
