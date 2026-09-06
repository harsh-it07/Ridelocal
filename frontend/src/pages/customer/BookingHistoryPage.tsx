import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";
import { Booking } from "../../types";

export function BookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/bookings")
      .then(({ data }) => setBookings(data.bookings))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">My bookings</h1>

      {loading && <p className="mt-4 text-ink-500">Loading...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {!loading && bookings.length === 0 && (
        <p className="mt-4 text-ink-500">
          You haven't booked a ride yet. <Link to="/search" className="text-brand-600 font-medium">Find one nearby</Link>.
        </p>
      )}

      <div className="mt-5 space-y-3">
        {bookings.map((b) => (
          <Link key={b.id} to={`/bookings/${b.id}`} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-ink-900">
                {b.vehicle?.brand} {b.vehicle?.model}
              </p>
              <p className="text-sm text-ink-500">
                {new Date(b.startTime).toLocaleDateString()} → {new Date(b.endTime).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-ink-900">₹{b.totalAmount}</span>
              <StatusBadge status={b.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
