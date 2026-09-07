import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

/* ─── Icons ────────────────────────────────────────────── */
function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3"  />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"  />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/* ─── Theme toggle pill ────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-toggle-btn"
    >
      <span className={`theme-icon ${theme === "light" ? "active" : ""}`}><SunIcon /></span>
      <span className={`theme-icon ${theme === "dark"  ? "active" : ""}`}><MoonIcon /></span>
    </button>
  );
}

/* ─── Main component ───────────────────────────────────── */
export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled,    setScrolled]    = useState(false);
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
    { to: "/search",                    label: "Explore Bikes" },
    { to: "/#how-it-works",             label: "How It Works"  },
    { to: "/get-started?role=OWNER",    label: "List Your Bike"},
  ];

  return (
    /* Full-width sticky row — transparent, just centres the capsule */
    <header className="navbar-wrap sticky top-0 z-40 flex justify-center px-4 py-3 pointer-events-none">

      {/* ── Glass capsule pill ── */}
      <div
        className={`navbar-capsule pointer-events-auto w-full max-w-5xl
          ${scrolled    ? "scrolled"  : ""}
          ${mobileOpen  ? "menu-open" : ""}
        `}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 sm:px-5">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-base font-extrabold"
            style={{ color: "var(--text-heading)" }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm text-sm font-bold flex-shrink-0">
              R
            </span>
            Ride<span className="text-brand-500">Local</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((l) => (
              <Link key={l.label} to={l.to} className="nav-link">{l.label}</Link>
            ))}
            {user?.role === "OWNER"    && <Link to="/owner"    className="nav-link">Owner dashboard</Link>}
            {user?.role === "ADMIN"    && <Link to="/admin"    className="nav-link">Admin</Link>}
            {user?.role === "CUSTOMER" && <Link to="/bookings" className="nav-link">My bookings</Link>}
          </nav>

          {/* Desktop right: toggle + auth */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/profile" className="chip">{user.name.split(" ")[0]}</Link>
                <button onClick={handleLogout} className="btn-secondary !py-1.5 !px-3.5 !text-sm">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"       className="btn-secondary !py-1.5 !px-3.5 !text-sm">Log in</Link>
                <Link to="/get-started" className="btn-primary   !py-1.5 !px-3.5 !text-sm">Get started</Link>
              </>
            )}
          </div>

          {/* Mobile: toggle + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
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
            className="px-4 py-3 md:hidden"
            style={{ borderTop: "1px solid var(--border-glass)" }}
          >
            <div className="flex flex-col gap-1">
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
              {user?.role === "OWNER"    && <Link to="/owner"    onClick={() => setMobileOpen(false)} className="nav-link">Owner dashboard</Link>}
              {user?.role === "ADMIN"    && <Link to="/admin"    onClick={() => setMobileOpen(false)} className="nav-link">Admin</Link>}
              {user?.role === "CUSTOMER" && <Link to="/bookings" onClick={() => setMobileOpen(false)} className="nav-link">My bookings</Link>}

              <div
                className="mt-2 flex gap-2 pt-3"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-sm">Profile</Link>
                    <button onClick={handleLogout} className="btn-primary flex-1 text-sm">Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login"       onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-sm">Log in</Link>
                    <Link to="/get-started" onClick={() => setMobileOpen(false)} className="btn-primary  flex-1 text-sm">Get started</Link>
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
