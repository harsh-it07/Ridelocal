import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/errors";
import { calculatePrice } from "../../utils/pricing";
import { CreateBookingInput } from "./bookings.schema";

// Creates a booking in PENDING_PAYMENT state. This is the most important
// module in the system: it is the last line of defense against double
// booking and price tampering. Nothing here trusts the frontend.
export async function createBooking(customerId: string, input: CreateBookingInput) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
  if (!vehicle) throw new AppError("Vehicle not found", 404);
  if (vehicle.status !== "ACTIVE") {
    throw new AppError("This vehicle is not currently bookable", 400);
  }
  if (vehicle.verificationStatus !== "VERIFIED") {
    throw new AppError("This vehicle has not been verified yet", 400);
  }
  if (vehicle.ownerId === customerId) {
    throw new AppError("You cannot book your own vehicle", 400);
  }

  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  if (!customer) throw new AppError("Customer not found", 404);
  if (customer.isSuspended) throw new AppError("Your account is suspended", 403);
  if (customer.verificationStatus !== "VERIFIED") {
    throw new AppError(
      "Please upload and verify your driving licence before booking a rental.",
      403
    );
  }

  // Conflict check: any CONFIRMED/ACTIVE/PENDING_PAYMENT booking on this
  // vehicle whose window overlaps the requested window blocks the request.
  // [start, end) overlap test: existing.start < newEnd AND existing.end > newStart
  const conflict = await prisma.booking.findFirst({
    where: {
      vehicleId: vehicle.id,
      status: { in: ["PENDING_PAYMENT", "CONFIRMED", "ACTIVE"] },
      startTime: { lt: input.endTime },
      endTime: { gt: input.startTime },
    },
  });
  if (conflict) {
    throw new AppError(
      "This vehicle is not available for the selected dates. Please choose a different window.",
      409
    );
  }

  const price = calculatePrice(
    Number(vehicle.pricePerDay),
    Number(vehicle.securityDeposit),
    input.startTime,
    input.endTime
  );

  const booking = await prisma.booking.create({
    data: {
      customerId,
      vehicleId: vehicle.id,
      startTime: input.startTime,
      endTime: input.endTime,
      pickupLocation: input.pickupLocation,
      returnLocation: input.returnLocation,
      rentalAmount: price.rentalAmount,
      securityDeposit: price.securityDeposit,
      platformFee: price.platformFee,
      totalAmount: price.totalAmount,
      status: "PENDING_PAYMENT",
    },
  });

  return booking;
}

export async function getBookingById(userId: string, role: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      vehicle: true,
      payments: { orderBy: { createdAt: "desc" } },
      review: true,
    },
  });
  if (!booking) throw new AppError("Booking not found", 404);

  const isOwnerOfVehicle = booking.vehicle.ownerId === userId;
  const isCustomer = booking.customerId === userId;
  if (role !== "ADMIN" && !isOwnerOfVehicle && !isCustomer) {
    throw new AppError("You do not have access to this booking", 403);
  }
  return booking;
}

export async function listMyBookings(userId: string, role: string) {
  if (role === "OWNER") {
    return prisma.booking.findMany({
      where: { vehicle: { ownerId: userId } },
      include: { vehicle: true, customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
  return prisma.booking.findMany({
    where: { customerId: userId },
    include: { vehicle: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function cancelBooking(userId: string, bookingId: string, reason?: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.customerId !== userId) throw new AppError("Not your booking", 403);

  if (!["PENDING_PAYMENT", "CONFIRMED"].includes(booking.status)) {
    throw new AppError(`Booking in status ${booking.status} cannot be cancelled`, 400);
  }

  const nextStatus = booking.status === "CONFIRMED" ? "REFUND_PENDING" : "CANCELLED";

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: nextStatus, cancelReason: reason },
  });
}
