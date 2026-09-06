# RideLocal v1.1

A tourist-first, location-aware peer-to-peer bike rental marketplace.
**React + TypeScript + Tailwind** frontend, **Node.js + Express + TypeScript**
backend, **PostgreSQL + Prisma** database. v1.1 is an upgrade of the original
project — the schema, auth system, and API structure are preserved and
extended, not replaced.

---

## What's new in v1.1

1. **Glassmorphism design system** — white glass surfaces, warm orange
   accents, restrained blur, smooth motion. Re-skinned globally through
   `frontend/src/index.css`, plus bespoke rebuilds of the navbar, hero, and
   a new role-picker auth landing page.
2. **Mock payment system replacing the broken Razorpay-on-localhost flow** —
   built on a `PaymentProvider` abstraction (`MockPaymentProvider` active,
   `RazorpayProvider` implemented but dormant) so a real gateway can be
   swapped in later with a one-line change.
3. **Real secure file uploads** — driving licences, RC certificates, and
   bike photos are now actually uploaded (drag/drop, progress, status),
   stored outside any public static folder, and served through an
   access-controlled endpoint (owner, document submitter, or admin only).
4. **Dispute tickets** — a proper `Dispute` entity separate from the
   refund flow, with customer/owner submission and an admin resolution
   queue.
5. **No Docker required** — the primary documented path uses a free
   hosted Postgres instance (Neon/Supabase) instead of Docker Desktop.
6. **Richer seed data** — 2 owners, 3 customers, 6 bikes spanning every
   status, a completed booking with a review, an active booking with a
   sample dispute, and a pending-payment booking.

---

## Project structure

```
ridelocal/
  backend/
    prisma/schema.prisma
    src/
      modules/
        auth, users, vehicles, availability, search, bookings,
        payments/providers/  <- PaymentProvider abstraction
        reviews, verification, disputes, uploads, admin
      middleware/  auth.ts, errorHandler.ts, upload.ts
  frontend/
    src/
      pages/{public,customer,owner,admin}
      components/  Navbar, UploadArea, StatusBadge, VehicleCard, ui.tsx
      context/AuthContext.tsx
```

---

## 1. Database — no Docker needed

Create a free Postgres database at **https://neon.tech** or
**https://supabase.com** (2 minutes, no card required), then copy the
connection string it gives you.

(If you'd rather run Postgres locally or via Docker, that still works —
just point `DATABASE_URL` at it.)

## 2. Backend setup

```bash
cd backend
cp .env.example .env
# paste your DATABASE_URL into .env
npm install
npm run prisma:migrate     # creates tables from prisma/schema.prisma
npm run prisma:seed        # seeds demo accounts, bikes, bookings, disputes
npm run dev                # http://localhost:4000
```

Uploaded files are written to `backend/uploads/` (created automatically on
first run) — never add this folder to a publicly served static path.

## 3. Frontend setup

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

The Vite dev server proxies `/api/*` to the backend, so open
http://localhost:5173 and everything just works — including file downloads,
since the auth cookie is shared across the proxy.

---

## Demo accounts (password for all: `Password@123`)

| Role     | Email                    | Notes                                              |
|----------|--------------------------|-----------------------------------------------------|
| Admin    | admin@ridelocal.dev      | Full platform access                                |
| Owner    | owner@ridelocal.dev      | Verified, 3 active bikes                            |
| Owner    | owner2@ridelocal.dev     | Under review, bikes in draft/pending/rejected       |
| Customer | customer@ridelocal.dev   | Verified, has a completed + an active booking       |
| Customer | customer2@ridelocal.dev  | Licence submitted, awaiting admin review            |
| Customer | customer3@ridelocal.dev  | Unverified, has a booking awaiting payment          |

Admin accounts are **never** created through public signup — the register
endpoint only accepts `CUSTOMER`/`OWNER`, enforced server-side. The
"Admin Access" card on `/get-started` routes straight to login with a
banner explaining this, not a signup form.

---

## Architecture

**Request flow:** `Frontend → Axios client → Express routes → Zod
validation → service layer → Prisma → PostgreSQL`. Prices, availability
conflicts, and payment confirmation are always computed/verified
server-side; the frontend only ever shows estimates before submit.

**Payment abstraction:**
```
PaymentService (payments.service.ts)
├── MockPaymentProvider   <- active in v1.1, no external calls
└── RazorpayProvider      <- implemented, dormant; swap in payments.service.ts
```
Both implement the same `PaymentProvider` interface (`createCharge` /
`confirmCharge`), so nothing else in the codebase needs to know which
gateway is active.

**File uploads:** `POST /api/uploads/:category` (multer, local disk,
JPG/PNG/PDF only, size-limited) returns a `fileRef`. That ref is then
attached to a `UserDocument` or `VehicleDocument` row via
`/api/verification/submit`. Downloads go through
`GET /api/uploads/file/:category/:filename`, which checks the requester is
the document's owner, the vehicle's owner, or an admin before streaming
the file — nothing is reachable by a guessed URL alone.

---

## Database schema (v1.1 additions)

Existing entities (`User`, `Vehicle`, `UserDocument`, `VehicleDocument`,
`Availability`, `Booking`, `Payment`, `Review`, `VerificationRecord`,
`Notification`) are preserved. New in v1.1:

- **`Dispute`** — `bookingId`, `raisedById`, `subject`, `description`,
  `status` (`OPEN → UNDER_REVIEW → RESOLVED/CLOSED`), `resolutionNote`,
  `resolvedById`.
- **`PaymentProvider` enum** (`MOCK` / `RAZORPAY`) and new `Payment`
  fields: `provider`, `method`, `transactionId`.
- **`PaymentStatus` cleaned up** to `PENDING / PROCESSING / PAID / FAILED /
  REFUNDED` (previously Razorpay-specific `CREATED/AUTHORIZED/CAPTURED`).

`Vehicle` was **not** renamed to `Bike` — that would touch ~30 files for
no functional gain. All user-facing copy says "bike"; the model/API name
stays `Vehicle` internally. This is a deliberate scope decision, noted
under Limitations below.

---

## Flows

**Authentication:** `/get-started` presents three entry points (Rent a
Bike / List Your Bike / Admin Access) → routes to `/register?role=...` or
`/login`. Registration only allows `CUSTOMER`/`OWNER`.

**Tourist flow:** Register → browse `/search` → view a bike →
(if unverified) prompted to upload a driving licence at `/verification` →
book → `/bookings/:id/pay` mock checkout (UPI/Card/Netbanking/Wallet →
processing → success) → booking `CONFIRMED`.

**Owner flow:** Register as owner → `/owner/vehicles/new` (draft) → upload
RC certificate + photos → submit for approval → admin approves → bike
appears in public search.

**Verification flow:** Any document upload creates a `VerificationRecord`
in `UNDER_REVIEW`. Admin approves/rejects at `/admin/verifications`
(users) or `/admin/vehicles` (bikes), with the actual uploaded file
viewable inline via the access-controlled download route.

**Booking flow:** Server checks vehicle is `ACTIVE` + `VERIFIED`, customer
is `VERIFIED` and not suspended, and no overlapping booking exists —
before ever calculating a price. Price is always server-computed.

**Mock payment flow:** `POST /payments/mock/create` creates a real
`Payment` row (`PROCESSING`) via `MockPaymentProvider` →
`POST /payments/mock/confirm` marks it `PAID` and the booking `CONFIRMED`
— both are real backend writes, never faked on the frontend.

---

## API endpoints

**Auth:** `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`

**Bikes (customer-facing):** `GET /search/vehicles`, `GET /vehicles/:id`

**Bikes (owner):** `POST /vehicles`, `PATCH /vehicles/:id`, `POST /vehicles/:id/submit`, `GET /vehicles/mine`, `DELETE /vehicles/:id`

**Availability:** `GET|POST /vehicles/:id/availability`, `DELETE /vehicles/:id/availability/:slotId`

**Bookings:** `POST /bookings`, `GET /bookings`, `GET /bookings/:id`, `POST /bookings/:id/cancel`

**Payments:** `POST /payments/mock/create`, `POST /payments/mock/confirm`

**Reviews:** `POST /reviews`, `GET /reviews/vehicle/:vehicleId`

**Verification:** `POST /verification/submit`, `GET /verification/status`

**Disputes:** `POST /disputes`, `GET /disputes/mine`

**Uploads:** `POST /uploads/:category`, `GET /uploads/file/:category/:filename`

**Admin:** `GET /admin/verifications`, `PATCH /admin/verifications/:id`,
`GET /admin/vehicles/pending`, `PATCH /admin/vehicles/:id/approve`,
`GET /admin/users`, `PATCH /admin/users/:id/status`,
`GET /admin/bookings`, `GET /admin/payments`,
`PATCH /admin/bookings/:id/refund`,
`GET /admin/disputes`, `PATCH /admin/disputes/:id`

---

## Environment variables

See `backend/.env.example` and `frontend/.env.example`. No Razorpay keys
are required in v1.1 — they're only read if `RazorpayProvider` is
manually swapped in later.

---

## Assumptions & limitations (being upfront about scope)

- `Vehicle` was kept as the internal model/API name rather than renamed to
  `Bike` (see above) — a naming choice, not a missing feature.
- No live GPS tracking or websockets — "Active Rentals" status lives on
  the `Booking`/`Vehicle` records and is viewed via normal polling
  (refetch on page load), per the brief's guidance that this is
  acceptable for v1.1.
- The admin panel is a set of focused pages (dashboard, verification
  queue, vehicle approval, users, bookings, payments, disputes) rather
  than a full sidebar-shell application shell — functionally complete,
  visually simpler than a bespoke admin layout would be.
- A file uploaded via `/api/uploads/:category` isn't downloadable until
  it's attached to a `UserDocument`/`VehicleDocument` via
  `/verification/submit` — by design, so stray uploads aren't guessable,
  but it means there's a brief window between upload and attachment.
- Bike photo gallery reordering/removal in the owner form isn't built —
  photos upload and queue for submission, but can't be reordered before
  submit.
