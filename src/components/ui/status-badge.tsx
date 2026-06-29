export type BadgeTone="blue"|"green"|"yellow"|"red"|"purple"|"gray";
export function StatusBadge({children,tone="blue"}:{children:React.ReactNode;tone?:BadgeTone}){return <span className={`status-badge badge-${tone}`}>{children}</span>}
