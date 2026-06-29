"use client";

import { useMemo, useState } from "react";
import { Boxes, CircleDollarSign, Edit3, Package, Plus, Tag, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { ProductImage } from "@/components/ui/product-image";
import { SearchInput } from "@/components/ui/search-input";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/format";
import { products } from "@/lib/mock-data";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [selectedId, setSelectedId] = useState(products[0].id);
  const [promo, setPromo] = useState(false);
  const filtered = useMemo(() => products.filter((product) => (category === "Semua" || product.category === category) && `${product.name} ${product.sku}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  const selected = products.find((product) => product.id === selectedId) ?? filtered[0] ?? products[0];
  return <>
    <PageHeader eyebrow="Master Data" title="Manajemen Produk" description="Kelola harga, status, dan ketersediaan produk AICE." action={<button className="icon-button primary" aria-label="Tambah produk"><Plus size={19} /></button>} />
    <div className="metric-grid product-metrics"><MetricCard label="Total Produk" value="12 SKU" icon={Package} /><MetricCard label="Produk Aktif" value="11 SKU" icon={Boxes} tone="green" /><MetricCard label="Stok Kritis" value="3 SKU" icon={TrendingUp} tone="red" /><MetricCard label="Promo Aktif" value="4 Promo" icon={Tag} tone="purple" /></div>
    <SearchInput placeholder="Cari nama atau SKU produk..." value={query} onChange={setQuery} />
    <div className="filter-chips">{["Semua", "Stick", "Mochi", "Cup", "Cone"].map((item) => <button key={item} className={`filter-chip ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <div className="product-layout">
      <SectionCard title={`Daftar Produk (${filtered.length})`} action={<button className="text-button">Status ▾</button>}>
        <div className="catalog-list">{filtered.map((product) => <button key={product.id} className={product.id === selected.id ? "selected" : ""} onClick={() => setSelectedId(product.id)}><ProductImage name={product.name} /><div className="catalog-info"><div><strong>{product.name}</strong><StatusBadge tone={product.status === "Aktif" ? "green" : product.status === "Stok Kritis" ? "red" : "gray"}>{product.status}</StatusBadge></div><p>{product.sku} · {product.category} · {product.unit}</p><div><b>{formatCurrency(product.price)}</b><span>Stok <strong>{product.stock}</strong></span></div></div></button>)}</div>
      </SectionCard>
      <div>
        <SectionCard title="Detail Produk" action={<button className="text-button"><Edit3 size={13} /> Edit</button>}>
          <div className="product-detail-head"><ProductImage name={selected.name} size="lg" /><div><StatusBadge tone={selected.status === "Aktif" ? "green" : selected.status === "Stok Kritis" ? "red" : "gray"}>{selected.status}</StatusBadge><h3>{selected.name}</h3><p>{selected.sku}</p></div></div>
          <div className="product-detail-grid"><div><span>Kategori</span><b>{selected.category}</b></div><div><span>Satuan Jual</span><b>{selected.unit}</b></div><div><span>Harga Dasar</span><b>{formatCurrency(selected.price)}</b></div><div><span>Stok Tersedia</span><b>{selected.stock} karton</b></div><div><span>Minimum Stok</span><b>{selected.minimumStock} karton</b></div><div><span>PPN</span><b>11%</b></div></div>
          <div className="stock-health"><div><span>Kesehatan Stok</span><b>{selected.stock >= selected.minimumStock ? "Aman" : "Perlu Restock"}</b></div><div><i style={{ width: `${Math.min(selected.stock / (selected.minimumStock * 3) * 100, 100)}%` }} /></div><small>{selected.stock} dari target {selected.minimumStock * 3} karton</small></div>
        </SectionCard>
        <SectionCard title="Preview Harga & Promo">
          <div className={`promo-preview ${promo ? "active" : ""}`}><div><span>Harga jual outlet</span><strong>{formatCurrency(promo ? selected.price * 0.9 : selected.price)}</strong>{promo && <del>{formatCurrency(selected.price)}</del>}</div><div className="promo-sticker">{promo ? "-10%" : "NORMAL"}</div></div>
          <label className="promo-toggle"><div><CircleDollarSign size={17} /><span><strong>Promo outlet aktif</strong><small>Diskon 10% untuk pembelian minimum 5 karton</small></span></div><input type="checkbox" checked={promo} onChange={(event) => setPromo(event.target.checked)} /><i /></label>
        </SectionCard>
        <SectionCard title="Performa 30 Hari"><div className="product-performance"><div><span>Terjual</span><strong>486 karton</strong><small>+18,4%</small></div><div><span>Omzet</span><strong>{formatCurrency(selected.price * 486, true)}</strong><small>+12,1%</small></div></div></SectionCard>
      </div>
    </div>
  </>;
}
