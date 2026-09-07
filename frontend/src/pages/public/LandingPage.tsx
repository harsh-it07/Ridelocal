import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function LandingPage() {
  const navigate = useNavigate();
  const [city, setCity] = useState("Jaipur");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (city)        q.set("city",  city);
    if (start)       q.set("start", start);
    if (end)         q.set("end",   end);
    if (vehicleType) q.set("type",  vehicleType);
    navigate(`/search?${q.toString()}`);
  }

  return (
    <div>
      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">

          {/* Left: headline + search */}
          <div className="animate-fade-up">
            <span className="chip">Verified local bikes, tourist-first</span>

            <h1
              className="mt-5 font-display text-4xl font-extrabold leading-[1.08] sm:text-5xl"
              style={{ color: "var(--text-heading)" }}
            >
              Explore your destination
              <br />
              on a bike you can trust.
            </h1>

            <p
              className="mt-4 max-w-md text-base"
              style={{ color: "var(--text-muted)" }}
            >
              RideLocal connects travelers with verified local owners — matched by
              location, availability, and price, with every bike and owner checked
              before it goes live.
            </p>

            {/* Search card */}
            <form onSubmit={handleSearch} className="card mt-7 space-y-3 p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Location</label>
                  <input
                    className="input"
                    placeholder="City or landmark"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Bike type</label>
                  <select
                    className="input"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                  >
                    <option value="">Any type</option>
                    <option value="SCOOTER">Scooter</option>
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="EBIKE">E-Bike</option>
                    <option value="BICYCLE">Bicycle</option>
                  </select>
                </div>
                <div>
                  <label className="label">Pickup</label>
                  <input
                    type="date"
                    className="input"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Return</label>
                  <input
                    type="date"
                    className="input"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">
                Search bikes
              </button>
            </form>

            {/* Trust badges */}
            <div
              className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <span>🛡️ Verified owners &amp; bikes</span>
              <span>📄 Licence-checked riders</span>
              <span>💳 Transparent pricing</span>
            </div>
          </div>

          {/* Right: visual composition */}
          <div
            className="relative animate-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            <div
              className="overflow-hidden rounded-3xl shadow-lg"
              style={{ border: "1px solid var(--border-glass)" }}
            >
              <div
                className="flex h-80 items-end bg-cover bg-center sm:h-[26rem]"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(17,24,39,0) 40%, rgba(17,24,39,0.55) 100%), url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop')",
                }}
              >
                <div className="glass m-4 flex w-full items-center justify-between rounded-2xl p-4 text-white sm:m-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-white/80">
                      Available now
                    </p>
                    <p className="mt-0.5 font-display font-bold">Royal Enfield Classic 350</p>
                    <p className="text-sm text-white/80">Jaipur · ⭐ 4.8</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-900">
                    ₹900/day
                  </span>
                </div>
              </div>
            </div>

            {/* Floating verification card */}
            <div className="card animate-float absolute -left-4 -bottom-6 hidden w-52 p-4 sm:block">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-heading)" }}>
                    Owner verified
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    ID + RC checked
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stat bento row ───────────────────────────── */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          <div className="card p-6">
            <p className="font-display text-3xl font-extrabold" style={{ color: "var(--text-heading)" }}>3</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Cities with verified bikes</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <p className="font-display text-3xl font-extrabold" style={{ color: "var(--text-heading)" }}>100%</p>
              <span className="chip">Verified</span>
            </div>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Owners &amp; bikes reviewed by admin</p>
          </div>
          <div className="card p-6 text-white" style={{ background: "linear-gradient(135deg, #1c1917, #292524)" }}>
            <p className="font-display text-3xl font-extrabold">₹0</p>
            <p className="mt-1 text-sm text-white/70">Hidden fees — pricing shown upfront</p>
          </div>
        </div>
      </section>

      {/* ─── How it works ──────────────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2
          className="font-display text-2xl font-bold"
          style={{ color: "var(--text-heading)" }}
        >
          How RideLocal works
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Find a verified bike",
              desc: "Search by location and dates — every result is owner-verified and admin-approved.",
            },
            {
              step: "2",
              title: "Verify your licence",
              desc: "A quick, secure upload keeps the platform safe for owners and travelers alike.",
            },
            {
              step: "3",
              title: "Book & ride",
              desc: "Review the full price breakdown, pay securely, and pick up your bike.",
            },
          ].map((s) => (
            <div key={s.step} className="card p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                {s.step}
              </span>
              <h3 className="mt-3 font-display font-bold" style={{ color: "var(--text-heading)" }}>
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Owner CTA ─────────────────────────────────── */}
      <section
        className="py-16"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-heading)" }}
          >
            Have a bike sitting idle?
          </h2>
          <p className="mt-2" style={{ color: "var(--text-muted)" }}>
            List it on RideLocal, set your price and availability, and start earning
            from travelers exploring your city.
          </p>
          <Link to="/get-started?role=OWNER" className="btn-primary mt-6 inline-flex">
            List your bike
          </Link>
        </div>
      </section>
    </div>
  );
}
