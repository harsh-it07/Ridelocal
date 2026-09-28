import { Link } from "react-router-dom";

const LINKS = [
  { to: "/admin/verifications", title: "VERIFICATION QUEUE", desc: "Audit tourist driving licences and identity submissions" },
  { to: "/admin/vehicles", title: "VEHICLE APPROVALS", desc: "Audit new listings, RC documents, and mechanical specs" },
  { to: "/admin/users", title: "USER MANAGEMENT", desc: "Account control, status flags, and suspension actions" },
  { to: "/admin/bookings", title: "BOOKING MONITORING", desc: "Active trips, timestamps, and handover states across Jaipur" },
  { to: "/admin/payments", title: "PAYMENT MONITORING", desc: "Escrow ledger, transaction logs, and payout verification" },
  { to: "/admin/disputes", title: "DISPUTES & REFUNDS", desc: "Rider complaints, deposit returns, and resolution tickets" },
];

export function AdminDashboardPage() {
  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        PLATFORM MODERATION
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
        ADMINISTRATION.
      </h1>
      <p style={{ fontSize: "1.0625rem", color: "#F0C4BC", marginTop: "12px" }}>
        Oversee identity verifications, vehicle fleet compliance, and financial transactions.
      </p>

      <div style={{ marginTop: "44px", borderTop: "1px solid rgba(249, 211, 205, 0.3)" }}>
        {LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "28px 0",
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
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  margin: 0,
                }}
              >
                {l.title}
              </p>
              <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px" }}>
                {l.desc}
              </p>
            </div>
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F9D3CD", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Open Section →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
