import {groups,groupIndex,ufCodes,totalGoals} from './data.js';

export async function getGeometry(uf) {
 const response=await fetch(`https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-${ufCodes[uf]}-mun.json`);
 if(!response.ok)throw new Error('Não foi possível obter a malha municipal.');
 return response.json();
}
export function mapImage(geo,rows,indicator) {
 const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=760;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,1000,760);
 let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 const collect=c=>{if(typeof c[0]==='number'){minX=Math.min(minX,c[0]);maxX=Math.max(maxX,c[0]);minY=Math.min(minY,c[1]);maxY=Math.max(maxY,c[1]);}else c.forEach(collect)};
 geo.features.forEach(f=>collect(f.geometry.coordinates));const scale=Math.min(690/(maxX-minX),700/(maxY-minY));const ox=(730-(maxX-minX)*scale)/2,oy=(760-(maxY-minY)*scale)/2;
 const byCode=new Map(rows.map(r=>[r.code,r]));const palette=['#dcece5','#acd7c6','#70b79d','#338d76','#135648'];
 for(const feature of geo.features){const row=byCode.get(String(feature.properties.id).slice(0,6)),v=indicator==='pop'?groupIndex(row?.pop):row?.goals[indicator];ctx.fillStyle=indicator==='pop'?(v>=0?palette[v]:'#d6dad7'):(v===1?'#218268':v===0?'#c65a4e':'#d6dad7');ctx.strokeStyle='#fff';ctx.lineWidth=.6;ctx.beginPath();const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;for(const polygon of polygons)for(const ring of polygon){ring.forEach((p,i)=>{const x=ox+(p[0]-minX)*scale,y=oy+(maxY-p[1])*scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath()}ctx.fill('evenodd');ctx.stroke()}
 ctx.font='18px Arial';ctx.fillStyle='#222';ctx.fillText('Legenda',745,260);const labels=indicator==='pop'?groups:['Alcançou','Não alcançou'];const colors=indicator==='pop'?palette:['#218268','#c65a4e'];[...labels,'Sem informação'].forEach((label,i)=>{ctx.fillStyle=colors[i]||'#d6dad7';ctx.fillRect(745,280+i*30,16,16);ctx.fillStyle='#222';ctx.fillText(label,770,294+i*30)});return canvas.toDataURL('image/png');
}
export function chartImage(top) {const c=document.createElement('canvas');c.width=1100;c.height=Math.max(500,top.length*32+100);const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,c.width,c.height);x.font='18px Arial';top.forEach((r,i)=>{const y=45+i*32;x.fillStyle='#222';x.textAlign='right';x.fillText(`${r.name} (${Number(r.pop).toLocaleString('pt-BR')})`,390,y+14);x.fillStyle='#25876b';x.fillRect(410,y,560*totalGoals(r)/14,19);x.textAlign='left';x.fillStyle='#222';x.fillText(String(totalGoals(r)),420+560*totalGoals(r)/14,y+15)});return c.toDataURL('image/png')}
