import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "../../../config/env";
import {
  ConfirmChargeInput,
  ConfirmChargeResult,
  CreateChargeInput,
  CreateChargeResult,
  PaymentProvider,
} from "./PaymentProvider";

// Not used by default in v1.1 (Razorpay checkout doesn't work reliably on
// localhost without a tunnel/HTTPS). Kept here, fully implementing the same
// PaymentProvider interface as MockPaymentProvider, so switching providers
// in the future is a one-line change in payments.service.ts — no other
// file needs to know which gateway is active.
export class RazorpayProvider implements PaymentProvider {
  name = "RAZORPAY" as const;
  private client: Razorpay;

  constructor() {
    if (!env.razorpayKeyId || !env.razorpayKeySecret) {
      throw new Error("RazorpayProvider requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET");
    }
    this.client = new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret });
  }

  async createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
    const order = await this.client.orders.create({
      amount: Math.round(input.amount * 100),
      currency: input.currency,
      receipt: input.bookingId,
    });
    return {
      providerRef: order.id,
      clientPayload: { provider: "RAZORPAY", orderId: order.id, keyId: env.razorpayKeyId },
    };
  }

  async confirmCharge(input: ConfirmChargeInput): Promise<ConfirmChargeResult> {
    const { razorpay_payment_id, razorpay_signature } = input.proof as {
      razorpay_payment_id: string;
      razorpay_signature: string;
    };
    const expected = crypto
      .createHmac("sha256", env.razorpayKeySecret)
      .update(`${input.providerRef}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return { success: false, transactionId: "", failureReason: "Signature mismatch" };
    }
    return { success: true, transactionId: razorpay_payment_id };
  }
}
