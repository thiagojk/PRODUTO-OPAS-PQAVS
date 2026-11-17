import * as XLSX from 'xlsx';

export const groups = ['Até 10.000', '10.001 a 30.000', '30.001 a 50.000', '50.001 a 100.000', 'Mais de 100.000'];
export const ufCodes = {AC:12,AL:27,AP:16,AM:13,BA:29,CE:23,DF:53,ES:32,GO:52,MA:21,MT:51,MS:50,MG:31,PA:15,PB:25,PR:41,PE:26,PI:22,RJ:33,RN:24,RS:43,RO:11,RR:14,SC:42,SP:35,SE:28,TO:17};
export const stateNames = {AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins'};
export function groupIndex(pop) { if (pop == null || pop === '' || !Number.isFinite(Number(pop))) return -1; const n=Number(pop); return n<=10000?0:n<=30000?1:n<=50000?2:n<=100000?3:4; }
export function readWorkbook(buffer) {
 const book=XLSX.read(buffer,{type:'array'});
 if(!book.Sheets.Municipios) throw new Error('A planilha precisa conter a aba Municipios.');
 const raw=XLSX.utils.sheet_to_json(book.Sheets.Municipios,{defval:null});
 if(!raw.length) throw new Error('A aba Municipios está vazia.');
 const columns=Object.keys(raw[0]);
 const population=columns.find(c=>/^pop_\d{4}$/i.test(c));
 const needed=['UF','COD_MUN','NOME_MUN',...Array.from({length:14},(_,i)=>`META_RES_${i+1}`)];
 const missing=needed.filter(c=>!columns.includes(c));
 if(!population || missing.length) throw new Error(`Formato incompatível. Faltam: ${[...missing,...(!population?['Pop_AAAA']:[])].join(', ')}.`);
 const rows=raw.filter(r=>ufCodes[String(r.UF||'').trim().toUpperCase()] && /^\d{6,7}$/.test(String(r.COD_MUN)) && r.NOME_MUN).map(r=>({uf:String(r.UF).trim().toUpperCase(),code:String(r.COD_MUN).slice(0,6),name:String(r.NOME_MUN),pop:r[population],goals:Array.from({length:14},(_,i)=>r[`META_RES_${i+1}`]===1||r[`META_RES_${i+1}`]==='1'?1:r[`META_RES_${i+1}`]===0||r[`META_RES_${i+1}`]==='0'?0:null),value:typeof r.valormunic==='number'?r.valormunic:null,incentive:r.incentivo_mun}));
 if(!rows.length) throw new Error('Nenhum município válido encontrado.');
 const duplicates=new Set(); for(const row of rows){const key=row.uf+row.code;if(duplicates.has(key))throw new Error(`Município duplicado na base: ${row.code}.`);duplicates.add(key);}
 const descriptions=book.Sheets.Indicadores?XLSX.utils.sheet_to_json(book.Sheets.Indicadores,{header:1}).flat().filter(x=>typeof x==='string'):[];
 const indicators=Array.from({length:14},(_,i)=>{const index=descriptions.findIndex(s=>new RegExp(`^Indicador\\s+${i+1}\\s*:`,'i').test(s));return {name:index<0?`Indicador ${i+1}`:descriptions[index],target:index<0?'':descriptions[index+1]||''};});
 const stateRows=book.Sheets.Estados?XLSX.utils.sheet_to_json(book.Sheets.Estados,{header:1,defval:null}):[];
 const stateFinance=Object.fromEntries(stateRows.filter(r=>ufCodes[r[0]]).map(r=>[r[0],r.slice(1,5)]));
 return {rows,indicators,stateFinance,year:population.match(/\d{4}/)[0]};
}
export function calculate(rows) {
 const counts=groups.map((_,i)=>rows.filter(r=>groupIndex(r.pop)===i).length);
 const indicators=Array.from({length:14},(_,i)=>({number:i+1,achieved:rows.filter(r=>r.goals[i]===1).length,notAchieved:rows.filter(r=>r.goals[i]===0).length,missing:rows.filter(r=>r.goals[i]==null).length,groups:groups.map((_,g)=>rows.filter(r=>groupIndex(r.pop)===g&&r.goals[i]===1).length)}));
 return {counts,indicators,top:[...rows].filter(r=>r.pop!=null).sort((a,b)=>b.pop-a.pop).slice(0,20),missingPop:rows.filter(r=>groupIndex(r.pop)<0).length};
}
export const totalGoals = r => r.goals.filter(v=>v===1).length;
export const number = n => new Intl.NumberFormat('pt-BR').format(n);
export const percent = (n,d) => d ? (100*n/d).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%' : '—';
