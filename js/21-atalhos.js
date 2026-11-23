/* ============ Atalhos: repetir em um toque, teclado e ícone do app ============ */
const KIND_TXT={xixi:'xixi',coco:'cocô',ambos:'xixi e cocô',seca:'seca'};
function quickRow(){const evs=allEv().filter(e=>e.start<=Date.now()).sort((a,b)=>b.start-a.start),out=[];
 const bot=evs.find(e=>e.type==='feed'&&e.kind==='mamadeira'&&+e.ml>0);
 if(bot)out.push(`<button class="qchip" data-act="quickFeed" aria-label="Repetir mamadeira de ${+bot.ml} ml agora" style="--c:var(--feed)">${ic('bottle')}Mamadeira ${+bot.ml} ml</button>`);
 const dp=evs.find(e=>e.type==='diaper'&&KIND_TXT[e.kind]);
 if(dp)out.push(`<button class="qchip" data-act="quickDiaper" data-id="${dp.kind}" aria-label="Registrar fralda ${KIND_TXT[dp.kind]} agora" style="--c:var(--diaper)">${ic('diaper')}Fralda ${KIND_TXT[dp.kind]}</button>`);
 if(dp&&dp.kind!=='xixi')out.push(`<button class="qchip" data-act="quickDiaper" data-id="xixi" aria-label="Registrar fralda xixi agora" style="--c:var(--diaper)">${ic('diaper')}Fralda xixi</button>`);
 if(!out.length)return'';
 return`<div class="repeat" role="group" aria-label="Repetir rápido"><span class="ql">${ic('bolt')}Repetir</span>${out.join('')}</div>`}
A.quickFeed=async()=>{const e=allEv().filter(x=>x.type==='feed'&&x.kind==='mamadeira'&&+x.ml>0).sort((a,b)=>b.start-a.start)[0];if(!e)return;
 await addEvent({type:'feed',kind:'mamadeira',ml:+e.ml,milk:e.milk,start:Date.now()});toast(`Mamadeira de ${+e.ml} ml registrada`)};
A.quickDiaper=async kind=>{await addEvent({type:'diaper',kind,start:Date.now(),itemId:S.cfg.diaperItem||undefined});const d=diaperStats();toast('Fralda registrada'+(d.items.length?' · restam '+d.total:''))};
/* teclado (computador): uma tecla, sem estar digitando */
const KEYS={f:['diaperOpen','Fralda'],m:['feedOpen','Mamada'],s:['sleepToggle','Sono (começar/parar)'],n:['fab','Novo registro'],d:['tab:diario','Diário'],i:['tab:inicio','Início'],a:['tab:agenda','Agenda'],c:['tab:conquistas','Conquistas'],t:['themeToggle','Tema claro/escuro'],'?':['help','Central de ajuda']};
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||M||TOUR||!S.cfg||!FAM)return;
 const t=e.target;if(t.matches&&t.matches('input,textarea,select,[contenteditable]'))return;
 const k=KEYS[e.key.toLowerCase()];if(!k)return;e.preventDefault();const[a,id]=k[0].split(':');A[a](id)});
/* ícone do app (segurar no celular) abre com ?a=fralda|mamada|sono|foto|novo */
const URL_ACT={fralda:'diaperOpen',mamada:'feedOpen',sono:'sleepToggle',foto:'albQuick',novo:'fab'};
(function urlAct(){const a=new URLSearchParams(location.search).get('a');if(!URL_ACT[a])return;let n=0;
 const go=setInterval(()=>{if(++n>100)return clearInterval(go);if(!S.cfg||!FAM)return;clearInterval(go);history.replaceState(null,'',location.pathname+location.hash);
  lsSet('ddb-onb',lsGet('ddb-onb')||'1');A[URL_ACT[a]]()},200)})();
