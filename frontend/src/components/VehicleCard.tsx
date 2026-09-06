import { Link } from "react-router-dom";
import { RankedVehicle } from "../types";
import { StatusBadge } from "./StatusBadge";

const TYPE_EMOJI: Record<string, string> = {
  SCOOTER: "🛵",
  MOTORCYCLE: "🏍️",
  BICYCLE: "🚲",
  EBIKE: "⚡",
};

export function VehicleCard({ vehicle }: { vehicle: RankedVehicle }) {
  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="card flex gap-4 p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-3xl">
        {TYPE_EMOJI[vehicle.vehicleType] || "🛵"}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display font-bold text-ink-900">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-ink-500">{vehicle.city}</p>
          </div>
          <StatusBadge status={vehicle.verificationStatus} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-700">
          <span className="font-semibold text-ink-900">₹{vehicle.pricePerDay}/day</span>
          <span>⭐ {vehicle.ratingAvg.toFixed(1)} ({vehicle.ratingCount})</span>
          {vehicle.distanceKm !== null && <span>📍 {vehicle.distanceKm} km away</span>}
          <span className="ml-auto text-xs text-brand-600 font-medium">
            Match {Math.round(vehicle.matchScore * 100)}%
          </span>
        </div>
      </div>
    </Link>
  );
}
