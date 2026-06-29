import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
export function MetricCard({label,value,detail,icon:Icon,tone="blue"}:{label:string;value:string;detail?:string;icon:LucideIcon;tone?:"blue"|"green"|"yellow"|"red"|"purple"}){return <article className="metric-card"><div className={`icon-tile tile-${tone}`}><Icon size={19}/></div><div><p>{label}</p><strong>{value}</strong>{detail&&<small><ArrowUpRight size={12}/>{detail}</small>}</div></article>}
