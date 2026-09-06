import bcrypt from "bcryptjs";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password@123", 10);

  // ---- Users ----

  const admin = await prisma.user.upsert({
    where: { email: "admin@ridelocal.dev" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@ridelocal.dev",
      passwordHash,
      role: "ADMIN",
      verificationStatus: "VERIFIED",
    },
  });

  const owners = await Promise.all(
    [
      { name: "Rohan Sharma", email: "owner@ridelocal.dev", verificationStatus: "VERIFIED" as const },
      { name: "Aditi Kapoor", email: "owner2@ridelocal.dev", verificationStatus: "UNDER_REVIEW" as const },
    ].map((o) =>
      prisma.user.upsert({
        where: { email: o.email },
        update: {},
        create: { ...o, passwordHash, role: "OWNER" },
      })
    )
  );
  const [owner, owner2] = owners;

  const customers = await Promise.all(
    [
      { name: "Priya Verma", email: "customer@ridelocal.dev", verificationStatus: "VERIFIED" as const },
      { name: "James Carter", email: "customer2@ridelocal.dev", verificationStatus: "UNDER_REVIEW" as const },
      { name: "Meera Nair", email: "customer3@ridelocal.dev", verificationStatus: "UNVERIFIED" as const },
    ].map((c) =>
      prisma.user.upsert({
        where: { email: c.email },
        update: {},
        create: { ...c, passwordHash, role: "CUSTOMER" },
      })
    )
  );
  const [customer, customer2, customer3] = customers;

  // A driving-licence submission for the customer under review, so the
  // admin verification queue isn't empty on first run.
  const existingDoc = await prisma.userDocument.findFirst({ where: { userId: customer2.id } });
  if (!existingDoc) {
    await prisma.userDocument.create({
      data: {
        userId: customer2.id,
        documentType: "DRIVING_LICENSE",
        secureFileReference: "local://user-docs/demo-dl-james.jpg",
        verificationStatus: "UNDER_REVIEW" as any,
      },
    });
    await prisma.verificationRecord.create({
      data: { verificationType: "USER_IDENTITY", userId: customer2.id, status: "UNDER_REVIEW" },
    });
  }

  // ---- Vehicles (bikes), across the full status range ----

  const bikeDefs = [
    {
      brand: "Honda",
      model: "Activa 6G",
      vehicleType: "SCOOTER" as const,
      registrationReference: "RJ14AB1234",
      pricePerDay: 450,
      securityDeposit: 1500,
      city: "Jaipur",
      latitude: 26.9124,
      longitude: 75.7873,
      description: "Well-maintained scooter, great for city rides near Hawa Mahal.",
      photoUrls: [],
      ratingAvg: 4.6,
      ratingCount: 18,
      status: "ACTIVE" as const,
      verificationStatus: "VERIFIED" as const,
      ownerId: owner.id,
    },
    {
      brand: "Royal Enfield",
      model: "Classic 350",
      vehicleType: "MOTORCYCLE" as const,
      registrationReference: "RJ14CD5678",
      pricePerDay: 900,
      securityDeposit: 3000,
      city: "Jaipur",
      latitude: 26.9239,
      longitude: 75.8267,
      description: "Perfect for a highway trip to Amber Fort.",
      photoUrls: [],
      ratingAvg: 4.8,
      ratingCount: 32,
      status: "ACTIVE" as const,
      verificationStatus: "VERIFIED" as const,
      ownerId: owner.id,
    },
    {
      brand: "TVS",
      model: "iQube Electric",
      vehicleType: "EBIKE" as const,
      registrationReference: "RJ14EF9012",
      pricePerDay: 500,
      securityDeposit: 2000,
      city: "Jaipur",
      latitude: 26.8890,
      longitude: 75.8060,
      description: "Electric scooter, silent and eco-friendly for short city hops.",
      photoUrls: [],
      ratingAvg: 4.3,
      ratingCount: 9,
      status: "ACTIVE" as const,
      verificationStatus: "VERIFIED" as const,
      ownerId: owner.id,
    },
    {
      brand: "Bajaj",
      model: "Pulsar NS200",
      vehicleType: "MOTORCYCLE" as const,
      registrationReference: "RJ14GH3456",
      pricePerDay: 700,
      securityDeposit: 2500,
      city: "Jaipur",
      latitude: 26.9155,
      longitude: 75.8189,
      description: "Newly listed — awaiting admin review before it goes live.",
      photoUrls: [],
      status: "PENDING_REVIEW" as const,
      verificationStatus: "UNDER_REVIEW" as const,
      ownerId: owner2.id,
    },
    {
      brand: "Hero",
      model: "Splendor Plus",
      vehicleType: "MOTORCYCLE" as const,
      registrationReference: "RJ14IJ7890",
      pricePerDay: 350,
      securityDeposit: 1200,
      city: "Jaipur",
      latitude: 26.9000,
      longitude: 75.8100,
      description: "Draft listing — owner hasn't submitted for review yet.",
      photoUrls: [],
      status: "DRAFT" as const,
      verificationStatus: "UNVERIFIED" as const,
      ownerId: owner2.id,
    },
    {
      brand: "Yamaha",
      model: "FZ-S",
      vehicleType: "MOTORCYCLE" as const,
      registrationReference: "RJ14KL2468",
      pricePerDay: 600,
      securityDeposit: 2000,
      city: "Jaipur",
      latitude: 26.9050,
      longitude: 75.8200,
      description: "Rejected on first submission (blurry RC photo) — resubmission pending.",
      photoUrls: [],
      status: "REJECTED" as const,
      verificationStatus: "REJECTED" as const,
      ownerId: owner2.id,
    },
  ];

  const bikes: Record<string, string> = {};
  for (const b of bikeDefs) {
    const existing = await prisma.vehicle.findFirst({
      where: { registrationReference: b.registrationReference },
    });
    const record = existing
      ? existing
      : await prisma.vehicle.create({ data: b });
    bikes[b.registrationReference] = record.id;
  }

  // ---- Sample bookings + mock payments across the lifecycle ----

  const activa = bikes["RJ14AB1234"];
  const enfield = bikes["RJ14CD5678"];

  const existingBooking = await prisma.booking.findFirst({ where: { vehicleId: activa, customerId: customer.id } });
  if (!existingBooking) {
    // 1) A completed, paid rental (for review + earnings demo data).
    const completedBooking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        vehicleId: activa,
        startTime: new Date(Date.now() - 10 * 86400000),
        endTime: new Date(Date.now() - 7 * 86400000),
        pickupLocation: "Hawa Mahal, Jaipur",
        returnLocation: "Hawa Mahal, Jaipur",
        rentalAmount: 1350,
        securityDeposit: 1500,
        platformFee: 108,
        totalAmount: 2958,
        status: "COMPLETED",
      },
    });
    await prisma.payment.create({
      data: {
        bookingId: completedBooking.id,
        provider: "MOCK",
        method: "UPI",
        transactionId: `MOCK_TXN_${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
        amount: 2958,
        paymentStatus: "PAID",
        paymentType: "RENTAL",
      },
    });
    await prisma.review.create({
      data: {
        bookingId: completedBooking.id,
        customerId: customer.id,
        vehicleId: activa,
        rating: 5,
        comment: "Smooth ride, owner was very responsive. Highly recommend!",
      },
    });

    // 2) An active, confirmed + paid rental happening right now.
    const activeBooking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        vehicleId: enfield,
        startTime: new Date(Date.now() - 1 * 86400000),
        endTime: new Date(Date.now() + 2 * 86400000),
        pickupLocation: "Amber Fort, Jaipur",
        returnLocation: "Amber Fort, Jaipur",
        rentalAmount: 2700,
        securityDeposit: 3000,
        platformFee: 216,
        totalAmount: 5916,
        status: "ACTIVE",
      },
    });
    await prisma.payment.create({
      data: {
        bookingId: activeBooking.id,
        provider: "MOCK",
        method: "CARD",
        transactionId: `MOCK_TXN_${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
        amount: 5916,
        paymentStatus: "PAID",
        paymentType: "RENTAL",
      },
    });

    // A sample dispute tied to the active booking, so the admin disputes
    // queue has something to triage on first run.
    await prisma.dispute.create({
      data: {
        bookingId: activeBooking.id,
        raisedById: customer.id,
        subject: "Bike had less fuel than expected at pickup",
        description:
          "The tank was nearly empty at pickup even though the listing said 'full tank'. Requesting a partial refund.",
        status: "OPEN",
      },
    });

    // 3) A booking still waiting on payment (tests the pending-payment UI path).
    await prisma.booking.create({
      data: {
        customerId: customer3.id,
        vehicleId: activa,
        startTime: new Date(Date.now() + 5 * 86400000),
        endTime: new Date(Date.now() + 7 * 86400000),
        pickupLocation: "City Palace, Jaipur",
        returnLocation: "City Palace, Jaipur",
        rentalAmount: 900,
        securityDeposit: 1500,
        platformFee: 72,
        totalAmount: 2472,
        status: "PENDING_PAYMENT",
      },
    });
  }

  console.log("Seed complete.\n");
  console.log("Demo accounts (password for all: Password@123):");
  console.log("  Admin:      admin@ridelocal.dev");
  console.log("  Owner:      owner@ridelocal.dev      (verified, 3 active bikes)");
  console.log("  Owner:      owner2@ridelocal.dev     (under review, 3 bikes in draft/pending/rejected)");
  console.log("  Customer:   customer@ridelocal.dev   (verified, has a completed + an active booking)");
  console.log("  Customer:   customer2@ridelocal.dev  (licence under review)");
  console.log("  Customer:   customer3@ridelocal.dev  (unverified, has a pending-payment booking)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
