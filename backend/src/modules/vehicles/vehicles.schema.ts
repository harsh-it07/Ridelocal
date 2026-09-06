import { z } from "zod";

export const createVehicleSchema = z.object({
  brand: z.string().min(1).max(60),
  model: z.string().min(1).max(60),
  vehicleType: z.enum(["SCOOTER", "MOTORCYCLE", "BICYCLE", "EBIKE"]),
  registrationReference: z.string().min(1).max(60),
  pricePerDay: z.number().positive(),
  securityDeposit: z.number().nonnegative(),
  city: z.string().min(1).max(80),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().max(2000).optional(),
  photoUrls: z.array(z.string().url()).max(10).default([]),
});
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;

export const updateVehicleSchema = createVehicleSchema.partial();
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

export const searchVehicleSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(200).default(10),
  city: z.string().optional(),
  vehicleType: z.enum(["SCOOTER", "MOTORCYCLE", "BICYCLE", "EBIKE"]).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  sortBy: z.enum(["distance", "price", "rating", "match"]).default("match"),
});
export type SearchVehicleInput = z.infer<typeof searchVehicleSchema>;
