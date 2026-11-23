/* ---------- lenços: estoque em lenços, gasto estimado pelas trocas ---------- */
const WIPE_DEF={xixi:2,coco:5,ambos:5,seca:0};
const wipePer=()=>({...WIPE_DEF,...(S.cfg?.wipesPer||{})});
const wipeItems=()=>S.inv.filter(i=>i.cat==='lenco');
const wipeLeft=it=>(+it.qty||0)*(+it.perPack||0)+(+it.openLeft||0);
function wipePrimary(){const w=wipeItems().filter(i=>+i.perPack>0);return w.find(i=>i.id===S.cfg?.wipeItem&&(+i.openLeft>0||+i.qty>0))||w.find(i=>+i.openLeft>0)||[...w].filter(i=>+i.qty>0).sort((a,b)=>(+b.qty)-(+a.qty))[0]||null}
function diaperAvgByKind(){const now=Date.now(),evs=allEv().filter(e=>e.type==='diaper'&&e.start<=now&&e.start>=now-7*DAY);if(evs.length<3)return null;
 const first=Math.min(...evs.map(e=>e.start)),span=Math.max(1,Math.min(7,(now-first)/DAY)),per=wipePer();return evs.reduce((s,e)=>s+(per[e.kind]??2),0)/span}
function wipesAll(){const w=wipeItems(),total=w.reduce((s,i)=>s+wipeLeft(i),0),packs=w.reduce((s,i)=>s+(+i.qty||0),0),noSize=w.filter(i=>!(+i.perPack)).length;
 let avg=diaperAvgByKind(),est=false;if(avg==null){avg=diaperStats().avg*3.2;est=true}
 const days=avg>0?total/avg:null,today=allEv().filter(e=>e.type==='diaper'&&e.start>=dayStart(Date.now())).reduce((s,e)=>s+(wipePer()[e.kind]??2),0);
 let st='ok',label='Tranquilo';if(!w.length){st='neutral';label='Cadastre os lenços'}else if(days!=null&&days<=3){st='bad';label='Comprar já'}else if(days!=null&&days<=7){st='warn';label='Comprar em breve'}
 const open=wipePrimary();return{total,packs,n:w.length,avg,est,days,today,st,label,noSize,open}}
async function wipeUse(kind,sign){const it=wipePrimary()||(sign<0?wipeItems().find(i=>i.id===S.cfg?.wipeItem):null);if(!it||!(+it.perPack))return;const n=wipePer()[kind]??2;if(!n)return;
 let open=(+it.openLeft||0)-sign*n,qty=+it.qty||0;const opened=[...(it.opened||[])];
 if(sign>0){while(open<0&&qty>0){qty--;open+=+it.perPack;opened.push(Date.now())}if(open<0)open=0}
 await store.set('inventory/'+it.id,{...strip(it),qty,openLeft:open,opened:opened.slice(-12)})}

/* ---------- painel de estoque (Início, Enxoval) ---------- */
function spark(vals,color){const W=150,H=42,mx=Math.max(1,...vals),bw=W/vals.length;return`<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${vals.map((v,i)=>`<rect x="${(i*bw+bw*.18).toFixed(1)}" y="${(H-Math.max(2,v/mx*(H-4))).toFixed(1)}" width="${(bw*.64).toFixed(1)}" height="${Math.max(2,v/mx*(H-4)).toFixed(1)}" rx="2" fill="${color}" opacity="${i===vals.length-1?1:.45}"/>`).join('')}</svg>`}
function gauge(days,st){const pct=days==null?0:Math.min(100,days/30*100);return`<div class="gauge"><i style="width:${pct}%;--c:var(--${st==='bad'?'bad':st==='warn'?'warn':'ok'})"></i></div>`}
/* Fraldas: gráfico por tamanho (toque numa barra para ver o tamanho) + lenços */
let STK_SZ=lsGet('ddb-stk-sz')||'';
A.stkSz=z=>{STK_SZ=z;lsSet('ddb-stk-sz',z);render()};
function diaperCard(){
 const d=diaperStats(),act=activeSize(),days=[...Array(7)].map((_,i)=>addDays(dayStart(Date.now()),i-6)),st=days.map(dayStats),used7=st.reduce((s,x)=>s+x.diapers,0);
 const has=SIZES.filter(z=>sizeQty(z)>0||z===act),sel=SIZES.includes(STK_SZ)&&(sizeQty(STK_SZ)>0||STK_SZ===act)?STK_SZ:(act||has[0]||'P');
 const q=sizeQty(sel),mx=Math.max(1,...SIZES.map(sizeQty)),isAct=sel===act,tone=d.st==='bad'?'bad':d.st==='warn'?'warn':'ok';
 const sub=!S.inv.some(i=>i.cat==='fralda')?'Toque em Comprei para cadastrar':isAct?(d.days!=null?(d.days<1?'acaba hoje':`em uso · dá para uns ${Math.floor(d.days)} dias`):'em uso'):(q?`guardadas · meta ${sizeGoal(sel)}`:'nenhuma em casa');
 return`<div class="card stkd"><div class="card-h"><div style="display:flex;align-items:center;gap:10px"><span class="ic" style="--c:var(--diaper)">${ic('diaper')}</span><h2>Fraldas</h2></div>${d.items.length?`<span class="pill ${d.st}">${d.label}</span>`:''}</div>
  <div class="stkd-body"><div class="stkd-num"><div class="stk-v">${q.toLocaleString('pt-BR')}</div><div class="stk-s"><b>Tamanho ${sel}</b> ${esc(sub)}</div>${isAct?gauge(d.days,d.st):''}</div>
  <div class="szbars" role="group" aria-label="Fraldas por tamanho">${SIZES.map(z=>{const v=sizeQty(z);return`<button class="szb${z===sel?' sel':''}${z===act?' act':''}" data-act="stkSz" data-id="${z}" aria-pressed="${z===sel}" aria-label="${z}: ${v} fraldas"><span class="szv">${v||''}</span><span class="szc"><i style="height:${v?Math.max(6,v/mx*100):0}%"></i></span><span class="szl">${z}</span></button>`}).join('')}</div></div>
  <div class="stk-f">${spark(st.map(x=>x.diapers),'var(--diaper)')}<span>Hoje <b>${d.today}</b> · 7 dias <b>${used7}</b> · média <b>${num(d.avg)}</b>/dia${d.est?' (estim.)':''}</span></div>
  <div style="display:flex;gap:8px;margin-top:10px"><button class="btn sm primary" data-act="buyDiaper">Comprei</button><button class="btn sm" data-act="tab" data-id="fraldas">Ver tudo</button></div></div>`}
function wipeCard(){const wp=wipesAll(),per=wipePer(),days=[...Array(7)].map((_,i)=>addDays(dayStart(Date.now()),i-6));
 const w7=days.map(t=>allEv().filter(e=>e.type==='diaper'&&e.start>=t&&e.start<addDays(t,1)).reduce((s,e)=>s+(per[e.kind]??2),0));
 return`<button class="card stkw" data-act="tab" data-id="fraldas"><span class="stk-h"><span class="ic" style="--c:var(--accent)">${ic('drop')}</span><span>Lenços</span>${wp.n?`<i class="stdot" style="--c:var(--${wp.st==='bad'?'bad':wp.st==='warn'?'warn':'ok'})"></i>`:''}</span>
  <span class="stkw-row"><span class="stk-v">${wp.n?wp.total.toLocaleString('pt-BR'):'—'}</span><span class="stk-s">${wp.n?`${wp.st==='bad'||wp.st==='warn'?`<b class="stwarn" style="--c:var(--${wp.st==='bad'?'bad':'warn'})">${wp.label}</b> · `:''}${wp.packs} ${wp.packs===1?'pacote':'pacotes'}${wp.days!=null?` · dá para uns ${Math.floor(wp.days)} dias`:''}`:'Toque para cadastrar'}</span></span>
  ${gauge(wp.n?wp.days:null,wp.st)}<span class="stk-f">${spark(w7,'var(--accent)')}<span>Hoje ~<b>${wp.today}</b> · média ~<b>${Math.round(wp.avg)}</b>/dia${wp.est?' (estim.)':''}</span></span></button>`}
function stockPanel(){return diaperCard()+wipeCard()}
