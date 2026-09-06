import { z } from "zod";

export const addAvailabilitySchema = z
  .object({
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    status: z.enum(["OPEN", "BLOCKED"]).default("OPEN"),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });
export type AddAvailabilityInput = z.infer<typeof addAvailabilitySchema>;
