"use client";
import Link from "next/link";import { usePathname } from "next/navigation";import { Boxes,CircleEllipsis,LayoutDashboard,MapPin,ShoppingBag } from "lucide-react";
const items=[{href:"/dashboard",label:"Dashboard",icon:LayoutDashboard},{href:"/orders/new",label:"Order",icon:ShoppingBag},{href:"/outlets",label:"Outlet",icon:MapPin},{href:"/stock",label:"Stok",icon:Boxes},{href:"/more",label:"Lainnya",icon:CircleEllipsis}];
export function BottomNav(){const path=usePathname();return <nav className="bottom-nav" aria-label="Navigasi utama">{items.map(({href,label,icon:Icon})=><Link key={href} href={href} className={path===href||(href!=="/dashboard"&&path.startsWith(href))?"active":""}><Icon size={21}/><span>{label}</span></Link>)}</nav>}
