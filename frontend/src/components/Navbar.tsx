import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
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
    { to: "/search", label: "Explore Bikes" },
    { to: "/#how-it-works", label: "How It Works" },
    { to: "/get-started?role=OWNER", label: "List Your Bike" },
  ];

  return (
    <header className={`sticky top-0 z-40 glass-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm">
            R
          </span>
          Ride<span className="text-brand-600">Local</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-white/70 hover:text-ink-900"
            >
              {l.label}
            </Link>
          ))}
          {user?.role === "OWNER" && (
            <Link to="/owner" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-white/70">
              Owner dashboard
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link to="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-white/70">
              Admin
            </Link>
          )}
          {user?.role === "CUSTOMER" && (
            <Link to="/bookings" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-white/70">
              My bookings
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link to="/profile" className="chip">
                {user.name.split(" ")[0]}
              </Link>
              <button onClick={handleLogout} className="btn-secondary !py-2 !px-3.5 text-sm">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !py-2 !px-3.5 text-sm">
                Log in
              </Link>
              <Link to="/get-started" className="btn-primary !py-2 !px-3.5 text-sm">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="btn-secondary !p-2.5 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/40 bg-white/90 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-neutral-100"
              >
                {l.label}
              </Link>
            ))}
            {user?.role === "OWNER" && (
              <Link to="/owner" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-neutral-100">
                Owner dashboard
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-neutral-100">
                Admin
              </Link>
            )}
            {user?.role === "CUSTOMER" && (
              <Link to="/bookings" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-neutral-100">
                My bookings
              </Link>
            )}

            <div className="mt-2 flex gap-2 border-t border-neutral-100 pt-3">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-sm">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="btn-primary flex-1 text-sm">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-sm">
                    Log in
                  </Link>
                  <Link to="/get-started" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-sm">
                    Get started
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
