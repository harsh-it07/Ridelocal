import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setMobileOpen(false);
    navigate("/");
  }

  const navLinks = [
    { to: "/search", label: "Explore" },
    { to: "/#how-it-works", label: "Home" },
    { to: "/get-started?role=OWNER", label: "Get Started" },
  ];

  return (
    <header
      className="navbar-wrap"
      style={{
        background: "#680A16",
        borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>

          {/* Logo — Tall Condensed Bebas Neue in Blush Pink */}
          <Link
            to="/"
            style={{
              fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
              fontSize: "2rem",
              letterSpacing: "0.03em",
              color: "#F9D3CD",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              lineHeight: 1,
            }}
          >
            RIDE <span style={{ opacity: 0.75, fontWeight: 400 }}>LOCAL</span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "14px" }} className="hidden md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "#F0C4BC",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "8px 14px",
                  textDecoration: "none",
                  transition: "color 150ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#F0C4BC")}
              >
                {l.label}
              </Link>
            ))}
            {user?.role === "OWNER" && (
              <Link
                to="/owner"
                style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 14px", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#F0C4BC")}
              >
                Dashboard
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link
                to="/admin"
                style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 14px", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#F0C4BC")}
              >
                Admin
              </Link>
            )}
            {user?.role === "CUSTOMER" && (
              <Link
                to="/bookings"
                style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 14px", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#F0C4BC")}
              >
                My Rides
              </Link>
            )}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {user ? (
              <>
                <Link
                  to="/profile"
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: "#F9D3CD",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    textDecoration: "none",
                  }}
                >
                  {user.name.split(" ")[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: "#F0C4BC",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#F0C4BC")}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: "#F0C4BC",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    textDecoration: "none",
                    padding: "8px 14px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#F0C4BC")}
                >
                  Login
                </Link>
                <Link
                  to="/get-started"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#680A16",
                    backgroundColor: "#F9D3CD",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    textDecoration: "none",
                    padding: "10px 20px",
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#F9D3CD",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "6px 0",
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? "[CLOSE]" : "[MENU]"}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid rgba(249, 211, 205, 0.2)",
            padding: "24px",
            background: "#5B0713",
          }}
          className="md:hidden"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#F9D3CD",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  textDecoration: "none",
                }}
              >
                {l.label}
              </Link>
            ))}
            {user?.role === "OWNER" && (
              <Link to="/owner" onClick={() => setMobileOpen(false)} style={{ fontSize: "1rem", fontWeight: 700, color: "#F9D3CD", textTransform: "uppercase", textDecoration: "none" }}>
                Dashboard
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ fontSize: "1rem", fontWeight: 700, color: "#F9D3CD", textTransform: "uppercase", textDecoration: "none" }}>
                Admin
              </Link>
            )}
            {user?.role === "CUSTOMER" && (
              <Link to="/bookings" onClick={() => setMobileOpen(false)} style={{ fontSize: "1rem", fontWeight: 700, color: "#F9D3CD", textTransform: "uppercase", textDecoration: "none" }}>
                My Rides
              </Link>
            )}

            <div style={{ borderTop: "1px solid rgba(249, 211, 205, 0.2)", paddingTop: "16px", marginTop: "8px", display: "flex", gap: "20px", alignItems: "center" }}>
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F9D3CD", textTransform: "uppercase", textDecoration: "none" }}>
                    Profile
                  </Link>
                  <button onClick={handleLogout} style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" }}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", textDecoration: "none" }}>
                    Login
                  </Link>
                  <Link to="/get-started" onClick={() => setMobileOpen(false)} style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#680A16", background: "#F9D3CD", padding: "10px 20px", textTransform: "uppercase", textDecoration: "none" }}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
