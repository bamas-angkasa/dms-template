"use client";
import { useEffect,useState } from "react";import { Bell,Search } from "lucide-react";
import { getCurrentTenant } from "@/lib/api";
import { tenant } from "@/lib/tenant";
export function MobileTopBar(){const [activeTenant,setActiveTenant]=useState({...tenant,source:"mock" as "mock"|"api"});useEffect(()=>{let mounted=true;getCurrentTenant().then(value=>{if(mounted)setActiveTenant(value)});return()=>{mounted=false}},[]);return <header className="mobile-topbar"><div className="brand-lockup"><div className="aice-logo">AICE</div><div><strong>{activeTenant.name}</strong><span>{activeTenant.company}<i className={`data-source ${activeTenant.source}`}>{activeTenant.source==="api"?"Live":"Demo"}</i></span></div></div><div className="top-actions"><button aria-label="Cari"><Search size={20}/></button><button className="notification" aria-label="Notifikasi"><Bell size={20}/><i>3</i></button><div className="avatar">MW</div></div></header>}
