"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, MapPin, Navigation, PackageCheck, Phone, Truck, UserRound } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";

type DeliveryStatus = "Siap Kirim" | "Dalam Perjalanan" | "Terkirim" | "Gagal";
type Delivery = { no: string; outlet: string; address: string; driver: string; vehicle: string; schedule: string; items: number; status: DeliveryStatus; pod: "Tersedia" | "Menunggu" | "Tidak Ada" };

const deliveries: Delivery[] = [
  { no: "DO-260629-012", outlet: "Toko Sejahtera", address: "Kebon Jeruk, Jakarta Barat", driver: "Andi Saputra", vehicle: "B 9124 KCD", schedule: "08:00–10:00", items: 8, status: "Dalam Perjalanan", pod: "Menunggu" },
  { no: "DO-260629-011", outlet: "Sumber Rejeki Mart", address: "Ciledug, Tangerang", driver: "Rizal Maulana", vehicle: "B 8831 UYT", schedule: "09:00–11:00", items: 5, status: "Siap Kirim", pod: "Menunggu" },
  { no: "DO-260629-010", outlet: "Amanah Minimarket", address: "Kelapa Gading, Jakarta Utara", driver: "Andi Saputra", vehicle: "B 9124 KCD", schedule: "07:30–09:00", items: 11, status: "Terkirim", pod: "Tersedia" },
  { no: "DO-260629-009", outlet: "Maju Bersama", address: "Bekasi Barat, Bekasi", driver: "Fajar Hidayat", vehicle: "B 7012 XZA", schedule: "10:00–12:00", items: 7, status: "Dalam Perjalanan", pod: "Menunggu" },
  { no: "DO-260629-008", outlet: "Prima Swalayan", address: "Karawaci, Tangerang", driver: "Rizal Maulana", vehicle: "B 8831 UYT", schedule: "06:30–08:30", items: 4, status: "Gagal", pod: "Tidak Ada" },
  { no: "DO-260629-007", outlet: "Mega Mart", address: "Tanjung Priok, Jakarta Utara", driver: "Fajar Hidayat", vehicle: "B 7012 XZA", schedule: "08:30–10:30", items: 9, status: "Terkirim", pod: "Tersedia" },
];

const statusTone: Record<DeliveryStatus, BadgeTone> = { "Siap Kirim": "purple", "Dalam Perjalanan": "blue", Terkirim: "green", Gagal: "red" };

export default function DeliveryPage() {
  const [status, setStatus] = useState<"Semua" | DeliveryStatus>("Semua");
  const [query, setQuery] = useState("");
  const [selectedNo, setSelectedNo] = useState(deliveries[0].no);
  const filtered = useMemo(() => deliveries.filter((item) => (status === "Semua" || item.status === status) && `${item.no} ${item.outlet} ${item.driver}`.toLowerCase().includes(query.toLowerCase())), [query, status]);
  const selected = deliveries.find((item) => item.no === selectedNo) ?? filtered[0] ?? deliveries[0];

  return <>
    <PageHeader eyebrow="Operasional" title="Manajemen Pengiriman" description="Pantau armada dan status delivery order hari ini." />
    <div className="metric-grid">
      <MetricCard label="Pengiriman Hari Ini" value="24 DO" icon={Truck} />
      <MetricCard label="Dalam Proses" value="8 DO" icon={Navigation} tone="purple" />
      <MetricCard label="Terlambat" value="2 DO" icon={AlertTriangle} tone="red" />
      <MetricCard label="Berhasil Terkirim" value="14 DO" detail="92% tepat waktu" icon={PackageCheck} tone="green" />
    </div>
    <SectionCard title="Ringkasan Status">
      <div className="delivery-status-grid">
        {([ ["Siap Kirim", 5, "purple"], ["Dalam Perjalanan", 8, "blue"], ["Terkirim", 14, "green"], ["Gagal", 1, "red"] ] as const).map(([label, value, tone]) => <button key={label} className={status === label ? "active" : ""} onClick={() => setStatus(label)}><i className={`status-tile ${tone}`}><Truck size={17} /></i><strong>{value}</strong><span>{label}</span></button>)}
      </div>
    </SectionCard>
    <SearchInput placeholder="Cari nomor DO, outlet, atau driver..." value={query} onChange={setQuery} />
    <div className="filter-chips">{(["Semua", "Siap Kirim", "Dalam Perjalanan", "Terkirim", "Gagal"] as const).map((item) => <button key={item} className={`filter-chip ${status === item ? "active" : ""}`} onClick={() => setStatus(item)}>{item}</button>)}</div>
    <div className="delivery-layout">
      <SectionCard title={`Delivery Order (${filtered.length})`}>
        <div className="delivery-list">{filtered.map((item) => <button key={item.no} className={item.no === selected.no ? "selected" : ""} onClick={() => setSelectedNo(item.no)}>
          <div className="delivery-list-head"><strong>{item.no}</strong><StatusBadge tone={statusTone[item.status]}>{item.status}</StatusBadge></div>
          <h3>{item.outlet}</h3><p><MapPin size={11} />{item.address}</p>
          <div className="delivery-meta"><span><UserRound size={11} />{item.driver}</span><span><Clock3 size={11} />{item.schedule}</span><b>{item.items} koli</b></div>
          <small className={`pod-${item.pod === "Tersedia" ? "ready" : item.pod === "Tidak Ada" ? "missing" : "wait"}`}><CheckCircle2 size={11} /> POD {item.pod}</small>
        </button>)}</div>
      </SectionCard>
      <div>
        <SectionCard title="Rute Aktif">
          <div className="route-map"><div className="route-line" /><i className="route-point start">G</i><i className="route-point middle">2</i><i className="route-point end"><MapPin size={14} /></i><span className="road road-a" /><span className="road road-b" /><span className="road road-c" /></div>
          <div className="route-detail"><div><span>Tujuan berikutnya</span><strong>{selected.outlet}</strong><small>{selected.address}</small></div><b>3,8 km</b></div>
          <button className="primary-button route-button"><Navigation size={16} /> Buka Navigasi</button>
        </SectionCard>
        <SectionCard title="Driver & Armada">
          <div className="driver-card"><div className="driver-avatar">AS</div><div><strong>{selected.driver}</strong><span>{selected.vehicle} · Cold Box</span><small><i /> Online sekarang</small></div><button aria-label="Telepon driver"><Phone size={17} /></button></div>
          <div className="driver-performance"><div><span>Pengiriman</span><strong>18</strong></div><div><span>Tepat Waktu</span><strong>94%</strong></div><div><span>Rating POD</span><strong>4,9</strong></div></div>
        </SectionCard>
      </div>
    </div>
  </>;
}
