import path from "path";
import fs from "fs";
import { Router } from "express";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError, asyncHandler } from "../../utils/errors";
import { requireAuth } from "../../middleware/auth";
import { CATEGORIES, upload } from "../../middleware/upload";

export const uploadsRouter = Router();

// Accepts one file for a given category and stores it locally (never in a
// publicly-served static folder). Returns a fileRef the client then
// attaches to a verification/vehicle submission -- the raw upload alone
// doesn't make a document "official" until it's linked to a DB record.
uploadsRouter.post(
  "/:category",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError("No file uploaded", 400);
    const category = req.params.category;
    const fileRef = `local://${category}/${req.file.filename}`;
    res.status(201).json({
      fileRef,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      sizeBytes: req.file.size,
    });
  })
);

// Serves a previously uploaded file, but only to: the person who submitted
// it (via a matching UserDocument/VehicleDocument row), the vehicle's
// owner, or an admin. This is what keeps driving licences and RC
// certificates from being publicly reachable.
uploadsRouter.get(
  "/file/:category/:filename",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { category, filename } = req.params;
    if (!CATEGORIES.includes(category as any)) throw new AppError("Not found", 404);

    const fileRef = `local://${category}/${filename}`;
    const isAdmin = req.user!.role === "ADMIN";

    if (!isAdmin) {
      const [userDoc, vehicleDoc] = await Promise.all([
        prisma.userDocument.findFirst({ where: { secureFileReference: fileRef } }),
        prisma.vehicleDocument.findFirst({
          where: { secureFileReference: fileRef },
          include: { vehicle: true },
        }),
      ]);

      const ownsUserDoc = userDoc?.userId === req.user!.userId;
      const ownsVehicleDoc = vehicleDoc?.vehicle.ownerId === req.user!.userId;

      if (!ownsUserDoc && !ownsVehicleDoc) {
        throw new AppError("You do not have access to this file", 403);
      }
    }

    const filePath = path.join(env.uploadsDir, category, filename);
    if (!fs.existsSync(filePath)) throw new AppError("File not found", 404);
    res.sendFile(path.resolve(filePath));
  })
);
