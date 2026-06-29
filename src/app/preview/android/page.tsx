import Link from "next/link";
import { ArrowLeft, ExternalLink, Smartphone } from "lucide-react";

const screens = [
  { title: "Dashboard", subtitle: "Ringkasan operasional", path: "/dashboard", color: "#5e8fff" },
  { title: "Buat Sales Order", subtitle: "Order cepat dari lapangan", path: "/orders/new", color: "#22c55e" },
  { title: "Stok Gudang", subtitle: "Persediaan real-time", path: "/stock", color: "#ffc928" },
  { title: "Pengiriman", subtitle: "Rute, driver, dan POD", path: "/delivery", color: "#a879ff" },
];

export default function AndroidPreviewPage() {
  return <div className="android-preview">
    <div className="preview-glow one" /><div className="preview-glow two" />
    <header className="preview-header"><div><span><Smartphone size={13} /> Client Presentation</span><h1>AICE Distributor Mobile PWA</h1><p>Android Infinix Preview</p></div><Link href="/dashboard"><ArrowLeft size={16} /> Kembali ke Aplikasi</Link></header>
    <div className="phone-stage">{screens.map((screen, index) => <article className="showcase" key={screen.path} style={{ "--accent": screen.color } as React.CSSProperties}>
      <div className="phone-label"><i>{String(index + 1).padStart(2, "0")}</i><div><strong>{screen.title}</strong><span>{screen.subtitle}</span></div></div>
      <div className="phone"><div className="phone-speaker" /><div className="phone-camera" /><div className="phone-screen"><iframe src={screen.path} title={`Preview ${screen.title}`} tabIndex={-1} /></div><div className="phone-reflection" /><div className="phone-button volume" /><div className="phone-button power" /></div>
      <Link className="open-screen" href={screen.path}>Buka layar <ExternalLink size={12} /></Link>
    </article>)}</div>
    <footer><div className="aice-logo">AICE</div><span>Distributor DMS · Mrs Wang · Mobile-first SaaS Preview</span></footer>
  </div>;
}
