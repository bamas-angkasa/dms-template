import type { LucideIcon } from "lucide-react";
import { ArrowDownToLine, BarChart3, Boxes, CalendarDays, ReceiptText, ShoppingBag, TrendingUp, Truck, WalletCards } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { formatCurrency } from "@/lib/format";

const reportPackages: Array<{ name: string; description: string; icon: LucideIcon }> = [
  { name: "Laporan Penjualan", description: "Order, omzet, diskon, dan PPN", icon: BarChart3 },
  { name: "Laporan Stok", description: "Saldo, mutasi, dan nilai persediaan", icon: Boxes },
  { name: "Laporan Pengiriman", description: "SLA, POD, dan performa driver", icon: Truck },
  { name: "Laporan Piutang", description: "Aging, pembayaran, dan limit kredit", icon: ReceiptText },
];

export default function ReportsPage() {
  return <>
    <PageHeader eyebrow="Analitik" title="Laporan Distributor" description="Ringkasan performa Juni 2026." action={<button className="icon-button primary" aria-label="Unduh laporan"><ArrowDownToLine size={18} /></button>} />
    <div className="report-period"><CalendarDays /><span>01–29 Juni 2026</span><button>Ubah Periode</button></div>
    <div className="metric-grid"><MetricCard label="Omzet Periode" value="Rp 684 jt" detail="14,2% vs Mei" icon={WalletCards} /><MetricCard label="Order Selesai" value="486" detail="8,4% vs Mei" icon={ShoppingBag} tone="green" /><MetricCard label="Rata-rata Order" value="Rp 1,4 jt" icon={TrendingUp} tone="purple" /><MetricCard label="Piutang Berjalan" value="Rp 56,8 jt" icon={ReceiptText} tone="yellow" /></div>
    <div className="report-grid"><SectionCard title="Penjualan per Minggu"><div className="report-bars">{[118, 142, 156, 181, 87].map((value, index) => <div key={index}><b>{formatCurrency(value * 1000000, true)}</b><i style={{ height: `${value / 2}%` }} /><span>Minggu {index + 1}</span></div>)}</div></SectionCard><SectionCard title="Kontribusi Kanal"><div className="channel-list"><p><span>Minimarket</span><b>42%</b><i><em style={{ width: "42%" }} /></i></p><p><span>Toko Kelontong</span><b>31%</b><i><em style={{ width: "31%" }} /></i></p><p><span>Swalayan</span><b>19%</b><i><em style={{ width: "19%" }} /></i></p><p><span>Lainnya</span><b>8%</b><i><em style={{ width: "8%" }} /></i></p></div></SectionCard></div>
    <SectionCard title="Paket Laporan"><div className="report-cards">{reportPackages.map(({ name, description, icon: Icon }) => <button key={name}><i><Icon /></i><span><strong>{name}</strong><small>{description}</small></span><ArrowDownToLine /></button>)}</div></SectionCard>
  </>;
}
