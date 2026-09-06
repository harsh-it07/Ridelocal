import { Router } from "express";
import { asyncHandler } from "../../utils/errors";
import { requireAuth, requireRole } from "../../middleware/auth";
import { cancelBookingSchema, createBookingSchema } from "./bookings.schema";
import { cancelBooking, createBooking, getBookingById, listMyBookings } from "./bookings.service";

export const bookingsRouter = Router();

bookingsRouter.post(
  "/",
  requireAuth,
  requireRole("CUSTOMER"),
  asyncHandler(async (req, res) => {
    const input = createBookingSchema.parse(req.body);
    const booking = await createBooking(req.user!.userId, input);
    res.status(201).json({ booking });
  })
);

bookingsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const bookings = await listMyBookings(req.user!.userId, req.user!.role);
    res.json({ bookings });
  })
);

bookingsRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const booking = await getBookingById(req.user!.userId, req.user!.role, req.params.id);
    res.json({ booking });
  })
);

bookingsRouter.post(
  "/:id/cancel",
  requireAuth,
  requireRole("CUSTOMER"),
  asyncHandler(async (req, res) => {
    const { reason } = cancelBookingSchema.parse(req.body);
    const booking = await cancelBooking(req.user!.userId, req.params.id, reason);
    res.json({ booking });
  })
);
