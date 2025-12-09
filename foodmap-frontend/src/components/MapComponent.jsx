import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { getPlaces } from "../api/places";
import api from "../api/api";

// стандартный маркер Leaflet надо поправить
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// фикс для маркеров
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const defaultPosition = [41.0082, 28.9784]; // Стамбул

function MapComponent() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    getPlaces().then((data) => setPlaces(data));
  }, []);

  const addToFavorite = async (placeId) => {
    try {
      await api.post("favorites/", { place_id: placeId });
      alert("Добавлено в избранное!");
    } catch (err) {
      alert("Ошибка: нужно авторизоваться!");
    }
  };

  return (
    <MapContainer
      center={defaultPosition}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "90vh", width: "100%" }}
    >
      {/* бесплатные карты */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
        >
          <Popup>
            <h3>{place.name}</h3>
            <p>⭐ {place.rating}</p>
            <p>{place.type === "cafe" ? "Кафе" : "Ресторан"}</p>

            <button
              onClick={() => addToFavorite(place.id)}
              style={{
                padding: "5px 10px",
                background: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Добавить в избранное
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapComponent;
