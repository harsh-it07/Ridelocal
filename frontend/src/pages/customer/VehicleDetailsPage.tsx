import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";
import { VehicleGallery } from "../../components/VehicleGallery";
import { ReviewsSection } from "../../components/ReviewsSection";
import { Loader } from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PaymentMethod } from "../../types";

const POPULAR_HUBS = [
  "Jaipur Junction Railway Station",
  "Hawa Mahal, Pink City",
  "Sindhi Camp Bus Stand",
  "MI Road Central",
  "Jaipur International Airport (T2)",
  "Mansarovar Metro Station",
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; desc: string }[] = [
  { id: "UPI", label: "UPI Instant Transfer", desc: "Google Pay, PhonePe, Paytm" },
  { id: "CARD", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
  { id: "NETBANKING", label: "Net Banking", desc: "HDFC, SBI, ICICI" },
  { id: "WALLET", label: "RideLocal Wallet Balance", desc: "Test environment wallet" },
];

export function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [pickup, setPickup] = useState("Jaipur Junction Railway Station");
  const [dropoff, setDropoff] = useState("Jaipur Junction Railway Station");
  const [sameLocation, setSameLocation] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState<string | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [paymentStage, setPaymentStage] = useState<"select" | "processing" | "success" | "failed">("select");
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  function loadData() {
    if (!id) return;
    Promise.all([
      api.get(`/vehicles/${id}`),
      api.get(`/reviews/vehicle/${id}`),
    ])
      .then(([vehicleRes, reviewsRes]) => {
        setVehicle(vehicleRes.data.vehicle);
        setReviews(reviewsRes.data.reviews || []);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(() => {
    loadData();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    dayAfter.setHours(9, 0, 0, 0);
    setStart(tomorrow);
    setEnd(dayAfter);
  }, [id]);

  useEffect(() => {
    if (sameLocation) setDropoff(pickup);
  }, [pickup, sameLocation]);

  const diffMs = start && end ? end.getTime() - start.getTime() : 0;
  const totalHours = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60)) : 0;
  const days = Math.max(1, Math.ceil(totalHours / 24));
  const estRental = vehicle ? days * Number(vehicle.pricePerDay) : 0;
  const platformFee = Math.round(estRental * 0.08);
  const securityDeposit = vehicle ? Number(vehicle.securityDeposit) : 0;
  const estTotal = estRental + platformFee + securityDeposit;

  function applyPreset(preset: "tomorrow" | "weekend" | "three_days" | "plus_one") {
    const now = new Date();
    if (preset === "tomorrow") {
      const s = new Date(now); s.setDate(s.getDate() + 1); s.setHours(9, 0, 0, 0);
      const e = new Date(s); e.setDate(e.getDate() + 1); e.setHours(9, 0, 0, 0);
      setStart(s); setEnd(e);
    } else if (preset === "weekend") {
      const s = new Date(now);
      const day = s.getDay();
      const diffToSat = (6 - day + 7) % 7 || 7;
      s.setDate(s.getDate() + diffToSat); s.setHours(8, 0, 0, 0);
      const e = new Date(s); e.setDate(e.getDate() + 2); e.setHours(9, 0, 0, 0);
      setStart(s); setEnd(e);
    } else if (preset === "three_days") {
      const s = start || new Date();
      const e = new Date(s); e.setDate(e.getDate() + 3);
      setEnd(e);
    } else if (preset === "plus_one") {
      if (end) { const e = new Date(end); e.setDate(e.getDate() + 1); setEnd(e); }
    }
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) { setBookingError("Geolocation is not supported."); return; }
    setDetectingGps(true); setGpsSuccess(null); setBookingError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        const resolved = `Current Location (${lat}, ${lng})`;
        setPickup(resolved);
        if (sameLocation) setDropoff(resolved);
        setGpsSuccess("GPS Location acquired");
        setDetectingGps(false);
      },
      (err) => { setBookingError("Location access denied: " + err.message); setDetectingGps(false); },
      { timeout: 9000, enableHighAccuracy: true }
    );
  }

  async function handleProceedToPayment() {
    if (!user) { navigate("/login"); return; }
    if (!start || !end) { setBookingError("Please select pickup and return dates."); return; }
    if (end.getTime() <= start.getTime()) { setBookingError("Return must be after pickup."); return; }
    if (!pickup.trim()) { setBookingError("Please specify a pickup location."); return; }
    setBookingError(null); setSubmitting(true);
    try {
      const { data } = await api.post("/bookings", {
        vehicleId: id, startTime: start.toISOString(), endTime: end.toISOString(),
        pickupLocation: pickup, returnLocation: dropoff || pickup,
      });
      setActiveBookingId(data.booking.id);
      setPaymentStage("select");
      setShowPaymentModal(true);
    } catch (err) { setBookingError(getErrorMessage(err)); }
    finally { setSubmitting(false); }
  }

  async function executeMockPayment() {
    if (!activeBookingId) return;
    setPaymentStage("processing");
    try {
      const { data: order } = await api.post("/payments/mock/create", { bookingId: activeBookingId, method: paymentMethod });
      await new Promise((r) => setTimeout(r, 1200));
      const { data: result } = await api.post("/payments/mock/confirm", { providerRef: order.providerRef, proof: {} });
      setTransactionId(result.payment?.transactionId || "MOCK_TXN_SUCCESS");
      setPaymentStage("success");
    } catch (err) { setBookingError(getErrorMessage(err)); setPaymentStage("failed"); }
  }

  if (error) return <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "56px 24px", color: "#FFAAAA", fontSize: "1.0625rem" }}>{error}</div>;
  if (!vehicle) return <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "56px 24px" }}><Loader message="Loading ride details..." size="lg" /></div>;

  return (
    <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "56px 24px" }}>
      {/* Editorial Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "20px", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            {vehicle.vehicleType} · {vehicle.city} HUB
          </p>
          <h1
            style={{
              fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              lineHeight: 0.92,
              letterSpacing: "0.01em",
              color: "#F9D3CD",
              textTransform: "uppercase",
              margin: "6px 0 0",
            }}
          >
            {vehicle.brand} {vehicle.model}
          </h1>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <StatusBadge status={vehicle.status} />
          <StatusBadge status={vehicle.verificationStatus} />
        </div>
      </div>

      {/* Gallery Frame */}
      <div style={{ marginTop: "32px" }}>
        <VehicleGallery photos={vehicle.photoUrls || []} altText={`${vehicle.brand} ${vehicle.model}`} />
      </div>

      {/* Main Grid: Specifications & Sticky Booking Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 460px", gap: "48px", marginTop: "48px" }} className="detail-grid">

        {/* Left Column: Information */}
        <div>
          {/* Key Rates Bar */}
          <div style={{ borderTop: "1px solid rgba(249, 211, 205, 0.3)", paddingTop: "28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
              <div>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.1em" }}>Daily Rate</p>
                <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2.25rem", color: "#F9D3CD", margin: "4px 0 0" }}>₹{vehicle.pricePerDay}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.1em" }}>Security Deposit</p>
                <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2.25rem", color: "#F9D3CD", margin: "4px 0 0" }}>₹{vehicle.securityDeposit}</p>
                <p style={{ fontSize: "0.8125rem", color: "#F0C4BC", margin: "2px 0 0", fontWeight: 500 }}>100% refundable</p>
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.1em" }}>Rider Rating</p>
                <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2.25rem", color: "#F9D3CD", margin: "4px 0 0" }}>
                  {vehicle.ratingAvg?.toFixed?.(1) ?? "4.8"} <span style={{ fontSize: "1.25rem", color: "#FFFFFF" }}>★</span>
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {vehicle.description && (
            <div style={{ marginTop: "36px", borderTop: "1px solid rgba(249, 211, 205, 0.2)", paddingTop: "28px" }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                ABOUT THIS RIDE
              </h3>
              <p style={{ fontSize: "1.0625rem", color: "#F9D3CD", lineHeight: 1.7, marginTop: "10px" }}>
                {vehicle.description}
              </p>
            </div>
          )}

          {/* What's included */}
          <div style={{ marginTop: "36px", borderTop: "1px solid rgba(249, 211, 205, 0.2)", paddingTop: "28px" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              RENTAL INCLUSIONS
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "14px" }}>
              {["Two ISI certified helmets", "Full fuel tank on handover", "24/7 roadside assistance support", "Free cancellation up to 6 hours"].map((item) => (
                <p key={item} style={{ fontSize: "0.9375rem", color: "#F9D3CD", margin: 0 }}>
                  — {item}
                </p>
              ))}
            </div>
          </div>

          {/* Owner Info */}
          <div style={{ marginTop: "36px", borderTop: "1px solid rgba(249, 211, 205, 0.2)", paddingTop: "28px" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              HOST OWNER
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "14px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#F9D3CD",
                  color: "#680A16",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  fontFamily: "'Bebas Neue'",
                }}
              >
                {vehicle.owner?.name?.charAt(0) || "O"}
              </div>
              <div>
                <p style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                  {vehicle.owner?.name || "Verified Local Owner"}
                </p>
                <div style={{ marginTop: "4px" }}>
                  <StatusBadge status={vehicle.owner?.verificationStatus || "VERIFIED"} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Reservation Panel (Spacious Minimal Helvetica Clean Box) */}
        <div
          className="booking-card"
          style={{
            border: "1px solid rgba(249, 211, 205, 0.18)",
            backgroundColor: "rgba(42, 4, 9, 0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "36px 32px",
            alignSelf: "start",
            position: "sticky",
            top: "84px",
            boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            fontFamily: "'Helvetica Neue', Helvetica, -apple-system, BlinkMacSystemFont, Arial, sans-serif",
          }}
        >
          {/* Header Row: Status tag and vehicle daily rate */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontSize: "0.78125rem",
                fontWeight: 500,
                color: "rgba(240, 196, 188, 0.75)",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#4ADE80", display: "inline-block" }} />
              reservation
            </span>
            <span style={{ fontSize: "0.85rem", color: "rgba(249, 211, 205, 0.75)" }}>
              ₹<strong style={{ fontSize: "1.15rem", color: "#FFFFFF", fontWeight: 600 }}>{vehicle.pricePerDay}</strong> / day
            </span>
          </div>

          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 600,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              margin: "10px 0 0",
              lineHeight: 1.25,
            }}
          >
            book this ride
          </h2>

          {user && user.role === "CUSTOMER" && user.verificationStatus !== "VERIFIED" && (
            <div
              style={{
                marginTop: "18px",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(251, 191, 36, 0.28)",
                backgroundColor: "rgba(251, 191, 36, 0.08)",
                fontSize: "0.8125rem",
                color: "#FDE68A",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                lineHeight: 1.5,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, marginTop: "2px" }}>
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>
                driving licence verification required prior to pickup.{" "}
                <a href="/verification" style={{ color: "#FFFFFF", fontWeight: 600, textDecoration: "underline" }}>
                  upload now →
                </a>
              </span>
            </div>
          )}

          {/* Quick Date Presets */}
          <div style={{ marginTop: "24px" }}>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(240, 196, 188, 0.75)", marginBottom: "9px" }}>
              quick select
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                { label: "tomorrow", key: "tomorrow" as const },
                { label: "weekend", key: "weekend" as const },
                { label: "3 days", key: "three_days" as const },
                { label: "+1 day", key: "plus_one" as const },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => applyPreset(p.key)}
                  className="booking-pill-btn"
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.84rem",
                    fontWeight: 500,
                    borderRadius: "20px",
                    border: "1px solid rgba(249, 211, 205, 0.3)",
                    backgroundColor: "rgba(249, 211, 205, 0.1)",
                    color: "#F9D3CD",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    outline: "none",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker Controls */}
          <div style={{ marginTop: "20px" }}>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(240, 196, 188, 0.75)", marginBottom: "7px" }}>
              pickup date & time
            </label>
            <DatePicker
              selected={start}
              onChange={(date: Date | null) => setStart(date)}
              showTimeSelect
              timeIntervals={30}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="booking-minimal-input"
              placeholderText="select pickup date & time"
              minDate={new Date()}
            />
          </div>

          <div style={{ marginTop: "16px" }}>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(240, 196, 188, 0.75)", marginBottom: "7px" }}>
              return date & time
            </label>
            <DatePicker
              selected={end}
              onChange={(date: Date | null) => setEnd(date)}
              showTimeSelect
              timeIntervals={30}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="booking-minimal-input"
              placeholderText="select return date & time"
              minDate={start || new Date()}
            />
          </div>

          {/* Pickup Location */}
          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
              <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "rgba(240, 196, 188, 0.75)", margin: 0 }}>
                pickup location
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={detectingGps}
                className="booking-gps-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "16px",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  backgroundColor: "rgba(249, 211, 205, 0.14)",
                  border: "1px solid rgba(249, 211, 205, 0.32)",
                  cursor: detectingGps ? "not-allowed" : "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                </svg>
                {detectingGps ? "detecting..." : "use gps"}
              </button>
            </div>
            <input
              className="booking-minimal-input"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="enter pickup hub or address"
            />
            {gpsSuccess && (
              <p style={{ fontSize: "0.78125rem", color: "#86EFAC", marginTop: "5px", display: "flex", alignItems: "center", gap: "5px" }}>
                ✓ {gpsSuccess.toLowerCase()}
              </p>
            )}
          </div>

          {/* Hub selection chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
            {POPULAR_HUBS.slice(0, 3).map((hub) => {
              const label = hub.split(",")[0].toLowerCase();
              const isSelected = pickup.toLowerCase().includes(label);
              return (
                <button
                  key={hub}
                  type="button"
                  onClick={() => { setPickup(hub); if (sameLocation) setDropoff(hub); }}
                  className={`booking-hub-chip ${isSelected ? "selected" : ""}`}
                  style={{
                    padding: "7px 15px",
                    fontSize: "0.8125rem",
                    borderRadius: "18px",
                    border: isSelected ? "1px solid #F9D3CD" : "1px solid rgba(249, 211, 205, 0.25)",
                    backgroundColor: isSelected ? "#F9D3CD" : "rgba(249, 211, 205, 0.08)",
                    color: isSelected ? "#4E050E" : "#F0C4BC",
                    fontWeight: isSelected ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Same location checkbox */}
          <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "18px", fontSize: "0.84375rem", color: "rgba(249, 211, 205, 0.85)", cursor: "pointer", fontWeight: 400, userSelect: "none" }}>
            <input
              type="checkbox"
              checked={sameLocation}
              onChange={(e) => setSameLocation(e.target.checked)}
              style={{ accentColor: "#F9D3CD", width: "16px", height: "16px", cursor: "pointer" }}
            />
            return to same pickup hub
          </label>
          {!sameLocation && (
            <div style={{ marginTop: "12px" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(240, 196, 188, 0.75)", marginBottom: "7px" }}>
                return location
              </label>
              <input
                className="booking-minimal-input"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="enter return hub or address"
              />
            </div>
          )}

          {/* Price breakdown */}
          {days > 0 && (
            <div style={{ marginTop: "26px", borderTop: "1px solid rgba(249, 211, 205, 0.14)", paddingTop: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "rgba(240, 196, 188, 0.8)", marginBottom: "10px" }}>
                <span>rental (₹{vehicle.pricePerDay} × {days}d)</span>
                <span style={{ fontWeight: 600, color: "#FFFFFF" }}>₹{estRental}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "rgba(240, 196, 188, 0.8)", marginBottom: "10px" }}>
                <span>platform fee (8%)</span>
                <span style={{ fontWeight: 600, color: "#FFFFFF" }}>₹{platformFee}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "rgba(240, 196, 188, 0.8)", marginBottom: "12px" }}>
                <span>security deposit <span style={{ opacity: 0.7, fontSize: "0.78125rem" }}>(100% refundable)</span></span>
                <span style={{ fontWeight: 600, color: "#FFFFFF" }}>₹{securityDeposit}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(249, 211, 205, 0.2)", paddingTop: "16px", marginTop: "6px", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.84375rem", fontWeight: 500, color: "rgba(240, 196, 188, 0.85)" }}>total payable</span>
                <span style={{ fontSize: "1.9rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  ₹{estTotal}
                </span>
              </div>
            </div>
          )}

          {bookingError && (
            <p style={{ fontSize: "0.8125rem", color: "#FCA5A5", marginTop: "12px", lineHeight: 1.4 }}>
              {bookingError.toLowerCase()}
            </p>
          )}

          <button
            onClick={handleProceedToPayment}
            disabled={!start || !end || !pickup || submitting}
            className="booking-cta-btn"
            style={{
              width: "100%",
              marginTop: "24px",
              padding: "16px 24px",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "14px",
              border: "none",
              backgroundColor: "#F9D3CD",
              color: "#4E050E",
              cursor: (!start || !end || !pickup || submitting) ? "not-allowed" : "pointer",
              opacity: (!start || !end || !pickup || submitting) ? 0.45 : 1,
              boxShadow: (!start || !end || !pickup || submitting) ? "none" : "0 8px 20px -4px rgba(249, 211, 205, 0.35)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span>{submitting ? "processing..." : `confirm & pay ₹${estTotal}`}</span>
            {!submitting && <span>→</span>}
          </button>
          <p style={{
            fontSize: "0.78125rem",
            color: "rgba(240, 196, 188, 0.65)",
            marginTop: "14px",
            textAlign: "center",
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            instant confirmation · secure escrow hold
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: "rgba(35, 2, 6, 0.85)" }}
          onClick={() => { if (paymentStage !== "processing") setShowPaymentModal(false); }}
        >
          <div
            style={{ backgroundColor: "#4E050E", border: "1px solid #F9D3CD", width: "100%", maxWidth: "460px", padding: "36px", position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            {paymentStage !== "processing" && (
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "#F9D3CD" }}
              >
                ✕
              </button>
            )}

            {paymentStage === "select" && (
              <>
                <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                  RIDELOCAL SECURE ESCROW
                </p>
                <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2.75rem", color: "#F9D3CD", margin: "4px 0 0" }}>
                  ₹{estTotal}
                </p>
                <p style={{ fontSize: "0.9375rem", color: "#FFFFFF", marginTop: "2px", fontWeight: 500 }}>
                  {vehicle.brand} {vehicle.model} · {days} day rental
                </p>

                <div style={{ marginTop: "24px" }}>
                  <label className="label">Select Payment Channel</label>
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      style={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px",
                        marginBottom: "8px",
                        border: paymentMethod === m.id ? "1px solid #F9D3CD" : "1px solid rgba(249, 211, 205, 0.2)",
                        backgroundColor: paymentMethod === m.id ? "rgba(249, 211, 205, 0.12)" : "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>{m.label}</p>
                        <p style={{ fontSize: "0.8125rem", color: "#F0C4BC", margin: "2px 0 0" }}>{m.desc}</p>
                      </div>
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          border: paymentMethod === m.id ? "5px solid #F9D3CD" : "1px solid rgba(249, 211, 205, 0.4)",
                        }}
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={executeMockPayment}
                  className="btn-primary"
                  style={{ width: "100%", marginTop: "20px", padding: "16px", fontSize: "0.9375rem" }}
                >
                  Authorize ₹{estTotal} →
                </button>
              </>
            )}

            {paymentStage === "processing" && (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ width: "48px", height: "48px", border: "3px solid rgba(249, 211, 205, 0.2)", borderTop: "3px solid #F9D3CD", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }} />
                <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2rem", color: "#F9D3CD", marginTop: "20px" }}>PROCESSING PAYMENT</p>
                <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px" }}>Securing escrow with {paymentMethod}...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {paymentStage === "success" && (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontFamily: "'Bebas Neue'", fontSize: "3rem", color: "#F9D3CD", margin: 0 }}>✓ CONFIRMED</p>
                <p style={{ fontSize: "0.9375rem", color: "#FFFFFF", marginTop: "8px", fontWeight: 600 }}>Transaction: {transactionId}</p>
                <div style={{ display: "flex", gap: "10px", marginTop: "28px" }}>
                  <button
                    type="button"
                    onClick={() => { setShowPaymentModal(false); if (activeBookingId) navigate(`/bookings/${activeBookingId}`); }}
                    className="btn-primary"
                    style={{ flex: 1, padding: "14px", fontSize: "0.9375rem" }}
                  >
                    View Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowPaymentModal(false); navigate("/bookings"); }}
                    className="btn-secondary"
                    style={{ flex: 1, padding: "14px", fontSize: "0.9375rem" }}
                  >
                    My Rides
                  </button>
                </div>
              </div>
            )}

            {paymentStage === "failed" && (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2.5rem", color: "#FFAAAA", margin: 0 }}>✕ PAYMENT FAILED</p>
                <p style={{ fontSize: "0.8125rem", color: "#FFAAAA", marginTop: "8px" }}>{bookingError || "Gateway error."}</p>
                <button
                  type="button"
                  onClick={() => setPaymentStage("select")}
                  className="btn-primary"
                  style={{ width: "100%", marginTop: "20px", padding: "12px" }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews */}
      <ReviewsSection vehicleId={id!} serverReviews={reviews} ratingAvg={vehicle.ratingAvg} ratingCount={vehicle.ratingCount} onReviewAdded={loadData} />

      <style>{`
        .booking-card {
          font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
        }
        .booking-card * {
          box-sizing: border-box;
          font-family: inherit;
        }
        .booking-pill-btn {
          user-select: none;
        }
        .booking-pill-btn:hover {
          background-color: rgba(249, 211, 205, 0.22) !important;
          border-color: rgba(249, 211, 205, 0.55) !important;
          color: #FFFFFF !important;
          transform: translateY(-1px);
        }
        .booking-pill-btn:active {
          transform: translateY(0);
        }
        .booking-gps-btn:hover:not(:disabled) {
          background-color: rgba(249, 211, 205, 0.26) !important;
          border-color: #F9D3CD !important;
          color: #FFFFFF !important;
        }
        .booking-hub-chip {
          user-select: none;
        }
        .booking-hub-chip:hover:not(.selected) {
          background-color: rgba(249, 211, 205, 0.18) !important;
          border-color: rgba(249, 211, 205, 0.45) !important;
          color: #FFFFFF !important;
        }
        .booking-minimal-input {
          width: 100%;
          background-color: rgba(0, 0, 0, 0.32);
          color: #FFFFFF;
          border: 1px solid rgba(249, 211, 205, 0.24);
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 0.9375rem;
          outline: none;
          transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
        }
        .booking-minimal-input:focus {
          border-color: #F9D3CD;
          background-color: rgba(0, 0, 0, 0.48);
          box-shadow: 0 0 0 3px rgba(249, 211, 205, 0.15);
        }
        .booking-minimal-input::placeholder {
          color: rgba(249, 211, 205, 0.4);
        }
        .booking-cta-btn:hover:not(:disabled) {
          background-color: #FFFFFF !important;
          color: #380309 !important;
          transform: translateY(-1px);
          box-shadow: 0 12px 24px -4px rgba(249, 211, 205, 0.45) !important;
        }
        .booking-cta-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .booking-card .react-datepicker-wrapper {
          width: 100%;
          display: block;
        }
        .booking-card .react-datepicker {
          border-radius: 12px !important;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6) !important;
          border: 1px solid rgba(249, 211, 205, 0.3) !important;
        }
        .booking-card .react-datepicker__current-month,
        .booking-card .react-datepicker-time__header {
          font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
          font-size: 0.9375rem !important;
          font-weight: 600 !important;
          text-transform: lowercase !important;
          letter-spacing: -0.01em !important;
        }
        .booking-card .react-datepicker__day-name {
          text-transform: lowercase !important;
          font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
          font-size: 0.78125rem !important;
        }
        .booking-card .react-datepicker__day {
          border-radius: 6px !important;
          font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
        }
        @media (max-width: 860px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
