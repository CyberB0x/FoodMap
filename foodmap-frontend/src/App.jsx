import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { useState, useEffect } from "react";

export default function App() {
  const [position, setPosition] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [minRating, setMinRating] = useState(0); // ⭐ Фильтр рейтинга

  // --- 1. Загружаем Google Maps API ---
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "Your_API_KEY",
    libraries: ["places"],
  });

  // --- 2. Получаем реальную геолокацию ---
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setPosition({ lat: 41.3111, lng: 69.2797 }); // fallback — Ташкент
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // --- 3. Поиск ресторанов через Google Places ---
  const loadPlaces = () => {
    if (!position) return;

    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    const request = {
      location: position,
      radius: 3000,
      type: "restaurant",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === "OK") {
        setPlaces(results);
      }
    });
  };

  if (!isLoaded || !position) return <h2>Загрузка карты...</h2>;

  return (
    <div>
      <h1>Поиск ресторанов (Google Maps)</h1>

      {/* --- Кнопка поиска --- */}
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
        Найти рестораны
      </button>

      {/* --- ⭐ Фильтр рейтинга --- */}
      <div
        style={{
          position: "absolute",
          zIndex: 9999,
          top: 20,
          left: 150,
          background: "white",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
        >
          <option value={0}>Все</option>
          <option value={4.0}>4.0+</option>
          <option value={4.5}>4.5+</option>
          <option value={5}>5.0</option>
        </select>
      </div>

      {/* --- Карта --- */}
      <GoogleMap
        center={position}
        zoom={15}
        mapContainerStyle={{ width: "100%", height: "100vh" }}
      >
        {/* Вы здесь */}
        <Marker position={position} />

        {/* Рестораны c фильтром */}
        {places
          .filter((place) => {
            if (!place.rating) return minRating === 0;
            return place.rating >= minRating;
          })
          .map((place, idx) => (
            <Marker
              key={idx}
              position={{
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              }}
              onClick={() => setSelectedPlace(place)}
            />
          ))}

        {/* Popup */}
        {selectedPlace && (
          <InfoWindow
            position={{
              lat: selectedPlace.geometry.location.lat(),
              lng: selectedPlace.geometry.location.lng(),
            }}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div style={{ maxWidth: "200px" }}>
              <h3>{selectedPlace.name}</h3>

              {/* Фото ресторана */}
              {selectedPlace.photos ? (
                <img
                  src={selectedPlace.photos[0].getUrl({ maxWidth: 300 })}
                  alt={selectedPlace.name}
                  style={{ width: "100%", borderRadius: "8px", marginBottom: "8px" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "120px",
                    background: "#eee",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                  }}
                >
                  Нет фото
                </div>
              )}

              <p>{selectedPlace.vicinity}</p>

              {selectedPlace.rating && <p>⭐ {selectedPlace.rating}</p>}

              {/* Кнопка перехода в Google Maps */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.geometry.location.lat()},${selectedPlace.geometry.location.lng()}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  background: "#4285F4",
                  color: "white",
                  borderRadius: "6px",
                  marginTop: "8px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                Открыть в Google Maps
              </a>
            </div>

          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
