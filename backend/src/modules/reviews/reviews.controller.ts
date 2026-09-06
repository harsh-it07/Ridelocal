import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError, asyncHandler } from "../../utils/errors";
import { requireAuth, requireRole } from "../../middleware/auth";

export const reviewsRouter = Router();

const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

reviewsRouter.post(
  "/",
  requireAuth,
  requireRole("CUSTOMER"),
  asyncHandler(async (req, res) => {
    const input = createReviewSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
    if (!booking) throw new AppError("Booking not found", 404);
    if (booking.customerId !== req.user!.userId) throw new AppError("Not your booking", 403);
    if (booking.status !== "COMPLETED") {
      throw new AppError("You can only review a completed rental", 400);
    }

    const review = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.review.create({
        data: {
          bookingId: booking.id,
          customerId: req.user!.userId,
          vehicleId: booking.vehicleId,
          rating: input.rating,
          comment: input.comment,
        },
      });

      const agg = await tx.review.aggregate({
        where: { vehicleId: booking.vehicleId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.vehicle.update({
        where: { id: booking.vehicleId },
        data: {
          ratingAvg: agg._avg.rating ?? 0,
          ratingCount: agg._count.rating,
        },
      });

      return created;
    });

    res.status(201).json({ review });
  })
);

reviewsRouter.get(
  "/vehicle/:vehicleId",
  asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
      where: { vehicleId: req.params.vehicleId },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ reviews });
  })
);
