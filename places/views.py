from rest_framework import viewsets, permissions
from .models import Place, FavoritePlace
from .serializers import PlaceSerializer, FavoritePlaceSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

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
