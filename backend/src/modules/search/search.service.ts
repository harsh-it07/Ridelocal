import { prisma } from "../../config/prisma";
import { distanceKm } from "../../utils/geo";
import { SearchVehicleInput } from "../vehicles/vehicles.schema";

export interface RankedVehicle {
  id: string;
  brand: string;
  model: string;
  vehicleType: string;
  pricePerDay: number;
  securityDeposit: number;
  city: string;
  latitude: number;
  longitude: number;
  photoUrls: string[];
  status: string;
  verificationStatus: string;
  ratingAvg: number;
  ratingCount: number;
  distanceKm: number | null;
  matchScore: number;
}

// Vehicles matching every filter except availability, ranked by a weighted
// match score: 40% proximity, 25% price, 20% rating, 15% verification/trust.
export async function searchVehicles(params: SearchVehicleInput): Promise<RankedVehicle[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: "ACTIVE",
      ...(params.city ? { city: { equals: params.city, mode: "insensitive" } } : {}),
      ...(params.vehicleType ? { vehicleType: params.vehicleType } : {}),
      ...(params.verifiedOnly ? { verificationStatus: "VERIFIED" } : {}),
      ...(params.minPrice !== undefined || params.maxPrice !== undefined
        ? {
            pricePerDay: {
              ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
              ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
            },
          }
        : {}),
      ...(params.minRating !== undefined ? { ratingAvg: { gte: params.minRating } } : {}),
    },
  });

  // If a date range was given, drop vehicles with an overlapping CONFIRMED/ACTIVE booking.
  let available = vehicles;
  if (params.startTime && params.endTime) {
    const conflicting = await prisma.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "ACTIVE"] },
        startTime: { lt: params.endTime },
        endTime: { gt: params.startTime },
      },
      select: { vehicleId: true },
    });
    const busyIds = new Set(conflicting.map((b: { vehicleId: string }) => b.vehicleId));
    available = vehicles.filter((v: { id: string }) => !busyIds.has(v.id));
  }

  // Apply radius filter if location was given
  type VehicleRow = (typeof available)[number];
  let withDistance: { v: VehicleRow; dist: number | null }[] = available.map((v: VehicleRow) => {
    const dist =
      params.lat !== undefined && params.lng !== undefined
        ? distanceKm(params.lat, params.lng, v.latitude, v.longitude)
        : null;
    return { v, dist };
  });

  if (params.lat !== undefined && params.lng !== undefined) {
    withDistance = withDistance.filter(
      (x: { v: VehicleRow; dist: number | null }) => (x.dist ?? Infinity) <= params.radiusKm
    );
  }

  const maxPrice = Math.max(
    ...withDistance.map((x: { v: VehicleRow; dist: number | null }) => Number(x.v.pricePerDay)),
    1
  );
  const maxDist = Math.max(
    ...withDistance.map((x: { v: VehicleRow; dist: number | null }) => x.dist ?? 0),
    1
  );

  const ranked: RankedVehicle[] = withDistance.map(({ v, dist }: { v: VehicleRow; dist: number | null }) => {
    const proximityScore = dist === null ? 0.5 : 1 - Math.min(dist / maxDist, 1);
    const priceScore = 1 - Math.min(Number(v.pricePerDay) / maxPrice, 1);
    const ratingScore = v.ratingAvg / 5;
    const trustScore = v.verificationStatus === "VERIFIED" ? 1 : 0.3;

    const matchScore =
      0.4 * proximityScore + 0.25 * priceScore + 0.2 * ratingScore + 0.15 * trustScore;

    return {
      id: v.id,
      brand: v.brand,
      model: v.model,
      vehicleType: v.vehicleType,
      pricePerDay: Number(v.pricePerDay),
      securityDeposit: Number(v.securityDeposit),
      city: v.city,
      latitude: v.latitude,
      longitude: v.longitude,
      photoUrls: v.photoUrls,
      status: v.status,
      verificationStatus: v.verificationStatus,
      ratingAvg: v.ratingAvg,
      ratingCount: v.ratingCount,
      distanceKm: dist === null ? null : Math.round(dist * 10) / 10,
      matchScore: Math.round(matchScore * 1000) / 1000,
    };
  });

  const sortKey: Record<string, (a: RankedVehicle, b: RankedVehicle) => number> = {
    distance: (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
    price: (a, b) => a.pricePerDay - b.pricePerDay,
    rating: (a, b) => b.ratingAvg - a.ratingAvg,
    match: (a, b) => b.matchScore - a.matchScore,
  };

  return ranked.sort(sortKey[params.sortBy]);
}
