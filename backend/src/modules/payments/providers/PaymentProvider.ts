// A payment provider only needs to know how to start a charge and confirm
// one. Everything else (booking status transitions, DB writes) lives in
// payments.service.ts and never talks to a specific gateway directly.
//
//   PaymentService
//   ├── MockPaymentProvider   (active in v1.1)
//   └── RazorpayProvider      (future — implement this interface, then
//                              swap PROVIDER in payments.service.ts)

export interface CreateChargeInput {
  bookingId: string;
  amount: number; // rupees, not paise — providers convert internally if needed
  currency: string;
  method?: string; // UPI | CARD | NETBANKING | WALLET
}

export interface CreateChargeResult {
  providerRef: string; // order id / charge id the provider gave us
  clientPayload: Record<string, unknown>; // whatever the frontend needs to render checkout
}

export interface ConfirmChargeInput {
  providerRef: string;
  // Provider-specific proof of payment. For Razorpay this would be the
  // signature triple; for the mock provider it's just a simulated txn id.
  proof: Record<string, unknown>;
}

export interface ConfirmChargeResult {
  success: boolean;
  transactionId: string;
  failureReason?: string;
}

export interface PaymentProvider {
  name: "MOCK" | "RAZORPAY";
  createCharge(input: CreateChargeInput): Promise<CreateChargeResult>;
  confirmCharge(input: ConfirmChargeInput): Promise<ConfirmChargeResult>;
}
