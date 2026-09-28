import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isAdminEntry = params.get("admin") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === "OWNER") navigate("/owner");
      else if (user.role === "ADMIN") navigate("/admin");
      else navigate("/search");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 61px)", backgroundColor: "#680A16" }} className="login-grid">
      {/* Left Column: Atmospheric Photography */}
      <div style={{ position: "relative", overflow: "hidden", borderRight: "1px solid rgba(249, 211, 205, 0.2)" }} className="login-photo">
        <img
          src="https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80"
          alt="Jaipur Palace architecture"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(78, 5, 14, 0.85)",
            padding: "24px 32px",
            borderTop: "1px solid rgba(249, 211, 205, 0.2)",
          }}
        >
          <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2rem", color: "#F9D3CD", margin: 0, letterSpacing: "0.02em" }}>
            AUTHENTIC JAIPUR ROADS
          </p>
          <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px" }}>
            Verified peer-to-peer bike rentals across the Pink City.
          </p>
        </div>
      </div>

      {/* Right Column: Editorial Form */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 64px",
          maxWidth: "520px",
          width: "100%",
          margin: "0 auto",
        }}
        className="login-form-area"
      >
        <p
          style={{
            fontFamily: "'Bebas Neue'",
            fontSize: "1.75rem",
            letterSpacing: "0.04em",
            color: "#F9D3CD",
            textTransform: "uppercase",
            marginBottom: "32px",
          }}
        >
          RIDE <span style={{ opacity: 0.7 }}>LOCAL</span>
        </p>

        {isAdminEntry && (
          <div style={{ marginBottom: "20px", padding: "12px 16px", backgroundColor: "rgba(255, 200, 100, 0.1)", border: "1px solid rgba(255, 200, 100, 0.3)", color: "#FFD285", fontSize: "0.875rem" }}>
            Admin authentication portal.
          </div>
        )}

        <h1
          style={{
            fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
            fontSize: "clamp(3rem, 7vw, 5rem)",
            lineHeight: 0.9,
            letterSpacing: "0.01em",
            color: "#F9D3CD",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          WELCOME<br />BACK.
        </h1>
        <p style={{ fontSize: "1rem", color: "#F0C4BC", marginTop: "12px" }}>
          Sign in to access your bookings, saved rides, or owner dashboard.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: "32px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ fontSize: "0.9375rem", color: "#FFAAAA", marginBottom: "16px" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: "100%", padding: "16px", fontSize: "0.9375rem" }}
          >
            {submitting ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div style={{ marginTop: "36px", borderTop: "1px solid rgba(249, 211, 205, 0.2)", paddingTop: "20px" }}>
          <p style={{ fontSize: "0.9375rem", color: "#F0C4BC" }}>
            Need an account?{" "}
            <Link to="/register" style={{ fontWeight: 700, color: "#FFFFFF", borderBottom: "1px solid #FFFFFF", paddingBottom: "1px", textDecoration: "none" }}>
              Create Account →
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .login-grid { grid-template-columns: 1fr !important; }
          .login-photo { height: 35vh; border-right: none !important; border-bottom: 1px solid rgba(249, 211, 205, 0.2); }
          .login-form-area { padding: 36px 24px !important; }
        }
      `}</style>
    </div>
  );
}
