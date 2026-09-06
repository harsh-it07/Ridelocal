import { Router } from "express";
import { asyncHandler } from "../../utils/errors";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createVehicleSchema, updateVehicleSchema } from "./vehicles.schema";
import {
  createVehicle,
  deleteVehicle,
  getVehicleById,
  listOwnerVehicles,
  submitVehicleForApproval,
  updateVehicle,
} from "./vehicles.service";

export const vehiclesRouter = Router();

vehiclesRouter.post(
  "/",
  requireAuth,
  requireRole("OWNER"),
  asyncHandler(async (req, res) => {
    const input = createVehicleSchema.parse(req.body);
    const vehicle = await createVehicle(req.user!.userId, input);
    res.status(201).json({ vehicle });
  })
);

vehiclesRouter.get(
  "/mine",
  requireAuth,
  requireRole("OWNER"),
  asyncHandler(async (req, res) => {
    const vehicles = await listOwnerVehicles(req.user!.userId);
    res.json({ vehicles });
  })
);

vehiclesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const vehicle = await getVehicleById(req.params.id);
    res.json({ vehicle });
  })
);

vehiclesRouter.patch(
  "/:id",
  requireAuth,
  requireRole("OWNER"),
  asyncHandler(async (req, res) => {
    const input = updateVehicleSchema.parse(req.body);
    const vehicle = await updateVehicle(req.user!.userId, req.params.id, input);
    res.json({ vehicle });
  })
);

vehiclesRouter.post(
  "/:id/submit",
  requireAuth,
  requireRole("OWNER"),
  asyncHandler(async (req, res) => {
    const vehicle = await submitVehicleForApproval(req.user!.userId, req.params.id);
    res.json({ vehicle });
  })
);

vehiclesRouter.delete(
  "/:id",
  requireAuth,
  requireRole("OWNER"),
  asyncHandler(async (req, res) => {
    const result = await deleteVehicle(req.user!.userId, req.params.id);
    res.json(result);
  })
);
