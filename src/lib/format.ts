export function formatCurrency(value:number,compact=false){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0,notation:compact?"compact":"standard"}).format(value)}
export function formatNumber(value:number){return new Intl.NumberFormat("id-ID").format(value)}
