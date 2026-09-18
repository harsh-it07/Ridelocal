import { Link } from "react-router-dom";
import { RankedVehicle } from "../types";
import { StatusBadge } from "./StatusBadge";

const TYPE_ICON: Record<string, string> = {
  SCOOTER: "SC",
  MOTORCYCLE: "MC",
  BICYCLE: "BC",
  EBIKE: "EB",
};

export function VehicleCard({ vehicle }: { vehicle: RankedVehicle }) {
  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="card flex gap-4 p-5 hover-lift"
    >
      <div
        className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold tracking-wide"
        style={{ background: 'rgba(249, 115, 22, 0.10)', color: '#fb923c' }}
      >
        {TYPE_ICON[vehicle.vehicleType] || "SC"}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display font-bold text-ink-900">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-ink-500">
              {vehicle.city}
            </p>
          </div>
          <StatusBadge status={vehicle.verificationStatus} />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
          <span className="font-semibold text-ink-900">₹{vehicle.pricePerDay}/day</span>
          <span>{vehicle.ratingAvg.toFixed(1)} ({vehicle.ratingCount})</span>
          {vehicle.distanceKm !== null && <span>{vehicle.distanceKm} km away</span>}
          <span className="ml-auto text-xs font-medium" style={{ color: '#fb923c' }}>
            Match {Math.round(vehicle.matchScore * 100)}%
          </span>
        </div>
      </div>
    </Link>
  );
}
