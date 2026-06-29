package httpapi

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/aice-distributor/dms-api/internal/model"
	"github.com/aice-distributor/dms-api/internal/store"
)

func TestCoreEndpointsAndTenantIsolation(t *testing.T) {
	handler := New(store.NewMemory(), "http://localhost:3000")
	for _, path := range []string{"/healthz", "/api/v1/me", "/api/v1/tenant/current", "/api/v1/dashboard/summary", "/api/v1/products", "/api/v1/outlets", "/api/v1/orders", "/api/v1/stock", "/api/v1/delivery-orders", "/api/v1/receivables", "/api/v1/tax/invoices"} {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		req.Header.Set("X-Tenant-ID", model.PilotTenantID)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusOK {
			t.Errorf("GET %s: expected 200, got %d: %s", path, res.Code, res.Body.String())
		}
	}
	req := httptest.NewRequest(http.MethodGet, "/api/v1/products", nil)
	req.Header.Set("X-Tenant-ID", "another-tenant")
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)
	if res.Code != http.StatusForbidden {
		t.Fatalf("expected unknown tenant to be forbidden, got %d", res.Code)
	}
}

func TestCreateOrderAndTaxExport(t *testing.T) {
	handler := New(store.NewMemory(), "http://localhost:3000")
	body := `{"OutletID":"out-01","PaymentMethod":"Kredit","Items":[{"ProductID":"prd-01","Quantity":2,"Price":72000}]}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/orders", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)
	if res.Code != http.StatusCreated {
		t.Fatalf("create order: expected 201, got %d: %s", res.Code, res.Body.String())
	}
	exportBody := `{"invoice_ids":["tax-02","tax-03"]}`
	req = httptest.NewRequest(http.MethodPost, "/api/v1/tax/export-xml", strings.NewReader(exportBody))
	res = httptest.NewRecorder()
	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("tax export: expected 200, got %d: %s", res.Code, res.Body.String())
	}
	if !strings.Contains(res.Body.String(), "FakturPajak") {
		t.Fatal("tax export did not return expected XML")
	}
}
