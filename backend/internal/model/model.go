package model

import "time"

const PilotTenantID = "tenant-aice-mrs-wang"

type Tenant struct { ID, Name, Slug, LogoURL, PrimaryColor, SecondaryColor, Status, Plan string; Modules map[string]bool `json:"modules"` }
type User struct { ID, TenantID, Name, Email, Role string }
type Product struct { ID, TenantID, SKU, Name, Category, Unit, ImageURL, Status string; Price float64; Stock, MinimumStock int }
type Outlet struct { ID, TenantID, Code, Name, Area, Address, Phone, NPWPNIK, NITKU, GPS, SalesPIC, Status string; CreditLimit, ReceivableBalance float64 }
type OrderItem struct { ID, TenantID, ProductID, ProductName string; Quantity int; Price, Discount, Subtotal float64 }
type Order struct { ID, TenantID, OrderNo, OutletID, OutletName, SalesID, SalesName, PaymentMethod, Status, Notes string; OrderDate, DueDate time.Time; Subtotal, Discount, PPN, ShippingFee, Total float64; Items []OrderItem }
type StockItem struct { ID, TenantID, WarehouseID, WarehouseName, ProductID, ProductName, SKU, BatchNo, Status string; AvailableQty, MinimumQty int }
type DeliveryOrder struct { ID, TenantID, DONo, OrderID, OutletID, OutletName, DriverID, DriverName, Vehicle, Status, PODStatus string; ScheduledAt time.Time }
type Receivable struct { ID, TenantID, InvoiceNo, OutletID, OutletName, OrderID, AgingBucket, Status string; InvoiceDate, DueDate time.Time; Amount, PaidAmount, Balance float64 }
type TaxInvoice struct { ID, TenantID, InvoiceNo, OutletID, OutletName, NPWPNIK, NITKU, ValidationStatus, ExportStatus string; DPP, PPN, Total float64; ExportedAt *time.Time }
type DashboardSummary struct { RevenueToday float64 `json:"revenue_today"`; IncomingOrders, ActiveOutlets, LowStock int; SalesTrend []int; OrderStatus map[string]int; RecentOrders []Order }
