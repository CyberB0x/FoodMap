import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function App() {
  const [position, setPosition] = useState(null);
  const [places, setPlaces] = useState([]);

  // --- 1. Получаем координаты пользователя ---
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("REAL GEO:", pos.coords.latitude, pos.coords.longitude);
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.warn("Geo error:", err);
        alert("GEO ERROR: " + err.message);
        setPosition([41.3111, 69.2797]); // fallback
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // --- 2. Автоматический поиск после получения координат ---
  useEffect(() => {
    if (position) {
      loadPlaces();
    }
  }, [position]);

  // --- Получение адреса (Reverse Geocoding) ---
  const getAddress = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "MyRestaurantApp/1.0" }
      });
      const data = await res.json();

      return data.display_name || "Адрес не найден";
    } catch (err) {
      return "Адрес неизвестен";
    }
  };

  // --- 3. Поиск ресторанов ---
  const loadPlaces = async () => {
    if (!position) return;

    try {
      const query = `
        [out:json];
        node["amenity"="restaurant"](around:3000,${position[0]},${position[1]});
        out;
      `;

      const url =
        "https://overpass-api.de/api/interpreter?data=" +
        encodeURIComponent(query);

      const res = await fetch(url);
      const json = await res.json();

      // Добавляем адрес к каждому ресторану
      const restaurants = await Promise.all(
        json.elements.map(async (el) => {
          const address = await getAddress(el.lat, el.lon);

          return {
            name: el.tags.name || "Ресторан",
            lat: el.lat,
            lng: el.lon,
            address: address
          };
        })
      );

      setPlaces(restaurants);
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };

  if (!position) return <h2>Загрузка карты...</h2>;

  return (
    <div>
      <h1>Поиск ресторанов (OSM + Leaflet)</h1>

      <button
        onClick={loadPlaces}
        style={{
          position: "absolute",
          zIndex: 9999,
          top: 20,
          left: 20,
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Обновить рестораны
      </button>

      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Метка пользователя */}
        <Marker position={position}>
          <Popup>Вы здесь</Popup>
        </Marker>

        {/* Метки ресторанов */}
        {places.map((p, index) => (
          <Marker key={index} position={[p.lat, p.lng]}>
            <Popup>
              <b>{p.name}</b> <br />
              {p.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
