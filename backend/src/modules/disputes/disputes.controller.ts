import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError, asyncHandler } from "../../utils/errors";
import { requireAuth } from "../../middleware/auth";

export const disputesRouter = Router();

const createDisputeSchema = z.object({
  bookingId: z.string().uuid(),
  subject: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
});

// Either party on a booking (the customer, or the vehicle's owner) can
// raise a dispute. Anyone else gets a 403.
disputesRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createDisputeSchema.parse(req.body);
    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      include: { vehicle: true },
    });
    if (!booking) throw new AppError("Booking not found", 404);

    const isCustomer = booking.customerId === req.user!.userId;
    const isOwner = booking.vehicle.ownerId === req.user!.userId;
    if (!isCustomer && !isOwner) {
      throw new AppError("You are not part of this booking", 403);
    }

    const dispute = await prisma.dispute.create({
      data: {
        bookingId: booking.id,
        raisedById: req.user!.userId,
        subject: input.subject,
        description: input.description,
      },
    });

    res.status(201).json({ dispute });
  })
);

// A user's own disputes (either raised by them or on a booking they're
// party to), so both tourists and owners can track status.
disputesRouter.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const disputes = await prisma.dispute.findMany({
      where: {
        OR: [
          { raisedById: req.user!.userId },
          { booking: { customerId: req.user!.userId } },
          { booking: { vehicle: { ownerId: req.user!.userId } } },
        ],
      },
      include: { booking: { include: { vehicle: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ disputes });
  })
);
