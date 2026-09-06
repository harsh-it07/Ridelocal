import crypto from "crypto";
import {
  ConfirmChargeInput,
  ConfirmChargeResult,
  CreateChargeInput,
  CreateChargeResult,
  PaymentProvider,
} from "./PaymentProvider";

// Simulates a payment gateway end-to-end so the rest of the app (booking
// lifecycle, admin monitoring, receipts) works exactly like it would with a
// real provider — the only difference is no money moves and no external
// network call happens.
export class MockPaymentProvider implements PaymentProvider {
  name = "MOCK" as const;

  async createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
    const providerRef = `mock_order_${crypto.randomUUID()}`;
    return {
      providerRef,
      clientPayload: {
        provider: "MOCK",
        providerRef,
        amount: input.amount,
        currency: input.currency,
        availableMethods: ["UPI", "CARD", "NETBANKING", "WALLET"],
      },
    };
  }

  async confirmCharge(input: ConfirmChargeInput): Promise<ConfirmChargeResult> {
    // A real gateway would verify a cryptographic signature here. The mock
    // provider "fails" only if the frontend explicitly simulated a failure
    // (proof.simulateFailure === true) so the failure-state UI is testable.
    if (input.proof?.simulateFailure) {
      return {
        success: false,
        transactionId: "",
        failureReason: "Simulated payment failure",
      };
    }

    const transactionId = `MOCK_TXN_${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    return { success: true, transactionId };
  }
}
