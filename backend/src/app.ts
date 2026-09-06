import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.controller";
import { usersRouter } from "./modules/users/users.controller";
import { vehiclesRouter } from "./modules/vehicles/vehicles.controller";
import { availabilityRouter } from "./modules/availability/availability.controller";
import { searchRouter } from "./modules/search/search.controller";
import { bookingsRouter } from "./modules/bookings/bookings.controller";
import { paymentsRouter } from "./modules/payments/payments.controller";
import { reviewsRouter } from "./modules/reviews/reviews.controller";
import { verificationRouter } from "./modules/verification/verification.controller";
import { adminRouter } from "./modules/admin/admin.controller";
import { disputesRouter } from "./modules/disputes/disputes.controller";
import { uploadsRouter } from "./modules/uploads/uploads.controller";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
  app.use(cookieParser());

  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/vehicles", vehiclesRouter);
  app.use("/api/vehicles/:id/availability", availabilityRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/verification", verificationRouter);
  app.use("/api/disputes", disputesRouter);
  app.use("/api/uploads", uploadsRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
