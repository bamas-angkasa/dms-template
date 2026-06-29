import type { ReactNode } from "react";
export function SectionCard({title,action,children,className=""}:{title?:string;action?:ReactNode;children:ReactNode;className?:string}){return <section className={`section-card ${className}`}>{(title||action)&&<div className="section-heading"><h2>{title}</h2>{action}</div>}{children}</section>}
