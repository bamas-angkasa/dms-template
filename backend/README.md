# AICE DMS API

Tenant-scoped Go REST API. The current service uses deterministic in-memory demo
data so the frontend and client demo work without infrastructure; PostgreSQL is the
durable local-development database initialized by `db/schema.sql` and `db/seed.sql`.

```bash
go test ./...
go run ./cmd/api
```

All `/api/v1` routes accept `X-Tenant-ID`. It defaults to the pilot tenant
`tenant-aice-mrs-wang`; unknown tenants receive HTTP 403. A bearer token is mocked
for MVP and any supplied authorization header must use the `Bearer` scheme.

Endpoints: `/healthz`, `/api/v1/me`, `/api/v1/tenant/current`, dashboard, products,
outlets, orders (GET/POST), stock, delivery orders, receivables, tax invoices,
tax validation, and XML export.
