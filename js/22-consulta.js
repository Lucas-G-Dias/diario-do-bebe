Object.assign(S,{questions:[],dev:{},foods:[]});
/* ============ Para a consulta: perguntas ao pediatra + resumo pronto dos últimos 14 dias + backup ============ */
function visitSummary(days=14){
 const now=Date.now(),from=dayStart(now)-(days-1)*DAY,ev=allEv().filter(e=>e.start>=from&&e.start<=now),per=x=>(x/days).toFixed(1).replace('.',',');
 let sleep=0;ev.filter(e=>e.type==='sleep').forEach(e=>{sleep+=Math.max(0,Math.min(e.end||now,now)-e.start)});
 const feeds=ev.filter(e=>e.type==='feed'),bot=feeds.filter(e=>e.kind==='mamadeira'&&+e.ml>0),dia=ev.filter(e=>e.type==='diaper');
 const temps=ev.filter(e=>e.type==='temp'&&+e.value>=37.8).map(e=>`${num(+e.value)} °C em ${fmtD(e.start)}`);
 const meds={};ev.filter(e=>e.type==='med'&&e.name).forEach(e=>{const k=e.name.trim();meds[k]=(meds[k]||0)+1});
 const gr=[...S.growth].sort((a,b)=>b.date.localeCompare(a.date)),g0=gr[0],g1=gr[1];
 const late=VAX.filter(v=>vaxStatus(v).s==='late').map(v=>`${v[1]} (${v[3]})`);
 const devMiss=typeof devNow==='function'?devNow().filter(x=>!(S.dev||{})[x[0]]).map(x=>x[2]):[];
 const foodBad=(S.foods||[]).filter(f=>f.reaction==='alergia').map(f=>f.name);
 const L=[[`Sono`,ev.some(e=>e.type==='sleep')?`${per(sleep/HR)} h por dia`:'sem registros'],
  ['Mamadas',feeds.length?`${per(feeds.length)} por dia${bot.length?` · mamadeira média ${Math.round(bot.reduce((s,e)=>s+ +e.ml,0)/bot.length)} ml`:''}`:'sem registros'],
  ['Fraldas',dia.length?`${per(dia.length)} por dia · ${dia.filter(e=>e.kind==='coco'||e.kind==='ambos').length} com cocô em ${days} dias`:'sem registros'],
  ['Febre',temps.length?temps.join('; '):'nenhuma registrada'],
  ['Remédios',Object.keys(meds).length?Object.entries(meds).map(([k,v])=>`${k} (${v}×)`).join(', '):'nenhum'],
  ['Peso e medida',g0?`${g0.w?num(g0.w)+' kg':''}${g0.l?' · '+num(g0.l)+' cm':''} em ${fmtD(Date.parse(g0.date+'T12:00'))}${g1&&g0.w&&g1.w?` (antes ${num(g1.w)} kg em ${fmtD(Date.parse(g1.date+'T12:00'))})`:''}`:'sem medida']];
 if(late.length)L.push(['Vacinas atrasadas',late.join(', ')]);
 if(devMiss.length)L.push(['Marcos ainda não vistos',devMiss.join('; ')]);
 if(foodBad.length)L.push(['Reação a alimento',foodBad.join(', ')]);
 return L}
const qOpen=()=>(S.questions||[]).filter(q=>!q.done).sort((a,b)=>a.at-b.at);
VIEWS.consulta=()=>{const L=visitSummary(),qs=qOpen(),done=(S.questions||[]).filter(q=>q.done).length,ped=(S.agenda||[]).filter(a=>!a.done&&a.type==='consulta'&&a.date&&dateOnly(a.date)>=dayStart(Date.now())).sort((a,b)=>a.date.localeCompare(b.date))[0];
 return`${ped?`<div class="banner" role="status">Próxima consulta: <b>${esc(ped.title)}</b> · ${relDay?relDay(dateOnly(ped.date)):fmtD(dateOnly(ped.date))}${ped.time?' às '+esc(ped.time):''}</div>`:''}
 <div class="card"><div class="card-h"><h2>Perguntas para o pediatra</h2><span class="small muted">${qs.length} abertas</span></div>
  <form id="qForm" class="qform"><input name="q" id="q-new" placeholder="Ex.: É normal acordar 4 vezes à noite?" aria-label="Nova pergunta" autocomplete="off" maxlength="200"><button class="btn primary" type="submit">Anotar</button></form>
  <div class="rows">${qs.map(q=>`<div class="row qrow"><button class="qchk" data-act="qDone" data-id="${q.id}" aria-label="Marcar como respondida: ${esc(q.text)}"></button><div class="main">${esc(q.text)}</div><button class="x" data-act="qDel" data-id="${q.id}" aria-label="Apagar pergunta: ${esc(q.text)}">×</button></div>`).join('')||'<p class="hint">Lembrou de algo? Anote aqui na hora. Na consulta, é só abrir.</p>'}</div>
  ${done?`<button class="linkbtn" data-act="qClear">Limpar ${done} ${done>1?'respondidas':'respondida'}</button>`:''}</div>
 <div class="card"><div class="card-h"><h2>Resumo dos últimos 14 dias</h2></div><dl class="sumlist">${L.map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
  <div class="frow2"><button class="btn primary" data-act="sumShare">${ic('note')}Enviar ou copiar</button><button class="btn ghost" data-act="sumPrint">Imprimir</button></div>
  <p class="hint">Mostre ao pediatra na consulta. São só os registros de vocês, não substituem a avaliação médica.</p></div>`};
document.addEventListener('submit',async e=>{if(e.target.id!=='qForm')return;e.preventDefault();e.stopImmediatePropagation();const t=e.target.q.value.trim();if(!t)return;
 e.target.q.value='';try{await w(store.set('questions/'+newId(),{text:t,done:false,at:Date.now(),by:WHO}));toast('Pergunta anotada')}catch(err){}},true);
A.qDone=id=>{const q=(S.questions||[]).find(x=>x.id===id);if(q)return w(store.set('questions/'+id,{...strip(q),done:true})).then(()=>toast('Marcada como respondida'))};
A.qDel=id=>w(store.del('questions/'+id));
A.qClear=()=>w(store.delMany((S.questions||[]).filter(q=>q.done).map(q=>'questions/'+q.id)));
function sumText(){const n=S.cfg?.name||'Bebê',a=age();return`${n} · ${a?ageText(a):''}\nResumo dos últimos 14 dias (Diário do Bebê)\n\n`+visitSummary().map(([k,v])=>`${k}: ${v}`).join('\n')+(qOpen().length?`\n\nPerguntas:\n`+qOpen().map(q=>'• '+q.text).join('\n'):'')}
A.sumShare=async()=>{const t=sumText();try{if(navigator.share){await navigator.share({title:'Resumo para a consulta',text:t});return}}catch(e){if(e&&e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(t);toast('Resumo copiado. Cole no WhatsApp ou e-mail.')}catch(e){toast('Não deu para copiar neste aparelho.',true)}};
A.sumPrint=()=>{const wdw=window.open('','_blank');if(!wdw){toast('Libere a abertura de janelas para imprimir.',true);return}
 wdw.document.write(`<meta charset="utf-8"><title>Resumo para a consulta</title><pre style="font:15px/1.6 system-ui;white-space:pre-wrap;padding:24px">${esc(sumText())}</pre>`);wdw.document.close();wdw.focus();wdw.print()};
/* backup: todos os dados da família num arquivo (em lotes de 1.000) */
A.backup=async()=>{const out=[];for(let i=0;;i+=1000){const{data,error}=await sb.from('docs').select('path,data,updated_at').eq('family_id',FAM).eq('deleted',false).order('path').range(i,i+999);
  if(error){toast('Não deu para baixar agora. Confira a internet e tente de novo.',true);return}out.push(...data);if(data.length<1000)break}
 const blob=new Blob([JSON.stringify({app:'Diário do Bebê',em:new Date().toISOString(),bebe:S.cfg?.name,registros:out},null,1)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`diario-do-bebe-${isoDate(Date.now())}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
 toast(`Backup baixado: ${out.length} itens. Fotos e anexos continuam guardados no app.`)};
