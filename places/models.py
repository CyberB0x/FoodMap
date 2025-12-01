from django.db import models
from django.contrib.auth.models import User

class Place(models.Model):
    PLACE_TYPES = (
        ('cafe', 'Cafe'),
        ('restaurant', 'Restaurant'),
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    rating = models.FloatField(default=0)
    type = models.CharField(max_length=20, choices=PLACE_TYPES)

    def __str__(self):
        return self.name

class FavoritePlace(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    place = models.ForeignKey(Place, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'place')

    def __str__(self):
        return f"{self.user.username} -> {self.place.name}"
