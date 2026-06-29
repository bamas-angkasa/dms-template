"use client";

import { useMemo, useState } from "react";
import { AlertCircle, ArrowDownLeft, Ban, CalendarClock, CheckCircle2, CreditCard, FileText, WalletCards } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/format";

type Aging = "Belum Jatuh Tempo" | "1–30 Hari" | "31–60 Hari" | ">60 Hari";
type Receivable = { invoice: string; outlet: string; due: string; amount: number; paid: number; balance: number; aging: Aging; status: "Lancar" | "Jatuh Tempo" | "Terlambat" };
const receivables: Receivable[] = [
  { invoice: "INV-260629-018", outlet: "Toko Sejahtera", due: "13 Jul 2026", amount: 2844000, paid: 0, balance: 2844000, aging: "Belum Jatuh Tempo", status: "Lancar" },
  { invoice: "INV-260615-044", outlet: "Sumber Rejeki Mart", due: "29 Jun 2026", amount: 6240000, paid: 2000000, balance: 4240000, aging: "1–30 Hari", status: "Jatuh Tempo" },
  { invoice: "INV-260528-031", outlet: "Prima Swalayan", due: "11 Jun 2026", amount: 8400000, paid: 2800000, balance: 5600000, aging: "1–30 Hari", status: "Terlambat" },
  { invoice: "INV-260501-012", outlet: "Cahaya Mini Market", due: "15 Mei 2026", amount: 12800000, paid: 4000000, balance: 8800000, aging: "31–60 Hari", status: "Terlambat" },
  { invoice: "INV-260410-006", outlet: "Toko Makmur", due: "24 Apr 2026", amount: 9200000, paid: 1200000, balance: 8000000, aging: ">60 Hari", status: "Terlambat" },
  { invoice: "INV-260626-071", outlet: "Amanah Minimarket", due: "10 Jul 2026", amount: 3987000, paid: 0, balance: 3987000, aging: "Belum Jatuh Tempo", status: "Lancar" },
  { invoice: "INV-260620-055", outlet: "Mega Mart", due: "04 Jul 2026", amount: 5120000, paid: 1500000, balance: 3620000, aging: "Belum Jatuh Tempo", status: "Lancar" },
  { invoice: "INV-260602-021", outlet: "Toko Harapan", due: "16 Jun 2026", amount: 7640000, paid: 5000000, balance: 2640000, aging: "1–30 Hari", status: "Terlambat" },
];
const tone: Record<Receivable["status"], BadgeTone> = { Lancar: "green", "Jatuh Tempo": "yellow", Terlambat: "red" };

export default function ReceivablesPage() {
  const [bucket, setBucket] = useState<"Semua" | Aging>("Semua");
  const [query, setQuery] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const filtered = useMemo(() => receivables.filter((item) => (bucket === "Semua" || item.aging === bucket) && `${item.invoice} ${item.outlet}`.toLowerCase().includes(query.toLowerCase())), [bucket, query]);
  const total = receivables.reduce((sum, item) => sum + item.balance, 0);
  const paid = receivables.reduce((sum, item) => sum + item.paid, 0);

  return <>
    <PageHeader eyebrow="Keuangan" title="Piutang & Pembayaran" description="Kendalikan arus kas dan limit kredit outlet." action={<button className="icon-button primary" aria-label="Catat pembayaran" onClick={() => setPaymentOpen(!paymentOpen)}><ArrowDownLeft size={19} /></button>} />
    {paymentOpen && <div className="payment-banner"><CheckCircle2 size={18} /><div><strong>Form pembayaran siap</strong><span>Pilih invoice dari daftar untuk mencatat pembayaran masuk.</span></div><button onClick={() => setPaymentOpen(false)}>Tutup</button></div>}
    <div className="metric-grid">
      <MetricCard label="Total Piutang" value={formatCurrency(total, true)} icon={WalletCards} />
      <MetricCard label="Jatuh Tempo Minggu Ini" value="Rp 18,6 jt" icon={CalendarClock} tone="yellow" />
      <MetricCard label="Outlet Diblokir" value="2 Outlet" icon={Ban} tone="red" />
      <MetricCard label="Pembayaran Hari Ini" value="Rp 12,8 jt" detail="6 transaksi" icon={ArrowDownLeft} tone="green" />
    </div>
    <div className="finance-grid">
      <SectionCard title="Aging Piutang" action={<button className="text-button">Jun 2026 ▾</button>}>
        <div className="aging-chart">{[
          ["Belum JT", 23.4, 56, "blue"], ["1–30 Hari", 16.7, 40, "yellow"], ["31–60 Hari", 8.8, 21, "orange"], [">60 Hari", 8, 19, "red"],
        ].map(([label, value, height, color]) => <div key={String(label)}><b>{formatCurrency(Number(value) * 1000000, true)}</b><i className={String(color)} style={{ height: `${height}%` }} /><span>{label}</span></div>)}</div>
      </SectionCard>
      <SectionCard title="Progress Penagihan">
        <div className="collection-progress"><div className="progress-ring"><div><strong>68%</strong><span>Tertagih</span></div></div><div><p><span>Target Bulan Ini</span><b>Rp 125 jt</b></p><p><span>Sudah Tertagih</span><b className="success">Rp 85 jt</b></p><p><span>Sisa Target</span><b>Rp 40 jt</b></p></div></div>
      </SectionCard>
    </div>
    <SearchInput placeholder="Cari invoice atau outlet..." value={query} onChange={setQuery} />
    <div className="filter-chips">{(["Semua", "Belum Jatuh Tempo", "1–30 Hari", "31–60 Hari", ">60 Hari"] as const).map((item) => <button key={item} className={`filter-chip ${bucket === item ? "active" : ""}`} onClick={() => setBucket(item)}>{item}</button>)}</div>
    <SectionCard title={`Daftar Piutang (${filtered.length})`} action={<button className="text-button">Urutkan ▾</button>}>
      <div className="receivable-list">{filtered.map((item) => <article key={item.invoice}>
        <div className="invoice-icon"><FileText size={18} /></div><div className="receivable-main"><div><strong>{item.outlet}</strong><StatusBadge tone={tone[item.status]}>{item.status}</StatusBadge></div><p>{item.invoice} · Jatuh tempo {item.due}</p><div className="invoice-progress"><i style={{ width: `${Math.round(item.paid / item.amount * 100)}%` }} /></div><small>Terbayar {formatCurrency(item.paid, true)} dari {formatCurrency(item.amount, true)}</small></div><div className="receivable-balance"><span>Saldo</span><b>{formatCurrency(item.balance, true)}</b><em>{item.aging}</em></div>
      </article>)}</div>
    </SectionCard>
    <div className="finance-grid">
      <SectionCard title="Pembayaran Terbaru"><div className="payment-list">{[
        ["Toko Sejahtera", "TRX-260629-009", 4800000, "10:24"], ["Maju Bersama", "TRX-260629-008", 3000000, "09:15"], ["Mega Mart", "TRX-260629-007", 5000000, "08:42"],
      ].map(([name, no, value, time]) => <article key={String(no)}><div className="payment-icon"><CreditCard size={16} /></div><div><strong>{name}</strong><span>{no} · {time}</span></div><b>+{formatCurrency(Number(value), true)}</b></article>)}</div></SectionCard>
      <SectionCard title="Peringatan Limit Kredit"><div className="credit-alerts"><article><AlertCircle /><div><strong>Prima Swalayan</strong><span>Limit terpakai 96% · Rp 19,2 jt dari Rp 20 jt</span></div></article><article><AlertCircle /><div><strong>Cahaya Mini Market</strong><span>Limit terpakai 88% · Rp 13,2 jt dari Rp 15 jt</span></div></article></div></SectionCard>
    </div>
  </>;
}
