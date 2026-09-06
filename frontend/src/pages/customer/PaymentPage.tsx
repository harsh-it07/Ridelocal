import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import { PaymentMethod } from "../../types";

type Stage = "select" | "processing" | "success" | "failed";

const METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "UPI", label: "UPI", icon: "📱" },
  { id: "CARD", label: "Credit / Debit Card", icon: "💳" },
  { id: "NETBANKING", label: "Net Banking", icon: "🏦" },
  { id: "WALLET", label: "Wallet", icon: "👛" },
];

export function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("select");
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [providerRef, setProviderRef] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/bookings/${id}`)
      .then(({ data }) => setBooking(data.booking))
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  async function openGateway() {
    setError(null);
    setModalOpen(true);
    setStage("select");
  }

  async function payWithMethod() {
    setStage("processing");
    try {
      // 1) Real backend call — creates an actual Payment row (PROCESSING).
      const { data: order } = await api.post("/payments/mock/create", {
        bookingId: id,
        method,
      });
      setProviderRef(order.providerRef);

      // Small delay so "Payment Processing..." reads as a real gateway
      // round-trip rather than an instant flash.
      await new Promise((r) => setTimeout(r, 1400));

      // 2) Real backend call — confirms the (simulated) charge and moves
      // the booking to CONFIRMED. Nothing about success is decided client-side.
      const { data: result } = await api.post("/payments/mock/confirm", {
        providerRef: order.providerRef,
        proof: {},
      });
      setTransactionId(result.payment.transactionId);
      setStage("success");
    } catch (err) {
      setError(getErrorMessage(err));
      setStage("failed");
    }
  }

  function finish() {
    setModalOpen(false);
    navigate(`/bookings/${id}`);
  }

  if (!booking) return <div className="mx-auto max-w-lg px-4 py-10 text-ink-500">Loading...</div>;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="card p-6">
        <h1 className="font-display text-xl font-bold text-ink-900">Confirm & pay</h1>
        <p className="mt-1 text-sm text-ink-500">
          {booking.vehicle?.brand} {booking.vehicle?.model}
        </p>

        <div className="mt-4 space-y-2 rounded-xl bg-white/60 p-4 text-sm">
          <Row label="Rental amount" value={booking.rentalAmount} />
          <Row label="Platform fee" value={booking.platformFee} />
          <Row label="Refundable security deposit" value={booking.securityDeposit} />
          <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 font-bold text-ink-900">
            <span>Total payable now</span>
            <span>₹{booking.totalAmount}</span>
          </div>
        </div>

        {error && !modalOpen && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button onClick={openGateway} className="btn-primary mt-5 w-full">
          Pay ₹{booking.totalAmount}
        </button>
        <p className="mt-2 text-center text-xs text-ink-500">
          Simulated payment gateway — no real money is charged. Real backend records are still
          created for this transaction.
        </p>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6">
            {stage === "select" && (
              <>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                  RideLocal Pay (test mode)
                </p>
                <p className="mt-1 font-display text-2xl font-extrabold text-ink-900">
                  ₹{booking.totalAmount}
                </p>

                <div className="mt-5 space-y-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${
                        method === m.id
                          ? "border-brand-400 bg-brand-50"
                          : "border-neutral-200 bg-white/70 hover:bg-white"
                      }`}
                    >
                      <span className="text-lg">{m.icon}</span>
                      <span className="font-medium text-ink-900">{m.label}</span>
                      {method === m.id && <span className="ml-auto text-brand-600">●</span>}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex gap-2">
                  <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button onClick={payWithMethod} className="btn-primary flex-1">
                    Pay now
                  </button>
                </div>
              </>
            )}

            {stage === "processing" && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
                <p className="font-medium text-ink-900">Payment processing…</p>
                <p className="text-sm text-ink-500">Confirming with {method}, please wait.</p>
              </div>
            )}

            {stage === "success" && (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
                  ✓
                </span>
                <p className="font-display font-bold text-ink-900">Payment successful</p>
                <p className="text-sm text-ink-500">Your booking is now confirmed.</p>
                {transactionId && (
                  <p className="mt-1 font-mono text-xs text-ink-500">{transactionId}</p>
                )}
                <button onClick={finish} className="btn-primary mt-4 w-full">
                  View booking
                </button>
              </div>
            )}

            {stage === "failed" && (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl text-red-700">
                  ✕
                </span>
                <p className="font-display font-bold text-ink-900">Payment failed</p>
                <p className="text-sm text-ink-500">{error || "Something went wrong."}</p>
                <button onClick={() => setStage("select")} className="btn-primary mt-4 w-full">
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-ink-700">
      <span>{label}</span>
      <span>₹{value}</span>
    </div>
  );
}
