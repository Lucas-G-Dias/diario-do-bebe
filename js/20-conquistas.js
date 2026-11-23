/* ============ Conquistas: sequência de dias, nível da família e medalhas ============ */
/* Medalhas ganhas ficam salvas em game/main (da família), então não somem quando os meses antigos saem da tela. */
const LEVELS=['Começando','Pegando o jeito','Dupla afinada','Cuidadores dedicados','Mestres da rotina','Lendas do berço'];
const BADGES=[
 ['first','star','var(--accent)','Primeiro registro','Registre qualquer coisa',g=>g.n>0],
 ['s3','flame','var(--impact)','3 dias seguidos','Registre 3 dias seguidos',g=>g.best>=3],
 ['s7','flame','var(--impact)','Uma semana seguida','7 dias seguidos com registro',g=>g.best>=7],
 ['s30','flame','var(--impact)','Um mês sem falhar','30 dias seguidos',g=>g.best>=30],
 ['fr10','diaper','var(--diaper)','10 trocas','Registre 10 fraldas',g=>g.diaper>=10],
 ['fr100','diaper','var(--diaper)','100 trocas','Registre 100 fraldas',g=>g.diaper>=100],
 ['mam50','bottle','var(--feed)','50 mamadas','Registre 50 mamadas',g=>g.feed>=50],
 ['sono20','moon','var(--sleep)','20 sonecas','Registre 20 sonos',g=>g.sleep>=20],
 ['night','moon','var(--sleep)','Plantão da madrugada','Registre algo entre meia-noite e 5h',g=>g.night],
 ['team','users','var(--accent)','Time completo','Duas pessoas registrando',g=>g.people>=2],
 ['foto1','image','var(--feed)','Primeira foto','Guarde uma foto no álbum',g=>S.photos.length>=1],
 ['foto25','image','var(--feed)','25 memórias','Guarde 25 fotos',g=>S.photos.length>=25],
 ['ms1','star','var(--growth)','Primeira vez','Registre uma conquista do bebê',g=>S.ms.length>=1],
 ['peso3','growth','var(--growth)','Curva em dia','Registre 3 medidas',g=>S.growth.length>=3],
 ['vax5','syringe','var(--health)','Vacinas em dia','Marque 5 vacinas aplicadas',g=>g.vax>=5],
 ['stock','box','var(--diaper)','Estoque organizado','Cadastre fraldas de 2 tamanhos',g=>new Set(S.inv.filter(i=>i.cat==='fralda').map(i=>i.size)).size>=2],
 ['enx','bag','var(--feed)','Enxoval pela metade','Metade do enxoval comprado ou ganho',g=>S.enx.length>=10&&enxStats(S.enx).done*2>=S.enx.length],
 ['bell','bell','var(--warn)','Sempre avisados','Ative os avisos neste aparelho',g=>PUSH==='on']];
function gameStats(){
 const evs=allEv(),now=Date.now(),days=new Set(evs.map(e=>isoDate(e.start)));
 const prevDay=d=>dayStart(d-12*HR);
 let streak=0,d=dayStart(now);const today=days.has(isoDate(d));if(!today)d=prevDay(d);
 while(days.has(isoDate(d))){streak++;d=prevDay(d)}
 let best=0,run=0;[...days].sort().forEach((k,i,a)=>{run=i&&Date.parse(k)-Date.parse(a[i-1])<=1.5*DAY?run+1:1;best=Math.max(best,run)});
 const cnt=t=>evs.filter(e=>e.type===t).length,wk={};evs.filter(e=>e.start>now-7*DAY).forEach(e=>{const k=e.by||'Alguém';wk[k]=(wk[k]||0)+1});
 const vax=Object.values(S.vax).filter(v=>v.done).length,have=Object.keys(S.game?.b||{}).length;
 const g={n:evs.length,days,today,streak,best:Math.max(best,S.game?.best||0),diaper:cnt('diaper'),feed:cnt('feed'),sleep:cnt('sleep'),vax,wk,
  night:evs.some(e=>new Date(e.start).getHours()<5),people:new Set(evs.map(e=>e.by).filter(Boolean)).size};
 g.xp=(S.game?.xp0||0)+evs.length*2+S.photos.length*3+S.ms.length*5+S.growth.length*3+vax*3+have*10;
 let lv=1;while(g.xp>=25*lv*(lv+1))lv++;g.lv=lv;g.lvName=LEVELS[Math.min(lv-1,LEVELS.length-1)];
 const a=25*(lv-1)*lv,b=25*lv*(lv+1);g.pct=Math.round((g.xp-a)/(b-a)*100);g.toNext=b-g.xp;
 g.got=BADGES.filter(x=>(S.game?.b||{})[x[0]]||x[5](g)).map(x=>x[0]);return g}
function gameCard(){if(S.game===undefined)return'';const g=gameStats();
 const sub=g.streak&&!g.today?'<span class="warn-t">Registre algo hoje para não perder a sequência</span>':`Nível ${g.lv} · ${g.lvName}`;
 return`<button class="card game" data-act="tab" data-id="conquistas" aria-label="Conquistas: ${g.streak} ${g.streak===1?'dia':'dias'} seguidos, nível ${g.lv}, ${g.got.length} de ${BADGES.length} medalhas">
 <span class="flame${g.streak?'':' off'}">${ic('flame')}<b>${g.streak}</b></span>
 <span class="gtx"><b>${g.streak?`${g.streak} ${g.streak===1?'dia':'dias'} seguidos`:'Comece sua sequência'}</b><span>${sub}</span><i class="xp"><b style="width:${g.pct}%"></b></i></span>
 <span class="gmed">${ic('medal')}${g.got.length}/${BADGES.length}</span></button>`}
VIEWS.conquistas=()=>{const g=gameStats(),now=Date.now(),max=Math.max(1,...Object.values(g.wk));
 const dots=Array.from({length:14},(_,i)=>{const d=dayStart(now-(13-i)*DAY),on=g.days.has(isoDate(d));return`<span class="dot${on?' on':''}${i===13?' hoje':''}" title="${fmtD(d)}${on?': com registro':': sem registro'}"></span>`}).join('');
 return`<div class="card lvl"><div class="lv-n">${g.lv}</div><div class="grow"><div class="small muted">Nível da família</div><b>${g.lvName}</b><i class="xp"><b style="width:${g.pct}%"></b></i><div class="small muted">${g.xp} pontos · faltam ${g.toNext} para o nível ${g.lv+1}</div></div></div>
 <div class="card streak14"><div class="card-h"><h2>${ic('flame')} ${g.streak} ${g.streak===1?'dia seguido':'dias seguidos'}</h2><span class="small muted">recorde ${g.best}</span></div><div class="dots14" role="img" aria-label="Últimos 14 dias: ${[...Array(14)].filter((_,i)=>g.days.has(isoDate(dayStart(now-(13-i)*DAY)))).length} com registro">${dots}</div></div>
 ${Object.keys(g.wk).length?`<div class="card"><div class="card-h"><h2>Esta semana</h2><span class="small muted">registros por pessoa</span></div>${Object.entries(g.wk).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="wkrow"><span>${esc(k)}</span><i><b style="width:${v/max*100}%"></b></i><b>${v}</b></div>`).join('')}</div>`:''}
 <div class="card"><div class="card-h"><h2>Medalhas</h2><span class="small muted">${g.got.length} de ${BADGES.length}</span></div><div class="badges">${BADGES.map(([id,i,c,t,how])=>{const on=g.got.includes(id);return`<div class="bdg${on?' on':''}" style="--c:${c}"><span class="ic">${ic(on?i:'lock')}</span><b>${t}</b><span>${on?'Conquistada':how}</span></div>`}).join('')}</div></div>`};
/* confere novas medalhas depois que os dados chegam; comemora uma vez só (vale para os dois aparelhos) */
let GAME_T=null;
function checkGame(){clearTimeout(GAME_T);GAME_T=setTimeout(async()=>{
 if(!FAM||!S.cfg||S.game===undefined||pageState('inicio')!=='ok'||TOUR)return;
 const g=gameStats(),old=S.game?.b||{},fresh=g.got.filter(id=>!old[id]);if(!fresh.length&&(S.game?.best||0)>=g.best)return;
 const first=!S.game?.b,b={...old};fresh.forEach(id=>b[id]=Date.now());
 try{await store.set('game/main',{...(S.game||{}),b,best:g.best})}catch(e){return}
 if(first){if(fresh.length)toast(`Vocês já têm ${fresh.length} ${fresh.length>1?'medalhas':'medalha'}! Veja em Menu › Conquistas.`);return}
 if(fresh.length)celebrate(fresh.map(id=>BADGES.find(x=>x[0]===id)))},1500)}
function celebrate(list){let el=$('#cele');el?.remove();el=document.createElement('div');el.id='cele';el.setAttribute('role','status');
 el.innerHTML=`<div class="conf" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i style="--x:${(i*37)%100}%;--d:${(i%5)*.08}s;--r:${i*47}deg"></i>`).join('')}</div>
 <span class="ic lg">${ic(list[0][1])}</span><div class="grow"><small>${list.length>1?list.length+' medalhas novas!':'Medalha nova!'}</small><b>${list.map(x=>x[3]).join(' · ')}</b></div><button class="btn sm" data-act="celeGo">Ver</button>`;
 document.body.appendChild(el);setTimeout(()=>el.remove(),6000)}
A.celeGo=()=>{$('#cele')?.remove();A.tab('conquistas')};
