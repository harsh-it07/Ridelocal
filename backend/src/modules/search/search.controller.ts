import { Router } from "express";
import { asyncHandler } from "../../utils/errors";
import { searchVehicleSchema } from "../vehicles/vehicles.schema";
import { searchVehicles } from "./search.service";

export const searchRouter = Router();

searchRouter.get(
  "/vehicles",
  asyncHandler(async (req, res) => {
    const params = searchVehicleSchema.parse(req.query);
    const results = await searchVehicles(params);
    res.json({ results, count: results.length });
  })
);
