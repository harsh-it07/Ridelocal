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
        <div className="mt-5 glass p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-orange-500/20 relative overflow-hidden" style={{ background: 'rgba(249, 115, 22, 0.05)' }}>
          {/* Subtle glow effect behind the text */}
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'rgba(249, 115, 22, 0.1)', filter: 'blur(80px)' }}></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-[0_0_15px_rgba(249,115,22,0.2)]" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-ink-900 mb-1 text-base">Action Required: Verify Account</h3>
              <p className="text-sm text-ink-500">
                Complete <Link to="/verification" className="text-brand-600 font-semibold hover:text-orange-300 transition-colors hover:underline">owner verification</Link> to get your vehicles approved faster.
              </p>
            </div>
          </div>
          
          <Link to="/verification" className="btn-primary shrink-0 relative z-10 !py-2.5 !px-5 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            Verify Now
          </Link>
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
