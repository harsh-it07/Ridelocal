import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

// Files land in uploads/<category>/<random>-<ext>, never under a
// publicly served static folder. Access is controlled by
// uploads.controller.ts, not by the filesystem being reachable directly.
const CATEGORIES = ["driving-licences", "rc-certificates", "bike-images", "other-documents"] as const;
export type UploadCategory = (typeof CATEGORIES)[number];

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "application/pdf"]);

for (const category of CATEGORIES) {
  const dir = path.join(env.uploadsDir, category);
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const category = req.params.category as UploadCategory;
    if (!CATEGORIES.includes(category)) {
      return cb(new AppError("Invalid upload category", 400), "");
    }
    cb(null, path.join(env.uploadsDir, category));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, safeName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new AppError("Only JPG, PNG, and PDF files are allowed", 400) as unknown as null, false);
      return;
    }
    cb(null, true);
  },
});

export { CATEGORIES };

