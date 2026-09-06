import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";

export function BookingMonitoringPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/admin/bookings")
      .then(({ data }) => setBookings(data.bookings))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Booking monitoring</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <div className="mt-5 space-y-2">
        {bookings.map((b) => (
          <div key={b.id} className="card flex items-center justify-between p-3 text-sm">
            <span>
              {b.vehicle?.brand} {b.vehicle?.model} — {b.customer?.name} —{" "}
              {new Date(b.startTime).toLocaleDateString()}
            </span>
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

export function PaymentMonitoringPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/admin/payments")
      .then(({ data }) => setPayments(data.payments))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Payment monitoring</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <div className="mt-5 space-y-2">
        {payments.map((p) => (
          <div key={p.id} className="card flex items-center justify-between p-3 text-sm">
            <div>
              <span className="font-mono text-xs text-ink-500">
                {p.transactionId || p.razorpayOrderId || p.id}
              </span>
              <p className="text-xs text-ink-500">
                {p.provider} · {p.method || "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-ink-900">₹{p.amount}</span>
              <StatusBadge status={p.paymentStatus} />
            </div>
          </div>
        ))}
        {payments.length === 0 && <p className="text-ink-500">No payments yet.</p>}
      </div>
    </div>
  );
}

export function DisputesPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    api
      .get("/admin/bookings", { params: { status: "REFUND_PENDING" } })
      .then(({ data }) => setBookings(data.bookings))
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(load, []);

  async function decide(id: string, approve: boolean) {
    setBusyId(id);
    try {
      await api.patch(`/admin/bookings/${id}/refund`, { approve });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Disputes & refunds</h1>

      <h2 className="mt-6 font-display font-semibold text-ink-900">Pending refund decisions</h2>
      {error && <p className="mt-2 text-red-600">{error}</p>}
      <div className="mt-3 space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-ink-900">
                {b.vehicle?.brand} {b.vehicle?.model} — {b.customer?.name}
              </p>
              <p className="text-sm text-ink-500">Total: ₹{b.totalAmount}</p>
            </div>
            <div className="flex gap-2">
              <button
                disabled={busyId === b.id}
                onClick={() => decide(b.id, true)}
                className="btn-primary !py-1.5 !px-3 text-sm"
              >
                Approve refund
              </button>
              <button
                disabled={busyId === b.id}
                onClick={() => decide(b.id, false)}
                className="btn-danger !py-1.5 !px-3 text-sm"
              >
                Mark disputed
              </button>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-ink-500">No pending refund decisions.</p>}
      </div>

      <DisputeTicketQueue />
    </div>
  );
}

function DisputeTicketQueue() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  function load() {
    api
      .get("/admin/disputes", { params: { status: "OPEN" } })
      .then(({ data }) => setDisputes(data.disputes))
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(load, []);

  async function decide(id: string, status: "RESOLVED" | "CLOSED") {
    setBusyId(id);
    try {
      await api.patch(`/admin/disputes/${id}`, {
        status,
        resolutionNote: noteDraft[id] || undefined,
      });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-10">
      <h2 className="font-display font-semibold text-ink-900">Open dispute tickets</h2>
      <p className="mt-1 text-sm text-ink-500">
        Issues reported by tourists or owners on a specific booking (e.g. "bike wasn't as
        described").
      </p>
      {error && <p className="mt-2 text-red-600">{error}</p>}

      <div className="mt-3 space-y-3">
        {disputes.map((d) => (
          <div key={d.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-ink-900">{d.subject}</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {d.raisedBy?.name} ({d.raisedBy?.role}) ·{" "}
                  {d.booking?.vehicle?.brand} {d.booking?.vehicle?.model} ·{" "}
                  {new Date(d.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-2 text-sm text-ink-700">{d.description}</p>
              </div>
              <StatusBadge status={d.status} />
            </div>

            <input
              className="input mt-3"
              placeholder="Resolution note (optional)"
              value={noteDraft[d.id] || ""}
              onChange={(e) => setNoteDraft((s) => ({ ...s, [d.id]: e.target.value }))}
            />
            <div className="mt-2 flex gap-2">
              <button
                disabled={busyId === d.id}
                onClick={() => decide(d.id, "RESOLVED")}
                className="btn-primary !py-1.5 !px-3 text-sm"
              >
                Mark resolved
              </button>
              <button
                disabled={busyId === d.id}
                onClick={() => decide(d.id, "CLOSED")}
                className="btn-secondary !py-1.5 !px-3 text-sm"
              >
                Close ticket
              </button>
            </div>
          </div>
        ))}
        {disputes.length === 0 && <p className="text-ink-500">No open dispute tickets.</p>}
      </div>
    </div>
  );
}
