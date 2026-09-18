import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="relative overflow-hidden">

      {/* ─── Ambient Orbs (decorative) ──────────────────── */}
      <div className="ambient-orb" style={{ width: 500, height: 500, top: '-10%', right: '-5%', background: 'radial-gradient(circle, rgba(249,115,22,0.25), transparent 70%)', animationDelay: '0s' }} />
      <div className="ambient-orb" style={{ width: 400, height: 400, bottom: '20%', left: '-8%', background: 'radial-gradient(circle, rgba(194,65,12,0.20), transparent 70%)', animationDelay: '5s' }} />
      <div className="ambient-orb" style={{ width: 300, height: 300, top: '40%', right: '30%', background: 'radial-gradient(circle, rgba(251,191,36,0.12), transparent 70%)', animationDelay: '10s' }} />

      {/* ═══ HERO ═══════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20 min-h-[85vh] flex flex-col justify-end">

        {/* Service tags — top left */}
        <div className="absolute top-16 left-5 sm:left-8 sm:top-24 flex flex-col gap-3 animate-slide-left">
          <span className="glass-tag stagger-1">Bike Rentals</span>
          <span className="glass-tag stagger-2">Verified Owners</span>
          <span className="glass-tag stagger-3">Transparent Pricing</span>
        </div>

        {/* Main heading — massive bold text at bottom */}
        <div className="mt-40 sm:mt-0">
          <h1 className="hero-heading animate-fade-up">
            RIDE<br />LOCAL
          </h1>

          {/* Bottom row: CTA + description */}
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

            {/* CTA button — crystal clear liquid glass */}
            <div className="animate-fade-up stagger-3">
              <Link to="/get-started" className="btn-glass group">
                <span>Get Started</span>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Description text — bottom right */}
            <p className="hero-description animate-slide-right stagger-4">
              Crafted with precision to create <strong>impactful</strong> and
              refined local riding experiences across India.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ STATS BENTO ROW ════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-7 animate-fade-up stagger-1 hover-lift">
            <p className="font-display text-4xl font-extrabold text-ink-900">3</p>
            <p className="mt-2 text-sm text-ink-500">
              Cities with verified bikes
            </p>
          </div>
          <div className="card p-7 animate-fade-up stagger-2 hover-lift">
            <div className="flex items-center justify-between">
              <p className="font-display text-4xl font-extrabold text-ink-900">100%</p>
              <span className="chip">Verified</span>
            </div>
            <p className="mt-2 text-sm text-ink-500">
              Owners & bikes reviewed by admin
            </p>
          </div>
          <div className="card p-7 animate-fade-up stagger-3 hover-lift animate-pulse-glow">
            <p className="font-display text-4xl font-extrabold text-ink-900">₹0</p>
            <p className="mt-2 text-sm text-ink-500">
              Hidden fees — pricing shown upfront
            </p>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════ */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="text-center mb-12 animate-fade-up">
          <span className="chip mb-4 inline-block">Simple & Secure</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl text-ink-900">
            How RideLocal works
          </h2>
          <p className="mt-3 mx-auto max-w-lg text-ink-500">
            Three simple steps to your perfect ride — verified, transparent, and ready to go.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Find a verified bike",
              desc: "Search by location and dates — every result is owner-verified and admin-approved.",
              icon: "01",
            },
            {
              step: "2",
              title: "Verify your licence",
              desc: "A quick, secure upload keeps the platform safe for owners and travelers alike.",
              icon: "02",
            },
            {
              step: "3",
              title: "Book & ride",
              desc: "Review the full price breakdown, pay securely, and pick up your bike.",
              icon: "03",
            },
          ].map((s) => (
            <div key={s.step} className={`card p-7 hover-lift animate-fade-up stagger-${s.step}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold tracking-wider bg-brand-50 text-brand-600">
                  {s.icon}
                </span>
                <span className="chip !px-2.5 !py-1 text-xs font-bold" style={{ color: '#fb923c' }}>
                  Step {s.step}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-ink-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ OWNER CTA ══════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="glass-panel p-10 sm:p-14 text-center animate-fade-up">
          <div className="ambient-orb" style={{ width: 200, height: 200, top: '-20%', left: '10%', background: 'radial-gradient(circle, rgba(249,115,22,0.20), transparent 70%)', animationDelay: '3s' }} />

          <span className="chip mb-5 inline-block">For Owners</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl text-ink-900">
            Have a bike sitting idle?
          </h2>
          <p className="mt-4 mx-auto max-w-lg text-ink-500">
            List it on RideLocal, set your price and availability, and start earning
            from travelers exploring your city.
          </p>
          <Link to="/get-started?role=OWNER" className="btn-glass mt-8 inline-flex">
            List your bike
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═════════════════════════════════════════ */}
      <footer className="mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 border-t border-neutral-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-500">
            © 2026 RideLocal. Verified rides, honest pricing.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/search" className="text-sm transition-colors hover:text-ink-900 text-ink-500">
              Explore
            </Link>
            <Link to="/get-started" className="text-sm transition-colors hover:text-ink-900 text-ink-500">
              Get Started
            </Link>
            <Link to="/login" className="text-sm transition-colors hover:text-ink-900 text-ink-500">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
