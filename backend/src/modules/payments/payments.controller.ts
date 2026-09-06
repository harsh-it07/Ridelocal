import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/errors";
import { requireAuth, requireRole } from "../../middleware/auth";
import { confirmPayment, createPaymentOrder } from "./payments.service";

export const paymentsRouter = Router();

const createOrderSchema = z.object({
  bookingId: z.string().uuid(),
  method: z.enum(["UPI", "CARD", "NETBANKING", "WALLET"]).optional(),
});

const confirmSchema = z.object({
  providerRef: z.string().min(1),
  // Free-form proof payload -- shape depends on the active provider. For
  // the mock provider this is just `{}` (success) or `{ simulateFailure: true }`.
  proof: z.record(z.unknown()).default({}),
});

// Starts a mock payment: creates a Payment row in PROCESSING and returns
// whatever the active provider needs the frontend to render (for MOCK,
// just the reference + available methods).
paymentsRouter.post(
  "/mock/create",
  requireAuth,
  requireRole("CUSTOMER"),
  asyncHandler(async (req, res) => {
    const { bookingId, method } = createOrderSchema.parse(req.body);
    const order = await createPaymentOrder(req.user!.userId, bookingId, method);
    res.status(201).json(order);
  })
);

// Confirms the simulated payment and moves the booking to CONFIRMED.
paymentsRouter.post(
  "/mock/confirm",
  requireAuth,
  requireRole("CUSTOMER"),
  asyncHandler(async (req, res) => {
    const { providerRef, proof } = confirmSchema.parse(req.body);
    const result = await confirmPayment(req.user!.userId, providerRef, proof);
    res.json(result);
  })
);
