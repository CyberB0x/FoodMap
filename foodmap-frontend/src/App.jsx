import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  useJsApiLoader,
  Autocomplete,
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
  const [searchBox, setSearchBox] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_API_KEY",
    libraries,
  });

  // Геолокация
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

  // Autocomplete
  const onPlaceChanged = () => {
    if (!searchBox) return;

    const place = searchBox.getPlace();
    if (!place.geometry) return;

    setPosition({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });

    setPlaces([]);
    setDirections(null);
    setSelectedPlace(null);
  };

  // Загрузка мест
  const loadPlaces = () => {
    if (!position) return;

    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    const request = {
      location: position,
      radius: 3000,
      type: placeType || "restaurant",
    };

    service.nearbySearch(request, (results, status) => {
      if (status !== "OK") return;

      const fullData = [];

      results.forEach((place) => {
        service.getDetails(
          {
            placeId: place.place_id,
            fields: [
              "name",
              "geometry",
              "vicinity",
              "rating",
              "photos",
              "opening_hours",
            ],
          },
          (details, dStatus) => {
            if (dStatus === "OK") {
              fullData.push({ ...place, ...details });
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

  // Маршрут
  const buildRoute = (place) => {
    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin: position,
        destination: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") setDirections(result);
      }
    );
  };

  if (!isLoaded || !position) return <h2>Loading map…</h2>;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* ---------- SIDEBAR ---------- */}
      <div
        style={{
          width: "360px",
          padding: "18px",
          background: "#f5f7fb",
          overflowY: "auto",
          borderRight: "1px solid #ddd",
        }}
      >
        <h2>📍 Places Nearby</h2>

        <Autocomplete onLoad={setSearchBox} onPlaceChanged={onPlaceChanged}>
          <input
            type="text"
            placeholder="Search for a city or place…"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              marginBottom: "15px",
            }}
          />
        </Autocomplete>

        <button
          onClick={loadPlaces}
          style={{
            width: "100%",
            padding: "12px",
            background: "#4285F4",
            color: "white",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          🔍 Scan
        </button>

        <NearbyFilters selectedType={placeType} onChange={setPlaceType} />

        <h4>Rating filter</h4>
        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <option value={0}>All</option>
          <option value={4}>4.0+</option>
          <option value={4.5}>4.5+</option>
        </select>

        {places
          .filter((p) => !p.rating || p.rating >= minRating)
          .map((place, idx) => (
            <div
              key={idx}
              style={{
                background: "#fff",
                padding: "14px",
                borderRadius: "14px",
                marginBottom: "18px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              }}
            >
              <h4>{place.name}</h4>
              <p>⭐ {place.rating || "—"}</p>
              <p>
                {place.opening_hours?.open_now ? "🟢 Open" : "🔴 Closed"}
              </p>

              {place.photos ? (
                <img
                  src={place.photos[0].getUrl({ maxWidth: 250 })}
                  style={{ width: "100%", borderRadius: "10px" }}
                />
              ) : (
                <div style={{ height: "120px", background: "#eee" }} />
              )}

              <button
                onClick={() => {
                  setSelectedPlace(place);
                  buildRoute(place);
                }}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "8px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                🧭 Route
              </button>
            </div>
          ))}
      </div>

      {/* ---------- MAP ---------- */}
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

          {selectedPlace && (
            <InfoWindow
              position={{
                lat: selectedPlace.geometry.location.lat(),
                lng: selectedPlace.geometry.location.lng(),
              }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div>
                <h3>{selectedPlace.name}</h3>
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
