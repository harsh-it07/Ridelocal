import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/errors";
import { signToken } from "../../utils/jwt";
import { LoginInput, RegisterInput } from "./auth.schema";

const PUBLIC_USER_FIELDS = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  verificationStatus: true,
  isSuspended: true,
  createdAt: true,
} as const;

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role,
    },
    select: PUBLIC_USER_FIELDS,
  });

  const token = signToken({ userId: user.id, role: user.role });
  return { user, token };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }
  if (user.isSuspended) {
    throw new AppError("This account has been suspended. Contact support.", 403);
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ userId: user.id, role: user.role });
  const { passwordHash: _omit, ...publicUser } = user;
  return { user: publicUser, token };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_FIELDS,
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
}
