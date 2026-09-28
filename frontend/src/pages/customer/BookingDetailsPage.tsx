import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";
import { Loader } from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";

export function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeSubject, setDisputeSubject] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [disputeSent, setDisputeSent] = useState(false);

  function load() {
    api.get(`/bookings/${id}`)
      .then(({ data }) => setBooking(data.booking))
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(load, [id]);

  async function handleCancel() {
    setBusy(true);
    try { await api.post(`/bookings/${id}/cancel`, { reason: "Customer requested cancellation" }); load(); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  }

  async function handleRaiseDispute() {
    setBusy(true); setError(null);
    try { await api.post("/disputes", { bookingId: id, subject: disputeSubject, description: disputeDesc }); setDisputeSent(true); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  }

  async function handleReview() {
    setBusy(true);
    try { await api.post("/reviews", { bookingId: id, rating, comment }); load(); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  }

  if (error) return <div style={{ maxWidth: "720px", margin: "0 auto", padding: "56px 24px", color: "#FFAAAA", fontSize: "1.0625rem" }}>{error}</div>;
  if (!booking) return <div style={{ maxWidth: "720px", margin: "0 auto", padding: "56px 24px" }}><Loader message="Loading booking record..." size="lg" /></div>;

  const canCancel = user?.role === "CUSTOMER" && ["PENDING_PAYMENT", "CONFIRMED"].includes(booking.status);
  const canPay = user?.role === "CUSTOMER" && booking.status === "PENDING_PAYMENT";
  const canReview = user?.role === "CUSTOMER" && booking.status === "COMPLETED" && !booking.review;

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "56px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
        <div>
          <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            BOOKING RECORD #{booking.id.slice(0, 8)}
          </p>
          <h1
            style={{
              fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              lineHeight: 0.95,
              color: "#F9D3CD",
              textTransform: "uppercase",
              margin: "6px 0 0",
            }}
          >
            {booking.vehicle?.brand} {booking.vehicle?.model}
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "6px", fontWeight: 500 }}>
            {new Date(booking.startTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} → {new Date(booking.endTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Details Box in Dark Wine Panel */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginTop: "36px",
          border: "1px solid rgba(249, 211, 205, 0.25)",
          backgroundColor: "#4E050E",
          padding: "28px",
        }}
      >
        <div>
          <p className="label">Pickup Location</p>
          <p style={{ fontSize: "1rem", color: "#FFFFFF", margin: "4px 0 0", fontWeight: 600 }}>{booking.pickupLocation}</p>
        </div>
        <div>
          <p className="label">Return Location</p>
          <p style={{ fontSize: "1rem", color: "#FFFFFF", margin: "4px 0 0", fontWeight: 600 }}>{booking.returnLocation}</p>
        </div>
        <div>
          <p className="label">Total Amount</p>
          <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2rem", color: "#F9D3CD", margin: "2px 0 0" }}>₹{booking.totalAmount}</p>
        </div>
        <div>
          <p className="label">Payment Status</p>
          <p style={{ fontSize: "1rem", color: "#FFFFFF", margin: "4px 0 0", fontWeight: 600 }}>
            {booking.payments?.length || 0} transaction log(s)
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", marginTop: "32px", flexWrap: "wrap" }}>
        {canPay && (
          <Link to={`/bookings/${id}/pay`} className="btn-primary" style={{ padding: "14px 28px" }}>
            Pay Remaining Amount →
          </Link>
        )}
        {canCancel && (
          <button onClick={handleCancel} disabled={busy} className="btn-danger" style={{ padding: "14px 24px" }}>
            Cancel Booking
          </button>
        )}
        {["CONFIRMED", "ACTIVE", "COMPLETED"].includes(booking.status) && !disputeOpen && (
          <button onClick={() => setDisputeOpen(true)} className="btn-secondary" style={{ padding: "14px 24px" }}>
            Report an Issue / Dispute
          </button>
        )}
      </div>

      {/* Dispute form */}
      {disputeOpen && !disputeSent && (
        <div style={{ marginTop: "32px", border: "1px solid rgba(249, 211, 205, 0.25)", backgroundColor: "#4E050E", padding: "28px" }}>
          <h3 style={{ fontFamily: "'Bebas Neue'", fontSize: "1.75rem", color: "#F9D3CD", margin: 0 }}>REPORT AN ISSUE</h3>
          <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px" }}>This opens a dispute ticket reviewed by platform administrators.</p>
          <input className="input" style={{ marginTop: "16px" }} placeholder="Brief subject" value={disputeSubject} onChange={(e) => setDisputeSubject(e.target.value)} />
          <textarea className="input" style={{ marginTop: "10px", minHeight: "90px" }} placeholder="Describe what occurred with vehicle condition or handover..." value={disputeDesc} onChange={(e) => setDisputeDesc(e.target.value)} />
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button onClick={() => setDisputeOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handleRaiseDispute} disabled={busy || !disputeSubject || disputeDesc.length < 10} className="btn-primary" style={{ flex: 1 }}>Submit Ticket</button>
          </div>
        </div>
      )}

      {disputeSent && (
        <div style={{ marginTop: "24px", padding: "16px 20px", backgroundColor: "rgba(249, 211, 205, 0.1)", border: "1px solid #F9D3CD", color: "#F9D3CD", fontSize: "0.9375rem" }}>
          ✓ Ticket submitted — the moderation team will review this booking shortly.
        </div>
      )}

      {/* Review form */}
      {canReview && (
        <div style={{ marginTop: "36px", border: "1px solid rgba(249, 211, 205, 0.25)", backgroundColor: "#4E050E", padding: "28px" }}>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: "1.75rem", color: "#F9D3CD", margin: 0 }}>RATE YOUR TRIP</h2>
          <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.75rem", color: n <= rating ? "#F9D3CD" : "rgba(249, 211, 205, 0.3)" }}>★</button>
            ))}
          </div>
          <textarea className="input" style={{ marginTop: "14px" }} rows={3} placeholder="How was the bike, pickup, and host owner?" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button onClick={handleReview} disabled={busy} className="btn-primary" style={{ marginTop: "14px" }}>Submit Review</button>
        </div>
      )}

      {booking.review && (
        <div style={{ marginTop: "32px", borderTop: "1px solid rgba(249, 211, 205, 0.2)", paddingTop: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <p style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.9375rem", margin: 0 }}>Your Rating:</p>
            <span style={{ color: "#F9D3CD", fontWeight: 700 }}>★ {booking.review.rating}.0</span>
          </div>
          {booking.review.comment && <p style={{ color: "#F0C4BC", fontSize: "0.9375rem", marginTop: "6px" }}>{booking.review.comment}</p>}
        </div>
      )}

      <button onClick={() => navigate(-1)} style={{ marginTop: "36px", background: "none", border: "none", fontSize: "0.875rem", fontWeight: 700, color: "#F9D3CD", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        ← Return
      </button>
    </div>
  );
}
