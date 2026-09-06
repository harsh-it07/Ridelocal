import { Router } from "express";
import { asyncHandler } from "../../utils/errors";
import { requireAuth } from "../../middleware/auth";
import { loginSchema, registerSchema } from "./auth.schema";
import { getCurrentUser, loginUser, registerUser } from "./auth.service";

export const authRouter = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const { user, token } = await registerUser(input);
    res.cookie("token", token, COOKIE_OPTS);
    res.status(201).json({ user, token });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const { user, token } = await loginUser(input);
    res.cookie("token", token, COOKIE_OPTS);
    res.json({ user, token });
  })
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req.user!.userId);
    res.json({ user });
  })
);
