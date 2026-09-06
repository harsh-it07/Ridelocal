import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";

export function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/vehicles/${id}`)
      .then(({ data }) => setVehicle(data.vehicle))
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  const days =
    start && end
      ? Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000))
      : 0;
  const estRental = vehicle ? days * Number(vehicle.pricePerDay) : 0;
  const estTotal = vehicle ? estRental + estRental * 0.08 + Number(vehicle.securityDeposit) : 0;

  async function handleBook() {
    if (!user) {
      navigate("/login");
      return;
    }
    setBookingError(null);
    setSubmitting(true);
    try {
      const { data } = await api.post("/bookings", {
        vehicleId: id,
        startTime: new Date(start).toISOString(),
        endTime: new Date(end).toISOString(),
        pickupLocation: pickup,
        returnLocation: dropoff,
      });
      navigate(`/bookings/${data.booking.id}/pay`);
    } catch (err) {
      setBookingError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <div className="mx-auto max-w-4xl px-4 py-10 text-red-600">{error}</div>;
  if (!vehicle) return <div className="mx-auto max-w-4xl px-4 py-10 text-ink-500">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="mt-1 text-ink-500">{vehicle.city}</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={vehicle.status} />
            <StatusBadge status={vehicle.verificationStatus} />
          </div>
        </div>

        <p className="mt-4 text-ink-700">{vehicle.description}</p>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-ink-500">Price / day</p>
            <p className="font-semibold text-ink-900">₹{vehicle.pricePerDay}</p>
          </div>
          <div>
            <p className="text-ink-500">Security deposit</p>
            <p className="font-semibold text-ink-900">₹{vehicle.securityDeposit}</p>
          </div>
          <div>
            <p className="text-ink-500">Rating</p>
            <p className="font-semibold text-ink-900">
              ⭐ {vehicle.ratingAvg?.toFixed?.(1) ?? "0.0"} ({vehicle.ratingCount})
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-ink-500">
          Owner: {vehicle.owner?.name} · <StatusBadge status={vehicle.owner?.verificationStatus} />
        </p>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-display font-bold text-ink-900">Book this vehicle</h2>

        {user && user.role === "CUSTOMER" && user.verificationStatus !== "VERIFIED" && (
          <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            You'll need a verified driving licence before this booking can be confirmed.{" "}
            <a href="/verification" className="font-semibold underline">
              Upload it now
            </a>
            .
          </div>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Pickup date & time</label>
            <input
              type="datetime-local"
              className="input"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Return date & time</label>
            <input
              type="datetime-local"
              className="input"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Pickup location</label>
            <input className="input" value={pickup} onChange={(e) => setPickup(e.target.value)} />
          </div>
          <div>
            <label className="label">Return location</label>
            <input className="input" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
          </div>
        </div>

        {days > 0 && (
          <div className="mt-4 rounded-xl bg-neutral-50 p-4 text-sm">
            <p className="text-ink-500">
              Estimated total for {days} day{days > 1 ? "s" : ""} (final price is confirmed by the
              server):
            </p>
            <p className="mt-1 text-lg font-bold text-ink-900">₹{estTotal.toFixed(2)}</p>
          </div>
        )}

        {bookingError && <p className="mt-3 text-sm text-red-600">{bookingError}</p>}

        <button
          onClick={handleBook}
          disabled={!start || !end || !pickup || !dropoff || submitting}
          className="btn-primary mt-4 w-full"
        >
          {submitting ? "Creating booking..." : "Continue to payment"}
        </button>
      </div>

      {vehicle.reviews?.length > 0 && (
        <div className="card mt-6 p-6">
          <h2 className="font-display font-bold text-ink-900">Reviews</h2>
          <div className="mt-3 space-y-3">
            {vehicle.reviews.map((r: any) => (
              <div key={r.id} className="border-b border-neutral-100 pb-3 last:border-0">
                <p className="text-sm font-semibold text-ink-900">
                  {r.customer?.name} — ⭐ {r.rating}
                </p>
                {r.comment && <p className="text-sm text-ink-500">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
