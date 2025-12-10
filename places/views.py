from rest_framework import viewsets, permissions
from .models import Place, FavoritePlace
from .serializers import PlaceSerializer, FavoritePlaceSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
import requests
from rest_framework.decorators import api_view

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        rating = self.request.query_params.get('rating')
        type_place = self.request.query_params.get('type')
        if rating:
            queryset = queryset.filter(rating__gte=rating)
        if type_place:
            queryset = queryset.filter(type=type_place)
        return queryset

class FavoritePlaceViewSet(viewsets.ModelViewSet):
    serializer_class = FavoritePlaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoritePlace.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(["GET"])
def get_places(request):
    lat = request.query_params.get("lat")
    lng = request.query_params.get("lng")

    if not lat or not lng:
        return Response({"error": "lat and lng are required"}, status=400)

    query = f"""
    [out:json];
    (
      node["amenity"="restaurant"](around:1000,{lat},{lng});
      node["amenity"="cafe"](around:1000,{lat},{lng});
      node["amenity"="fast_food"](around:1000,{lat},{lng});
      node["amenity"="bar"](around:1000,{lat},{lng});
    );
    out;
    """

    response = requests.get(OVERPASS_URL, params={"data": query})
    data = response.json()

    places = []

    for element in data.get("elements", []):
        places.append({
            "id": element.get("id"),
            "name": element.get("tags", {}).get("name", "Unknown"),
            "lat": element.get("lat"),
            "lng": element.get("lon"),
            "type": element.get("tags", {}).get("amenity")
        })

    return Response(places)
