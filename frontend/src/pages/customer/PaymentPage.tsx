import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { Loader } from "../../components/Loader";
import { PaymentMethod } from "../../types";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; desc: string }[] = [
  { id: "UPI", label: "UPI Instant Transfer", desc: "Google Pay, PhonePe, Paytm" },
  { id: "CARD", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
  { id: "NETBANKING", label: "Net Banking", desc: "HDFC, SBI, ICICI, Axis" },
  { id: "WALLET", label: "RideLocal Wallet Balance", desc: "Test environment wallet" },
];

export function PaymentPage() {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [stage, setStage] = useState<"select" | "processing" | "success" | "failed">("select");
  const [txnId, setTxnId] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/bookings/${bookingId}`)
      .then(({ data }) => setBooking(data.booking))
      .catch((err) => setError(getErrorMessage(err)));
  }, [bookingId]);

  async function executePay() {
    setStage("processing"); setError(null);
    try {
      const { data: order } = await api.post("/payments/mock/create", { bookingId, method: paymentMethod });
      await new Promise((r) => setTimeout(r, 1200));
      const { data: result } = await api.post("/payments/mock/confirm", { providerRef: order.providerRef, proof: {} });
      setTxnId(result.payment?.transactionId || "MOCK_TXN_OK");
      setStage("success");
    } catch (err) { setError(getErrorMessage(err)); setStage("failed"); }
  }

  if (error && !booking) return <div style={{ maxWidth: "520px", margin: "0 auto", padding: "56px 24px", color: "#FFAAAA", fontSize: "1.0625rem" }}>{error}</div>;
  if (!booking) return <div style={{ maxWidth: "520px", margin: "0 auto", padding: "56px 24px" }}><Loader message="Loading payment record..." size="lg" /></div>;

  return (
    <div style={{ maxWidth: "520px", margin: "0 auto", padding: "56px 24px" }}>
      {stage === "select" && (
        <>
          <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0C4BC", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            ESCROW PAYMENT GATEWAY
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: "3.5rem", color: "#F9D3CD", margin: "4px 0 0", letterSpacing: "0.01em" }}>
            ₹{booking.totalAmount}
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#FFFFFF", marginTop: "4px" }}>
            {booking.vehicle?.brand} {booking.vehicle?.model} · {new Date(booking.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {new Date(booking.endTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>

          <div style={{ marginTop: "36px" }}>
            <label className="label">Select Payment Method</label>
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
                  backgroundColor: paymentMethod === m.id ? "rgba(249, 211, 205, 0.12)" : "rgba(0, 0, 0, 0.2)",
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

          {error && <p style={{ fontSize: "0.875rem", color: "#FFAAAA", marginTop: "14px" }}>{error}</p>}

          <button
            type="button"
            onClick={executePay}
            className="btn-primary"
            style={{ width: "100%", marginTop: "28px", padding: "16px", fontSize: "0.9375rem" }}
          >
            Authorize Payment ₹{booking.totalAmount} →
          </button>
        </>
      )}

      {stage === "processing" && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div className="loader loader-md" style={{ margin: "0 auto" }} />
          <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2rem", color: "#F9D3CD", marginTop: "24px", letterSpacing: "0.02em" }}>PROCESSING ESCROW</p>
          <p style={{ fontSize: "0.9375rem", color: "#F0C4BC", marginTop: "4px" }}>Connecting to {paymentMethod} secure gateway...</p>
        </div>
      )}

      {stage === "success" && (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <p style={{ fontFamily: "'Bebas Neue'", fontSize: "3.5rem", color: "#F9D3CD", margin: 0 }}>✓ PAYMENT COMPLETE</p>
          <p style={{ fontSize: "0.9375rem", color: "#FFFFFF", marginTop: "8px", fontWeight: 600 }}>Escrow transaction ref: {txnId}</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "32px" }}>
            <button onClick={() => navigate(`/bookings/${bookingId}`)} className="btn-primary" style={{ flex: 1, padding: "14px", fontSize: "0.9375rem" }}>
              View Booking
            </button>
            <button onClick={() => navigate("/bookings")} className="btn-secondary" style={{ flex: 1, padding: "14px", fontSize: "0.9375rem" }}>
              My Rides
            </button>
          </div>
        </div>
      )}

      {stage === "failed" && (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <p style={{ fontFamily: "'Bebas Neue'", fontSize: "2.5rem", color: "#FFAAAA", margin: 0 }}>✕ TRANSACTION FAILED</p>
          <p style={{ fontSize: "0.875rem", color: "#FFAAAA", marginTop: "6px" }}>{error}</p>
          <button onClick={() => { setStage("select"); setError(null); }} className="btn-primary" style={{ width: "100%", marginTop: "24px", padding: "14px", fontSize: "0.9375rem" }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
