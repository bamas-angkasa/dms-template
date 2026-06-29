"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, ChevronDown, MapPin, Minus, Plus, Save, ShoppingCart, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ProductImage } from "@/components/ui/product-image";
import { SearchInput } from "@/components/ui/search-input";
import { SectionCard } from "@/components/ui/section-card";
import { createOrder } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { outlets, products } from "@/lib/mock-data";

type Cart = Record<string, number>;
type SubmitState = "idle" | "loading" | "success";

export default function NewOrderPage() {
  const [cart, setCart] = useState<Cart>({ p1: 2, p2: 1, p3: 1 });
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const selected = products.filter((product) => cart[product.id]);
  const subtotal = selected.reduce((sum, product) => sum + product.price * cart[product.id], 0);
  const discount = Math.round(subtotal * 0.03);
  const ppn = Math.round((subtotal - discount) * 0.11);
  const total = subtotal - discount + ppn;
  const filtered = useMemo(() => products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5), [query]);

  function updateQuantity(id: string, delta: number) { setCart((current) => ({ ...current, [id]: Math.max(0, (current[id] || 0) + delta) })); }
  async function submitOrder() {
    setSubmitState("loading");
    try { await createOrder({ OutletID: outlets[0].id, PaymentMethod: "Kredit", Notes: notes, Items: selected.map((product) => ({ ProductID: product.id, ProductName: product.name, Quantity: cart[product.id], Price: product.price, Discount: product.price * cart[product.id] * 0.03 })) }); }
    catch { /* The demo remains usable when the optional API is offline. */ }
    setSubmitState("success");
  }

  return <>
    <PageHeader eyebrow="Sales Order" title="Buat Order Baru" description="SO-260629-021 · 29 Jun 2026" />
    {submitState === "success" && <div className="payment-banner"><Check size={18} /><div><strong>Order berhasil disubmit</strong><span>SO-260629-021 menunggu approval admin.</span></div><button onClick={() => setSubmitState("idle")}>Tutup</button></div>}
    <SectionCard title="Informasi Order"><div className="form-grid">
      <label><span>Sales</span><div className="select-like">Rina Amelia <ChevronDown size={15} /></div></label>
      <label><span>Tanggal Order</span><div className="select-like">29 Jun 2026 <CalendarDays size={15} /></div></label>
      <label className="form-wide"><span>Outlet</span><div className="select-like"><div><b>{outlets[0].name}</b><small><MapPin size={11} />{outlets[0].area}</small></div><ChevronDown size={15} /></div></label>
      <label className="form-wide"><span>Alamat Kirim</span><textarea defaultValue={outlets[0].address} /></label>
      <label><span>Pembayaran</span><div className="select-like">Kredit <ChevronDown size={15} /></div></label>
      <label><span>Tempo</span><div className="select-like">14 Hari <ChevronDown size={15} /></div></label>
      <label className="form-wide"><span>Catatan</span><textarea placeholder="Contoh: kirim sebelum pukul 12.00" value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
    </div></SectionCard>
    <SectionCard title="Tambah Produk" action={<span className="item-count">{selected.length} produk</span>}><SearchInput placeholder="Cari nama atau SKU..." value={query} onChange={setQuery} filter={false} /><div className="product-picker">{filtered.map((product) => <article key={product.id}><ProductImage name={product.name} size="sm" /><div><strong>{product.name}</strong><small>{product.sku} · Stok {product.stock}</small><b>{formatCurrency(product.price)}</b></div><button className={cart[product.id] ? "added" : ""} onClick={() => updateQuantity(product.id, 1)} aria-label={`Tambah ${product.name}`}>{cart[product.id] ? <Check size={17} /> : <Plus size={17} />}</button></article>)}</div></SectionCard>
    <SectionCard title="Keranjang Order"><div className="cart-list">{selected.map((product) => <article key={product.id}><ProductImage name={product.name} size="sm" /><div className="cart-info"><strong>{product.name}</strong><small>{product.sku} · {formatCurrency(product.price)}/karton</small><small style={{ color: "var(--success)" }}>Diskon item 3% · stok tersedia {product.stock}</small><b>{formatCurrency(product.price * cart[product.id] * 0.97)}</b></div><div className="qty-stepper"><button onClick={() => updateQuantity(product.id, -1)} aria-label="Kurangi">{cart[product.id] === 1 ? <Trash2 size={13} /> : <Minus size={13} />}</button><span>{cart[product.id]}</span><button onClick={() => updateQuantity(product.id, 1)} disabled={cart[product.id] >= product.stock} aria-label="Tambah"><Plus size={13} /></button></div></article>)}</div></SectionCard>
    <SectionCard title="Ringkasan Pembayaran"><div className="order-totals"><p><span>Subtotal</span><b>{formatCurrency(subtotal)}</b></p><p className="discount"><span>Diskon 3%</span><b>-{formatCurrency(discount)}</b></p><p><span>PPN 11%</span><b>{formatCurrency(ppn)}</b></p><p><span>Ongkos Kirim</span><b>Gratis</b></p><div><span>Total Pembayaran</span><strong>{formatCurrency(total)}</strong></div></div></SectionCard>
    <div className="sticky-actions"><button className="secondary-button" onClick={() => setSaved(true)}><Save size={17} />{saved ? "Draft Tersimpan" : "Simpan Draft"}</button><button className="primary-button" disabled={submitState === "loading" || selected.length === 0} onClick={submitOrder}><ShoppingCart size={17} />{submitState === "loading" ? "Mengirim..." : "Submit Order"}</button></div>
  </>;
}
