import { BottomNav } from "./bottom-nav";import { MobileTopBar } from "./mobile-top-bar";import { Sidebar } from "./sidebar";
export function MobileAppShell({children}:{children:React.ReactNode}){return <div className="app-root"><Sidebar/><div className="app-column"><MobileTopBar/><main className="app-content">{children}</main><BottomNav/></div></div>}
