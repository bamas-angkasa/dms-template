package store

import (
	"fmt"
	"sync"
	"time"

	"github.com/aice-distributor/dms-api/internal/model"
)

type Memory struct {
	mu          sync.RWMutex
	Tenant      model.Tenant
	Users       []model.User
	Products    []model.Product
	Outlets     []model.Outlet
	Orders      []model.Order
	Stock       []model.StockItem
	Deliveries  []model.DeliveryOrder
	Receivables []model.Receivable
	TaxInvoices []model.TaxInvoice
}

func NewMemory() *Memory {
	tenantID := model.PilotTenantID
	s := &Memory{Tenant: model.Tenant{ID: tenantID, Name: "AICE Distributor", Slug: "aice-mrs-wang", PrimaryColor: "#001F6B", SecondaryColor: "#0057FF", Status: "active", Plan: "Pilot Pro", Modules: map[string]bool{"dashboard": true, "products": true, "outlets": true, "orders": true, "stock": true, "delivery": true, "receivables": true, "tax": true, "reports": true}}}
	s.Users = []model.User{{ID: "usr-admin", TenantID: tenantID, Name: "Mrs Wang", Email: "mrs.wang@aice-distributor.id", Role: "owner_admin"}, {ID: "usr-sales-1", TenantID: tenantID, Name: "Rina Amelia", Email: "rina@aice-distributor.id", Role: "sales"}, {ID: "usr-sales-2", TenantID: tenantID, Name: "Budi Santoso", Email: "budi@aice-distributor.id", Role: "sales"}, {ID: "usr-driver-1", TenantID: tenantID, Name: "Andi Saputra", Email: "andi@aice-distributor.id", Role: "driver"}}
	productNames := []string{"AICE Nanas 65g", "AICE Mochi Vanilla 45g", "AICE Chocolate Crispy 60g", "AICE Sweet Corn 60g", "AICE Milk Melon 55g", "AICE Mango Slushy 60ml", "AICE Mochi Green Tea 30g", "AICE Miki-Miki 90ml", "AICE Strawberry Crispy", "AICE Coffee Crispy", "AICE Sundae Chocolate", "AICE Two Colors"}
	for i, name := range productNames {
		stock := 18 + (i*17)%137
		status := "Aktif"
		if stock < 35 {
			status = "Stok Kritis"
		}
		s.Products = append(s.Products, model.Product{ID: fmt.Sprintf("prd-%02d", i+1), TenantID: tenantID, SKU: fmt.Sprintf("AIC-%03d", 101+i), Name: name, Category: []string{"Stick", "Mochi", "Cup", "Cone"}[i%4], Unit: "Karton", Price: 72000 + float64(i*6000), Stock: stock, MinimumStock: 35, Status: status})
	}
	outletNames := []string{"Toko Sejahtera", "Sumber Rejeki Mart", "Maju Bersama", "Amanah Minimarket", "Toko Makmur", "Prima Swalayan", "Toko Harapan", "Mega Mart", "Berkah Jaya", "Toko Melati", "Sinar Baru", "Family Mart", "Rizki Abadi", "Toko Sentosa", "Cahaya Mini Market", "Toko Barokah", "Bintang Swalayan", "Toko Indah", "Kurnia Mart", "Sahabat Kita"}
	for i, name := range outletNames {
		s.Outlets = append(s.Outlets, model.Outlet{ID: fmt.Sprintf("out-%02d", i+1), TenantID: tenantID, Code: fmt.Sprintf("OUT-%03d", i+1), Name: name, Area: []string{"Jakarta Barat", "Tangerang", "Jakarta Utara", "Bekasi"}[i%4], Address: fmt.Sprintf("Jl. Raya Distributor No. %d", 12+i), Phone: fmt.Sprintf("0812-3456-%04d", 1000+i), NPWPNIK: fmt.Sprintf("31.728.%03d.2-401.000", 100+i), NITKU: fmt.Sprintf("NITKU-401-%03d", 100+i), GPS: fmt.Sprintf("-6.%d, 106.%d", 170+i, 740+i), SalesPIC: []string{"Rina Amelia", "Budi Santoso", "Dimas Pratama"}[i%3], CreditLimit: 15000000 + float64(i%4)*5000000, ReceivableBalance: float64(i%5) * 2800000, Status: "Aktif"})
	}
	now := time.Date(2026, 6, 29, 10, 30, 0, 0, time.Local)
	for i := 0; i < 20; i++ {
		outlet := s.Outlets[i%len(s.Outlets)]
		subtotal := float64(1200000 + i*137000)
		discount := subtotal * .03
		ppn := (subtotal - discount) * .11
		order := model.Order{ID: fmt.Sprintf("ord-%02d", i+1), TenantID: tenantID, OrderNo: fmt.Sprintf("SO-2606-%03d", i+1), OutletID: outlet.ID, OutletName: outlet.Name, SalesID: "usr-sales-1", SalesName: "Rina Amelia", OrderDate: now.AddDate(0, 0, -i), DueDate: now.AddDate(0, 0, 14-i), PaymentMethod: "Kredit", Subtotal: subtotal, Discount: discount, PPN: ppn, Total: subtotal - discount + ppn, Status: []string{"Menunggu Approval", "Diproses Gudang", "Siap Kirim", "Terkirim"}[i%4]}
		order.Items = []model.OrderItem{{ID: fmt.Sprintf("itm-%02d", i+1), TenantID: tenantID, ProductID: s.Products[i%12].ID, ProductName: s.Products[i%12].Name, Quantity: 2 + i%4, Price: s.Products[i%12].Price, Subtotal: s.Products[i%12].Price * float64(2+i%4)}}
		s.Orders = append(s.Orders, order)
		receivable := model.Receivable{ID: fmt.Sprintf("rec-%02d", i+1), TenantID: tenantID, InvoiceNo: fmt.Sprintf("INV-2606-%03d", i+1), OutletID: outlet.ID, OutletName: outlet.Name, OrderID: order.ID, InvoiceDate: order.OrderDate, DueDate: order.DueDate, Amount: order.Total, PaidAmount: order.Total * float64(i%3) / 3, Balance: order.Total * (1 - float64(i%3)/3), AgingBucket: []string{"Belum Jatuh Tempo", "1-30 Hari", "31-60 Hari", ">60 Hari"}[i%4], Status: []string{"Lancar", "Jatuh Tempo", "Terlambat"}[i%3]}
		s.Receivables = append(s.Receivables, receivable)
		tax := model.TaxInvoice{ID: fmt.Sprintf("tax-%02d", i+1), TenantID: tenantID, InvoiceNo: receivable.InvoiceNo, OutletID: outlet.ID, OutletName: outlet.Name, NPWPNIK: outlet.NPWPNIK, NITKU: outlet.NITKU, DPP: order.Subtotal - order.Discount, PPN: order.PPN, Total: order.Total, ValidationStatus: "Valid", ExportStatus: "Belum"}
		if i%7 == 0 {
			tax.NPWPNIK = ""
			tax.ValidationStatus = "Invalid"
		}
		s.TaxInvoices = append(s.TaxInvoices, tax)
	}
	for i, p := range s.Products {
		s.Stock = append(s.Stock, model.StockItem{ID: fmt.Sprintf("stk-%02d", i+1), TenantID: tenantID, WarehouseID: fmt.Sprintf("wh-%d", i%2+1), WarehouseName: []string{"Gudang Utama Tangerang", "Gudang Jakarta Barat"}[i%2], ProductID: p.ID, ProductName: p.Name, SKU: p.SKU, BatchNo: fmt.Sprintf("B2606-%02d", i+1), AvailableQty: p.Stock, MinimumQty: p.MinimumStock, Status: p.Status})
	}
	for i := 0; i < 10; i++ {
		order := s.Orders[i]
		outlet := s.Outlets[i]
		s.Deliveries = append(s.Deliveries, model.DeliveryOrder{ID: fmt.Sprintf("del-%02d", i+1), TenantID: tenantID, DONo: fmt.Sprintf("DO-2606-%03d", i+1), OrderID: order.ID, OutletID: outlet.ID, OutletName: outlet.Name, DriverID: fmt.Sprintf("driver-%d", i%3+1), DriverName: []string{"Andi Saputra", "Rizal Maulana", "Fajar Hidayat"}[i%3], Vehicle: []string{"B 9124 KCD", "B 8831 UYT", "B 7012 XZA"}[i%3], ScheduledAt: now.Add(time.Duration(i) * time.Hour), Status: []string{"Siap Kirim", "Dalam Perjalanan", "Terkirim", "Gagal"}[i%4], PODStatus: []string{"Menunggu", "Menunggu", "Tersedia", "Tidak Ada"}[i%4]})
	}
	return s
}

func (s *Memory) AddOrder(order model.Order) model.Order {
	s.mu.Lock()
	defer s.mu.Unlock()
	order.ID = fmt.Sprintf("ord-%02d", len(s.Orders)+1)
	order.OrderNo = fmt.Sprintf("SO-2606-%03d", len(s.Orders)+1)
	order.TenantID = model.PilotTenantID
	order.Status = "Menunggu Approval"
	s.Orders = append(s.Orders, order)
	return order
}
func (s *Memory) MarkTaxExported(ids []string) int {
	s.mu.Lock()
	defer s.mu.Unlock()
	selected := map[string]bool{}
	for _, id := range ids {
		selected[id] = true
	}
	count := 0
	now := time.Now()
	for i := range s.TaxInvoices {
		if selected[s.TaxInvoices[i].ID] && s.TaxInvoices[i].ValidationStatus == "Valid" {
			s.TaxInvoices[i].ExportStatus = "Sudah"
			s.TaxInvoices[i].ExportedAt = &now
			count++
		}
	}
	return count
}
