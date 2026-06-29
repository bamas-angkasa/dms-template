CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(160) NOT NULL, slug varchar(100) NOT NULL UNIQUE,
  logo_url text, primary_color varchar(16) NOT NULL DEFAULT '#001F6B', secondary_color varchar(16) NOT NULL DEFAULT '#0057FF',
  status varchar(30) NOT NULL DEFAULT 'active', plan varchar(60) NOT NULL DEFAULT 'starter', module_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, name varchar(80) NOT NULL,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,name)
);
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, role_id uuid REFERENCES roles(id),
  name varchar(160) NOT NULL, email varchar(180) NOT NULL, password_hash text, phone varchar(40), status varchar(30) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,email)
);
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, name varchar(100) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,name)
);
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, category_id uuid REFERENCES product_categories(id),
  sku varchar(80) NOT NULL, name varchar(180) NOT NULL, category varchar(100), unit varchar(40) NOT NULL DEFAULT 'Karton', price numeric(18,2) NOT NULL DEFAULT 0,
  image_url text, status varchar(40) NOT NULL DEFAULT 'Aktif', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,sku)
);
CREATE TABLE IF NOT EXISTS outlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, code varchar(60) NOT NULL, name varchar(180) NOT NULL,
  area varchar(120), address text, phone varchar(40), npwp_nik varchar(60), nitku varchar(80), gps_lat numeric(10,7), gps_lng numeric(10,7),
  sales_pic_id uuid REFERENCES users(id), credit_limit numeric(18,2) NOT NULL DEFAULT 0, receivable_balance numeric(18,2) NOT NULL DEFAULT 0,
  status varchar(40) NOT NULL DEFAULT 'Aktif', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,code)
);
CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, code varchar(60) NOT NULL, name varchar(160) NOT NULL,
  address text, status varchar(40) NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,code)
);
CREATE TABLE IF NOT EXISTS stock_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, warehouse_id uuid NOT NULL REFERENCES warehouses(id),
  product_id uuid NOT NULL REFERENCES products(id), batch_no varchar(80), available_qty integer NOT NULL DEFAULT 0, minimum_qty integer NOT NULL DEFAULT 0,
  status varchar(40) NOT NULL DEFAULT 'Aman', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,warehouse_id,product_id,batch_no)
);
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, warehouse_id uuid NOT NULL REFERENCES warehouses(id),
  product_id uuid NOT NULL REFERENCES products(id), movement_type varchar(30) NOT NULL, quantity integer NOT NULL, reference_no varchar(80), notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, order_no varchar(80) NOT NULL,
  outlet_id uuid NOT NULL REFERENCES outlets(id), sales_id uuid REFERENCES users(id), order_date date NOT NULL, payment_method varchar(40), due_date date,
  subtotal numeric(18,2) NOT NULL DEFAULT 0, discount numeric(18,2) NOT NULL DEFAULT 0, ppn numeric(18,2) NOT NULL DEFAULT 0,
  shipping_fee numeric(18,2) NOT NULL DEFAULT 0, total numeric(18,2) NOT NULL DEFAULT 0, status varchar(50) NOT NULL DEFAULT 'Draft', notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,order_no)
);
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id), qty integer NOT NULL, price numeric(18,2) NOT NULL, discount numeric(18,2) NOT NULL DEFAULT 0,
  subtotal numeric(18,2) NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS delivery_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, do_no varchar(80) NOT NULL,
  order_id uuid NOT NULL REFERENCES orders(id), outlet_id uuid NOT NULL REFERENCES outlets(id), driver_id uuid REFERENCES users(id), vehicle varchar(60),
  scheduled_at timestamptz, status varchar(50) NOT NULL DEFAULT 'Siap Kirim', pod_status varchar(50) NOT NULL DEFAULT 'Menunggu', pod_url text, delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,do_no)
);
CREATE TABLE IF NOT EXISTS delivery_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  delivery_order_id uuid NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE, product_id uuid NOT NULL REFERENCES products(id), qty integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS receivables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, invoice_no varchar(80) NOT NULL,
  outlet_id uuid NOT NULL REFERENCES outlets(id), order_id uuid NOT NULL REFERENCES orders(id), invoice_date date NOT NULL, due_date date NOT NULL,
  amount numeric(18,2) NOT NULL, paid_amount numeric(18,2) NOT NULL DEFAULT 0, balance numeric(18,2) NOT NULL,
  aging_bucket varchar(40) NOT NULL, status varchar(40) NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,invoice_no)
);
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, receivable_id uuid NOT NULL REFERENCES receivables(id),
  payment_no varchar(80) NOT NULL, payment_date date NOT NULL, amount numeric(18,2) NOT NULL, method varchar(50), reference_no varchar(100),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,payment_no)
);
CREATE TABLE IF NOT EXISTS tax_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, invoice_no varchar(80) NOT NULL,
  outlet_id uuid NOT NULL REFERENCES outlets(id), npwp_nik varchar(60), nitku varchar(80), dpp numeric(18,2) NOT NULL, ppn numeric(18,2) NOT NULL,
  total numeric(18,2) NOT NULL, validation_status varchar(40) NOT NULL DEFAULT 'Belum Validasi', export_status varchar(40) NOT NULL DEFAULT 'Belum', exported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,invoice_no)
);
CREATE TABLE IF NOT EXISTS tax_export_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, file_name varchar(200) NOT NULL,
  period varchar(20) NOT NULL, invoice_count integer NOT NULL, status varchar(40) NOT NULL, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, user_id uuid REFERENCES users(id),
  module varchar(60) NOT NULL, action varchar(100) NOT NULL, entity_type varchar(80), entity_id uuid, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_outlets_tenant_area ON outlets(tenant_id,area);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_date ON orders(tenant_id,order_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_tenant_product ON stock_items(tenant_id,product_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tenant_schedule ON delivery_orders(tenant_id,scheduled_at);
CREATE INDEX IF NOT EXISTS idx_receivables_tenant_due ON receivables(tenant_id,due_date);
CREATE INDEX IF NOT EXISTS idx_tax_tenant_status ON tax_invoices(tenant_id,validation_status,export_status);
