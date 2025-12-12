import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useState, useEffect } from "react";
import NearbyFilters from "./components/NearbyFilters";

const libraries = ["places"];

export default function App() {
  const [placeType, setPlaceType] = useState("");
  const [position, setPosition] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [mapType, setMapType] = useState("roadmap");
  const [directions, setDirections] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_API_KEY",
    libraries,
  });

  // Получаем геолокацию
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setPosition({ lat: 41.3111, lng: 69.2797 });
      }
    );
  }, []);

  // ---- ЗАГРУЗКА МЕСТ ----
  const loadPlaces = () => {
    if (!position) return;

    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    const request = {
      location: position,
      radius: 3000,
      type: placeType || "restaurant",
      // openNow: true — можно включить если нужно
    };

    service.nearbySearch(request, (results, status) => {
      if (status !== "OK") return;

      const fullData = [];

      results.forEach((place) => {
        service.getDetails(
          {
            placeId: place.place_id,
            fields: ["name", "geometry", "vicinity", "rating", "photos"],
          },
          (details, dStatus) => {
            if (dStatus === "OK") {
              fullData.push({
                ...place,
                photos: details.photos,
              });
            } else {
              fullData.push(place);
            }

            if (fullData.length === results.length) {
              setPlaces(fullData);
            }
          }
        );
      });
    });
  };

  // Построение маршрута
  const buildRoute = (place) => {
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: position,
        destination: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        }
      }
    );
  };

  if (!isLoaded || !position) return <h2>Загрузка карты...</h2>;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* -------- ЛЕВОЕ МЕНЮ -------- */}
      <div
        style={{
          width: "350px",
          padding: "15px",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
          background: "#fafafa",
        }}
      >
        <h2>Рестораны рядом</h2>

        <button
          onClick={loadPlaces}
          style={{
            width: "100%",
            padding: "12px",
            background: "#4285F4",
            color: "white",
            borderRadius: "6px",
            marginBottom: "20px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Сканировать
        </button>

        {/* Фильтры */}
        <NearbyFilters selectedType={placeType} onChange={setPlaceType} />

        <h4>Режим карты</h4>
        <button onClick={() => setMapType("roadmap")}>Дорожная</button>
        <button onClick={() => setMapType("satellite")}>Спутник</button>
        <button onClick={() => setMapType("hybrid")}>Гибрид</button>

        <h4 style={{ marginTop: "15px" }}>Фильтр рейтинга</h4>
        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            marginBottom: "20px",
          }}
        >
          <option value={0}>Все</option>
          <option value={4.0}>4.0+</option>
          <option value={4.5}>4.5+</option>
          <option value={5}>5.0</option>
        </select>

        {/* Список мест */}
        {places
          .filter((p) => !p.rating || p.rating >= minRating)
          .map((place, idx) => (
            <div
              key={idx}
              style={{
                background: "white",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                marginBottom: "15px",
              }}
            >
              <h4>{place.name}</h4>
              <p>⭐ {place.rating || "—"}</p>

              {place.photos ? (
                <img
                  src={place.photos[0].getUrl({ maxWidth: 200 })}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "120px",
                    background: "#eee",
                    borderRadius: "8px",
                  }}
                ></div>
              )}

              <button
                onClick={() => {
                  setSelectedPlace(place);
                  buildRoute(place);
                }}
                style={{
                  marginTop: "10px",
                  padding: "8px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Показать на карте + маршрут
              </button>
            </div>
          ))}
      </div>

      {/* -------- КАРТА -------- */}
      <div style={{ flex: 1 }}>
        <GoogleMap
          center={position}
          zoom={15}
          mapTypeId={mapType}
          mapContainerStyle={{ width: "100%", height: "100%" }}
        >
          <Marker position={position} />

          {places.map((place, idx) => (
            <Marker
              key={idx}
              position={{
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              }}
              onClick={() => {
                setSelectedPlace(place);
                buildRoute(place);
              }}
            />
          ))}

          {/* Инфо окно */}
          {selectedPlace && (
            <InfoWindow
              position={{
                lat: selectedPlace.geometry.location.lat(),
                lng: selectedPlace.geometry.location.lng(),
              }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div style={{ width: "220px" }}>
                <h3>{selectedPlace.name}</h3>

                {selectedPlace.photos && (
                  <img
                    src={selectedPlace.photos[0].getUrl({ maxWidth: 200 })}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                )}

                {directions && (
                  <p>
                    🚗 {directions.routes[0].legs[0].distance.text} <br />
                    🕒 {directions.routes[0].legs[0].duration.text}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}

          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>
    </div>
  );
}
