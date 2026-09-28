import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";
import { Loader } from "../../components/Loader";
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
    <div style={{ maxWidth: "880px", margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        TRIP ACTIVITY
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
        MY RIDES.
      </h1>

      {loading && <Loader message="Loading your ride ledger..." />}
      {error && <p style={{ marginTop: "24px", color: "#FFAAAA", fontSize: "1.0625rem" }}>{error}</p>}
      {!loading && bookings.length === 0 && (
        <div style={{ padding: "48px 0", textAlign: "left" }}>
          <p style={{ color: "#F0C4BC", fontSize: "1.125rem" }}>
            You haven't reserved a ride yet.
          </p>
          <Link
            to="/search"
            className="btn-primary"
            style={{ marginTop: "16px", display: "inline-block" }}
          >
            Find a Ride Nearby →
          </Link>
        </div>
      )}

      <div style={{ marginTop: "40px", borderTop: "1px solid rgba(249, 211, 205, 0.3)" }}>
        {bookings.map((b) => (
          <Link
            key={b.id}
            to={`/bookings/${b.id}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "24px 0",
              borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
              textDecoration: "none",
              color: "inherit",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Barlow Condensed', 'Bebas Neue', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.625rem",
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {b.vehicle?.brand} {b.vehicle?.model}
              </p>
              <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "6px", fontWeight: 500 }}>
                {new Date(b.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — {new Date(b.endTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: "2rem", color: "#F9D3CD" }}>
                ₹{b.totalAmount}
              </span>
              <StatusBadge status={b.status} />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Details →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
