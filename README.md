# AICE Distributor DMS

Mobile-first, multi-tenant-ready Distributor Management System for the pilot tenant
**AICE Distributor - Mrs Wang**. The repository contains a polished Next.js PWA,
a tenant-scoped Go REST API, PostgreSQL schema and realistic seed data, plus a local
Docker Compose stack.

## Included modules

- Dashboard with sales KPIs, lightweight charts, order and delivery summaries
- Interactive Sales Order form with cart, discount, PPN, notes, draft and submit
- Outlet master data with credit usage, tax identity, location and activity
- Real-time stock cards, movements, restock alerts and warehouse distribution
- Delivery orders with route preview, driver/vehicle status and POD tracking
- Receivables aging, collection progress, payments and credit-limit alerts
- Tax validation with working XML/CSV generation and export history
- Product catalog with search, filters, stock health and promotion preview
- Reports, tenant branding, module toggles and role/security settings preview
- Four-screen Android/Infinix client showcase at `/preview/android`
- Installable PWA manifest, local icons, shortcuts and offline application shell
- Go API with all requested `/api/v1` endpoints and tenant isolation
- 18-table PostgreSQL schema and realistic pilot seed dataset

## Run the frontend

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Open:

- Application: <http://localhost:3000/dashboard>
- Client presentation: <http://localhost:3000/preview/android>

The frontend automatically uses typed mock data if `NEXT_PUBLIC_API_URL` is not
configured or the API is unavailable. The header displays **Demo** or **Live** to
make the active data source explicit.

## Run the complete stack

Requirements: Docker with Compose.

```bash
cp .env.example .env
docker compose up --build
```

Services:

- Web/PWA: <http://localhost:3000>
- REST API: <http://localhost:8080/api/v1>
- Health check: <http://localhost:8080/healthz>
- PostgreSQL: `localhost:5432` (`aice_dms` by default)

The PostgreSQL container initializes [schema.sql](backend/db/schema.sql) and
[seed.sql](backend/db/seed.sql) on its first clean volume start.

## Run the API directly

Requirements: Go 1.23+.

```bash
cd backend
go test ./...
go run ./cmd/api
```

All business endpoints accept `X-Tenant-ID`. The pilot ID is
`tenant-aice-mrs-wang`; unknown tenants receive HTTP 403. Authentication is an MVP
bearer-session mock, while tenant and role boundaries are represented in both code
and database design.

## Verification

```bash
npm run typecheck
npm run build
cd backend && go test ./... && go vet ./...
```

If a dev server is already using `.next`, verify a production build without cache
contention in PowerShell:

```powershell
$env:NEXT_DIST_DIR = '.next-build'
npm run build
```

## Repository structure

```text
src/app/                 Next.js routes and mobile-first pages
src/components/layout/   top bar, bottom navigation, desktop sidebar
src/components/ui/       reusable cards, badges, charts, search, product image
src/lib/                 typed mock data, tenant config, API fallback client
src/styles/              feature-oriented responsive styles
public/                  PWA manifest, service worker and local icons
backend/cmd/api/          Go API entrypoint
backend/internal/         config, tenant middleware, models, store and handlers
backend/db/               PostgreSQL schema and pilot seed
docs/                    phased implementation and continuation record
```

## Deliberate MVP boundaries

- The API uses deterministic in-memory data for instant demos; PostgreSQL schema and
  seed are ready for the next persistence-adapter iteration.
- Authentication is mocked; production should add signed JWT/session storage and
  password hashing.
- Tax XML is a safe export simulation. There is intentionally no direct DJP/Coretax
  integration yet.
- Product visuals are local branded placeholders, so runtime has no external-image
  dependency.

See [PROJECT_PROGRESS.md](docs/PROJECT_PROGRESS.md) for feature commits, proof of
verification, and recommended production-hardening work.
