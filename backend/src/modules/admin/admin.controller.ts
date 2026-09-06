import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError, asyncHandler } from "../../utils/errors";
import { requireAuth, requireRole } from "../../middleware/auth";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("ADMIN"));

// ---- Verification queue ----

adminRouter.get(
  "/verifications",
  asyncHandler(async (req, res) => {
    const status = (req.query.status as string) || "UNDER_REVIEW";
    const records = await prisma.verificationRecord.findMany({
      where: { status: status as any },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        vehicle: { select: { id: true, brand: true, model: true, ownerId: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Attach the actual submitted documents so the admin can open them
    // (via the access-controlled /api/uploads/file/... route) instead of
    // approving/rejecting blind.
    const withDocs = await Promise.all(
      records.map(async (r: (typeof records)[number]) => {
        const documents = r.userId
          ? await prisma.userDocument.findMany({ where: { userId: r.userId } })
          : r.vehicleId
          ? await prisma.vehicleDocument.findMany({ where: { vehicleId: r.vehicleId } })
          : [];
        return { ...r, documents };
      })
    );

    res.json({ records: withDocs });
  })
);

const decisionSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  notes: z.string().max(1000).optional(),
});

adminRouter.patch(
  "/verifications/:id",
  asyncHandler(async (req, res) => {
    const { status, notes } = decisionSchema.parse(req.body);
    const record = await prisma.verificationRecord.findUnique({ where: { id: req.params.id } });
    if (!record) throw new AppError("Verification record not found", 404);

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const rec = await tx.verificationRecord.update({
        where: { id: req.params.id },
        data: { status, notes, reviewedById: req.user!.userId, reviewedAt: new Date() },
      });

      if (record.userId) {
        await tx.user.update({ where: { id: record.userId }, data: { verificationStatus: status } });
      }
      if (record.vehicleId) {
        await tx.vehicle.update({
          where: { id: record.vehicleId },
          data: { verificationStatus: status },
        });
      }
      return rec;
    });

    res.json({ record: updated });
  })
);

// ---- Vehicle approval ----

const vehicleApprovalSchema = z.object({
  approve: z.boolean(),
  notes: z.string().max(1000).optional(),
});

adminRouter.get(
  "/vehicles/pending",
  asyncHandler(async (_req, res) => {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: "PENDING_REVIEW" },
      include: {
        owner: { select: { name: true, email: true, verificationStatus: true } },
        documents: true,
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({ vehicles });
  })
);

adminRouter.patch(
  "/vehicles/:id/approve",
  asyncHandler(async (req, res) => {
    const { approve, notes } = vehicleApprovalSchema.parse(req.body);
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: { status: approve ? "ACTIVE" : "REJECTED" },
    });

    await prisma.verificationRecord.create({
      data: {
        verificationType: "VEHICLE_DOCUMENTS",
        vehicleId: vehicle.id,
        status: approve ? "VERIFIED" : "REJECTED",
        reviewedById: req.user!.userId,
        reviewedAt: new Date(),
        notes,
      },
    });

    res.json({ vehicle });
  })
);

// ---- User management ----

adminRouter.get(
  "/users",
  asyncHandler(async (req, res) => {
    const role = req.query.role as string | undefined;
    const users = await prisma.user.findMany({
      where: role ? { role: role as any } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verificationStatus: true,
        isSuspended: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  })
);

const statusSchema = z.object({ isSuspended: z.boolean() });

adminRouter.patch(
  "/users/:id/status",
  asyncHandler(async (req, res) => {
    const { isSuspended } = statusSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isSuspended },
      select: { id: true, name: true, email: true, isSuspended: true },
    });
    res.json({ user });
  })
);

// ---- Booking / payment monitoring ----

adminRouter.get(
  "/bookings",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const bookings = await prisma.booking.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        vehicle: { select: { brand: true, model: true } },
        customer: { select: { name: true, email: true } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json({ bookings });
  })
);

adminRouter.get(
  "/payments",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const payments = await prisma.payment.findMany({
      where: status ? { paymentStatus: status as any } : undefined,
      include: { booking: { select: { id: true, status: true, customerId: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json({ payments });
  })
);

// ---- Disputes / refunds ----

const refundDecisionSchema = z.object({
  approve: z.boolean(),
});

adminRouter.patch(
  "/bookings/:id/refund",
  asyncHandler(async (req, res) => {
    const { approve } = refundDecisionSchema.parse(req.body);
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) throw new AppError("Booking not found", 404);
    if (booking.status !== "REFUND_PENDING") {
      throw new AppError("Booking is not awaiting a refund decision", 400);
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: approve ? "REFUNDED" : "DISPUTED" },
    });
    res.json({ booking: updated });
  })
);

// ---- Dispute tickets (separate from the refund flow above: these are
// free-form issues either party raised, e.g. "bike wasn't as described") ----

adminRouter.get(
  "/disputes",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const disputes = await prisma.dispute.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        booking: { include: { vehicle: true, customer: { select: { name: true, email: true } } } },
        raisedBy: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ disputes });
  })
);

const disputeDecisionSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "RESOLVED", "CLOSED"]),
  resolutionNote: z.string().max(1000).optional(),
});

adminRouter.patch(
  "/disputes/:id",
  asyncHandler(async (req, res) => {
    const { status, resolutionNote } = disputeDecisionSchema.parse(req.body);
    const dispute = await prisma.dispute.update({
      where: { id: req.params.id },
      data: {
        status,
        resolutionNote,
        resolvedById: ["RESOLVED", "CLOSED"].includes(status) ? req.user!.userId : undefined,
        resolvedAt: ["RESOLVED", "CLOSED"].includes(status) ? new Date() : undefined,
      },
    });
    res.json({ dispute });
  })
);
