import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/errors";
import { MockPaymentProvider } from "./providers/MockPaymentProvider";
import { PaymentProvider } from "./providers/PaymentProvider";

// v1.1 runs entirely on the mock provider (Razorpay checkout is unreliable
// on plain localhost). Swapping to a real gateway later is a one-line
// change here -- RazorpayProvider already implements the same interface.
const activeProvider: PaymentProvider = new MockPaymentProvider();

export async function createPaymentOrder(
  customerId: string,
  bookingId: string,
  method?: string
) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.customerId !== customerId) throw new AppError("Not your booking", 403);
  if (booking.status !== "PENDING_PAYMENT") {
    throw new AppError(`Booking is not awaiting payment (status: ${booking.status})`, 400);
  }

  const charge = await activeProvider.createCharge({
    bookingId: booking.id,
    amount: Number(booking.totalAmount),
    currency: "INR",
    method,
  });

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: activeProvider.name,
      method,
      razorpayOrderId: activeProvider.name === "RAZORPAY" ? charge.providerRef : undefined,
      transactionId: activeProvider.name === "MOCK" ? charge.providerRef : undefined,
      amount: booking.totalAmount,
      currency: "INR",
      paymentStatus: "PROCESSING",
      paymentType: "RENTAL",
    },
  });

  return { payment, ...charge.clientPayload };
}

// Confirms a payment against whichever provider created it, then -- and
// only then -- moves the booking from PENDING_PAYMENT to CONFIRMED. This is
// the single place a booking is allowed to become CONFIRMED.
export async function confirmPayment(
  customerId: string,
  providerRef: string,
  proof: Record<string, unknown>
) {
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [{ transactionId: providerRef }, { razorpayOrderId: providerRef }],
    },
    include: { booking: true },
  });
  if (!payment) throw new AppError("Payment record not found", 404);
  if (payment.booking.customerId !== customerId) throw new AppError("Not your booking", 403);
  if (payment.paymentStatus === "PAID") {
    // Idempotent: confirming twice just returns the existing result.
    return { payment, booking: payment.booking };
  }

  const result = await activeProvider.confirmCharge({ providerRef, proof });

  if (!result.success) {
    const [updatedPayment, updatedBooking] = await prisma.$transaction([
      prisma.payment.update({ where: { id: payment.id }, data: { paymentStatus: "FAILED" } }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "PAYMENT_FAILED" },
      }),
    ]);
    throw new AppError(result.failureReason || "Payment failed", 400, {
      payment: updatedPayment,
      booking: updatedBooking,
    });
  }

  const [updatedPayment, updatedBooking] = await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { paymentStatus: "PAID", transactionId: result.transactionId },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    }),
  ]);

  return { payment: updatedPayment, booking: updatedBooking };
}
