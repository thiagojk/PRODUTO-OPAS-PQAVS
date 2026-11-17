import {groups,groupIndex,number,percent,stateNames,totalGoals} from './data.js';

function listNames(items) { return items.map(x=>x.name).join(', '); }

export function summarizeMaps(geo,rows) {
 const byCode=new Map(rows.map(row=>[row.code,row]));
 const features=geo.features.map(f=>byCode.get(String(f.properties.id).slice(0,6)));
 const unmatched=features.filter(r=>!r).length;
 const matchedCodes=new Set(geo.features.map(f=>String(f.properties.id).slice(0,6)));
 const outside=rows.filter(r=>!matchedCodes.has(r.code)).length;
 const population=groups.map((_,i)=>features.filter(r=>r&&groupIndex(r.pop)===i).length);
 const missingPop=features.filter(r=>!r||groupIndex(r.pop)<0).length;
 const coverage=`A malha contém ${number(features.length)} áreas municipais; ${number(unmatched)} não possuem correspondência na base e ${number(outside)} registros da base não possuem correspondência na malha. A categoria sem informação no mapa inclui áreas sem correspondência.`;
 return {population:`No mapa de população, ${population.map((n,i)=>`${number(n)} áreas estão na faixa ${groups[i]}`).join('; ')} habitantes. Há ${number(missingPop)} áreas sem informação populacional. ${coverage}`,
  indicators:Array.from({length:14},(_,i)=>{const yes=features.filter(r=>r?.goals[i]===1).length,no=features.filter(r=>r?.goals[i]===0).length,missing=features.length-yes-no;return `No mapa do indicador ${i+1}, ${number(yes)} áreas municipais aparecem como meta alcançada, ${number(no)} como não alcançada e ${number(missing)} como sem informação. ${coverage}`;})};
}

export function buildReport(data, uf, rows, stats, notes={}) {
 const name=stateNames[uf], year=data.year;
 const population=rows.reduce((sum,r)=>sum+(Number(r.pop)||0),0);
 const sorted=[...rows].sort((a,b)=>(a.pop??Infinity)-(b.pop??Infinity));
 const achieved=stats.indicators.map((s,i)=>({title:data.indicators[i].name,target:data.indicators[i].target,...s,text:`O indicador ${i+1} teve a meta alcançada por ${number(s.achieved)} municípios (${percent(s.achieved,rows.length)} do total de registros). Não alcançaram a meta ${number(s.notAchieved)} municípios e ${number(s.missing)} estão sem informação. Entre os municípios que alcançaram a meta, ${s.groups.map((n,j)=>`${number(n)} pertencem à faixa de ${groups[j]} habitantes`).join('; ')}. Há ${number(s.achieved-s.groups.reduce((a,b)=>a+b,0))} municípios que alcançaram a meta sem população informada.`}));
 const extrema=(values,order)=>{const target=order==='max'?Math.max(...values.map(x=>x.value)):Math.min(...values.map(x=>x.value));return {value:target,items:values.filter(x=>x.value===target)};};
 const indicatorValues=achieved.map(s=>({name:`indicador ${s.number}`,value:s.achieved}));
 const highest=extrema(indicatorValues,'max'),lowest=extrema(indicatorValues,'min');
 const groupValues=groups.map((g,i)=>({name:g,value:stats.counts[i]}));
 const mostPop=extrema(groupValues,'max');
 const goalValues=rows.map(r=>({name:r.name,value:totalGoals(r)}));
 const topValues=stats.top.map(r=>({name:r.name,value:totalGoals(r)}));
 const topMax=topValues.length?extrema(topValues,'max'):null,topMin=topValues.length?extrema(topValues,'min'):null;
 const summaries={population:`A base reúne ${number(rows.length)} municípios: ${groups.map((g,i)=>`${number(stats.counts[i])} na faixa ${g}`).join('; ')} habitantes. ${number(stats.missingPop)} não possuem população informada. A maior quantidade de municípios está na(s) faixa(s) ${listNames(mostPop.items)}, com ${number(mostPop.value)} município(s) em cada.`,
 general:`O maior número de municípios que alcançaram a meta foi registrado em ${listNames(highest.items)}, com ${number(highest.value)} (${percent(highest.value,rows.length)}). O menor ocorreu em ${listNames(lowest.items)}, com ${number(lowest.value)} (${percent(lowest.value,rows.length)}). Empates são apresentados em conjunto; o denominador é o total de municípios da base.`,
 groups:`A distribuição por faixa apresenta números absolutos de municípios que alcançaram cada meta. Como as faixas têm quantidades distintas de municípios, as contagens não representam, por si só, uma comparação proporcional entre elas.`,
 municipalities:goalValues.length?`Na tabela municipal, os registros apresentam de ${number(extrema(goalValues,'min').value)} a ${number(extrema(goalValues,'max').value)} metas alcançadas entre os 14 indicadores. O total considera apenas valores iguais a 1; metas sem informação não são contabilizadas como alcançadas.`:'Não há registros municipais para analisar.',
 top:topValues.length?`Entre os ${number(topValues.length)} municípios mais populosos com população informada, o maior número de metas alcançadas foi ${number(topMax.value)}, registrado em ${listNames(topMax.items)}. O menor foi ${number(topMin.value)}, em ${listNames(topMin.items)}. Os municípios foram selecionados pela população, não pela quantidade de metas.`:'Não há população informada para selecionar os municípios do gráfico.'};
 const values=rows.filter(r=>r.value!=null), sum=values.reduce((n,r)=>n+r.value,0), state=data.stateFinance[uf];
 const currency=v=>v==null?'—':v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 return {name,uf,year,notes,population,achieved,summaries,counts:stats.counts,missingPop:stats.missingPop,total:rows.length,top:stats.top,municipalities:sorted,finance:`O campo valormunic soma ${values.length?currency(sum):'valor indisponível'} em ${number(values.length)} municípios com valor informado. ${state?`Na aba Estados, os valores informados nos estratos 100%, 75%, 50% e 25% são, respectivamente, ${state.map(currency).join(', ')}.`:'Não há valores estaduais na planilha para esta UF.'} A natureza e o período dos valores devem ser confirmados antes de tratá-los como repasses.`,tables:{finance:[['Valor municipal informado', 'Estrato 100%', 'Estrato 75%', 'Estrato 50%', 'Estrato 25%'], [values.length?currency(sum):'—', ...(state||[null,null,null,null]).map(currency)]],population:[['Faixa populacional','Nº de municípios'],...groups.map((g,i)=>[g,number(stats.counts[i])]),['Sem informação',number(stats.missingPop)],['Total',number(rows.length)]],general:[['Indicador','Municípios que alcançaram','% do total','Sem informação'],...achieved.map(s=>[String(s.number),number(s.achieved),percent(s.achieved,rows.length),number(s.missing)])],groups:[['Indicador',...groups,'Total'],...achieved.map(s=>[String(s.number),...s.groups.map(number),number(s.achieved)])],municipalities:[['Município',`População ${year}`,'Faixa populacional','Nº de metas','% de metas'],...sorted.map(r=>[r.name,r.pop==null?'—':number(r.pop),groups[groupIndex(r.pop)]||'Sem informação',String(totalGoals(r)),percent(totalGoals(r),14)])]}};
}
