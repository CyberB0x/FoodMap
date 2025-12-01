from rest_framework import serializers
from .models import Place, FavoritePlace

class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = '__all__'

class FavoritePlaceSerializer(serializers.ModelSerializer):
    place = PlaceSerializer(read_only=True)
    place_id = serializers.PrimaryKeyRelatedField(
        queryset=Place.objects.all(),
        source='place',
        write_only=True
    )

    class Meta:
        model = FavoritePlace
        fields = ['id', 'place', 'place_id', 'created_at']
