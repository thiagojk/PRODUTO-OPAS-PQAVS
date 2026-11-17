import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readWorkbook,calculate,groupIndex} from './data.js';

test('base fornecida preserva municípios e calcula metas conforme o R',async()=>{
 const data=readWorkbook(await readFile('public/PQAVS_2025_Final.xlsx'));
 const mg=data.rows.filter(r=>r.uf==='MG');
 assert.equal(mg.length,853);
 assert.equal(data.year,'2025');
 assert.match(data.indicators[7].name,/dengue/i);
 const stats=calculate(mg);
 assert.equal(stats.indicators.length,14);
 assert.deepEqual(stats.indicators.map(s=>s.achieved),[616,708,578,369,144,171,5,76,120,234,621,678,676,676]);
 for(const s of stats.indicators){assert.equal(s.achieved+s.notAchieved+s.missing,mg.length);assert.equal(s.groups.reduce((a,b)=>a+b,0),s.achieved)}
 assert.equal(stats.counts.reduce((a,b)=>a+b,0)+stats.missingPop,mg.length);
});
test('limites populacionais seguem cut do R',()=>{assert.deepEqual([10000,10001,30000,30001,50000,50001,100000,100001,null].map(groupIndex),[0,1,1,2,2,3,3,4,-1])});
