package httpapi

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"net/http"
	"time"

	"github.com/aice-distributor/dms-api/internal/middleware"
	"github.com/aice-distributor/dms-api/internal/model"
	"github.com/aice-distributor/dms-api/internal/store"
)

type API struct {
	store       *store.Memory
	frontendURL string
}

func New(store *store.Memory, frontendURL string) http.Handler {
	api := &API{store: store, frontendURL: frontendURL}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", api.health)
	mux.HandleFunc("GET /api/v1/me", api.me)
	mux.HandleFunc("GET /api/v1/tenant/current", api.currentTenant)
	mux.HandleFunc("GET /api/v1/dashboard/summary", api.dashboard)
	mux.HandleFunc("GET /api/v1/products", api.products)
	mux.HandleFunc("GET /api/v1/outlets", api.outlets)
	mux.HandleFunc("GET /api/v1/orders", api.orders)
	mux.HandleFunc("POST /api/v1/orders", api.createOrder)
	mux.HandleFunc("GET /api/v1/stock", api.stock)
	mux.HandleFunc("GET /api/v1/delivery-orders", api.deliveries)
	mux.HandleFunc("GET /api/v1/receivables", api.receivables)
	mux.HandleFunc("GET /api/v1/tax/invoices", api.taxInvoices)
	mux.HandleFunc("POST /api/v1/tax/validate", api.validateTax)
	mux.HandleFunc("POST /api/v1/tax/export-xml", api.exportTaxXML)
	return api.cors(middleware.Tenant(mux))
}

func (a *API) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", a.frontendURL)
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Tenant-ID")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Vary", "Origin")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
func (a *API) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "service": "aice-dms-api", "time": time.Now().UTC()})
}
func (a *API) me(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, a.store.Users[0])
}
func (a *API) currentTenant(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, a.store.Tenant)
}
func (a *API) products(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, envelope(a.store.Products, len(a.store.Products)))
}
func (a *API) outlets(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, envelope(a.store.Outlets, len(a.store.Outlets)))
}
func (a *API) orders(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, envelope(a.store.Orders, len(a.store.Orders)))
}
func (a *API) stock(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, envelope(a.store.Stock, len(a.store.Stock)))
}
func (a *API) deliveries(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, envelope(a.store.Deliveries, len(a.store.Deliveries)))
}
func (a *API) receivables(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, envelope(a.store.Receivables, len(a.store.Receivables)))
}
func (a *API) taxInvoices(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, envelope(a.store.TaxInvoices, len(a.store.TaxInvoices)))
}
func (a *API) dashboard(w http.ResponseWriter, _ *http.Request) {
	recent := a.store.Orders
	if len(recent) > 4 {
		recent = recent[len(recent)-4:]
	}
	writeJSON(w, http.StatusOK, model.DashboardSummary{RevenueToday: 28400000, IncomingOrders: 48, ActiveOutlets: 186, LowStock: 7, SalesTrend: []int{42, 55, 48, 67, 58, 76, 84}, OrderStatus: map[string]int{"processing": 18, "delivered": 22, "waiting": 6, "cancelled": 2}, RecentOrders: recent})
}

func (a *API) createOrder(w http.ResponseWriter, r *http.Request) {
	var order model.Order
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		writeError(w, http.StatusBadRequest, "payload order tidak valid")
		return
	}
	if order.OutletID == "" || len(order.Items) == 0 {
		writeError(w, http.StatusUnprocessableEntity, "outlet dan minimal satu item wajib diisi")
		return
	}
	order.TenantID = middleware.TenantID(r.Context())
	order.OrderDate = time.Now()
	if order.DueDate.IsZero() {
		order.DueDate = order.OrderDate.AddDate(0, 0, 14)
	}
	for i := range order.Items {
		order.Items[i].TenantID = order.TenantID
		order.Items[i].Subtotal = float64(order.Items[i].Quantity)*order.Items[i].Price - order.Items[i].Discount
		order.Subtotal += order.Items[i].Subtotal
	}
	order.PPN = (order.Subtotal - order.Discount) * .11
	order.Total = order.Subtotal - order.Discount + order.PPN + order.ShippingFee
	created := a.store.AddOrder(order)
	writeJSON(w, http.StatusCreated, created)
}
func (a *API) validateTax(w http.ResponseWriter, _ *http.Request) {
	valid, invalid := 0, 0
	for _, item := range a.store.TaxInvoices {
		if item.NPWPNIK == "" || item.NITKU == "" {
			invalid++
		} else {
			valid++
		}
	}
	writeJSON(w, http.StatusOK, map[string]any{"valid": valid, "invalid": invalid, "checked_at": time.Now().UTC()})
}

type exportRequest struct {
	InvoiceIDs []string `json:"invoice_ids"`
}
type xmlInvoice struct {
	XMLName xml.Name `xml:"Faktur"`
	Number  string   `xml:"Nomor"`
	NPWP    string   `xml:"NPWP"`
	NITKU   string   `xml:"NITKU"`
	DPP     float64  `xml:"DPP"`
	PPN     float64  `xml:"PPN"`
	Total   float64  `xml:"Total"`
}
type xmlExport struct {
	XMLName  xml.Name     `xml:"FakturPajak"`
	Tenant   string       `xml:"tenant,attr"`
	Period   string       `xml:"periode,attr"`
	Invoices []xmlInvoice `xml:"Faktur"`
}

func (a *API) exportTaxXML(w http.ResponseWriter, r *http.Request) {
	var req exportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || len(req.InvoiceIDs) == 0 {
		writeError(w, http.StatusBadRequest, "invoice_ids wajib diisi")
		return
	}
	selected := map[string]bool{}
	for _, id := range req.InvoiceIDs {
		selected[id] = true
	}
	payload := xmlExport{Tenant: a.store.Tenant.Name + " - Mrs Wang", Period: time.Now().Format("2006-01")}
	for _, item := range a.store.TaxInvoices {
		if selected[item.ID] && item.ValidationStatus == "Valid" {
			payload.Invoices = append(payload.Invoices, xmlInvoice{Number: item.InvoiceNo, NPWP: item.NPWPNIK, NITKU: item.NITKU, DPP: item.DPP, PPN: item.PPN, Total: item.Total})
		}
	}
	if len(payload.Invoices) == 0 {
		writeError(w, http.StatusUnprocessableEntity, "tidak ada invoice valid yang dipilih")
		return
	}
	body, err := xml.MarshalIndent(payload, "", "  ")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "gagal membuat XML")
		return
	}
	a.store.MarkTaxExported(req.InvoiceIDs)
	w.Header().Set("Content-Type", "application/xml")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=faktur-pajak-%s.xml", payload.Period))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(append([]byte(xml.Header), body...))
}

func envelope(data any, total int) map[string]any {
	return map[string]any{"data": data, "meta": map[string]int{"total": total}}
}
func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]any{"error": message, "status": status})
}
