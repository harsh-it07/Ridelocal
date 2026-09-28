import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        ADMINISTRATION
      </p>
      <h1
        style={{
          fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
          fontSize: "clamp(3rem, 7vw, 5rem)",
          lineHeight: 0.9,
          letterSpacing: "0.01em",
          color: "#F9D3CD",
          textTransform: "uppercase",
          margin: "8px 0 0",
        }}
      >
        BOOKING MONITORING.
      </h1>

      {error && <p style={{ marginTop: "24px", color: "#FFAAAA", fontSize: "0.9375rem" }}>{error}</p>}

      <div style={{ marginTop: "40px", borderTop: "1px solid rgba(249, 211, 205, 0.3)" }}>
        {bookings.map((b) => (
          <div
            key={b.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
              borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
              fontSize: "0.9375rem",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: "1.25rem", color: "#FFFFFF", textTransform: "uppercase", margin: 0 }}>
                {b.vehicle?.brand} {b.vehicle?.model}
              </p>
              <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "2px" }}>
                Rider: {b.customer?.name} · {new Date(b.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} → {new Date(b.endTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: "1.5rem", color: "#F9D3CD" }}>₹{b.totalAmount}</span>
              <StatusBadge status={b.status} />
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <p style={{ color: "#F0C4BC", fontSize: "1rem", padding: "36px 0" }}>
            No platform bookings recorded yet.
          </p>
        )}
      </div>

      <div style={{ marginTop: "40px" }}>
        <Link
          to="/admin"
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#FFFFFF",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            borderBottom: "1px solid #FFFFFF",
            paddingBottom: "2px",
            textDecoration: "none",
          }}
        >
          ← Return to Admin Hub
        </Link>
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
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        ADMINISTRATION
      </p>
      <h1
        style={{
          fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
          fontSize: "clamp(3rem, 7vw, 5rem)",
          lineHeight: 0.9,
          letterSpacing: "0.01em",
          color: "#F9D3CD",
          textTransform: "uppercase",
          margin: "8px 0 0",
        }}
      >
        PAYMENT MONITORING.
      </h1>

      {error && <p style={{ marginTop: "24px", color: "#FFAAAA", fontSize: "0.9375rem" }}>{error}</p>}

      <div style={{ marginTop: "40px", borderTop: "1px solid rgba(249, 211, 205, 0.3)" }}>
        {payments.map((p) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
              borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
              fontSize: "0.9375rem",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ fontFamily: "monospace", fontSize: "0.9375rem", color: "#FFFFFF", margin: 0, fontWeight: 700 }}>
                {p.transactionId || p.razorpayOrderId || p.id}
              </p>
              <p style={{ fontSize: "0.875rem", color: "#F0C4BC", marginTop: "4px" }}>
                Channel: {p.provider} · Method: {p.method || "—"}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: "1.5rem", color: "#F9D3CD" }}>₹{p.amount}</span>
              <StatusBadge status={p.paymentStatus} />
            </div>
          </div>
        ))}

        {payments.length === 0 && (
          <p style={{ color: "#F0C4BC", fontSize: "1rem", padding: "36px 0" }}>
            No payment transaction entries logged yet.
          </p>
        )}
      </div>

      <div style={{ marginTop: "40px" }}>
        <Link
          to="/admin"
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#FFFFFF",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            borderBottom: "1px solid #FFFFFF",
            paddingBottom: "2px",
            textDecoration: "none",
          }}
        >
          ← Return to Admin Hub
        </Link>
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
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        DISPUTE RESOLUTION
      </p>
      <h1
        style={{
          fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
          fontSize: "clamp(3rem, 7vw, 5rem)",
          lineHeight: 0.9,
          letterSpacing: "0.01em",
          color: "#F9D3CD",
          textTransform: "uppercase",
          margin: "8px 0 0",
        }}
      >
        REFUNDS & DISPUTES.
      </h1>

      <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.375rem", fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "40px" }}>
        PENDING REFUND DECISIONS
      </h2>
      {error && <p style={{ marginTop: "12px", color: "#FFAAAA", fontSize: "0.9375rem" }}>{error}</p>}

      <div style={{ marginTop: "16px", borderTop: "1px solid rgba(249, 211, 205, 0.3)" }}>
        {bookings.map((b) => (
          <div
            key={b.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
              borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: "1.25rem", color: "#FFFFFF", textTransform: "uppercase", margin: 0 }}>
                {b.vehicle?.brand} {b.vehicle?.model} — Rider: {b.customer?.name}
              </p>
              <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px" }}>
                Total Claim Amount: ₹{b.totalAmount}
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                disabled={busyId === b.id}
                onClick={() => decide(b.id, true)}
                className="btn-primary"
                style={{ padding: "8px 16px", fontSize: "0.875rem" }}
              >
                Approve Refund
              </button>
              <button
                disabled={busyId === b.id}
                onClick={() => decide(b.id, false)}
                className="btn-danger"
                style={{ padding: "8px 16px", fontSize: "0.875rem" }}
              >
                Dispute Claim
              </button>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <p style={{ color: "#F0C4BC", fontSize: "1rem", padding: "20px 0" }}>
            No refund actions pending review.
          </p>
        )}
      </div>

      <DisputeTicketQueue />

      <div style={{ marginTop: "40px" }}>
        <Link
          to="/admin"
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#FFFFFF",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            borderBottom: "1px solid #FFFFFF",
            paddingBottom: "2px",
            textDecoration: "none",
          }}
        >
          ← Return to Admin Hub
        </Link>
      </div>
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
    <div style={{ marginTop: "56px" }}>
      <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.375rem", fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        OPEN DISPUTE TICKETS
      </h2>
      <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px" }}>
        Tickets lodged by riders or hosts concerning condition, delay, or deposit issues.
      </p>
      {error && <p style={{ marginTop: "12px", color: "#FFAAAA", fontSize: "0.9375rem" }}>{error}</p>}

      <div style={{ marginTop: "20px" }}>
        {disputes.map((d) => (
          <div
            key={d.id}
            style={{
              padding: "24px",
              border: "1px solid rgba(249, 211, 205, 0.25)",
              backgroundColor: "#4E050E",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <p style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.25rem", fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", margin: 0 }}>
                  {d.subject}
                </p>
                <p style={{ fontSize: "0.875rem", color: "#F0C4BC", marginTop: "2px" }}>
                  By: {d.raisedBy?.name} ({d.raisedBy?.role}) · Ride: {d.booking?.vehicle?.brand} {d.booking?.vehicle?.model} · {new Date(d.createdAt).toLocaleDateString()}
                </p>
                <p style={{ fontSize: "0.9375rem", color: "#F9D3CD", marginTop: "12px", lineHeight: 1.5 }}>
                  {d.description}
                </p>
              </div>
              <StatusBadge status={d.status} />
            </div>

            <input
              className="input"
              style={{ marginTop: "16px" }}
              placeholder="Resolution note (audit log record)"
              value={noteDraft[d.id] || ""}
              onChange={(e) => setNoteDraft((s) => ({ ...s, [d.id]: e.target.value }))}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                disabled={busyId === d.id}
                onClick={() => decide(d.id, "RESOLVED")}
                className="btn-primary"
                style={{ padding: "8px 16px", fontSize: "0.875rem" }}
              >
                Resolve Ticket
              </button>
              <button
                disabled={busyId === d.id}
                onClick={() => decide(d.id, "CLOSED")}
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.875rem" }}
              >
                Close Ticket
              </button>
            </div>
          </div>
        ))}

        {disputes.length === 0 && (
          <p style={{ color: "#F0C4BC", fontSize: "1rem", padding: "16px 0" }}>
            No open dispute tickets currently active.
          </p>
        )}
      </div>
    </div>
  );
}
