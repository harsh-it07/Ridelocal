import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";
import { VehicleGallery } from "../../components/VehicleGallery";
import { ReviewsSection } from "../../components/ReviewsSection";
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

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { id: "UPI", label: "UPI Instant", icon: "⚡", desc: "Google Pay, PhonePe, Paytm, BHIM" },
  { id: "CARD", label: "Credit / Debit Card", icon: "💳", desc: "Visa, Mastercard, RuPay" },
  { id: "NETBANKING", label: "Net Banking", icon: "🏦", desc: "HDFC, SBI, ICICI, Axis Bank" },
  { id: "WALLET", label: "RideLocal Wallet", icon: "👛", desc: "Instant test balance" },
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

  // Mock Payment Modal state
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

    // Default dates: Tomorrow 9:00 AM to Day after Tomorrow 9:00 AM (24 hours)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    dayAfter.setHours(9, 0, 0, 0);

    setStart(tomorrow);
    setEnd(dayAfter);
  }, [id]);

  // Keep dropoff in sync if sameLocation is checked
  useEffect(() => {
    if (sameLocation) {
      setDropoff(pickup);
    }
  }, [pickup, sameLocation]);

  // Calculate duration
  const diffMs = start && end ? end.getTime() - start.getTime() : 0;
  const totalHours = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60)) : 0;
  const days = Math.max(1, Math.ceil(totalHours / 24));

  const estRental = vehicle ? days * Number(vehicle.pricePerDay) : 0;
  const platformFee = Math.round(estRental * 0.08);
  const securityDeposit = vehicle ? Number(vehicle.securityDeposit) : 0;
  const estTotal = estRental + platformFee + securityDeposit;

  // Preset Shortcuts
  function applyPreset(preset: "tomorrow" | "weekend" | "three_days" | "plus_one") {
    const now = new Date();
    if (preset === "tomorrow") {
      const s = new Date(now);
      s.setDate(s.getDate() + 1);
      s.setHours(9, 0, 0, 0);
      const e = new Date(s);
      e.setDate(e.getDate() + 1);
      e.setHours(9, 0, 0, 0);
      setStart(s);
      setEnd(e);
    } else if (preset === "weekend") {
      const s = new Date(now);
      // Next Saturday
      const day = s.getDay();
      const diffToSat = (6 - day + 7) % 7 || 7;
      s.setDate(s.getDate() + diffToSat);
      s.setHours(8, 0, 0, 0);
      const e = new Date(s);
      e.setDate(e.getDate() + 2); // Monday morning
      e.setHours(9, 0, 0, 0);
      setStart(s);
      setEnd(e);
    } else if (preset === "three_days") {
      const s = start || new Date();
      const e = new Date(s);
      e.setDate(e.getDate() + 3);
      setEnd(e);
    } else if (preset === "plus_one") {
      if (end) {
        const e = new Date(end);
        e.setDate(e.getDate() + 1);
        setEnd(e);
      }
    }
  }

  // Location Permission & Geolocation
  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setBookingError("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingGps(true);
    setGpsSuccess(null);
    setBookingError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        const resolved = `Current Location (${lat}, ${lng} · Jaipur Hub)`;
        setPickup(resolved);
        if (sameLocation) setDropoff(resolved);
        setGpsSuccess("📍 Location acquired via GPS accuracy (" + Math.round(pos.coords.accuracy) + "m)");
        setDetectingGps(false);
      },
      (err) => {
        setBookingError("Location access denied or timed out: " + err.message);
        setDetectingGps(false);
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  }

  // Create booking and initiate mock payment modal
  async function handleProceedToPayment() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!start || !end) {
      setBookingError("Please select pickup and return dates.");
      return;
    }
    if (end.getTime() <= start.getTime()) {
      setBookingError("Return date/time must be strictly after pickup date/time.");
      return;
    }
    if (!pickup.trim()) {
      setBookingError("Please specify a pickup location.");
      return;
    }

    setBookingError(null);
    setSubmitting(true);

    try {
      const { data } = await api.post("/bookings", {
        vehicleId: id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        pickupLocation: pickup,
        returnLocation: dropoff || pickup,
      });

      setActiveBookingId(data.booking.id);
      setPaymentStage("select");
      setShowPaymentModal(true);
    } catch (err) {
      setBookingError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // Execute Mock Payment
  async function executeMockPayment() {
    if (!activeBookingId) return;
    setPaymentStage("processing");
    try {
      // Step 1: Create mock order
      const { data: order } = await api.post("/payments/mock/create", {
        bookingId: activeBookingId,
        method: paymentMethod,
      });

      // Realistic gateway roundtrip pause
      await new Promise((r) => setTimeout(r, 1200));

      // Step 2: Confirm mock charge
      const { data: result } = await api.post("/payments/mock/confirm", {
        providerRef: order.providerRef,
        proof: {},
      });

      setTransactionId(result.payment?.transactionId || "MOCK_TXN_SUCCESS");
      setPaymentStage("success");
    } catch (err) {
      setBookingError(getErrorMessage(err));
      setPaymentStage("failed");
    }
  }

  if (error) return <div className="mx-auto max-w-4xl px-4 py-10 text-red-400">{error}</div>;
  if (!vehicle) return <div className="mx-auto max-w-4xl px-4 py-10 text-ink-500">Loading ride details...</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Vehicle Hero Card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-brand-400 font-semibold">
                {vehicle.vehicleType}
              </span>
              <span className="text-ink-500">·</span>
              <span className="text-xs text-ink-500">{vehicle.city}</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-ink-900 mt-0.5">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-xs text-ink-500 mt-1">
              Registration: <span className="font-mono uppercase font-medium">{vehicle.registrationReference}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={vehicle.status} />
            <StatusBadge status={vehicle.verificationStatus} />
            <span className="chip !py-1 text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-500/10">
              ⚡ Instant Booking
            </span>
          </div>
        </div>

        {/* Rich Interactive Photo Gallery */}
        <div className="mt-6">
          <VehicleGallery photos={vehicle.photoUrls || []} altText={`${vehicle.brand} ${vehicle.model}`} />
        </div>

        {/* Vehicle Highlights & Badges */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-glass-border bg-glass-surface p-3 text-xs">
            <span className="text-lg">🪖</span>
            <div>
              <p className="font-semibold text-ink-900">2 Helmets</p>
              <p className="text-[11px] text-ink-500">Included free</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-glass-border bg-glass-surface p-3 text-xs">
            <span className="text-lg">⛽</span>
            <div>
              <p className="font-semibold text-ink-900">Full Tank</p>
              <p className="text-[11px] text-ink-500">Pickup ready</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-glass-border bg-glass-surface p-3 text-xs">
            <span className="text-lg">🧼</span>
            <div>
              <p className="font-semibold text-ink-900">Sanitized</p>
              <p className="text-[11px] text-ink-500">Before handover</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-glass-border bg-glass-surface p-3 text-xs">
            <span className="text-lg">🛡️</span>
            <div>
              <p className="font-semibold text-ink-900">Free Cancel</p>
              <p className="text-[11px] text-ink-500">Up to 6h before</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {vehicle.description && (
          <p className="mt-5 text-sm text-ink-700 leading-relaxed bg-glass-surface p-4 rounded-xl border border-glass-border">
            {vehicle.description}
          </p>
        )}

        {/* Pricing & Rating Highlights */}
        <div className="mt-5 grid grid-cols-3 gap-4 rounded-xl bg-glass-surface p-4 border border-glass-border text-sm">
          <div>
            <p className="text-xs text-ink-500">Daily rate</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">₹{vehicle.pricePerDay}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500">Security deposit</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">₹{vehicle.securityDeposit}</p>
            <span className="text-[10px] text-green-400 font-medium">100% refundable</span>
          </div>
          <div>
            <p className="text-xs text-ink-500">Rider Rating</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5 flex items-center gap-1">
              <span>{vehicle.ratingAvg?.toFixed?.(1) ?? "4.8"}</span>
              <span className="text-amber-400 text-sm">★</span>
            </p>
            <span className="text-[10px] text-ink-500">({vehicle.ratingCount || 32} reviews)</span>
          </div>
        </div>

        {/* Owner Card */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-glass-border bg-glass-surface px-4 py-3 text-xs text-ink-700">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300">
              {vehicle.owner?.name?.charAt(0) || "O"}
            </div>
            <div>
              <p className="font-semibold text-ink-900">{vehicle.owner?.name || "Verified Host"}</p>
              <p className="text-[11px] text-ink-500">Host rating 4.9 ★ · Response time &lt; 15 mins</p>
            </div>
          </div>
          <StatusBadge status={vehicle.owner?.verificationStatus || "VERIFIED"} />
        </div>
      </div>

      {/* Book this vehicle Card */}
      <div className="card mt-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-glass-border pb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900">Plan & Book Your Ride</h2>
            <p className="text-xs text-ink-500 mt-0.5">Select pickup/return timing and pickup location.</p>
          </div>
          {diffMs > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400 border border-brand-500/20">
              <span>⏱️ {days} Day{days > 1 ? "s" : ""}</span>
              <span>·</span>
              <span>{totalHours} hrs</span>
            </div>
          )}
        </div>

        {user && user.role === "CUSTOMER" && user.verificationStatus !== "VERIFIED" && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>
              You'll need a verified driving licence before this ride can be confirmed.{" "}
              <a href="/verification" className="font-semibold underline text-amber-200">
                Upload verification now
              </a>
              .
            </span>
          </div>
        )}

        {/* Quick Duration Shortcuts */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Quick Presets</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => applyPreset("tomorrow")}
              className="rounded-lg border border-glass-border bg-glass-surface px-3 py-1 text-xs font-medium text-ink-700 hover:text-white hover:border-brand-500 transition"
            >
              Tomorrow 9:00 AM (24h)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("weekend")}
              className="rounded-lg border border-glass-border bg-glass-surface px-3 py-1 text-xs font-medium text-ink-700 hover:text-white hover:border-brand-500 transition"
            >
              Weekend Getaway (Sat-Mon)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("three_days")}
              className="rounded-lg border border-glass-border bg-glass-surface px-3 py-1 text-xs font-medium text-ink-700 hover:text-white hover:border-brand-500 transition"
            >
              3-Day Tour
            </button>
            <button
              type="button"
              onClick={() => applyPreset("plus_one")}
              className="rounded-lg border border-glass-border bg-glass-surface px-3 py-1 text-xs font-medium text-brand-400 hover:text-brand-300 hover:border-brand-500 transition"
            >
              +1 Day Extra
            </button>
          </div>
        </div>

        {/* Advanced Date & Time Pickers */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label flex items-center gap-1.5">
              <span>📅 Pickup Date & Time</span>
            </label>
            <DatePicker
              selected={start}
              onChange={(date: Date | null) => setStart(date)}
              showTimeSelect
              timeIntervals={30}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="input w-full"
              placeholderText="Select pickup date & time"
              minDate={new Date()}
            />
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <span>🏁 Return Date & Time</span>
            </label>
            <DatePicker
              selected={end}
              onChange={(date: Date | null) => setEnd(date)}
              showTimeSelect
              timeIntervals={30}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="input w-full"
              placeholderText="Select return date & time"
              minDate={start || new Date()}
            />
          </div>
        </div>

        {/* Location Selection with Geolocation API */}
        <div className="mt-5 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label !mb-0">Pickup Location</label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={detectingGps}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{detectingGps ? "Detecting GPS..." : "Use Current Location"}</span>
              </button>
            </div>
            <input
              className="input w-full"
              placeholder="e.g. Jaipur Junction or Hotel address"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
            {gpsSuccess && (
              <p className="mt-1 text-xs text-green-400 font-medium">{gpsSuccess}</p>
            )}
          </div>

          {/* Popular Pickup Hub Chips */}
          <div>
            <p className="text-[11px] text-ink-500 font-medium mb-1.5">Popular Jaipur Hubs:</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_HUBS.map((hub) => (
                <button
                  key={hub}
                  type="button"
                  onClick={() => {
                    setPickup(hub);
                    if (sameLocation) setDropoff(hub);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    pickup === hub
                      ? "bg-brand-500 text-white"
                      : "bg-glass-surface border border-glass-border text-ink-600 hover:text-ink-900"
                  }`}
                >
                  {hub}
                </button>
              ))}
            </div>
          </div>

          {/* Return location toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-ink-700">
              <input
                type="checkbox"
                checked={sameLocation}
                onChange={(e) => setSameLocation(e.target.checked)}
                className="rounded border-glass-border bg-glass-surface text-brand-500 focus:ring-brand-500"
              />
              <span>Return bike to the same location</span>
            </label>

            {!sameLocation && (
              <div className="mt-2 animate-fade-in">
                <label className="label">Different Return Location</label>
                <input
                  className="input w-full"
                  placeholder="Specify drop-off spot"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Live Fare Breakdown */}
        {days > 0 && (
          <div className="mt-6 rounded-2xl border border-glass-border bg-neutral-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-display font-semibold text-sm text-ink-900">Price Breakdown</span>
              <span className="text-xs text-ink-500">Transparent & No Hidden Fees</span>
            </div>

            <div className="space-y-1.5 text-xs text-ink-700">
              <div className="flex justify-between">
                <span>Base Rental (₹{vehicle.pricePerDay} × {days} day{days > 1 ? "s" : ""})</span>
                <span className="font-semibold text-ink-900">₹{estRental.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Convenience Fee (8%)</span>
                <span className="font-semibold text-ink-900">₹{platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span>100% Refundable Security Deposit</span>
                <span className="font-semibold">₹{securityDeposit.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
              <div>
                <span className="text-xs text-ink-500 block">Total Payable Now</span>
                <span className="font-display text-2xl font-black text-ink-900">₹{estTotal.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-green-400 block font-medium">🛡️ ₹{securityDeposit} refunded</span>
                <span className="text-[10px] text-ink-500 block">within 24h after ride inspection</span>
              </div>
            </div>
          </div>
        )}

        {bookingError && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 flex items-center gap-2">
            <span>✕</span>
            <span>{bookingError}</span>
          </div>
        )}

        <button
          onClick={handleProceedToPayment}
          disabled={!start || !end || !pickup || submitting}
          className="btn-primary mt-6 w-full py-3.5 text-base font-bold shadow-lg"
        >
          {submitting ? "Initiating Booking..." : `Continue to Mock Payment (₹${estTotal.toFixed(2)})`}
        </button>
        <p className="mt-2 text-center text-xs text-ink-500">
          Simulated instant mock payment gateway for testing. Real database booking records are generated.
        </p>
      </div>

      {/* Interactive Mock Payment Modal */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 animate-fade-in"
          onClick={() => {
            if (paymentStage !== "processing") setShowPaymentModal(false);
          }}
        >
          <div
            className="card w-full max-w-md p-6 relative border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {paymentStage !== "processing" && (
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-ink-500 hover:text-white"
              >
                ✕
              </button>
            )}

            {paymentStage === "select" && (
              <>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-brand-500/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-400">
                    RideLocal Sandbox
                  </span>
                  <span className="text-xs text-ink-500">Instant Mock Gateway</span>
                </div>
                <h3 className="font-display text-2xl font-extrabold text-ink-900 mt-2">
                  ₹{estTotal.toFixed(2)}
                </h3>
                <p className="text-xs text-ink-500 mt-0.5">
                  Rental: {vehicle.brand} {vehicle.model} ({days} day{days > 1 ? "s" : ""})
                </p>

                {/* Payment Methods */}
                <div className="mt-5 space-y-2.5">
                  <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
                    Select Test Payment Method
                  </label>
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex w-full items-center justify-between rounded-xl p-3 border text-left transition ${
                        paymentMethod === method.id
                          ? "border-brand-500 bg-brand-500/10 ring-1 ring-brand-500/50"
                          : "border-glass-border bg-glass-surface hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{method.icon}</span>
                        <div>
                          <p className="font-semibold text-xs text-ink-900">{method.label}</p>
                          <p className="text-[11px] text-ink-500">{method.desc}</p>
                        </div>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === method.id ? "border-brand-500 bg-brand-500" : "border-neutral-600"
                        }`}
                      >
                        {paymentMethod === method.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={executeMockPayment}
                    className="btn-primary w-full py-3 text-sm font-bold"
                  >
                    Simulate Successful Payment (₹{estTotal.toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      if (activeBookingId) navigate(`/bookings/${activeBookingId}/pay`);
                    }}
                    className="btn-secondary w-full py-2.5 text-xs"
                  >
                    Open Fullscreen Payment Page
                  </button>
                </div>
              </>
            )}

            {paymentStage === "processing" && (
              <div className="text-center py-8 space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
                <h4 className="font-display text-lg font-bold text-ink-900">Processing Simulated Payment</h4>
                <p className="text-xs text-ink-500">
                  Connecting to RideLocal test sandbox ({paymentMethod}). Creating confirmed transaction record...
                </p>
              </div>
            )}

            {paymentStage === "success" && (
              <div className="text-center py-6 space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-3xl border border-emerald-500/30">
                  ✓
                </div>
                <h4 className="font-display text-xl font-extrabold text-ink-900">Booking Confirmed!</h4>
                <p className="text-xs text-ink-500">
                  Transaction completed successfully via simulated {paymentMethod}.
                </p>

                <div className="rounded-xl border border-glass-border bg-glass-surface p-3 text-xs text-left space-y-1 font-mono">
                  <div className="flex justify-between text-ink-500">
                    <span>Transaction ID:</span>
                    <span className="text-ink-900 font-bold">{transactionId}</span>
                  </div>
                  <div className="flex justify-between text-ink-500">
                    <span>Amount Paid:</span>
                    <span className="text-ink-900 font-bold">₹{estTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-ink-500">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-bold">CONFIRMED (PAID)</span>
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      if (activeBookingId) navigate(`/bookings/${activeBookingId}`);
                    }}
                    className="btn-primary flex-1 py-2.5 text-xs font-bold"
                  >
                    View Booking Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      navigate("/trips");
                    }}
                    className="btn-secondary flex-1 py-2.5 text-xs"
                  >
                    Go to My Trips
                  </button>
                </div>
              </div>
            )}

            {paymentStage === "failed" && (
              <div className="text-center py-6 space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-3xl border border-red-500/30">
                  ✕
                </div>
                <h4 className="font-display text-xl font-bold text-ink-900">Payment Simulation Failed</h4>
                <p className="text-xs text-red-400">{bookingError || "Simulated gateway error. Please try again."}</p>
                <button
                  type="button"
                  onClick={() => setPaymentStage("select")}
                  className="btn-primary w-full py-2.5 text-xs font-bold mt-2"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Reviews Section */}
      <ReviewsSection
        vehicleId={id!}
        serverReviews={reviews}
        ratingAvg={vehicle.ratingAvg}
        ratingCount={vehicle.ratingCount}
        onReviewAdded={loadData}
      />
    </div>
  );
}
