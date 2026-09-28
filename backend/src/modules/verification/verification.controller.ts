import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/errors";
import { requireAuth } from "../../middleware/auth";

export const verificationRouter = Router();

const submitSchema = z.preprocess((val: any) => {
  if (!val || typeof val !== "object") return val;
  const copy = { ...val };

  if (!copy.verificationType) {
    copy.verificationType = copy.vehicleId ? "VEHICLE_DOCUMENTS" : "USER_IDENTITY";
  }

  // Support flat submission or legacy fields
  if (!Array.isArray(copy.documents) || copy.documents.length === 0) {
    const docs: { documentType: string; secureFileReference: string }[] = [];
    if (copy.drivingLicence || copy.licenceFront || copy.frontFileRef) {
      docs.push({
        documentType: "DRIVING_LICENSE",
        secureFileReference: copy.drivingLicence || copy.licenceFront || copy.frontFileRef,
      });
    }
    if (copy.aadharCard || copy.licenceBack || copy.backFileRef) {
      docs.push({
        documentType: copy.aadharCard ? "GOVT_ID" : "DRIVING_LICENSE",
        secureFileReference: copy.aadharCard || copy.licenceBack || copy.backFileRef,
      });
    }
    if (copy.secureFileReference && copy.documentType) {
      const docType = copy.documentType === "DRIVING_LICENCE" ? "DRIVING_LICENSE" : copy.documentType;
      docs.push({
        documentType: docType,
        secureFileReference: copy.secureFileReference,
      });
    }
    if (docs.length > 0) {
      copy.documents = docs;
    }
  } else {
    copy.documents = copy.documents.map((d: any) => ({
      ...d,
      documentType: d.documentType === "DRIVING_LICENCE" ? "DRIVING_LICENSE" : d.documentType,
    }));
  }

  return copy;
}, z.object({
  verificationType: z.enum(["USER_IDENTITY", "OWNER_KYC", "VEHICLE_DOCUMENTS"]).default("USER_IDENTITY"),
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
}));

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
