import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div style={{ backgroundColor: "#680A16", color: "#F9D3CD", minHeight: "100vh" }}>
      {/* ═══ HERO — Direct Pitch Deck Reference Adaptation ═══ */}
      <section
        style={{
          minHeight: "92vh",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 36px 40px",
        }}
      >
        {/* Tone-on-tone background giant watermark (Right side, like in reference) */}
        <div
          style={{
            position: "absolute",
            right: "-4vw",
            top: "50%",
            transform: "translateY(-49%)",
            fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
            fontSize: "clamp(10rem, 30vw, 32rem)",
            lineHeight: 0.72,
            color: "rgba(78, 5, 14, 0.55)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0,
            whiteSpace: "nowrap",
          }}
        >
          Ride<br />Local. 
        </div>

        {/* Top bar metadata */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "1px solid rgba(249, 211, 205, 0.2)",
            paddingBottom: "20px",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "1.125rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#FFFFFF",
              }}
            >
              Making Jaipur Mobility Easy ! 
            </span>
            <p style={{ fontSize: "1rem", color: "#F0C4BC", margin: "4px 0 0", fontWeight: 600 }}>
              Rental System Portal
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "1.125rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: "#FFFFFF",
              }}
            >
              EST. 2026
            </span>
            <p style={{ fontSize: "1rem", color: "#F0C4BC", margin: "4px 0 0", fontWeight: 600 }}>
              JAIPUR, RAJASTHAN, INDIA
            </p>
          </div>
        </div>

        {/* Main Hero Content: Massive Condensed Typography */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "56px",
            alignItems: "flex-end",
            margin: "44px 0",
          }}
          className="hero-main-grid"
        >
          {/* Giant Title in Pale Blush Pink */}
          <div>
            <h1
              style={{
                fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
                fontSize: "clamp(5.5rem, 16vw, 15rem)",
                lineHeight: 0.84,
                letterSpacing: "0.01em",
                color: "#F9D3CD",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              RIDE<br />LOCAL.
            </h1>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "clamp(1.125rem, 1.6vw, 1.1rem)",
                lineHeight: 1.6,
                color: "#F9D3CD",
                maxWidth: "32rem",
                marginTop: "24px",
              }}
            >
              Explore the Pink City at your own speed. Rent verified motorcycles, scooters, and e-bikes directly from vetted locals.
            </p>

            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "36px", flexWrap: "wrap" }}>
              <Link to="/search" className="btn-primary" style={{ padding: "16px 36px", fontSize: "1rem" }}>
                Explore Available Bikes →
              </Link>
              <Link to="/get-started?role=OWNER" className="btn-secondary" style={{ padding: "16px 28px", fontSize: "1rem" }}>
                List Your Bike
              </Link>
            </div>
          </div>

          {/* Right Presentation Frame */}
          <div
            style={{
              border: "1px solid rgba(249, 211, 205, 0.35)",
              padding: "40px",
              position: "relative",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
            }}
            className="hero-spec-frame"
          >
            {/* Corner guide markers */}
            <div
              style={{
                position: "absolute",
                top: -5,
                left: -5,
                width: 9,
                height: 9,
                backgroundColor: "#F9D3CD",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -5,
                right: -5,
                width: 9,
                height: 9,
                backgroundColor: "#F9D3CD",
              }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", borderBottom: "1px solid rgba(249, 211, 205, 0.2)", paddingBottom: "24px" }}>
              <div>
                <p style={{ fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#F0C4BC", margin: 0 }}>
                  SERVICE MODEL :
                </p>
                <p style={{ fontSize: "1.125rem", color: "#FFFFFF", marginTop: "6px", fontWeight: 700 }}>
                  P2P Verified Rental
                </p>
              </div>

              <div>
                <p style={{ fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#F0C4BC", margin: 0 }}>
                  LOCATION BASE :
                </p>
                <p style={{ fontSize: "1.125rem", color: "#FFFFFF", marginTop: "6px", fontWeight: 700 }}>
                  Jaipur
                </p>
              </div>
            </div>

            <div style={{ marginTop: "28px" }}>
              <p
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "2.75rem",
                  letterSpacing: "0.04em",
                  color: "#FFFFFF",
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                UNCOMPROMISED TRANSPARENCY
              </p>
              <p style={{ fontSize: "1.0625rem", color: "#F0C4BC", marginTop: "12px", lineHeight: 1.65 }}>
                Every vehicle is verified with original RC documents. Fixed daily pricing, zero hidden surge multipliers, 100% refundable security deposits.
              </p>
            </div>

            <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F9D3CD" }}>
                
              </span>
              <Link to="/search" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#FFFFFF", textDecoration: "none", borderBottom: "1px solid #FFFFFF", paddingBottom: "2px", letterSpacing: "0.08em" }}>
                Browse Catalog →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Hero Metadata Strip */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(249, 211, 205, 0.2)",
            paddingTop: "20px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.25rem", fontWeight: 700, letterSpacing: "0.12em", color: "#F9D3CD" }}>
            BY : HARSHIT SHARMA
          </span>
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.25rem", fontWeight: 700, letterSpacing: "0.12em", color: "#FFFFFF", textTransform: "uppercase" }}>
            TOURIST MOBILITY & INDEPENDENT TRAVEL FACILITY

          </span>
        </div>
      </section>

      {/* ═══ SEARCH QUICK BAR — Crimson Strip ═══ */}
      <section style={{ backgroundColor: "#4E050E", borderBottom: "1px solid rgba(249, 211, 205, 0.2)" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", alignItems: "center" }} className="search-strip">
            <div style={{ padding: "28px 0", borderRight: "1px solid rgba(249, 211, 205, 0.2)" }}>
              <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.14em", margin: 0 }}>
                LOCATION
              </p>
              <p style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.5rem", fontWeight: 700, color: "#FFFFFF", marginTop: "4px", letterSpacing: "0.04em", margin: 0 }}>
                JAIPUR ALL HUBS
              </p>
            </div>
            <div style={{ padding: "28px 32px", borderRight: "1px solid rgba(249, 211, 205, 0.2)" }}>
              <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.14em", margin: 0 }}>
                DURATION
              </p>
              <p style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.5rem", fontWeight: 700, color: "#F9D3CD", marginTop: "4px", letterSpacing: "0.04em", margin: 0 }}>
                DAILY / MULTI-DAY
              </p>
            </div>
            <div style={{ padding: "28px 32px", borderRight: "1px solid rgba(249, 211, 205, 0.2)" }}>
              <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.14em", margin: 0 }}>
                VEHICLE
              </p>
              <p style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.5rem", fontWeight: 700, color: "#F9D3CD", marginTop: "4px", letterSpacing: "0.04em", margin: 0 }}>
                MOTORCYCLE / SCOOTER
              </p>
            </div>
            <div style={{ padding: "28px 32px", textAlign: "right" }}>
              <Link
                to="/search"
                className="btn-primary"
                style={{ padding: "14px 32px", fontSize: "0.9375rem" }}
              >
                Search Fleet →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — Numbered Editorial ═══ */}
      <section id="how-it-works" style={{ padding: "96px 0", borderBottom: "1px solid rgba(249, 211, 205, 0.2)" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "64px", flexWrap: "wrap", gap: "24px" }}>
            <div>
              <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>
                THE PROCESS
              </p>
              <h2
                style={{
                  fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
                  fontSize: "clamp(2.75rem, 6vw, 4.75rem)",
                  lineHeight: 0.95,
                  letterSpacing: "0.02em",
                  color: "#F9D3CD",
                  margin: "8px 0 0",
                  textTransform: "uppercase",
                }}
              >
                HOW IT WORKS.
              </h2>
            </div>
            <p style={{ fontSize: "1.125rem", color: "#F0C4BC", maxWidth: "28rem", margin: 0, lineHeight: 1.65 }}>
              Three direct steps from searching verified listings to exploring the historic roads of Rajasthan.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0" }} className="steps-grid">
            {[
              {
                num: "01",
                title: "SELECT YOUR BIKE",
                desc: "Choose from Royal Enfield tourers, city scooters, or electric rides. Filter by pick-up hubs across Jaipur.",
              },
              {
                num: "02",
                title: "CONFIRM & VERIFY",
                desc: "Upload your driving licence once. Transparent daily rates, no hidden surcharges, fully refundable security deposit.",
              },
              {
                num: "03",
                title: "PICK UP & RIDE",
                desc: "Meet the verified local owner at your selected hub. Inspect the two-wheeler, receive two ISI helmets, and head out.",
              },
            ].map((s, i) => (
              <div
                key={s.num}
                style={{
                  padding: i === 0 ? "0 48px 0 0" : "0 48px",
                  borderLeft: i > 0 ? "1px solid rgba(249, 211, 205, 0.2)" : "none",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "5rem",
                    fontWeight: 800,
                    color: "#F9D3CD",
                    lineHeight: 1,
                  }}
                >
                  {s.num}
                </span>
                <h3
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginTop: "16px",
                  }}
                >
                  {s.title}
                </h3>
                <p style={{ fontSize: "1.0625rem", color: "#F0C4BC", lineHeight: 1.65, marginTop: "12px" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OWNER SECTION — Deep Wine Contrast ═══ */}
      <section style={{ backgroundColor: "#4E050E", padding: "96px 0", borderBottom: "1px solid rgba(249, 211, 205, 0.2)" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "64px", alignItems: "center" }} className="owner-grid">
            <div>
              <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>
                FOR LOCAL BIKE OWNERS
              </p>
              <h2
                style={{
                  fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
                  fontSize: "clamp(3rem, 7vw, 5.5rem)",
                  lineHeight: 0.92,
                  color: "#F9D3CD",
                  textTransform: "uppercase",
                  letterSpacing: "0.01em",
                  marginTop: "8px",
                }}
              >
                YOUR BIKE.<br />EARNING DAILY.
              </h2>
              <p style={{ fontSize: "1.125rem", color: "#F0C4BC", lineHeight: 1.65, marginTop: "24px", maxWidth: "34rem" }}>
                Turn your idle two-wheeler into steady income. We verify tourist identities, manage payment escrow, and handle booking agreements for you.
              </p>
              <div style={{ marginTop: "36px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Link to="/get-started?role=OWNER" className="btn-primary" style={{ padding: "16px 36px", fontSize: "0.9375rem" }}>
                  List Your Bike Now →
                </Link>
                <Link to="/login" className="btn-secondary" style={{ padding: "16px 28px", fontSize: "0.9375rem" }}>
                  Owner Portal
                </Link>
              </div>
            </div>

            <div style={{ border: "1px solid rgba(249, 211, 205, 0.25)", overflow: "hidden", position: "relative" }}>
              <img
                src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80"
                alt="Motorcycle on Jaipur highway"
                style={{ width: "100%", height: "440px", objectFit: "cover", display: "block" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: "rgba(78, 5, 14, 0.9)",
                  padding: "18px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.125rem", fontWeight: 700, letterSpacing: "0.1em", color: "#FFFFFF" }}>
                  VERIFIED OWNERS ACROSS JAIPUR
                </span>
                <span style={{ fontSize: "0.9375rem", color: "#F9D3CD", fontWeight: 700 }}>100% ID SCREENED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST & IDENTITY ═══ */}
      <section style={{ padding: "88px 0", borderBottom: "1px solid rgba(249, 211, 205, 0.2)" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }} className="trust-grid">
            <div>
              <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>
                SAFETY & VERIFICATION
              </p>
              <h2
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  lineHeight: 0.95,
                  color: "#FFFFFF",
                  letterSpacing: "0.02em",
                  marginTop: "8px",
                }}
              >
                NO ANONYMOUS RENTALS.
              </h2>
            </div>
            <div>
              <p style={{ fontSize: "1.125rem", color: "#F0C4BC", lineHeight: 1.7 }}>
                Every rider undergoes driving licence validation before a booking can be confirmed. Vehicle registration papers (RC) and owner IDs are audited by human administrators.
              </p>
              <div style={{ display: "flex", gap: "36px", marginTop: "28px" }}>
                <div>
                  <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2.5rem", color: "#F9D3CD", margin: 0 }}>100%</p>
                  <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", margin: 0, textTransform: "uppercase", fontWeight: 700 }}>Verified Licences</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2.5rem", color: "#F9D3CD", margin: 0 }}>₹0</p>
                  <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", margin: 0, textTransform: "uppercase", fontWeight: 700 }}>Surge Multipliers</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2.5rem", color: "#F9D3CD", margin: 0 }}>24/7</p>
                  <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", margin: 0, textTransform: "uppercase", fontWeight: 700 }}>Jaipur Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: "64px 0 40px", backgroundColor: "#4E050E" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "36px" }}>
            <div>
              <p
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "2.75rem",
                  color: "#F9D3CD",
                  letterSpacing: "0.02em",
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                RIDE <span style={{ opacity: 0.65 }}>LOCAL</span>
              </p>
              <p style={{ fontSize: "1.0625rem", color: "#F0C4BC", marginTop: "12px", maxWidth: "24rem", lineHeight: 1.65 }}>
                Jaipur tourist two-wheeler rental marketplace. Connecting travelers directly with local verified bike owners.
              </p>
            </div>

            <div style={{ display: "flex", gap: "56px", flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FFFFFF", margin: 0 }}>
                  EXPLORE
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  <Link to="/search" style={{ fontSize: "1rem", color: "#F0C4BC", textDecoration: "none", fontWeight: 600 }}>All Bikes</Link>
                  <Link to="/#how-it-works" style={{ fontSize: "1rem", color: "#F0C4BC", textDecoration: "none", fontWeight: 600 }}>How It Works</Link>
                  <Link to="/get-started?role=OWNER" style={{ fontSize: "1rem", color: "#F0C4BC", textDecoration: "none", fontWeight: 600 }}>List a Bike</Link>
                </div>
              </div>

              <div>
                <p style={{ fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FFFFFF", margin: 0 }}>
                  ACCOUNT
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  <Link to="/login" style={{ fontSize: "1rem", color: "#F0C4BC", textDecoration: "none", fontWeight: 600 }}>Login</Link>
                  <Link to="/register" style={{ fontSize: "1rem", color: "#F0C4BC", textDecoration: "none", fontWeight: 600 }}>Sign Up</Link>
                  <Link to="/verification" style={{ fontSize: "1rem", color: "#F0C4BC", textDecoration: "none", fontWeight: 600 }}>Verification</Link>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "48px", borderTop: "1px solid rgba(249, 211, 205, 0.15)", paddingTop: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", margin: 0, fontWeight: 500 }}>
              © 2026 RIDELOCAL. JAIPUR, RAJASTHAN. ALL RIGHTS RESERVED.
            </p>
            <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", margin: 0, fontWeight: 500 }}>
              DESIGNED IN JAIPUR · PURE EDITORIAL
            </p>
          </div>
        </div>
      </footer>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 900px) {
          .hero-main-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hero-spec-frame { padding: 28px !important; }
          .search-strip { grid-template-columns: 1fr 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .steps-grid > div { border-left: none !important; padding: 0 !important; border-bottom: 1px solid rgba(249, 211, 205, 0.2); padding-bottom: 28px !important; }
          .steps-grid > div:last-child { border-bottom: none; }
          .owner-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .trust-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  );
}
