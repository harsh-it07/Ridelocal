import { env } from "../config/env";

export interface PriceBreakdown {
  days: number;
  rentalAmount: number;
  securityDeposit: number;
  platformFee: number;
  totalAmount: number;
}

// The backend is the single source of truth for price. The frontend must
// never be trusted to submit a final amount.
export function calculatePrice(
  pricePerDay: number,
  securityDeposit: number,
  startTime: Date,
  endTime: Date
): PriceBreakdown {
  const msPerDay = 1000 * 60 * 60 * 24;
  const rawDays = (endTime.getTime() - startTime.getTime()) / msPerDay;
  const days = Math.max(1, Math.ceil(rawDays));

  const rentalAmount = round2(pricePerDay * days);
  const platformFee = round2(rentalAmount * (env.platformFeePercent / 100));
  const totalAmount = round2(rentalAmount + platformFee + securityDeposit);

  return {
    days,
    rentalAmount,
    securityDeposit: round2(securityDeposit),
    platformFee,
    totalAmount,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
