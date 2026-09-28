import { Link, useSearchParams } from "react-router-dom";

const OPTIONS = [
  {
    role: "CUSTOMER" as const,
    title: "RENT A BIKE",
    description: "Browse verified local motorcycles, scooters & e-bikes. Explore Jaipur at your own speed with transparent daily rates.",
    cta: "Continue as tourist →",
    to: "/register?role=CUSTOMER",
  },
  {
    role: "OWNER" as const,
    title: "LIST YOUR BIKE",
    description: "Turn your idle two-wheeler into steady income. We verify tourist identities and manage escrow payments for your peace of mind.",
    cta: "Continue as owner →",
    to: "/register?role=OWNER",
  },
  {
    role: "ADMIN" as const,
    title: "ADMIN ACCESS",
    description: "Secure moderation portal for verification queues, vehicle approvals, and transaction audit logs.",
    cta: "Admin sign in →",
    to: "/login?admin=1",
  },
];

export function GetStartedPage() {
  const [params] = useSearchParams();
  const highlight = params.get("role");

  return (
    <div style={{ maxWidth: "880px", margin: "0 auto", padding: "64px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        ONBOARDING
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
        SELECT YOUR PATH.
      </h1>
      <p style={{ fontSize: "1.0625rem", color: "#F0C4BC", marginTop: "12px" }}>
        Choose how you would like to participate in RideLocal.
      </p>

      <div style={{ marginTop: "48px" }}>
        {OPTIONS.map((opt, i) => (
          <div
            key={opt.role}
            style={{
              padding: "36px 0",
              borderTop: i === 0 ? "1px solid rgba(249, 211, 205, 0.4)" : "1px solid rgba(249, 211, 205, 0.2)",
              borderBottom: i === OPTIONS.length - 1 ? "1px solid rgba(249, 211, 205, 0.2)" : "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: "240px" }}>
              <h2
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "2rem",
                  color: "#FFFFFF",
                  letterSpacing: "0.02em",
                  margin: 0,
                }}
              >
                {opt.title}
              </h2>
              <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "8px", maxWidth: "28rem", lineHeight: 1.6 }}>
                {opt.description}
              </p>
            </div>
            <Link
              to={opt.to}
              className={highlight === opt.role ? "btn-primary" : "btn-secondary"}
              style={{
                alignSelf: "center",
                whiteSpace: "nowrap",
                padding: "12px 24px",
                fontSize: "0.875rem",
              }}
            >
              {opt.cta}
            </Link>
          </div>
        ))}
      </div>

      <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "40px" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ fontWeight: 700, color: "#FFFFFF", borderBottom: "1px solid #FFFFFF", paddingBottom: "1px", textDecoration: "none" }}>
          Sign In →
        </Link>
      </p>
    </div>
  );
}
