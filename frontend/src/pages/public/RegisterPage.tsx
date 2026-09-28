import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = params.get("role") === "OWNER" ? "OWNER" : "CUSTOMER";

  const [role, setRole] = useState<"CUSTOMER" | "OWNER">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await register({ name, email, phone: phone || undefined, password, role });
      if (user.role === "OWNER") navigate("/owner");
      else navigate("/search");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 61px)", backgroundColor: "#680A16" }} className="register-grid">
      {/* Left Column: Atmospheric Photography */}
      <div style={{ position: "relative", overflow: "hidden", borderRight: "1px solid rgba(249, 211, 205, 0.2)" }} className="register-photo">
        <img
          src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80"
          alt="Riding across Jaipur"
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
            JOIN THE COMMUNITY
          </p>
          <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px" }}>
            Tourist rentals and local bike owner earnings in Jaipur.
          </p>
        </div>
      </div>

      {/* Right Column: Form Area */}
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
        className="register-form-area"
      >
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
          START YOUR<br />JOURNEY.
        </h1>
        <p style={{ fontSize: "1rem", color: "#F0C4BC", marginTop: "12px" }}>
          {role === "CUSTOMER"
            ? "Rent verified motorcycles and explore Jaipur at your own speed."
            : "List your two-wheeler and earn daily from vetted travelers."}
        </p>

        {/* Role Toggle Tabs */}
        <div style={{ display: "flex", gap: "24px", marginTop: "24px", borderBottom: "1px solid rgba(249, 211, 205, 0.25)", paddingBottom: "12px" }}>
          {(["CUSTOMER", "OWNER"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "1.125rem",
                fontWeight: 700,
                color: role === r ? "#FFFFFF" : "#F0C4BC",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                background: "none",
                border: "none",
                cursor: "pointer",
                borderBottom: role === r ? "2px solid #F9D3CD" : "2px solid transparent",
                paddingBottom: "4px",
              }}
            >
              {r === "CUSTOMER" ? "I WANT TO RENT" : "I WANT TO LIST"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: "24px" }}>
          <div style={{ marginBottom: "14px" }}>
            <label className="label">Full Legal Name</label>
            <input className="input" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label className="label">Email Address</label>
            <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label className="label">Phone Number (Optional)</label>
            <input className="input" placeholder="+91 ..." value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Min. 8 characters" value={password} minLength={8} onChange={(e) => setPassword(e.target.value)} required />
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
            {submitting ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        <div style={{ marginTop: "28px", borderTop: "1px solid rgba(249, 211, 205, 0.2)", paddingTop: "18px" }}>
          <p style={{ fontSize: "0.9375rem", color: "#F0C4BC" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ fontWeight: 700, color: "#FFFFFF", borderBottom: "1px solid #FFFFFF", paddingBottom: "1px", textDecoration: "none" }}>
              Sign In →
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .register-grid { grid-template-columns: 1fr !important; }
          .register-photo { height: 35vh; border-right: none !important; border-bottom: 1px solid rgba(249, 211, 205, 0.2); }
          .register-form-area { padding: 36px 24px !important; }
        }
      `}</style>
    </div>
  );
}
