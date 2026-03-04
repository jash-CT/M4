# Logistics & Supply Chain Platform

Production-ready codebase for **warehouse management**, **carrier integrations**, **route optimization**, **customs and compliance**, **real-time tracking**, and **vendor portals**.

## Stack

- **Monorepo**: npm workspaces (`packages/api`, `packages/web`, `packages/shared`)
- **API**: NestJS (Node.js), Prisma (PostgreSQL), JWT auth, WebSockets (Socket.IO)
- **Web**: Next.js (React), vendor portal and admin dashboard
- **Shared**: TypeScript types and constants used by API and web

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or use Docker for DB only)

### 1. Install and database

```bash
npm install
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string.
```

### 2. Database migrations and seed

```bash
npm run db:generate   # Prisma client (run from repo root or packages/api)
cd packages/api && npx prisma migrate dev --name init
cd packages/api && npm run db:seed
```

### 3. Run API and Web

```bash
# Terminal 1 – API
npm run dev:api

# Terminal 2 – Web
npm run dev:web
```

- **API**: http://localhost:3001/api  
- **Web**: http://localhost:3000  
- **Health**: http://localhost:3001/api/health  

### 4. Default credentials (from seed)

| Role   | Login                    | Password   |
|--------|--------------------------|------------|
| Admin  | admin@logistics.local    | admin123   |
| Vendor | Vendor code: **VENDOR01**, Email: portal@acme.example | vendor123 |

---

## Docker

Run API + PostgreSQL only:

```bash
docker-compose up -d db
# Set DATABASE_URL in .env to postgresql://logistics:logistics@localhost:5432/logistics
npm run dev:api
```

Run full stack (API + DB; web can be run locally for dev):

```bash
docker-compose up --build
# API: http://localhost:3001/api
# Run web locally: npm run dev:web
```

---

## Features

### Warehouse management

- **Warehouses**: CRUD, zones (receiving, storage, picking, shipping, quarantine), capacity
- **Inventory**: SKU-level stock, reservations, lot/expiry, location codes
- **Receiving orders**: Vendor PO, expected/received dates, line-level receiving
- **Shipment orders**: Allocate → pick → pack → ship, carrier and tracking link

**API**: `GET /api/warehouses`, `GET /api/warehouses/:id`, `GET /api/warehouses/:id/inventory`, `GET /api/warehouses/:id/receiving-orders`, `GET /api/warehouses/:id/shipment-orders`

### Carrier integrations

- **Adapter pattern**: Register carrier adapters (stub included; extend for FedEx, UPS, DHL, etc.)
- **Rates**: `POST /api/carriers/:id/rates` with origin, destination, parcels
- **Create shipment**: `POST /api/carriers/:id/shipments` returns tracking number and label URL
- **Tracking**: Optional `getTracking(trackingNumber)` on adapter; persisted events in DB

**API**: `GET /api/carriers`, `GET /api/carriers/:id`, `POST /api/carriers/:id/rates`, `POST /api/carriers/:id/shipments`

### Route optimization

- **TSP-style optimization**: Nearest-neighbor heuristic from depot with optional time windows and service times
- **API**: `POST /api/routes/optimize` (depot + stops) → suggested sequence; `POST /api/routes` to save a route
- **Routes list**: `GET /api/routes`, `GET /api/routes/:id`

### Customs and compliance

- **Rules**: Per-country import/export/transit rules and required document types
- **Customs declarations**: Per shipment (country of export/import, Incoterm, line items with HS codes)
- **Documents**: Attach compliance documents (commercial invoice, packing list, etc.) and submit for review

**API**: `GET /api/compliance/rules`, `GET /api/compliance/declarations/shipment/:shipmentId`, `POST /api/compliance/declarations`, `POST /api/compliance/declarations/:id/documents`, `POST /api/compliance/declarations/:id/submit`

### Real-time tracking

- **REST**: `GET /api/tracking/by-number/:trackingNumber` (public), `GET /api/tracking/shipment/:shipmentId` (auth)
- **WebSocket**: Connect to `/api/ws` and subscribe to `tracking` events by tracking number or shipment ID (see `TrackingGateway`)

### Vendor portals

- **Auth**: `POST /api/auth/vendor/login` (vendorCode, email, password) → JWT with `type: 'vendor'`
- **Vendor-only routes**: Profile, receiving orders (list and detail) scoped to the vendor

**API**: `GET /api/vendor/profile`, `GET /api/vendor/receiving-orders`, `GET /api/vendor/receiving-orders/:orderId` (all require vendor JWT)

---

## Project layout

```
logistics-platform/
├── package.json                 # Workspace root
├── docker-compose.yml
├── .env.example
├── packages/
│   ├── shared/                  # Types and constants
│   │   └── src/
│   │       ├── types/           # warehouse, carrier, shipment, route, compliance, vendor, tracking
│   │       └── constants.ts
│   ├── api/                     # NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── auth/            # JWT, vendor vs admin
│   │       ├── warehouse/
│   │       ├── carrier/         # Registry + stub adapter
│   │       ├── route/          # Optimization + CRUD
│   │       ├── compliance/
│   │       ├── tracking/       # REST + WebSocket gateway
│   │       ├── vendor/
│   │       └── health/
│   └── web/                     # Next.js frontend
│       └── src/
│           ├── pages/           # index, tracking, login, vendor/*, admin/*
│           ├── components/
│           └── lib/api.ts
```

---

## Production checklist

1. **Environment**: Set `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN` in production.
2. **Migrations**: Run `npx prisma migrate deploy` in the API container or release step.
3. **Carriers**: Implement real adapters (e.g. FedEx, UPS) by implementing `ICarrierAdapter` and registering in `CarrierModule`.
4. **Rate limiting / security**: Add throttling and helmet on the API; keep vendor and admin routes behind auth.
5. **Real-time**: Ensure WebSocket path (`/api/ws`) is reachable through your reverse proxy if you use one.

---

## License

MIT
