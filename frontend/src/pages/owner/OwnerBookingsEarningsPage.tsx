import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";

export function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/bookings")
      .then(({ data }) => setBookings(data.bookings))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Bookings for your vehicles</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <div className="mt-5 space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-ink-900">
                {b.vehicle?.brand} {b.vehicle?.model}
              </p>
              <p className="text-sm text-ink-500">
                Customer: {b.customer?.name} · {new Date(b.startTime).toLocaleDateString()} →{" "}
                {new Date(b.endTime).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-ink-900">₹{b.totalAmount}</span>
              <StatusBadge status={b.status} />
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-ink-500">No bookings yet.</p>}
      </div>
    </div>
  );
}

export function OwnerEarningsPage() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    api.get("/bookings").then(({ data }) => setBookings(data.bookings));
  }, []);

  const earningBookings = bookings.filter((b) =>
    ["CONFIRMED", "ACTIVE", "COMPLETED"].includes(b.status)
  );
  const totalEarnings = earningBookings.reduce((sum, b) => sum + Number(b.rentalAmount), 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Earnings</h1>

      <div className="card mt-5 p-6">
        <p className="text-sm text-ink-500">Total earnings from confirmed rentals</p>
        <p className="mt-1 font-display text-3xl font-extrabold text-brand-600">
          ₹{totalEarnings.toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-ink-500">
          Across {earningBookings.length} rental{earningBookings.length === 1 ? "" : "s"} (excludes
          platform fee and deposits)
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {earningBookings.map((b) => (
          <div key={b.id} className="card flex justify-between p-3 text-sm">
            <span>
              {b.vehicle?.brand} {b.vehicle?.model} — {new Date(b.startTime).toLocaleDateString()}
            </span>
            <span className="font-semibold text-ink-900">₹{b.rentalAmount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
