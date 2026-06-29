const colors=["#E9F0FF","#FFF3C7","#F3E8FF","#DCFCE7","#FFE4E6"];
export function ProductImage({name,size="md"}:{name:string;size?:"sm"|"md"|"lg"}){const hash=[...name].reduce((t,c)=>t+c.charCodeAt(0),0);return <div className={`product-image product-${size}`} style={{background:colors[hash%colors.length]}} aria-label={`Gambar ${name}`}><span>ice</span><b>•</b></div>}
