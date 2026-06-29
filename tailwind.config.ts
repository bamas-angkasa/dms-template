import type { Config } from "tailwindcss";
export default { content:["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme:{extend:{colors:{navy:"#001F6B",royal:"#003DAE",action:"#0057FF",ink:"#07164A",muted:"#5A6685",surface:"#F7F9FC",border:"#E5EAF3"},fontFamily:{sans:["var(--font-jakarta)","sans-serif"]},boxShadow:{card:"0 8px 28px rgba(7,22,74,.07)"}}},plugins:[] } satisfies Config;
