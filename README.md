# RideLocal — Peer-to-Peer Tourist Bike Rental Marketplace

<div align="center">

![RideLocal Banner](https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1400&q=80)

**Making Jaipur Mobility Easy · Explore the Pink City on Two Wheels**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 📖 Executive Summary

**RideLocal** is a full-stack, tourist-first peer-to-peer bike and scooter rental marketplace purpose-built for the heritage city of Jaipur, Rajasthan. Traditional vehicle rentals in tourist hubs suffer from extortionate offline security deposits, non-transparent surge pricing, unverified identities, and lack of accountability. 

RideLocal solves this through a digital escrow and verification platform connecting verified tourists directly with local bike owners. Backed by strict KYC identity checks, vehicle registration (RC) document audits, server-side anti-conflict reservation scheduling, and an extensible payment provider system, RideLocal guarantees safety, affordability, and seamless mobility.

---

## 📑 Table of Contents

- [✨ Core Features](#-core-features)
  - [👤 For Tourists (Customers)](#-for-tourists-customers)
  - [🏍️ For Bike Owners (Hosts)](#️-for-bike-owners-hosts)
  - [🛡️ For Platform Administrators](#️-for-platform-administrators)
- [🎨 Design System & Aesthetics](#-design-system--aesthetics)
- [🏗️ System Architecture](#️-system-architecture)
  - [High-Level Topology](#high-level-topology)
  - [Database Schema (Prisma)](#database-schema-prisma)
  - [Core State Machines](#core-state-machines)
- [🚀 Quick Start & Installation Guide](#-quick-start--installation-guide)
  - [Prerequisites](#prerequisites)
  - [1. Database Provisioning (Cloud / Local)](#1-database-provisioning-cloud--local)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Verification of Live Services](#4-verification-of-live-services)
- [🔑 Pre-Configured Demo Accounts](#-pre-configured-demo-accounts)
- [🔌 REST API Reference](#-rest-api-reference)
- [🔐 Secure Document Upload & Storage Flow](#-secure-document-upload--storage-flow)
- [💳 Modular Payment Engine](#-modular-payment-engine)
- [⚙️ Environment Variables Reference](#️-environment-variables-reference)
- [📁 Repository Directory Structure](#-repository-directory-structure)
- [🤝 Contributing & License](#-contributing--license)

---

## ✨ Core Features

### 👤 For Tourists (Customers)
- **Geospatial & Semantic Search**:
  - Filter by vehicle type: `MOTORCYCLE`, `SCOOTER`, `EBIKE`, `BICYCLE`.
  - Filter by price per day, minimum rating, verified-only badge, and custom dates.
  - Sort by proximity (`distance`), budget (`price`), feedback score (`rating`), or intelligent (`match`).
  - Interactive Jaipur location radius query with MapLibre GL map visualization.
- **Rich Two-Wheeler Profiles**:
  - Multi-image photo galleries, brand and model specs, city hub location, and daily rates.
  - Clear breakdown of daily rental rate, refundable security deposit, and 8% platform fee.
  - Genuine reviews and 1-to-5 star ratings from verified past renters.
- **Identity & KYC Verification**:
  - Document upload portal for Indian or International Driving Licences and Government IDs (Aadhaar / Passport).
  - Real-time verification status tracker (`UNVERIFIED` ➔ `UNDER_REVIEW` ➔ `VERIFIED` / `REJECTED`).
- **Seamless Booking & Payment**:
  - Anti-collision calendar booking: backend strictly forbids overlapping reservations.
  - Multi-method mock payment gateway simulating realistic UPI (GPay, PhonePe, Paytm), Credit/Debit Card, Netbanking, and Wallets.
  - Immediate booking confirmation and digital reservation pass.
- **Trip Lifecycle & Handover Management**:
  - Booking details page displaying pickup/return landmarks, owner contacts, and timing.
  - Customer cancellation workflow with automated refund triggers.
  - In-app ticket submission for booking disputes (fuel discrepancy, vehicle condition, deposit returns).
  - Verified review submission upon ride completion.

---

### 🏍️ For Bike Owners (Hosts)
- **Comprehensive Listing Studio**:
  - Create and edit two-wheeler profiles with technical specifications, descriptions, and location pins.
  - Upload real vehicle photos and mandatory RC (Registration Certificate) documents.
  - Set custom daily rental rates and refundable security deposits.
  - Submit listings to the admin queue (`DRAFT` ➔ `PENDING_REVIEW` ➔ `ACTIVE`).
- **Dynamic Availability Calendar**:
  - Define custom open rental schedules.
  - Block maintenance slots or personal usage periods with zero reservation conflicts.
- **Owner Command Center & Analytics**:
  - Fleet management overview tracking all listed bikes and their current statuses.
  - Live rental monitoring with current handover states and renter information.
  - Financial overview showing gross rental volume, platform commissions, and net earnings.
- **Dispute Participation**:
  - Track customer-raised tickets and provide context directly to platform administrators.

---

### 🛡️ For Platform Administrators
- **Verification Review Queue**:
  - Inspect submitted user documents (driving licences, government IDs) with protected inline preview.
  - Approve or reject verification requests with recorded audit logs and administrative notes.
- **Vehicle Approval Pipeline**:
  - Audit newly listed bikes and scooters against uploaded RC documents and photographs.
  - One-click approval to publish vehicles to public search, or rejection with constructive feedback.
- **User & Fleet Management**:
  - Platform-wide user directory with role filters (`CUSTOMER`, `OWNER`, `ADMIN`).
  - Account suspension toggle to immediately revoke access for malicious users.
- **Operations & Ledger Monitoring**:
  - **Booking Monitoring**: Live dashboard of all historic and ongoing trips across Jaipur.
  - **Payment Monitoring**: Comprehensive financial ledger tracking transaction IDs, payment methods, amounts, and statuses.
  - **Disputes & Refund Console**: Investigate grievances between renters and hosts, authorize deposit refunds, or close disputed tickets.

---

## 🎨 Design System & Aesthetics

RideLocal features a **bespoke Crimson & Blush luxury palette** coupled with bold editorial typography inspired by the architectural grandeur of Rajasthan.

| Token | Hex Value | Application |
|---|---|---|
| **Crimson 950** | `#360208` | Deepest shadows and contrasting overlays |
| **Crimson 900** | `#4E050E` | Secondary dark background, hero strips, and footers |
| **Crimson 800** | `#680A16` | **Primary background color** |
| **Crimson 700** | `#821220` | Card borders and subtle separators |
| **Blush 200** | `#F9D3CD` | **Primary text, high-contrast headings, and highlights** |
| **Blush 400** | `#DFA8A0` | Secondary muted text, labels, and metadata |
| **Blush 50** | `#FFFFFF` | Bright white accents, buttons, and badges |

### Typography Hierarchy
- **Headline Font**: `'Bebas Neue'`, `'Barlow Condensed'`, sans-serif — for monumental section titles, giant numbers, and brand marks.
- **Display Font**: `'Barlow Condensed'`, `'DM Sans'`, sans-serif — for tags, tables, specs, and status banners.
- **Body Font**: `'DM Sans'`, sans-serif — for readable paragraphs, descriptions, and input controls.

### Micro-Interactions & Styling
- **Custom Interactive Cursors**: Precision crosshair cursor and smooth line cursor for an immersive desktop experience.
- **Editorial Presentation Frames**: Architectural corner markers, geometric grid lines, and high-contrast glassmorphism borders.
- **Fluid Layout**: Fully responsive across mobile viewports, tablets, and ultra-wide desktop monitors.

---

## 🏗️ System Architecture

### High-Level Topology

```mermaid
flowchart TB
    subgraph Client["Frontend Layer (React 18 + Vite + Tailwind)"]
        UI[Pages & Custom Components]
        RQ[TanStack Query Cache]
        AX[Axios API Client]
        UI --> RQ --> AX
    end

    subgraph Server["Backend Layer (Node.js + Express + TypeScript)"]
        RT[Express Routers & Middlewares]
        MW_Auth[JWT Auth & RBAC Guard]
        MW_Zod[Zod Schema Validation]
        SVC[Business Service Layer]
        PP[PaymentProvider Abstraction]
        UP[Secure Upload Controller]

        RT --> MW_Auth --> MW_Zod --> SVC
        SVC --> PP
        RT --> UP
    end

    subgraph Storage["Persistence & Filesystem"]
        DB[(PostgreSQL Database via Prisma ORM)]
        DISK[Access-Controlled Local Storage /uploads]
    end

    AX -- "HTTPS / Cookie Auth" --> RT
    SVC --> DB
    UP --> DISK
    UP --> DB
```

---

### Database Schema (Prisma)

```mermaid
erDiagram
    User ||--o{ Vehicle : "owns"
    User ||--o{ Booking : "books"
    User ||--o{ UserDocument : "submits"
    User ||--o{ VerificationRecord : "targets"
    User ||--o{ Review : "writes"
    User ||--o{ Dispute : "raises"
    User ||--o{ Notification : "receives"

    Vehicle ||--o{ VehicleDocument : "has"
    Vehicle ||--o{ Availability : "has_slots"
    Vehicle ||--o{ Booking : "reserved_in"
    Vehicle ||--o{ Review : "receives"

    Booking ||--o{ Payment : "has_transactions"
    Booking ||--o| Review : "yields"
    Booking ||--o{ Dispute : "has_disputes"
```

---

### Core State Machines

#### 1. Vehicle Lifecycle
```mermaid
stateDiagram-v2
    [*] --> DRAFT : Owner creates listing
    DRAFT --> PENDING_REVIEW : Uploads RC & photos, submits
    PENDING_REVIEW --> ACTIVE : Admin approves
    PENDING_REVIEW --> REJECTED : Admin rejects
    REJECTED --> PENDING_REVIEW : Owner resubmits
    ACTIVE --> SUSPENDED : Admin flag / Compliance issue
    SUSPENDED --> ACTIVE : Reinstated
```

#### 2. Booking Lifecycle
```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT : Customer selects dates
    PENDING_PAYMENT --> CONFIRMED : Payment processed
    PENDING_PAYMENT --> PAYMENT_FAILED : Payment failure
    PENDING_PAYMENT --> CANCELLED : Customer abandons
    CONFIRMED --> ACTIVE : Handover & ride start
    ACTIVE --> COMPLETED : Vehicle returned
    CONFIRMED --> CANCELLED : Customer cancels before trip
    ACTIVE --> DISPUTED : Dispute raised
    CANCELLED --> REFUND_PENDING : Deposit / fee refund
    REFUND_PENDING --> REFUNDED : Admin completes refund
```

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher (`v20+` recommended)
- **Package Manager**: `npm` (`v9+`)
- **Database**: PostgreSQL (Cloud hosted on [Neon](https://neon.tech) / [Supabase](https://supabase.com), or local PostgreSQL instance)

---

### 1. Database Provisioning (Cloud / Local)

#### Option A: Free Hosted Cloud Database (Recommended — Zero Docker required)
1. Sign up for a free PostgreSQL database at [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Create a new project and copy your connection string (format: `postgresql://user:password@host:5432/dbname?sslmode=require`).

#### Option B: Local PostgreSQL or Docker
If you prefer running a local database instance via Docker:
```bash
docker run --name ridelocal-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ridelocal -p 5432:5432 -d postgres:15
# Connection URL: postgresql://postgres:postgres@localhost:5432/ridelocal?schema=public
```

---

### 2. Backend Setup

Open a terminal in the project directory:

```bash
# Navigate to backend
cd backend

# Copy environment configuration
cp .env.example .env
```

Open `backend/.env` in your editor and configure your `DATABASE_URL`:
```env
DATABASE_URL="postgresql://<username>:<password>@<host>:5432/<database>?sslmode=require"
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET="your-super-secure-random-secret-key"
PLATFORM_FEE_PERCENT=8
UPLOADS_DIR=./uploads
MAX_UPLOAD_SIZE_MB=8
```

Install dependencies, run migrations, and populate seed data:
```bash
# Install backend dependencies
npm install

# Push database schema migrations
npm run prisma:migrate

# Populate demo accounts, vehicles, bookings, disputes, and reviews
npm run prisma:seed

# Start backend development server (with hot reload via tsx watch)
npm run dev
```
The backend API server will start on **`http://localhost:4000`**.

---

### 3. Frontend Setup

In a separate terminal window:

```bash
# Navigate to frontend
cd frontend

# Copy environment configuration
cp .env.example .env
```

`frontend/.env` contains the default proxy target:
```env
VITE_API_BASE_URL=/api
```

Install dependencies and start the Vite dev server:
```bash
# Install frontend packages
npm install

# Start Vite development server
npm run dev
```
The client application will launch on **`http://localhost:5173`**.

> **Note on Vite Proxy**: The frontend dev server proxies all `/api/*` network requests directly to `http://localhost:4000`. Authentication cookies and file streaming seamlessly pass through the proxy with zero CORS configuration required.

---

### 4. Verification of Live Services

- **Backend Health Check**: Open `http://localhost:4000/api/health` in your browser. You should receive:
  ```json
  { "status": "ok", "time": "2026-..." }
  ```
- **Prisma Studio (Optional Data Explorer)**: Run `npm run prisma:studio` inside `backend/` to view and query database records via an interactive web GUI at `http://localhost:5555`.

---

## 🔑 Pre-Configured Demo Accounts

All pre-seeded demo accounts share the universal password:  
**`Password@123`**

| Role | Email Address | Verification Status | Pre-Configured Context |
|---|---|---|---|
| **Platform Admin** | `admin@ridelocal.dev` | `VERIFIED` | Full access to moderation queues, user controls, disputes, and approvals |
| **Verified Owner** | `owner@ridelocal.dev` | `VERIFIED` | Owns 3 live bikes (Activa 6G, Classic 350, TVS iQube), earnings history, active rental |
| **Pending Owner** | `owner2@ridelocal.dev` | `UNDER_REVIEW` | Owns 3 bikes across `DRAFT`, `PENDING_REVIEW` (Pulsar NS200), and `REJECTED` states |
| **Verified Tourist** | `customer@ridelocal.dev` | `VERIFIED` | Has a completed rental with a review + an active rental with a raised dispute |
| **Pending Tourist** | `customer2@ridelocal.dev` | `UNDER_REVIEW` | Submitted driving licence, pending in Admin Verification Queue |
| **Unverified Tourist**| `customer3@ridelocal.dev` | `UNVERIFIED` | Fresh account with a booking currently awaiting checkout payment |

> [!IMPORTANT]
> **Admin Account Security**: Platform Administrator accounts cannot be created via the public registration endpoint. Registration is restricted server-side to `CUSTOMER` and `OWNER` roles. Administrative users must be created through database seeding or direct DB administrator insertion.

---

## 🔌 REST API Reference

All protected endpoints require a valid HTTP-only `auth_token` cookie or Bearer JWT token in the request header.

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (`role`: `CUSTOMER` or `OWNER`) |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue JWT cookie |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate authentication cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and session data |

### 2. Vehicle Search & Catalog (`/api/search` & `/api/vehicles`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/search/vehicles` | Public | Search vehicles by lat/lng, radius, dates, price, and category |
| `GET` | `/api/vehicles/:id` | Public | Fetch comprehensive vehicle details, specs, and owner info |
| `POST` | `/api/vehicles` | Owner | Create new vehicle draft listing |
| `PATCH` | `/api/vehicles/:id` | Owner | Update draft or existing vehicle details |
| `POST` | `/api/vehicles/:id/submit`| Owner | Submit vehicle listing for admin review |
| `GET` | `/api/vehicles/mine` | Owner | List all vehicles owned by current user |
| `DELETE`| `/api/vehicles/:id` | Owner | Remove an unbooked vehicle listing |

### 3. Availability Calendar (`/api/vehicles/:id/availability`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/vehicles/:id/availability` | Public | Get open and blocked time slots for vehicle |
| `POST` | `/api/vehicles/:id/availability` | Owner | Block out dates for maintenance or owner use |
| `DELETE`| `/api/vehicles/:id/availability/:slotId` | Owner | Release a previously blocked date slot |

### 4. Bookings Engine (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Customer | Reserve vehicle (calculates rental, deposit, platform fee) |
| `GET` | `/api/bookings` | Authenticated | List all bookings for customer or owner |
| `GET` | `/api/bookings/:id` | Authenticated | Get full booking receipt, status, and breakdown |
| `POST` | `/api/bookings/:id/cancel` | Customer | Cancel a booking with reason |

### 5. Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/mock/create` | Customer | Initialize payment order (`PROCESSING` state) |
| `POST` | `/api/payments/mock/confirm` | Customer | Confirm transaction, mark `PAID`, advance booking to `CONFIRMED` |

### 6. KYC & Document Verification (`/api/verification`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/verification/submit` | Authenticated | Submit driving licence or RC document references |
| `GET` | `/api/verification/status` | Authenticated | Retrieve verification history and status for current user |

### 7. Reviews & Ratings (`/api/reviews`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reviews` | Customer | Submit 1–5 star review and comment for completed rental |
| `GET` | `/api/reviews/vehicle/:vehicleId` | Public | List all reviews and ratings for a bike |

### 8. Disputes & Claims (`/api/disputes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/disputes` | Customer / Owner | Open a dispute ticket regarding a booking |
| `GET` | `/api/disputes/mine` | Authenticated | List all disputes relevant to current user |

### 9. Secure File Uploads (`/api/uploads`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/uploads/:category` | Authenticated | Upload document/photo (`user-docs`, `vehicle-docs`, `bike-images`) |
| `GET` | `/api/uploads/file/:category/:filename` | Controlled | Secure stream of uploaded file (ACL enforced) |

### 10. Platform Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/verifications` | Admin | Fetch user and vehicle verification queue |
| `PATCH` | `/api/admin/verifications/:id` | Admin | Approve or reject identity verification with notes |
| `GET` | `/api/admin/vehicles/pending` | Admin | Fetch pending vehicle listing submissions |
| `PATCH` | `/api/admin/vehicles/:id/approve` | Admin | Approve or reject bike listing |
| `GET` | `/api/admin/users` | Admin | Query platform users with optional role filter |
| `PATCH` | `/api/admin/users/:id/status` | Admin | Toggle user account suspension |
| `GET` | `/api/admin/bookings` | Admin | Monitor all platform bookings and statuses |
| `GET` | `/api/admin/payments` | Admin | Monitor global payment transactions and escrow |
| `PATCH` | `/api/admin/bookings/:id/refund` | Admin | Authorize or reject customer deposit/rental refunds |
| `GET` | `/api/admin/disputes` | Admin | List all open dispute tickets |
| `PATCH` | `/api/admin/disputes/:id` | Admin | Update dispute state (`RESOLVED`, `CLOSED`) with resolution notes |

---

## 🔐 Secure Document Upload & Storage Flow

Driving licences and vehicle RC papers contain sensitive Personally Identifiable Information (PII). RideLocal implements an **Access Control List (ACL) file vault**:

```
[Client Drag & Drop] 
       │
       ▼
POST /api/uploads/:category
       │
       ├─► Validates MIME type (image/jpeg, image/png, application/pdf)
       ├─► Checks file size (<= 8 MB)
       ├─► Writes to backend/uploads/:category with UUID filename
       └─► Returns secure reference: local://:category/:filename
       │
       ▼
POST /api/verification/submit
       │
       └─► Attaches fileRef to UserDocument or VehicleDocument record
```

### Access-Controlled File Retrieval:
When requesting `GET /api/uploads/file/:category/:filename`:
1. **Public Vehicle Photos** (`bike-images`): Streamed freely to display bike galleries in search.
2. **Sensitive KYC Documents** (`user-docs`, `vehicle-docs`): The backend verifies authentication and strictly checks:
   - Is the requester the **document submitter**?
   - Is the requester the **vehicle owner**?
   - Is the requester a **Platform Administrator**?
   
If none match, the server returns an immediate `403 Forbidden`. **Files are never exposed to public static web directories.**

---

## 💳 Modular Payment Engine

RideLocal utilizes a **Provider Strategy Pattern** for financial transactions:

```
                  ┌──────────────────────┐
                  │    PaymentService    │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│  MockPaymentProvider  │         │   RazorpayProvider    │
│  (Active by Default)  │         │ (Enterprise / Dormant)│
└───────────────────────┘         └───────────────────────┘
```

- **Mock Payment Provider (Active)**: Zero external credentials needed. Fully simulates transaction lifecycles, creates genuine database `Payment` records in `PROCESSING` and `PAID` states, and supports UPI, Card, Netbanking, and Wallets.
- **Razorpay Provider (Ready for Production)**: Pre-architected and ready for activation. To switch to live Razorpay processing, supply `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env` and update the active provider registration in `payments.service.ts`.

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Type | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | String | *(Required)* | PostgreSQL connection URI (Neon, Supabase, or Local) |
| `PORT` | Number | `4000` | HTTP port backend server listens on |
| `NODE_ENV` | String | `development` | Runtime environment (`development` / `production`) |
| `CLIENT_ORIGIN` | String | `http://localhost:5173`| Allowed CORS origin for browser requests |
| `JWT_SECRET` | String | *(Required)* | Secret key used to sign and verify JWT session cookies |
| `JWT_EXPIRES_IN` | String | `7d` | Token expiry duration |
| `PLATFORM_FEE_PERCENT`| Number | `8` | Marketplace commission percentage added to rental total |
| `UPLOADS_DIR` | String | `./uploads` | Local directory for uploaded files and KYC vault |
| `MAX_UPLOAD_SIZE_MB` | Number | `8` | Maximum allowable single file size in megabytes |
| `RAZORPAY_KEY_ID` | String | *(Optional)* | Razorpay gateway API key (for live mode) |
| `RAZORPAY_KEY_SECRET` | String | *(Optional)* | Razorpay gateway secret (for live mode) |
| `RAZORPAY_WEBHOOK_SECRET` | String | *(Optional)* | Razorpay webhook secret |

### Frontend (`frontend/.env`)

| Variable | Type | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | String | `/api` | Base path for API requests (proxied to backend) |
| `VITE_RAZORPAY_KEY_ID` | String | *(Optional)* | Client-side Razorpay public key (if enabled) |

---

## 📁 Repository Directory Structure

```text
ridelocal/
├── backend/
│   ├── prisma/
│   │   ├── migrations/             # Timestamped SQL database migrations
│   │   ├── schema.prisma           # Prisma models, relations, and enums
│   │   └── seed.ts                 # Database seeder (demo accounts, bikes, bookings)
│   ├── src/
│   │   ├── config/                 # Environment validation and Prisma client instance
│   │   ├── middleware/             # JWT auth, role guard, error handler, Multer upload
│   │   ├── modules/
│   │   │   ├── admin/              # Verifications, vehicle approvals, user status
│   │   │   ├── auth/               # Register, login, logout, me
│   │   │   ├── availability/       # Date range booking conflict validation
│   │   │   ├── bookings/           # Booking creation, lifecycle, and pricing logic
│   │   │   ├── disputes/           # Complaint tickets and admin resolution
│   │   │   ├── payments/           # Modular PaymentService & provider drivers
│   │   │   │   └── providers/      # MockPaymentProvider, RazorpayProvider
│   │   │   ├── reviews/            # Verified customer ratings and feedback
│   │   │   ├── search/             # Geospatial and multi-attribute bike discovery
│   │   │   ├── uploads/            # Multipart file handler & access-controlled streaming
│   │   │   ├── users/              # User profile endpoints
│   │   │   └── vehicles/           # Bike listing CRUD, specs, and owner management
│   │   ├── utils/                  # Async handler wrappers, HTTP error classes
│   │   ├── app.ts                  # Express application configuration and middleware stack
│   │   └── index.ts                # HTTP server bootstrap entry point
│   ├── .env.example                # Backend environment template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/                     # Static icons and assets
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── CrosshairCursor.tsx # Precision cursor micro-interaction
│   │   │   ├── LineCursor.tsx      # Smooth accent line follower
│   │   │   ├── Loader.tsx          # Custom animated loader
│   │   │   ├── Navbar.tsx          # Multi-role responsive navigation bar
│   │   │   ├── ReviewsSection.tsx  # Dynamic reviews and rating submission form
│   │   │   ├── StatusBadge.tsx     # Colored pill badges for statuses
│   │   │   ├── ui.tsx              # Input, button, select primitives
│   │   │   ├── UploadArea.tsx      # Drag & drop file upload with progress indicator
│   │   │   ├── VehicleCard.tsx     # Vehicle catalog item card
│   │   │   └── VehicleGallery.tsx  # Interactive multi-image photo gallery
│   │   ├── context/
│   │   │   ├── AuthContext.tsx     # User authentication state & session provider
│   │   │   └── ThemeContext.tsx    # Theme provider
│   │   ├── pages/
│   │   │   ├── admin/              # AdminDashboard, Monitoring, Approvals, Users
│   │   │   ├── customer/           # SearchPage, VehicleDetails, Payment, Bookings
│   │   │   ├── owner/              # OwnerDashboard, VehicleForm, Availability, Earnings
│   │   │   └── public/             # LandingPage, GetStarted, LoginPage, RegisterPage
│   │   ├── routes/
│   │   │   └── ProtectedRoute.tsx  # Role-based route authorization guard
│   │   ├── App.tsx                 # Client routing table and theme provider
│   │   ├── index.css               # Crimson & Blush design tokens, utility classes
│   │   └── main.tsx                # React DOM entry point
│   ├── .env.example                # Frontend environment template
│   ├── index.html                  # HTML5 entry with Google Fonts preconnect
│   ├── package.json
│   ├── tailwind.config.js          # Custom colors, typography, and theme extensions
│   ├── tsconfig.json
│   └── vite.config.ts              # Vite server & API proxy configuration
│
└── README.md                       # Comprehensive project documentation
```

---

## 🤝 Contributing & License

Contributions, feedback, and issue reports are warmly welcomed!

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m "feat: add amazing feature"`).
4. Push to your branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <b>RideLocal</b> · Designed and Engineered for Jaipur, Rajasthan 🇮🇳<br>
  <sub>Empowering Local Bike Owners · Providing Unmatched Freedom to Travelers</sub>
</div>
