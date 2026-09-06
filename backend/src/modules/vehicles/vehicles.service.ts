import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/errors";
import { CreateVehicleInput, UpdateVehicleInput } from "./vehicles.schema";

export async function createVehicle(ownerId: string, input: CreateVehicleInput) {
  return prisma.vehicle.create({
    data: {
      ...input,
      ownerId,
      status: "DRAFT",
      verificationStatus: "UNVERIFIED",
    },
  });
}

export async function updateVehicle(
  ownerId: string,
  vehicleId: string,
  input: UpdateVehicleInput
) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new AppError("Vehicle not found", 404);
  if (vehicle.ownerId !== ownerId) throw new AppError("Not your vehicle", 403);

  // Editing core details after approval sends it back for re-review.
  const needsReReview = vehicle.status === "ACTIVE";

  return prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      ...input,
      status: needsReReview ? "PENDING_REVIEW" : vehicle.status,
    },
  });
}

export async function submitVehicleForApproval(ownerId: string, vehicleId: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new AppError("Vehicle not found", 404);
  if (vehicle.ownerId !== ownerId) throw new AppError("Not your vehicle", 403);

  return prisma.vehicle.update({
    where: { id: vehicleId },
    data: { status: "PENDING_REVIEW" },
  });
}

export async function deleteVehicle(ownerId: string, vehicleId: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new AppError("Vehicle not found", 404);
  if (vehicle.ownerId !== ownerId) throw new AppError("Not your vehicle", 403);

  await prisma.vehicle.delete({ where: { id: vehicleId } });
  return { success: true };
}

export async function getVehicleById(vehicleId: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      owner: { select: { id: true, name: true, verificationStatus: true, createdAt: true } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { customer: { select: { name: true } } },
      },
      documents: { select: { documentType: true, verificationStatus: true } },
    },
  });
  if (!vehicle) throw new AppError("Vehicle not found", 404);
  return vehicle;
}

export async function listOwnerVehicles(ownerId: string) {
  return prisma.vehicle.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
}
