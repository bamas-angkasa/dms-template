import { tenant as fallbackTenant } from "./tenant";
import { outlets as fallbackOutlets, products as fallbackProducts, type Outlet, type Product } from "./mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
const TENANT_ID = fallbackTenant.id;
type APIEnvelope<T> = { data: T; meta?: { total: number } };
type RawRecord = Record<string, unknown>;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("API URL is not configured");
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 1800);
  try { const response = await fetch(`${API_URL}${path}`, { ...init, signal:controller.signal, headers:{"Content-Type":"application/json","X-Tenant-ID":TENANT_ID,...(init?.headers??{})} }); if(!response.ok) throw new Error(`API ${response.status}`); return await response.json() as T; }
  finally { clearTimeout(timeout); }
}
function value<T>(record:RawRecord,camel:string,pascal:string,fallback:T):T{return (record[camel]??record[pascal]??fallback) as T}
function normalizeProduct(raw:RawRecord):Product{return{id:value(raw,"id","ID",""),sku:value(raw,"sku","SKU",""),name:value(raw,"name","Name",""),category:value(raw,"category","Category",""),unit:value(raw,"unit","Unit","Karton"),price:value(raw,"price","Price",0),stock:value(raw,"stock","Stock",0),minimumStock:value(raw,"minimumStock","MinimumStock",35),status:value(raw,"status","Status","Aktif")}}
function normalizeOutlet(raw:RawRecord):Outlet{return{id:value(raw,"id","ID",""),code:value(raw,"code","Code",""),name:value(raw,"name","Name",""),area:value(raw,"area","Area",""),address:value(raw,"address","Address",""),phone:value(raw,"phone","Phone",""),npwpNik:value(raw,"npwpNik","NPWPNIK","-"),nitku:value(raw,"nitku","NITKU","-"),sales:value(raw,"sales","SalesPIC","-"),creditLimit:value(raw,"creditLimit","CreditLimit",0),receivable:value(raw,"receivable","ReceivableBalance",0),status:value(raw,"status","Status","Aktif"),gps:value(raw,"gps","GPS","-")}}

export async function getCurrentTenant(){try{const raw=await request<RawRecord>("/tenant/current");return{...fallbackTenant,name:value(raw,"name","Name",fallbackTenant.name),company:value(raw,"company","Company",fallbackTenant.company),primaryColor:value(raw,"primaryColor","PrimaryColor",fallbackTenant.primaryColor),plan:value(raw,"plan","Plan",fallbackTenant.plan),source:"api" as const}}catch{return{...fallbackTenant,source:"mock" as const}}}
export async function getProducts():Promise<{data:Product[];source:"api"|"mock"}>{try{const result=await request<APIEnvelope<RawRecord[]>>("/products");return{data:result.data.map(normalizeProduct),source:"api"}}catch{return{data:fallbackProducts,source:"mock"}}}
export async function getOutlets():Promise<{data:Outlet[];source:"api"|"mock"}>{try{const result=await request<APIEnvelope<RawRecord[]>>("/outlets");return{data:result.data.map(normalizeOutlet),source:"api"}}catch{return{data:fallbackOutlets,source:"mock"}}}
export async function getDashboardSummary(){return request<RawRecord>("/dashboard/summary")}
export async function getOrders(){return request<APIEnvelope<RawRecord[]>>("/orders")}
export async function getStock(){return request<APIEnvelope<RawRecord[]>>("/stock")}
export async function getDeliveryOrders(){return request<APIEnvelope<RawRecord[]>>("/delivery-orders")}
export async function getReceivables(){return request<APIEnvelope<RawRecord[]>>("/receivables")}
export async function getTaxInvoices(){return request<APIEnvelope<RawRecord[]>>("/tax/invoices")}
export async function createOrder(payload:unknown){return request<RawRecord>("/orders",{method:"POST",body:JSON.stringify(payload)})}
export async function validateTaxInvoices(){return request<{valid:number;invalid:number}>("/tax/validate",{method:"POST",body:"{}"})}
export async function exportTaxXML(invoiceIds:string[]){if(!API_URL)throw new Error("API URL is not configured");const response=await fetch(`${API_URL}/tax/export-xml`,{method:"POST",headers:{"Content-Type":"application/json","X-Tenant-ID":TENANT_ID},body:JSON.stringify({invoice_ids:invoiceIds})});if(!response.ok)throw new Error(`API ${response.status}`);return response.blob()}
