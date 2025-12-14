export default function NearbyFilters({ selectedType, onChange }) {
  const types = [
    { value: "restaurant", label: "🍽 Restaurants" },
    { label: "🏨 Hotels", value: "lodging" },
    { value: "cafe", label: "☕ Cafés" },
    { value: "store", label: "🛍 Shops" },
    { value: "gas_station", label: "⛽ Gas stations" },
    { value: "hospital", label: "🏥 Hospitals" },
  ];

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Nearby places filter</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              background: selectedType === t.value ? "#1976d2" : "#f0f0f0",
              color: selectedType === t.value ? "#fff" : "#333",
              border: "1px solid #ccc",
              textAlign: "left",
              fontSize: "16px",
            }}
          >
            {t.label}
          </button>
        ))}

        <button
          onClick={() => onChange("")}
          style={{
            padding: "10px",
            borderRadius: "8px",
            cursor: "pointer",
            background: selectedType === "" ? "#1976d2" : "#f0f0f0",
            color: selectedType === "" ? "#fff" : "#333",
            border: "1px solid #ccc",
            textAlign: "left",
          }}
        >
          🔄 Show all
        </button>
      </div>
    </div>
  );
}
