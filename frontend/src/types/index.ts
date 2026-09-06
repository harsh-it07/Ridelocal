export type Role = "CUSTOMER" | "OWNER" | "ADMIN";
export type VerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED";

export type VehicleType = "SCOOTER" | "MOTORCYCLE" | "BICYCLE" | "EBIKE";
export type VehicleStatus = "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "REJECTED" | "SUSPENDED";

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_FAILED"
  | "CONFIRMED"
  | "CANCELLED"
  | "ACTIVE"
  | "COMPLETED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "DISPUTED";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  brand: string;
  model: string;
  vehicleType: VehicleType;
  registrationReference: string;
  pricePerDay: number | string;
  securityDeposit: number | string;
  city: string;
  latitude: number;
  longitude: number;
  description?: string | null;
  photoUrls: string[];
  status: VehicleStatus;
  verificationStatus: VerificationStatus;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
}

export interface RankedVehicle {
  id: string;
  brand: string;
  model: string;
  vehicleType: VehicleType;
  pricePerDay: number;
  securityDeposit: number;
  city: string;
  latitude: number;
  longitude: number;
  photoUrls: string[];
  status: VehicleStatus;
  verificationStatus: VerificationStatus;
  ratingAvg: number;
  ratingCount: number;
  distanceKm: number | null;
  matchScore: number;
}

export type PaymentStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "UPI" | "CARD" | "NETBANKING" | "WALLET";
export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";

export interface Dispute {
  id: string;
  bookingId: string;
  raisedById: string;
  subject: string;
  description: string;
  status: DisputeStatus;
  resolutionNote?: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  vehicleId: string;
  vehicle?: Vehicle;
  startTime: string;
  endTime: string;
  pickupLocation: string;
  returnLocation: string;
  rentalAmount: number | string;
  securityDeposit: number | string;
  platformFee: number | string;
  totalAmount: number | string;
  status: BookingStatus;
  createdAt: string;
}
