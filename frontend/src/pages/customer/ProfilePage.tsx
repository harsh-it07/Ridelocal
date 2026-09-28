import { FormEvent, useEffect, useState } from "react";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
  }, [user]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await api.patch("/users/me", { name, phone: phone || undefined });
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!user) return null;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
        ACCOUNT PROFILE
      </p>
      <h1
        style={{
          fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
          lineHeight: 0.9,
          letterSpacing: "0.01em",
          color: "#F9D3CD",
          textTransform: "uppercase",
          margin: "8px 0 0",
        }}
      >
        YOUR DETAILS.
      </h1>

      <div style={{ marginTop: "40px", borderTop: "1px solid rgba(249, 211, 205, 0.3)", paddingTop: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", backgroundColor: "#4E050E", padding: "16px 20px", border: "1px solid rgba(249, 211, 205, 0.2)" }}>
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
              VERIFICATION STATUS
            </p>
            {user.verificationStatus !== "VERIFIED" && (
              <Link
                to="/verification"
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  textDecoration: "underline",
                  marginTop: "4px",
                  display: "inline-block",
                }}
              >
                Upload driving licence →
              </Link>
            )}
          </div>
          <StatusBadge status={user.verificationStatus} />
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label className="label">Full Legal Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Email Address (Locked)</label>
            <input
              className="input"
              value={user.email}
              disabled
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", color: "#F0C4BC" }}
            />
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>

          {error && <p style={{ fontSize: "0.8125rem", color: "#FFAAAA", marginTop: "4px" }}>{error}</p>}
          {saved && (
            <p style={{ fontSize: "0.8125rem", color: "#FFFFFF", marginTop: "4px", backgroundColor: "rgba(249, 211, 205, 0.1)", padding: "10px", border: "1px solid #F9D3CD" }}>
              ✓ Profile information saved successfully.
            </p>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "16px",
              fontSize: "0.875rem",
            }}
          >
            Save Profile Changes →
          </button>
        </form>
      </div>
    </div>
  );
}
