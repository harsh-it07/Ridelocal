import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT || "8"),
  uploadsDir: process.env.UPLOADS_DIR || "./uploads",
  maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || "8", 10),
  get razorpayMockMode() {
    return !this.razorpayKeyId || !this.razorpayKeySecret;
  },
};
