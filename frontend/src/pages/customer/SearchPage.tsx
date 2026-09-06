import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../api/client";
import { VehicleCard } from "../../components/VehicleCard";
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Find a nearby ride</h1>
      <p className="mt-1 text-sm text-ink-500">
        Share your location for the best matches, or search by city.
      </p>

      <div className="card mt-5 grid gap-3 p-4 sm:grid-cols-5">
        <button onClick={detectLocation} className="btn-secondary sm:col-span-1">
          📍 Use my location
        </button>
        <input
          className="input sm:col-span-1"
          placeholder="City"
          value={city}
          disabled={!!coords}
          onChange={(e) => setCity(e.target.value)}
        />
        <select
          className="input sm:col-span-1"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value as VehicleType | "")}
        >
          {VEHICLE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          className="input sm:col-span-1"
          placeholder="Max price/day"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <select
          className="input sm:col-span-1"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="match">Best match</option>
          <option value="distance">Nearest</option>
          <option value="price">Cheapest</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      {locationError && <p className="mt-2 text-sm text-amber-600">{locationError}</p>}

      <div className="mt-3">
        <button onClick={runSearch} className="btn-primary !py-2 !px-4 text-sm">
          Search
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-ink-500">Searching nearby vehicles...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && results.length === 0 && !error && (
          <p className="text-ink-500">No vehicles matched your search. Try widening filters.</p>
        )}
        {results.map((v) => (
          <VehicleCard key={v.id} vehicle={v} />
        ))}
      </div>
    </div>
  );
}
