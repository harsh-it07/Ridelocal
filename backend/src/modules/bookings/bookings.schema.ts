import { z } from "zod";

export const createBookingSchema = z
  .object({
    vehicleId: z.string().uuid(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    pickupLocation: z.string().min(1).max(200),
    returnLocation: z.string().min(1).max(200),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  })
  .refine((d) => d.startTime.getTime() > Date.now() - 60_000, {
    message: "startTime must be in the future",
    path: ["startTime"],
  });
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});
