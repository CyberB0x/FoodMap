export default function NearbyFilters({ selectedType, onChange }) {
  const types = [
    { value: "restaurant", label: "🍽 Рестораны" },
    { value: "cafe", label: "☕ Кафе" },
    { value: "store", label: "🛍 Магазины" },
    { value: "gas_station", label: "⛽ АЗС" },
    { value: "hospital", label: "🏥 Больницы" },
  ];

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Фильтр мест рядом</h3>

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
          🔄 Показать всё
        </button>
      </div>
    </div>
  );
}
