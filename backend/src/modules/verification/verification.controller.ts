import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/errors";
import { requireAuth } from "../../middleware/auth";

export const verificationRouter = Router();

const submitSchema = z.object({
  verificationType: z.enum(["USER_IDENTITY", "OWNER_KYC", "VEHICLE_DOCUMENTS"]),
  vehicleId: z.string().uuid().optional(),
  documents: z
    .array(
      z.object({
        documentType: z.enum([
          "GOVT_ID",
          "DRIVING_LICENSE",
          "VEHICLE_RC",
          "VEHICLE_INSURANCE",
          "VEHICLE_PHOTO",
          "OTHER",
        ]),
        secureFileReference: z.string().min(1),
      })
    )
    .min(1),
});

// Submits identity/KYC/vehicle documents and creates a PENDING verification
// record for admin review. Storage upload itself happens client-side to
// Supabase Storage; this endpoint just records the resulting file references.
verificationRouter.post(
  "/submit",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = submitSchema.parse(req.body);
    const userId = req.user!.userId;

    const record = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (input.verificationType === "VEHICLE_DOCUMENTS" && input.vehicleId) {
        await tx.vehicleDocument.createMany({
          data: input.documents.map((d) => ({
            vehicleId: input.vehicleId!,
            documentType: d.documentType,
            secureFileReference: d.secureFileReference,
          })),
        });
        await tx.vehicle.update({
          where: { id: input.vehicleId },
          data: { verificationStatus: "UNDER_REVIEW" },
        });
      } else {
        await tx.userDocument.createMany({
          data: input.documents.map((d) => ({
            userId,
            documentType: d.documentType,
            secureFileReference: d.secureFileReference,
          })),
        });
        await tx.user.update({
          where: { id: userId },
          data: { verificationStatus: "UNDER_REVIEW" },
        });
      }

      return tx.verificationRecord.create({
        data: {
          verificationType: input.verificationType,
          userId: input.verificationType === "VEHICLE_DOCUMENTS" ? undefined : userId,
          vehicleId: input.verificationType === "VEHICLE_DOCUMENTS" ? input.vehicleId : undefined,
          status: "UNDER_REVIEW",
        },
      });
    });

    res.status(201).json({ record });
  })
);

verificationRouter.get(
  "/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const records = await prisma.verificationRecord.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ records });
  })
);
