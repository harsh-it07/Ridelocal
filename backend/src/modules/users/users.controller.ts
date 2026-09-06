import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/errors";
import { requireAuth } from "../../middleware/auth";

export const usersRouter = Router();

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().min(7).max(20).optional(),
});

usersRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        verificationStatus: true,
        createdAt: true,
      },
    });
    res.json({ user });
  })
);

usersRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = updateSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: input,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    res.json({ user });
  })
);
