"use client";
import { Bell,Search } from "lucide-react";
import { tenant } from "@/lib/tenant";
export function MobileTopBar(){return <header className="mobile-topbar"><div className="brand-lockup"><div className="aice-logo">AICE</div><div><strong>{tenant.name}</strong><span>{tenant.company}</span></div></div><div className="top-actions"><button aria-label="Cari"><Search size={20}/></button><button className="notification" aria-label="Notifikasi"><Bell size={20}/><i>3</i></button><div className="avatar">MW</div></div></header>}
