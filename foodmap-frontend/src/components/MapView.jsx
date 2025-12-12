import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import NearbyFilters from "./NearbyFilters";

// фикс иконок (иначе не отображаются в Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
});

export default function MapView() {
  const [center] = useState([41.3111, 69.2797]);
  const [category, setCategory] = useState("restaurant");
  const [places, setPlaces] = useState([]);

  // ===== Загрузка POI из Overpass =====
  useEffect(() => {
    const query = `
      [out:json];
      (
        node["amenity"="${category}"](around:2000, ${center[0]}, ${center[1]});
        way["amenity"="${category}"](around:2000, ${center[0]}, ${center[1]});
      );
      out center;
    `;

    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    })
      .then((res) => res.json())
      .then((data) => {
        setPlaces(data.elements || []);
      });
  }, [category]);

  // ===== Проверка open_now =====
  const getOpenStatus = (tags) => {
    if (!tags?.opening_hours) return "Unknown";

    // простая проверка: наличие "24/7"
    if (tags.opening_hours.includes("24/7")) return "🟢 Open Now";

    return "❓ Depends on schedule";
  };

  return (
    <div>
      {/* ===== Фильтры ===== */}
      <NearbyFilters setCategory={setCategory} />

      {/* ===== Карта ===== */}
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        {/* ===== Маркеры ===== */}
        {places.map((place) => {
          const lat = place.lat || place.center?.lat;
          const lon = place.lon || place.center?.lon;

          return (
            <Marker key={place.id} position={[lat, lon]}>
              <Popup>
                <b>{place.tags.name || "Без названия"}</b>
                <br />
                <br />
                <b>Status:</b> {getOpenStatus(place.tags)}
                <br />
                <b>Category:</b> {category}
                <br />
                {place.tags.opening_hours && (
                  <>
                    <br />
                    <b>Hours:</b> {place.tags.opening_hours}
                  </>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
