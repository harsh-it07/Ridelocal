import { Router } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/errors";
import { AppError } from "../../utils/errors";
import { requireAuth, requireRole } from "../../middleware/auth";
import { addAvailabilitySchema } from "./availability.schema";

export const availabilityRouter = Router({ mergeParams: true });

availabilityRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const slots = await prisma.availability.findMany({
      where: { vehicleId: req.params.id },
      orderBy: { startTime: "asc" },
    });
    res.json({ slots });
  })
);

availabilityRouter.post(
  "/",
  requireAuth,
  requireRole("OWNER"),
  asyncHandler(async (req, res) => {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
    if (!vehicle) throw new AppError("Vehicle not found", 404);
    if (vehicle.ownerId !== req.user!.userId) throw new AppError("Not your vehicle", 403);

    const input = addAvailabilitySchema.parse(req.body);
    const slot = await prisma.availability.create({
      data: { vehicleId: vehicle.id, ...input },
    });
    res.status(201).json({ slot });
  })
);

availabilityRouter.delete(
  "/:slotId",
  requireAuth,
  requireRole("OWNER"),
  asyncHandler(async (req, res) => {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
    if (!vehicle) throw new AppError("Vehicle not found", 404);
    if (vehicle.ownerId !== req.user!.userId) throw new AppError("Not your vehicle", 403);

    await prisma.availability.delete({ where: { id: req.params.slotId } });
    res.json({ success: true });
  })
);
