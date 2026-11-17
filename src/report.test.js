import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {unzipSync,strFromU8} from 'fflate';
import {readWorkbook,calculate} from './data.js';
import {buildReport} from './reportModel.js';
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
 assert.equal((xml.match(/<w:drawing>/g)||[]).length,16);
});
