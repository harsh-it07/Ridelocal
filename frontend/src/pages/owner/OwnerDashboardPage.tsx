import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";
import { Vehicle } from "../../types";
import { useAuth } from "../../context/AuthContext";

export function OwnerDashboardPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/vehicles/mine")
      .then(({ data }) => setVehicles(data.vehicles))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Owner dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">
            Verification: <StatusBadge status={user?.verificationStatus || "UNVERIFIED"} />
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/owner/bookings" className="btn-secondary">
            Bookings
          </Link>
          <Link to="/owner/earnings" className="btn-secondary">
            Earnings
          </Link>
          <Link to="/owner/vehicles/new" className="btn-primary">
            + Add vehicle
          </Link>
        </div>
      </div>

      {user?.verificationStatus !== "VERIFIED" && (
        <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          Complete <Link to="/verification" className="font-semibold underline">owner verification</Link>{" "}
          to get your vehicles approved faster.
        </div>
      )}

      {loading && <p className="mt-6 text-ink-500">Loading...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      <div className="mt-6 space-y-3">
        {vehicles.map((v) => (
          <div key={v.id} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-ink-900">
                {v.brand} {v.model}
              </p>
              <p className="text-sm text-ink-500">
                ₹{v.pricePerDay}/day · {v.city}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={v.status} />
              <StatusBadge status={v.verificationStatus} />
              <Link to={`/owner/vehicles/${v.id}/edit`} className="btn-secondary !py-1.5 !px-3 text-sm">
                Manage
              </Link>
            </div>
          </div>
        ))}
        {!loading && vehicles.length === 0 && (
          <p className="text-ink-500">
            No vehicles yet. <Link to="/owner/vehicles/new" className="text-brand-600 font-medium">Add your first one</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
