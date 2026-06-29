"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileCheck2, FileCode2, FileSpreadsheet, RefreshCw, ShieldCheck } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/format";
import { outlets } from "@/lib/mock-data";

type TaxInvoice = { invoice: string; outlet: string; npwp: string; nitku: string; dpp: number; ppn: number; total: number; validation: "Valid" | "Invalid" | "Belum Validasi"; exported: boolean };
const initialInvoices: TaxInvoice[] = outlets.slice(0, 12).map((outlet, index) => {
  const dpp = 1800000 + index * 375000;
  const invalid = outlet.npwpNik === "-" || outlet.nitku === "-";
  return { invoice: `INV-2606-${String(88 - index).padStart(3, "0")}`, outlet: outlet.name, npwp: outlet.npwpNik, nitku: outlet.nitku, dpp, ppn: Math.round(dpp * 0.11), total: dpp + Math.round(dpp * 0.11), validation: index > 8 ? "Belum Validasi" : invalid ? "Invalid" : "Valid", exported: index === 1 || index === 3 };
});

function download(name: string, body: string, type: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([body], { type }));
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function TaxXmlPage() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [filter, setFilter] = useState("Semua");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(initialInvoices.filter((item) => item.validation === "Valid" && !item.exported).map((item) => item.invoice));
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => invoices.filter((item) => (filter === "Semua" || (filter === "Siap Ekspor" ? item.validation === "Valid" && !item.exported : filter === "Sudah Ekspor" ? item.exported : item.validation === filter)) && `${item.invoice} ${item.outlet} ${item.npwp}`.toLowerCase().includes(query.toLowerCase())), [filter, invoices, query]);
  const validSelected = invoices.filter((item) => selected.includes(item.invoice) && item.validation === "Valid");
  const dpp = invoices.reduce((sum, item) => sum + item.dpp, 0);
  const ppn = invoices.reduce((sum, item) => sum + item.ppn, 0);

  function validateData() {
    setInvoices((current) => current.map((item) => item.validation === "Belum Validasi" ? { ...item, validation: item.npwp === "-" || item.nitku === "-" ? "Invalid" : "Valid" } : item));
    setNotice("Validasi selesai. Data tanpa NPWP/NIK atau NITKU ditandai invalid.");
  }
  function exportXml() {
    if (!validSelected.length) return setNotice("Pilih setidaknya satu invoice valid untuk diekspor.");
    const rows = validSelected.map((item) => `  <Faktur><Nomor>${item.invoice}</Nomor><NPWP>${item.npwp}</NPWP><NITKU>${item.nitku}</NITKU><DPP>${item.dpp}</DPP><PPN>${item.ppn}</PPN><Total>${item.total}</Total></Faktur>`).join("\n");
    download(`aice-faktur-pajak-2026-06.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<FakturPajak tenant="AICE Distributor - Mrs Wang" periode="2026-06">\n${rows}\n</FakturPajak>`, "application/xml");
    setInvoices((current) => current.map((item) => selected.includes(item.invoice) ? { ...item, exported: true } : item));
    setSelected([]); setNotice(`${validSelected.length} invoice berhasil dibuat menjadi XML.`);
  }
  function exportCsv() {
    const rows = invoices.map((item) => [item.invoice, item.outlet, item.npwp, item.nitku, item.dpp, item.ppn, item.total, item.validation, item.exported ? "Sudah" : "Belum"].join(","));
    download("aice-faktur-pajak-2026-06.csv", `Invoice,Outlet,NPWP_NIK,NITKU,DPP,PPN,Total,Validasi,Ekspor\n${rows.join("\n")}`, "text/csv");
    setNotice("Rekap pajak berhasil diekspor sebagai CSV yang kompatibel dengan Excel.");
  }

  return <>
    <PageHeader eyebrow="Pajak" title="Ekspor Pajak XML" description="Validasi dan siapkan data faktur untuk pelaporan Coretax." />
    {notice && <div className="tax-notice"><CheckCircle2 size={17} /><span>{notice}</span><button onClick={() => setNotice("")}>×</button></div>}
    <div className="metric-grid">
      <MetricCard label="Invoice Siap Ekspor" value={`${invoices.filter((item) => item.validation === "Valid" && !item.exported).length} Invoice`} icon={FileCheck2} tone="green" />
      <MetricCard label="Nilai DPP Periode Ini" value={formatCurrency(dpp, true)} icon={FileSpreadsheet} />
      <MetricCard label="Total PPN Periode Ini" value={formatCurrency(ppn, true)} icon={ShieldCheck} tone="purple" />
      <MetricCard label="Data Invalid" value={`${invoices.filter((item) => item.validation === "Invalid").length} Invoice`} icon={AlertTriangle} tone="red" />
    </div>
    <SectionCard title="Aksi Pelaporan"><div className="tax-actions"><button className="primary-button" onClick={exportXml}><FileCode2 size={17} />Generate XML <b>{selected.length || ""}</b></button><button className="secondary-button" onClick={exportCsv}><FileSpreadsheet size={17} />Export Excel</button><button className="secondary-button" onClick={validateData}><RefreshCw size={17} />Validasi Data</button></div><p className="tax-disclaimer"><AlertTriangle size={13} /> Simulasi file ekspor. Belum terhubung langsung ke DJP/Coretax.</p></SectionCard>
    <div className="tax-filter-grid"><label><span>Periode</span><select defaultValue="2026-06"><option value="2026-06">Juni 2026</option><option value="2026-05">Mei 2026</option></select></label><label><span>Status Pajak</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>Semua</option><option>Siap Ekspor</option><option>Valid</option><option>Invalid</option><option>Belum Validasi</option><option>Sudah Ekspor</option></select></label><label><span>Tipe Customer</span><select><option>Semua Customer</option><option>NPWP</option><option>NIK</option></select></label></div>
    <SearchInput placeholder="Cari invoice, outlet, atau NPWP..." value={query} onChange={setQuery} filter={false} />
    <SectionCard title={`Faktur Pajak (${filtered.length})`} action={<button className="text-button" onClick={() => setSelected(filtered.filter((item) => item.validation === "Valid" && !item.exported).map((item) => item.invoice))}>Pilih siap ekspor</button>}>
      <div className="tax-list">{filtered.map((item) => <article key={item.invoice} className={selected.includes(item.invoice) ? "selected" : ""}>
        <label className="tax-check"><input type="checkbox" disabled={item.validation !== "Valid" || item.exported} checked={selected.includes(item.invoice)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, item.invoice] : current.filter((invoice) => invoice !== item.invoice))} /><i /></label>
        <div className="tax-main"><div><strong>{item.outlet}</strong><StatusBadge tone={item.validation === "Valid" ? "green" : item.validation === "Invalid" ? "red" : "yellow"}>{item.validation}</StatusBadge></div><p>{item.invoice}</p><small>NPWP/NIK: {item.npwp} · NITKU: {item.nitku}</small><div className="tax-values"><span>DPP <b>{formatCurrency(item.dpp, true)}</b></span><span>PPN <b>{formatCurrency(item.ppn, true)}</b></span><span>Total <b>{formatCurrency(item.total, true)}</b></span></div></div>
        {item.exported && <em><Download size={11} />Diekspor</em>}
      </article>)}</div>
    </SectionCard>
    <div className="tax-bottom-grid">
      <SectionCard title="Ringkasan Validasi"><div className="validation-list"><p><span><AlertTriangle />NPWP/NIK kosong</span><b>3</b></p><p><span><AlertTriangle />NITKU kosong</span><b>2</b></p><p><span><AlertTriangle />Masalah alamat</span><b>1</b></p><p><span><CheckCircle2 />Nilai pajak konsisten</span><b className="ok">18</b></p></div></SectionCard>
      <SectionCard title="Riwayat Ekspor"><div className="export-history"><article><div className="file-icon"><FileCode2 /></div><div><strong>Faktur_Pajak_Jun_2026_01.xml</strong><span>12 invoice · 27 Jun 2026, 16:20</span></div><button><Download size={15} /></button></article><article><div className="file-icon"><FileCode2 /></div><div><strong>Faktur_Pajak_Mei_2026.xml</strong><span>42 invoice · 31 Mei 2026, 17:05</span></div><button><Download size={15} /></button></article></div></SectionCard>
    </div>
  </>;
}
