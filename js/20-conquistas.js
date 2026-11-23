/* ============ Conquistas: sequência de dias, nível da família e medalhas ============ */
/* Medalhas ganhas ficam salvas em game/main (da família), então não somem quando os meses antigos saem da tela. */
const LEVELS=['Começando','Pegando o jeito','Dupla afinada','Cuidadores dedicados','Mestres da rotina','Lendas do berço'];
/* [id, ícone, cor, grupo, título, como ganhar, progresso(g)->[atual, meta]] — progresso dá a barrinha "faltam N" */
const cnt=(k,n)=>g=>[g[k],n];
const BADGES=[
 ['first','star','var(--accent)','Rotina','Primeiro registro','Registre qualquer coisa',cnt('n',1)],
 ['r100','list','var(--accent)','Rotina','100 registros','Registre 100 vezes',cnt('n',100)],
 ['r1000','list','var(--accent)','Rotina','1.000 registros','Registre 1.000 vezes',cnt('n',1000)],
 ['r5000','list','var(--accent)','Rotina','5.000 registros','Registre 5.000 vezes',cnt('n',5000)],
 ['s3','flame','var(--impact)','Sequência','3 dias seguidos','Registre 3 dias seguidos',cnt('best',3)],
 ['s7','flame','var(--impact)','Sequência','Uma semana','7 dias seguidos com registro',cnt('best',7)],
 ['s30','flame','var(--impact)','Sequência','Um mês sem falhar','30 dias seguidos',cnt('best',30)],
 ['s100','flame','var(--impact)','Sequência','100 dias','100 dias seguidos',cnt('best',100)],
 ['s365','flame','var(--impact)','Sequência','Um ano inteiro','365 dias seguidos',cnt('best',365)],
 ['fr10','diaper','var(--diaper)','Fraldas','10 trocas','Registre 10 fraldas',cnt('diaper',10)],
 ['fr100','diaper','var(--diaper)','Fraldas','100 trocas','Registre 100 fraldas',cnt('diaper',100)],
 ['fr500','diaper','var(--diaper)','Fraldas','500 trocas','Registre 500 fraldas',cnt('diaper',500)],
 ['fr1000','diaper','var(--diaper)','Fraldas','1.000 trocas','Registre 1.000 fraldas',cnt('diaper',1000)],
 ['fr2500','diaper','var(--diaper)','Fraldas','2.500 trocas','Registre 2.500 fraldas',cnt('diaper',2500)],
 ['meta','box','var(--diaper)','Fraldas','Meta batida','Chegue à meta de um tamanho de fralda',g=>[g.metaHit?1:0,1]],
 ['stock','box','var(--diaper)','Fraldas','Estoque organizado','Cadastre fraldas de 2 tamanhos',g=>[g.sizes,2]],
 ['mam50','bottle','var(--feed)','Alimentação','50 mamadas','Registre 50 mamadas',cnt('feed',50)],
 ['mam500','bottle','var(--feed)','Alimentação','500 mamadas','Registre 500 mamadas',cnt('feed',500)],
 ['mam1000','bottle','var(--feed)','Alimentação','1.000 mamadas','Registre 1.000 mamadas',cnt('feed',1000)],
 ['food1','bottle','var(--feed)','Alimentação','Primeira comidinha','Marque o primeiro alimento oferecido',cnt('foods',1)],
 ['food10','bottle','var(--feed)','Alimentação','10 sabores','Ofereça 10 alimentos diferentes',cnt('foods',10)],
 ['food30','bottle','var(--feed)','Alimentação','30 sabores','Ofereça 30 alimentos diferentes',cnt('foods',30)],
 ['rainbow','bottle','var(--feed)','Alimentação','Prato colorido','Um alimento de cada grupo',g=>[g.groups,g.groupsAll]],
 ['sono20','moon','var(--sleep)','Sono','20 sonecas','Registre 20 sonos',cnt('sleep',20)],
 ['sono200','moon','var(--sleep)','Sono','200 sonecas','Registre 200 sonos',cnt('sleep',200)],
 ['night','moon','var(--sleep)','Sono','Plantão da madrugada','Registre algo entre meia-noite e 5h',g=>[g.night?1:0,1]],
 ['vax5','syringe','var(--health)','Saúde','Vacinas em dia','Marque 5 vacinas aplicadas',cnt('vax',5)],
 ['vax15','syringe','var(--health)','Saúde','Caderneta cheia','Marque 15 vacinas aplicadas',cnt('vax',15)],
 ['peso3','growth','var(--growth)','Saúde','Curva em dia','Registre 3 medidas',g=>[S.growth.length,3]],
 ['peso10','growth','var(--growth)','Saúde','Acompanhamento de ouro','Registre 10 medidas',g=>[S.growth.length,10]],
 ['dev','sprout','var(--growth)','Saúde','Marcos em dia','Marque os marcos da idade atual',g=>[g.devDone,g.devNow]],
 ['ped','note','var(--health)','Saúde','Pronto para a consulta','Anote uma pergunta para o pediatra',g=>[(S.questions||[]).length,1]],
 ['enx1','bag','var(--feed)','Enxoval','Primeira compra','Marque um item como comprado ou ganho',g=>[g.enx.done,1]],
 ['enx25','bag','var(--feed)','Enxoval','25% do enxoval','Um quarto da lista pronta',g=>[g.enxPct,25]],
 ['enx50','bag','var(--feed)','Enxoval','Metade do enxoval','Metade da lista pronta',g=>[g.enxPct,50]],
 ['enx75','bag','var(--feed)','Enxoval','Quase lá','75% da lista pronta',g=>[g.enxPct,75]],
 ['enx100','bag','var(--feed)','Enxoval','Enxoval completo','Toda a lista pronta',g=>[g.enxPct,100]],
 ['gift10','heart','var(--health)','Enxoval','Muito amado','Ganhe 10 itens de presente',g=>[g.gifts,10]],
 ['foto1','image','var(--feed)','Memórias','Primeira foto','Guarde uma foto no álbum',g=>[S.photos.length,1]],
 ['foto25','image','var(--feed)','Memórias','25 memórias','Guarde 25 fotos',g=>[S.photos.length,25]],
 ['foto100','image','var(--feed)','Memórias','100 memórias','Guarde 100 fotos',g=>[S.photos.length,100]],
 ['ms1','star','var(--growth)','Memórias','Primeira vez','Registre uma conquista do bebê',g=>[S.ms.length,1]],
 ['ms10','star','var(--growth)','Memórias','10 primeiras vezes','Registre 10 conquistas do bebê',g=>[S.ms.length,10]],
 ['team','users','var(--accent)','Família','Time completo','Duas pessoas registrando',g=>[g.people,2]],
 ['bell','bell','var(--warn)','Família','Sempre avisados','Ative os avisos neste aparelho',g=>[PUSH==='on'?1:0,1]]];
const badgeOk=(x,g)=>{const[c,t]=x[6](g);return t>0&&c>=t};
/* contagem de todo o histórico vem do banco (1 consulta); o app soma com o que está na tela */
let GSTATS=null,GSTATS_T=0;
async function loadStats(force){if(!FAM||(!force&&Date.now()-GSTATS_T<60000))return;GSTATS_T=Date.now();
 try{const{data,error}=await sb.rpc('family_stats',{f:FAM});if(!error&&data){GSTATS=data;lsSet('ddb-gs-'+FAM,JSON.stringify(data));render()}}catch(e){}}
function savedStats(){if(!GSTATS&&FAM){try{GSTATS=JSON.parse(lsGet('ddb-gs-'+FAM)||'null')}catch(e){}}return GSTATS||{types:{},total:0,days:[]}}
function gameStats(){
 const evs=allEv(),now=Date.now(),H=savedStats(),days=new Set([...H.days,...evs.map(e=>isoDate(e.start))]);
 const prevDay=d=>dayStart(d-12*HR);
 let streak=0,d=dayStart(now);const today=days.has(isoDate(d));if(!today)d=prevDay(d);
 while(days.has(isoDate(d))){streak++;d=prevDay(d)}
 let best=0,run=0;[...days].sort().forEach((k,i,a)=>{run=i&&Date.parse(k)-Date.parse(a[i-1])<=1.5*DAY?run+1:1;best=Math.max(best,run)});
 const cntT=t=>Math.max(+(H.types||{})[t]||0,evs.filter(e=>e.type===t).length),wk={};evs.filter(e=>e.start>now-7*DAY).forEach(e=>{const k=e.by||'Alguém';wk[k]=(wk[k]||0)+1});
 const vax=Object.values(S.vax).filter(v=>v.done).length,have=Object.keys(S.game?.b||{}).length;
 const es=enxStats(S.enx),fr=S.inv.filter(i=>i.cat==='fralda');
 const g={n:Math.max(+H.total||0,evs.length),days,today,streak,best:Math.max(best,S.game?.best||0),diaper:cntT('diaper'),feed:cntT('feed'),sleep:cntT('sleep'),vax,wk,
  enx:es,enxPct:es.n?Math.floor(es.done/es.n*100):0,gifts:S.enx.filter(i=>i.status==='ganhou').length,sizes:new Set(fr.map(i=>i.size)).size,
  metaHit:SIZES.some(z=>sizeGoal(z)>0&&sizeQty(z)>=sizeGoal(z)),foods:typeof foodsOffered==='function'?foodsOffered().size:0,groups:typeof foodGroupsDone==='function'?foodGroupsDone():0,groupsAll:5,
  devNow:typeof devNow==='function'?devNow().length:0,devDone:typeof devNow==='function'?devNow().filter(x=>S.dev&&S.dev[x[0]]).length:0,
  night:evs.some(e=>new Date(e.start).getHours()<5),people:new Set(evs.map(e=>e.by).filter(Boolean)).size};
 g.xp=(S.game?.xp0||0)+g.n*2+S.photos.length*3+S.ms.length*5+S.growth.length*3+vax*3+have*10;
 let lv=1;while(g.xp>=25*lv*(lv+1))lv++;g.lv=lv;g.lvName=LEVELS[Math.min(lv-1,LEVELS.length-1)];
 const a=25*(lv-1)*lv,b=25*lv*(lv+1);g.pct=Math.round((g.xp-a)/(b-a)*100);g.toNext=b-g.xp;
 g.got=BADGES.filter(x=>(S.game?.b||{})[x[0]]||badgeOk(x,g)).map(x=>x[0]);return g}
function gameCard(){if(S.game===undefined)return'';const g=gameStats();
 const sub=g.streak&&!g.today?'<span class="warn-t">Registre algo hoje para não perder a sequência</span>':`Nível ${g.lv} · ${g.lvName}`;
 return`<button class="card game" data-act="tab" data-id="conquistas" aria-label="Conquistas: ${g.streak} ${g.streak===1?'dia':'dias'} seguidos, nível ${g.lv}, ${g.got.length} de ${BADGES.length} medalhas">
 <span class="flame${g.streak?'':' off'}">${ic('flame')}<b>${g.streak}</b></span>
 <span class="gtx"><b>${g.streak?`${g.streak} ${g.streak===1?'dia':'dias'} seguidos`:'Comece sua sequência'}</b><span>${sub}</span><i class="xp"><b style="width:${g.pct}%"></b></i></span>
 <span class="gmed">${ic('medal')}${g.got.length}/${BADGES.length}</span></button>`}
VIEWS.conquistas=()=>{loadStats();const g=gameStats(),now=Date.now(),max=Math.max(1,...Object.values(g.wk));
 const dots=Array.from({length:14},(_,i)=>{const d=dayStart(now-(13-i)*DAY),on=g.days.has(isoDate(d));return`<span class="dot${on?' on':''}${i===13?' hoje':''}" title="${fmtD(d)}${on?': com registro':': sem registro'}"></span>`}).join('');
 return`<div class="card lvl"><div class="lv-n">${g.lv}</div><div class="grow"><div class="small muted">Nível da família</div><b>${g.lvName}</b><i class="xp"><b style="width:${g.pct}%"></b></i><div class="small muted">${g.xp} pontos · faltam ${g.toNext} para o nível ${g.lv+1}</div></div></div>
 <div class="card streak14"><div class="card-h"><h2>${ic('flame')} ${g.streak} ${g.streak===1?'dia seguido':'dias seguidos'}</h2><span class="small muted">recorde ${g.best}</span></div><div class="dots14" role="img" aria-label="Últimos 14 dias: ${[...Array(14)].filter((_,i)=>g.days.has(isoDate(dayStart(now-(13-i)*DAY)))).length} com registro">${dots}</div></div>
 ${Object.keys(g.wk).length?`<div class="card"><div class="card-h"><h2>Esta semana</h2><span class="small muted">registros por pessoa</span></div>${Object.entries(g.wk).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="wkrow"><span>${esc(k)}</span><i><b style="width:${v/max*100}%"></b></i><b>${v}</b></div>`).join('')}</div>`:''}
 ${[...new Set(BADGES.map(x=>x[3]))].map(grp=>{const L=BADGES.filter(x=>x[3]===grp),n=L.filter(x=>g.got.includes(x[0])).length;
  return`<div class="card"><div class="card-h"><h2>${grp}</h2><span class="small muted">${n} de ${L.length}</span></div><div class="badges">${L.map(x=>{const[id,i,c,,t,how,pr]=x,on=g.got.includes(id),[cur,tot]=pr(g);
   return`<button class="bdg${on?' on':''}" style="--c:${c}" data-act="medal" data-id="${id}" aria-label="${t}: ${on?'conquistada, '+TIERS[tierOf(id)][0]:'faltam '+Math.max(0,tot-cur).toLocaleString('pt-BR')}">${medalSvg(x,on,Math.min(1,cur/(tot||1)))}<b>${t}</b>${on?'<span>Conquistada</span>':`<span>${how}</span>${tot>1?`<span class="small">${Math.min(cur,tot).toLocaleString('pt-BR')} / ${tot.toLocaleString('pt-BR')}</span>`:''}`}</button>`}).join('')}</div></div>`}).join('')}`};
/* confere novas medalhas depois que os dados chegam; comemora uma vez só (vale para os dois aparelhos) */
let GAME_T=null;
function checkGame(){clearTimeout(GAME_T);GAME_T=setTimeout(async()=>{
 if(!FAM||!S.cfg||S.game===undefined||pageState('inicio')!=='ok'||TOUR)return;loadStats();
 const g=gameStats(),old=S.game?.b||{},fresh=g.got.filter(id=>!old[id]);if(!fresh.length&&(S.game?.best||0)>=g.best)return;
 const first=!S.game?.b,b={...old};fresh.forEach(id=>b[id]=Date.now());
 try{await store.set('game/main',{...(S.game||{}),b,best:g.best})}catch(e){return}
 if(first){if(fresh.length)toast(`Vocês já têm ${fresh.length} ${fresh.length>1?'medalhas':'medalha'}! Veja em Menu › Conquistas.`);return}
 if(fresh.length)celebrate(fresh.map(id=>BADGES.find(x=>x[0]===id)))},1500)}
function celebrate(list){let el=$('#cele');el?.remove();el=document.createElement('div');el.id='cele';el.setAttribute('role','status');
 el.innerHTML=`<div class="conf" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i style="--x:${(i*37)%100}%;--d:${(i%5)*.08}s;--r:${i*47}deg"></i>`).join('')}</div>
 ${medalSvg(list[0],true)}<div class="grow"><small>${list.length>1?list.length+' medalhas novas!':'Medalha nova!'}</small><b>${list.map(x=>x[4]).join(' · ')}</b></div><button class="btn sm" data-act="celeGo">Ver</button>`;
 document.body.appendChild(el);setTimeout(()=>el.remove(),6000)}
A.celeGo=()=>{$('#cele')?.remove();A.tab('conquistas')};
