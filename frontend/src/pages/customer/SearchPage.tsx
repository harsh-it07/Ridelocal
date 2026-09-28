import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../api/client";
import { VehicleCard } from "../../components/VehicleCard";
import { Loader } from "../../components/Loader";
import { RankedVehicle, VehicleType } from "../../types";

const VEHICLE_TYPES: { value: VehicleType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "SCOOTER", label: "Scooter" },
  { value: "MOTORCYCLE", label: "Motorcycle" },
  { value: "EBIKE", label: "E-Bike" },
  { value: "BICYCLE", label: "Bicycle" },
];

export function SearchPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [city, setCity] = useState("Jaipur");
  const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<"match" | "distance" | "price" | "rating">("match");
  const [results, setResults] = useState<RankedVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(null);
      },
      () => setLocationError("Location access denied. You can still search by city.")
    );
  }

  async function runSearch() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/search/vehicles", {
        params: {
          lat: coords?.lat,
          lng: coords?.lng,
          radiusKm: 15,
          city: coords ? undefined : city || undefined,
          vehicleType: vehicleType || undefined,
          maxPrice: maxPrice || undefined,
          sortBy,
        },
      });
      setResults(data.results);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, sortBy]);

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "56px 24px" }}>
      {/* Editorial Header */}
      <div>
        <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
          JAIPUR FLEET CATALOGUE
        </p>
        <h1
          style={{
            fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
            fontSize: "clamp(3.5rem, 8vw, 6rem)",
            lineHeight: 0.9,
            letterSpacing: "0.01em",
            color: "#F9D3CD",
            textTransform: "uppercase",
            margin: "8px 0 0",
          }}
        >
          FIND YOUR RIDE.
        </h1>
        <p style={{ fontSize: "1.0625rem", color: "#F0C4BC", marginTop: "12px", fontWeight: 500 }}>
          Two wheels. One city. Direct peer-to-peer verified bookings.
        </p>
      </div>

      {/* Filter Toolbar — Styled in Dark Wine / Crimson Panel */}
      <div
        style={{
          marginTop: "40px",
          border: "1px solid rgba(249, 211, 205, 0.25)",
          backgroundColor: "#4E050E",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1", minWidth: "130px" }}>
            <label className="label">City Hub</label>
            <input
              className="input"
              placeholder="City"
              value={city}
              disabled={!!coords}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div style={{ flex: "1", minWidth: "130px" }}>
            <label className="label">Vehicle Type</label>
            <select
              className="input"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as VehicleType | "")}
            >
              {VEHICLE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1", minWidth: "120px" }}>
            <label className="label">Max Price / Day</label>
            <input
              className="input"
              placeholder="₹ Amount"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div style={{ flex: "1", minWidth: "130px" }}>
            <label className="label">Sort Order</label>
            <select
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="match">Best match</option>
              <option value="distance">Nearest</option>
              <option value="price">Lowest price</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={runSearch} className="btn-primary" style={{ padding: "14px 28px" }}>
              Filter Fleet →
            </button>
            <button onClick={detectLocation} className="btn-secondary" style={{ padding: "14px 18px", fontSize: "0.875rem" }}>
              Use GPS
            </button>
          </div>
        </div>
      </div>

      {locationError && <p style={{ marginTop: "12px", fontSize: "0.9375rem", color: "#F9D3CD" }}>{locationError}</p>}

      {/* Results List */}
      <div style={{ marginTop: "48px" }}>
        {loading && <Loader message="Searching nearby verified fleet..." />}
        {error && <p style={{ color: "#FF9B9B", fontSize: "1.0625rem" }}>{error}</p>}
        {!loading && results.length === 0 && !error && (
          <div style={{ padding: "48px 0", textAlign: "left" }}>
            <p style={{ color: "#F0C4BC", fontSize: "1.125rem" }}>
              No vehicles matched your search filters. Try widening the price or selecting all vehicle types.
            </p>
          </div>
        )}
        {results.map((v) => (
          <VehicleCard key={v.id} vehicle={v} />
        ))}
      </div>
    </div>
  );
}
