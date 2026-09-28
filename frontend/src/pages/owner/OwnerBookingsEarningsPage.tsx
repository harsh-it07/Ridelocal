import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div style={{ maxWidth: "880px", margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        OWNER FLEET PORTAL
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
        RENTAL BOOKINGS.
      </h1>

      {error && <p style={{ marginTop: "24px", color: "#FFAAAA" }}>{error}</p>}

      <div style={{ marginTop: "40px", borderTop: "1px solid rgba(249, 211, 205, 0.3)" }}>
        {bookings.map((b) => (
          <div
            key={b.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "24px 0",
              borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {b.vehicle?.brand} {b.vehicle?.model}
              </p>
              <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "6px", fontWeight: 500 }}>
                Rider: {b.customer?.name} · {new Date(b.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} →{" "}
                {new Date(b.endTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: "1.75rem", color: "#F9D3CD" }}>
                ₹{b.totalAmount}
              </span>
              <StatusBadge status={b.status} />
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <p style={{ color: "#F0C4BC", fontSize: "1rem", padding: "40px 0" }}>
            No bookings recorded for your vehicles yet.
          </p>
        )}
      </div>

      <div style={{ marginTop: "40px" }}>
        <Link
          to="/owner"
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#FFFFFF",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            borderBottom: "1px solid #FFFFFF",
            paddingBottom: "2px",
            textDecoration: "none",
          }}
        >
          ← Return to Dashboard
        </Link>
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
    <div style={{ maxWidth: "880px", margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        OWNER FINANCIALS
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
        EARNINGS SUMMARY.
      </h1>

      {/* Editorial metric block in deep wine container */}
      <div
        style={{
          marginTop: "40px",
          border: "1px solid rgba(249, 211, 205, 0.3)",
          backgroundColor: "#4E050E",
          padding: "36px",
        }}
      >
        <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.14em" }}>
          NET PAYOUT FROM CONFIRMED RENTALS
        </p>
        <p
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(3.5rem, 8vw, 5.5rem)",
            color: "#F9D3CD",
            lineHeight: 0.95,
            letterSpacing: "0.01em",
            margin: "8px 0 0",
          }}
        >
          ₹{totalEarnings.toFixed(2)}
        </p>
        <p style={{ fontSize: "0.9375rem", color: "#FFFFFF", marginTop: "12px", fontWeight: 500 }}>
          Across {earningBookings.length} completed rental{earningBookings.length === 1 ? "" : "s"} (excludes security deposit & platform fee).
        </p>
      </div>

      {/* Ledger list */}
      <div style={{ marginTop: "40px" }}>
        <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "20px" }}>
          TRANSACTION HISTORY
        </h3>

        {earningBookings.map((b) => (
          <div
            key={b.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
              borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
            }}
          >
            <div>
              <p style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: "1.375rem", color: "#FFFFFF", textTransform: "uppercase", margin: 0 }}>
                {b.vehicle?.brand} {b.vehicle?.model}
              </p>
              <p style={{ fontSize: "0.875rem", color: "#F0C4BC", marginTop: "4px" }}>
                {new Date(b.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <span style={{ fontFamily: "'Bebas Neue'", fontWeight: 700, color: "#F9D3CD", fontSize: "1.75rem" }}>
              +₹{b.rentalAmount}
            </span>
          </div>
        ))}

        {earningBookings.length === 0 && (
          <p style={{ color: "#F0C4BC", fontSize: "1rem", padding: "24px 0" }}>
            No rental earnings recorded yet.
          </p>
        )}
      </div>

      <div style={{ marginTop: "40px" }}>
        <Link
          to="/owner"
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#FFFFFF",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            borderBottom: "1px solid #FFFFFF",
            paddingBottom: "2px",
            textDecoration: "none",
          }}
        >
          ← Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
