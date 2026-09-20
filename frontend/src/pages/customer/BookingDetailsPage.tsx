import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";

export function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeSubject, setDisputeSubject] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [disputeSent, setDisputeSent] = useState(false);

  function load() {
    api
      .get(`/bookings/${id}`)
      .then(({ data }) => setBooking(data.booking))
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(load, [id]);

  async function handleCancel() {
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/cancel`, { reason: "Customer requested cancellation" });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRaiseDispute() {
    setBusy(true);
    setError(null);
    try {
      await api.post("/disputes", {
        bookingId: id,
        subject: disputeSubject,
        description: disputeDesc,
      });
      setDisputeSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleReview() {
    setBusy(true);
    try {
      await api.post("/reviews", { bookingId: id, rating, comment });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="mx-auto max-w-2xl px-4 py-10 text-red-600">{error}</div>;
  if (!booking) return <div className="mx-auto max-w-2xl px-4 py-10 text-ink-500">Loading...</div>;

  const canCancel = user?.role === "CUSTOMER" && ["PENDING_PAYMENT", "CONFIRMED"].includes(booking.status);
  const canPay = user?.role === "CUSTOMER" && booking.status === "PENDING_PAYMENT";
  const canReview = user?.role === "CUSTOMER" && booking.status === "COMPLETED" && !booking.review;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-ink-900">
              {booking.vehicle?.brand} {booking.vehicle?.model}
            </h1>
            <p className="text-sm text-ink-500">
              {new Date(booking.startTime).toLocaleString()} → {new Date(booking.endTime).toLocaleString()}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-ink-500">Pickup</p>
            <p className="text-ink-900">{booking.pickupLocation}</p>
          </div>
          <div>
            <p className="text-ink-500">Return</p>
            <p className="text-ink-900">{booking.returnLocation}</p>
          </div>
          <div>
            <p className="text-ink-500">Total amount</p>
            <p className="font-semibold text-ink-900">₹{booking.totalAmount}</p>
          </div>
          <div>
            <p className="text-ink-500">Payments</p>
            <p className="text-ink-900">{booking.payments?.length || 0} record(s)</p>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          {canPay && (
            <Link to={`/bookings/${id}/pay`} className="btn-primary">
              Pay now
            </Link>
          )}
          {canCancel && (
            <button onClick={handleCancel} disabled={busy} className="btn-danger">
              Cancel booking
            </button>
          )}
          {["CONFIRMED", "ACTIVE", "COMPLETED"].includes(booking.status) && !disputeOpen && (
            <button onClick={() => setDisputeOpen(true)} className="btn-secondary">
              Report an issue
            </button>
          )}
        </div>

        {disputeOpen && !disputeSent && (
          <div className="mt-5 border-t border-neutral-200 pt-5">
            <h3 className="font-display font-semibold text-ink-900">Report an issue</h3>
            <p className="mt-1 text-sm text-ink-500">
              This opens a ticket our team reviews — e.g. the bike didn't match the listing.
            </p>
            <input
              className="input mt-3"
              placeholder="Short subject"
              value={disputeSubject}
              onChange={(e) => setDisputeSubject(e.target.value)}
            />
            <textarea
              className="input mt-2"
              rows={3}
              placeholder="What happened?"
              value={disputeDesc}
              onChange={(e) => setDisputeDesc(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <button onClick={() => setDisputeOpen(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleRaiseDispute}
                disabled={busy || !disputeSubject || disputeDesc.length < 10}
                className="btn-primary flex-1"
              >
                Submit ticket
              </button>
            </div>
          </div>
        )}

        {disputeSent && (
          <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-800">
            Ticket submitted — our team will follow up on this booking.
          </div>
        )}
      </div>

      {canReview && (
        <div className="card mt-5 p-6">
          <h2 className="font-display font-bold text-ink-900">Rate your rental</h2>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform duration-100 hover:scale-110 focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 transition-colors duration-150 ${
                    n <= (hoverRating || rating) ? "text-brand-600" : "text-neutral-200"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
          <textarea
            className="input mt-3"
            rows={3}
            placeholder="How was the vehicle and owner?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button onClick={handleReview} disabled={busy} className="btn-primary mt-3">
            Submit review
          </button>
        </div>
      )}

      {booking.review && (
        <div className="card mt-5 p-6 text-sm">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-ink-900">You rated this rental</p>
            <span className="text-brand-600 font-bold">★ {booking.review.rating}</span>
          </div>
          {booking.review.comment && <p className="mt-1 text-ink-500">{booking.review.comment}</p>}
        </div>
      )}

      <button onClick={() => navigate(-1)} className="mt-5 text-sm text-brand-600 font-medium">
        ← Back
      </button>
    </div>
  );
}
