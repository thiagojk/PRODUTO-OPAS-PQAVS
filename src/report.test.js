import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {unzipSync,strFromU8} from 'fflate';
import {readWorkbook,calculate} from './data.js';
import {buildReport,summarizeMaps} from './reportModel.js';
import {createReportDocument} from './reportWord.js';

test('Word inclui seções, valores da base, texto editado, municípios e imagens',async()=>{
 const data=readWorkbook(await readFile('public/PQAVS_2025_Final.xlsx'));
 const rows=data.rows.filter(r=>r.uf==='MG');
 const model=buildReport(data,'MG',rows,calculate(rows),{conclusion:'Texto da conclusão editada.'});
 assert.equal(model.tables.municipalities.length,854);
 const ctx={fillRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){}};
 globalThis.document={createElement:()=>({getContext:()=>ctx,toDataURL:()=> 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='})};
 globalThis.fetch=async()=>({ok:true,json:async()=>({features:[{properties:{id:'3100104'},geometry:{type:'Polygon',coordinates:[[[0,0],[1,0],[1,1],[0,0]]]}}]})});
 const blob=await createReportDocument(model,rows);
 const zip=unzipSync(new Uint8Array(await blob.arrayBuffer()));
 const xml=strFromU8(zip['word/document.xml']);
 assert.match(xml,/Considerações Finais/);
 assert.match(xml,/Texto da conclusão editada/);
 assert.match(xml,/853/);
 assert.match(xml,/616/);
 assert.match(xml,/Serra da Saudade/);
 assert.match(xml,/No mapa do indicador 14/);
 assert.match(xml,/maior número de municípios/);
 assert.match(xml,/Entre os 20 municípios mais populosos/);
 assert.equal((xml.match(/<w:drawing>/g)||[]).length,16);
});

test('análises são geradas para todas as UFs e preservam empates e dados ausentes',async()=>{
 const data=readWorkbook(await readFile('public/PQAVS_2025_Final.xlsx'));
 for(const uf of new Set(data.rows.map(r=>r.uf))){
  const rows=data.rows.filter(r=>r.uf===uf), model=buildReport(data,uf,rows,calculate(rows));
  assert.match(model.summaries.population,new RegExp(rows.length.toLocaleString('pt-BR').replace('.', '\\.')));
  assert.equal(model.achieved.length,14);
  assert.ok(model.summaries.top.length>50);
 }
 const rows=[{code:'123456',name:'A',pop:10000,goals:Array(14).fill(1),value:null},{code:'123457',name:'B',pop:null,goals:Array(14).fill(null),value:null}];
 const map=summarizeMaps({features:[{properties:{id:'1234560'}},{properties:{id:'9999990'}}]},rows);
 assert.match(map.indicators[0],/1 áreas municipais aparecem como meta alcançada, 0 como não alcançada e 1 como sem informação/);
 assert.match(map.indicators[0],/1 registros da base não possuem correspondência/);
 assert.match(map.population,/1 áreas sem informação populacional/);
 const data2={year:'2025',indicators:Array.from({length:14},(_,i)=>({name:`Indicador ${i+1}`,target:''})),stateFinance:{}};
 const model=buildReport(data2,'MG',rows,calculate(rows));
 assert.match(model.summaries.general,/indicador 1, indicador 2/);
 assert.match(model.finance,/valor indisponível/);
});
