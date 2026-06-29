import type { Metadata,Viewport } from "next";import { Plus_Jakarta_Sans } from "next/font/google";import { MobileAppShell } from "@/components/layout/mobile-app-shell";import "./globals.css";import "../styles/features.css";import "../styles/orders.css";import "../styles/outlets.css";import "../styles/operations.css";
const jakarta=Plus_Jakarta_Sans({subsets:["latin"],variable:"--font-jakarta",display:"swap"});
export const metadata:Metadata={title:{default:"AICE Distributor DMS",template:"%s · AICE DMS"},description:"Mobile distributor management system for AICE Distributor - Mrs Wang",manifest:"/manifest.webmanifest"};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#001F6B"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body className={jakarta.variable}><MobileAppShell>{children}</MobileAppShell></body></html>}
