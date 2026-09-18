import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ─── Main component ───────────────────────────────────── */
export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    await logout();
    setMobileOpen(false);
    navigate("/");
  }

  const navLinks = [
    { to: "/search",                 label: "Explore Bikes" },
    { to: "/#how-it-works",          label: "How It Works"  },
    { to: "/get-started?role=OWNER", label: "List Your Bike"},
  ];

  return (
    <header className="navbar-wrap sticky top-0 z-40 flex justify-center px-4 py-3 pointer-events-none">

      {/* ── Liquid Glass Panel Navbar ── */}
      <div
        className={`navbar-capsule pointer-events-auto w-full max-w-5xl
          ${scrolled    ? "scrolled"  : ""}
          ${mobileOpen  ? "menu-open" : ""}
        `}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 sm:px-6">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink-900 hover:opacity-80 transition-opacity"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/25 text-sm font-bold flex-shrink-0">
              R
            </span>
            <span className="text-ink-900">
              Ride<span className="text-brand-600">Local</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link key={l.label} to={l.to} className="nav-link">{l.label}</Link>
            ))}
            {user?.role === "OWNER"    && <Link to="/owner"    className="nav-link">Dashboard</Link>}
            {user?.role === "ADMIN"    && <Link to="/admin"    className="nav-link">Admin</Link>}
            {user?.role === "CUSTOMER" && <Link to="/bookings" className="nav-link">My Bookings</Link>}
          </nav>

          {/* Desktop right: auth buttons */}
          <div className="hidden items-center gap-2.5 md:flex">
            {user ? (
              <>
                <Link to="/profile" className="chip">{user.name.split(" ")[0]}</Link>
                <button onClick={handleLogout} className="btn-secondary !py-2 !px-4 !text-sm">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary !py-2 !px-4 !text-sm">Log in</Link>
                <Link to="/get-started" className="btn-glass !py-2 !px-5 !text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="btn-secondary !p-2.5"
              aria-label="Toggle menu"
            >
              {mobileOpen
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            className="px-5 py-4 md:hidden"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex flex-col gap-1.5">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="nav-link"
                >
                  {l.label}
                </Link>
              ))}
              {user?.role === "OWNER"    && <Link to="/owner"    onClick={() => setMobileOpen(false)} className="nav-link">Dashboard</Link>}
              {user?.role === "ADMIN"    && <Link to="/admin"    onClick={() => setMobileOpen(false)} className="nav-link">Admin</Link>}
              {user?.role === "CUSTOMER" && <Link to="/bookings" onClick={() => setMobileOpen(false)} className="nav-link">My Bookings</Link>}

              <div
                className="mt-3 flex gap-2.5 pt-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-sm">Profile</Link>
                    <button onClick={handleLogout} className="btn-primary flex-1 text-sm">Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login"       onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-sm">Log in</Link>
                    <Link to="/get-started" onClick={() => setMobileOpen(false)} className="btn-glass flex-1 text-sm">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
