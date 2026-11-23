/* ============ eventos ============ */
let evSubs={};
function subMonths(){
 const cur=ymOf(Date.now()),want=[cur,prevYm(cur)];
 if(S.hist&&!want.includes(S.hist))want.push(S.hist);
 Object.keys(evSubs).forEach(ym=>{if(!want.includes(ym)){evSubs[ym]();delete evSubs[ym];delete S.ev[ym]}});
 want.forEach(ym=>{if(!evSubs[ym])evSubs[ym]=store.col('months/'+ym+'/events',list=>{S.ev[ym]=list.map(e=>({...e,ym}));S.loaded.ev=true;render()})});
}
const allEv=()=>Object.values(S.ev).flat().sort((a,b)=>b.start-a.start);
const ongoing=type=>allEv().find(e=>e.type===type&&e.end==null&&(type==='sleep'||e.kind==='peito'));
async function addEvent(o){
 const id=newId(),ym=ymOf(o.start);
 await w(store.set('months/'+ym+'/events/'+id,{...o,by:WHO,createdAt:Date.now()}));
 if(o.type==='diaper'&&o.itemId)adjustItem(o.itemId,-1);
 if(o.type==='diaper')wipeUse(o.kind,1);
}
async function updateEvent(old,o){
 const doc={...strip(old),...o};
 Object.keys(doc).forEach(k=>doc[k]===undefined&&delete doc[k]);
 const ym=ymOf(doc.start);
 await w(store.set('months/'+ym+'/events/'+old.id,doc));
 if(ym!==old.ym)await w(store.del('months/'+old.ym+'/events/'+old.id));
 if(old.type==='diaper'&&old.itemId!==doc.itemId){if(old.itemId)adjustItem(old.itemId,1);if(doc.itemId)adjustItem(doc.itemId,-1)}
}
async function deleteEvent(ev){
 await w(store.del('months/'+ev.ym+'/events/'+ev.id));
 if(ev.type==='diaper'&&ev.itemId)adjustItem(ev.itemId,1);
 if(ev.type==='diaper')wipeUse(ev.kind,-1);
}
async function adjustItem(id,delta){const it=S.inv.find(i=>i.id===id);if(!it)return;await w(store.set('inventory/'+id,{...strip(it),qty:Math.max(0,(+it.qty||0)+delta)}))}

/* ============ cálculos ============ */
function age(now=Date.now()){
 if(!S.cfg?.birth)return null;
 const b=new Date(S.cfg.birth+'T00:00'),n=new Date(now);
 let m=(n.getFullYear()-b.getFullYear())*12+n.getMonth()-b.getMonth();if(n.getDate()<b.getDate())m--;
 const a=new Date(b);a.setMonth(b.getMonth()+m);
 const d=Math.max(0,Math.floor((dayStart(now)-a.getTime())/DAY));const days=Math.floor((dayStart(now)-b.getTime())/DAY);
 return {m:Math.max(0,m),d,days,months:days/30.4375};
}
function ageText(a){if(!a)return'';if(a.days<0)return'ainda não nasceu';if(a.days<31)return a.days===1?'1 dia':a.days+' dias';
 const y=Math.floor(a.m/12),mm=a.m%12;let s='';if(y)s+=y+(y>1?' anos':' ano');if(mm)s+=(s?' e ':'')+mm+(mm>1?' meses':' mês');if(y<2&&a.d)s+=' e '+a.d+(a.d>1?' dias':' dia');return s}
const phaseOf=a=>PHASES.find(p=>a.months>=p.from&&a.months<p.to)||PHASES[0];
function sleepIn(evs,from,to){const now=Date.now();let t=0;evs.forEach(e=>{if(e.type!=='sleep')return;const s=Math.max(e.start,from),en=Math.min(e.end??now,to);if(en>s)t+=en-s});return t}
function dayStats(t0){
 const t1=addDays(t0,1),evs=allEv(),inDay=evs.filter(e=>e.start>=t0&&e.start<t1);
 const feeds=inDay.filter(e=>e.type==='feed'),di=inDay.filter(e=>e.type==='diaper');
 return {sleep:sleepIn(evs,t0,t1),feeds:feeds.length,ml:feeds.reduce((s,e)=>s+(+e.ml||0),0),
  diapers:di.length,xixi:di.filter(e=>e.kind==='xixi'||e.kind==='ambos').length,coco:di.filter(e=>e.kind==='coco'||e.kind==='ambos').length,list:inDay};
}
function diaperStats(){
 const now=Date.now(),fr=S.inv.filter(i=>i.cat==='fralda');
 const act=fr.find(i=>i.id===S.cfg?.diaperItem),pool=act?fr.filter(i=>normSize(i.size)===normSize(act.size)):fr;
 const total=pool.reduce((s,i)=>s+(+i.qty||0),0);
 const evs=allEv().filter(e=>e.type==='diaper'&&e.start<=now);
 const today=evs.filter(e=>e.start>=dayStart(now)).length;
 const last7=evs.filter(e=>e.start>=now-7*DAY);
 let avg=0,est=false;
 if(last7.length>=3){const first=Math.min(...evs.map(e=>e.start));avg=last7.length/Math.max(1,Math.min(7,(now-first)/DAY))}
 else{const a=age();const m=a?a.months:0;avg=m<1?10:m<6?8:m<12?6:5;est=true}
 const days=avg?total/avg:null;
 let st='ok',label='Estoque tranquilo';
 if(!fr.length){st='neutral';label='Cadastre as fraldas'}
 else if(days<=2){st='bad';label='Comprar já'}
 else if(days<=5){st='warn';label='Comprar em breve'}
 return {total,today,avg,est,days,st,label,items:fr};
}
const shopping=()=>S.inv.filter(i=>(+i.min||0)>0&&(+i.qty||0)<=(+i.min||0));
function vaxStatus(v){const done=S.vax[v[0]];if(done?.done)return{s:'done',l:'Aplicada'+(done.date?' em '+fmtDY(dateOnly(done.date)):'')};
 if(!S.cfg?.birth)return{s:'',l:''};const b=new Date(S.cfg.birth+'T12:00');b.setMonth(b.getMonth()+v[2]);const due=b.getTime(),now=Date.now();
 if(due<now-14*DAY)return{s:'late',l:'Atrasada desde '+fmtDY(due),due};if(due<now+30*DAY)return{s:'soon',l:(due<now?'Desde ':'Prevista para ')+fmtDY(due),due};return{s:'',l:'Prevista para '+fmtDY(due),due}}
const examAsAg=e=>({id:e.id,title:'Exame: '+e.name,type:'exame',date:e.date,time:e.time,place:e.place,notes:'',done:false,gcal:e.gcal,_exam:true});
const upcoming=()=>{const t0=dayStart(Date.now());return S.agenda.filter(a=>!a.done&&dateOnly(a.date)>=t0).concat(S.exams.filter(e=>e.status==='agendado'&&e.date&&dateOnly(e.date)>=t0).map(examAsAg)).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')))};

/* ============ textos dos eventos ============ */
const SIDE={E:'esquerdo',D:'direito',ambos:'os dois lados'};
const DK={xixi:'Xixi',coco:'Cocô',ambos:'Xixi e cocô',seca:'Seca'};
function evText(e){
 const now=Date.now();
 switch(e.type){
  case'sleep':return{t:e.end==null?'Dormindo agora':'Sono · '+fmtDur(e.end-e.start),d:e.end==null?'desde '+fmtT(e.start)+' ('+fmtDur(now-e.start)+')':fmtT(e.start)+' até '+fmtT(e.end)};
  case'feed':if(e.kind==='peito')return{t:e.end==null?'Mamando agora':'Peito · '+fmtDur(e.end-e.start),d:'lado '+(SIDE[e.side]||'-')+(e.end==null?' · '+fmtDur(now-e.start):'')};
   if(e.kind==='mamadeira')return{t:'Mamadeira · '+(e.ml||0)+' ml',d:e.milk==='materno'?'leite materno':'fórmula'};
   return{t:'Comidinha'+(e.food?' · '+e.food:''),d:{bem:'comeu bem',pouco:'comeu pouco',recusou:'recusou'}[e.accept]||''};
  case'diaper':{const it=S.inv.find(i=>i.id===e.itemId);return{t:'Fralda · '+(DK[e.kind]||''),d:it?it.name+(it.size?' '+it.size:''):''}}
  case'med':return{t:'Remédio · '+(e.name||''),d:e.dose||''};
  case'temp':{const v=+e.value;return{t:'Temperatura · '+num(v)+' °C',d:v>=37.8?'febre':v>=37.3?'temperatura elevada':'normal'}}
  case'bath':return{t:'Banho',d:''};
  case'note':return{t:'Anotação',d:e.text||''};
 }
 return{t:e.type,d:''};
}
function timeline(list,emptyMsg){
 if(!list.length)return`<div class="empty">${emptyMsg}</div>`;
 return`<ul class="tl">${list.map(e=>{const x=evText(e);const extra=e.note?` · ${esc(e.note)}`:'';return`<li data-act="ev" data-id="${e.id}" style="--c:${EVC[e.type]}"><span class="t">${fmtT(e.start)}</span><span class="ic" style="--c:${EVC[e.type]}">${ic(EVI[e.type])}</span><span><div class="ttl">${esc(x.t)}</div>${x.d||extra?`<div class="ds">${esc(x.d)}${extra}</div>`:''}</span><span class="by">${esc(e.by||'')}</span></li>`}).join('')}</ul>`;
}

/* ============ ícones ============ */
const ICP={
 home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 list:'<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1.3"/><circle cx="4.5" cy="12" r="1.3"/><circle cx="4.5" cy="18" r="1.3"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
 moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 bottle:'<path d="M10 2h4M10.5 2v3l-2 2.5V20a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V7.5l-2-2.5V2"/><path d="M8.5 12h7M8.5 16h7"/>',
 diaper:'<path d="M3 6h18v4a9 9 0 0 1-18 0z"/><path d="M7 6v3M17 6v3"/>',
 pill:'<path d="M10.5 20.5a5 5 0 0 1-7-7l6-6a5 5 0 0 1 7 7z"/><path d="M8.5 8.5l7 7"/>',
 thermo:'<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/>',
 drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
 note:'<path d="M5 3h10l4 4v14H5z"/><path d="M9 12h6M9 16h6"/>',
 growth:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
 flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.5 15h9"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
 box:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
 syringe:'<path d="M18 2l4 4M20 4l-4 4M14 6l4 4M15.5 8.5L8 16l-2-2 7.5-7.5M6 14l-3 3M8 16l-1 1"/>',
 sprout:'<path d="M12 21v-9"/><path d="M12 12C12 7 8.5 4 4 4c0 5 3.5 8 8 8zM12 14c0-4 3-7 8-7 0 4-3 7-8 7z"/>',
 book:'<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>',
 gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
 bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
 heart:'<path d="M12 20.5s-8-5-8-10.7A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8 2.6c0 5.7-8 10.7-8 10.7z"/>',
 wave:'<path d="M2 10c2.5-3 4.5-3 7 0s4.5 3 7 0 4.5-3 6 0"/><path d="M2 16c2.5-3 4.5-3 7 0s4.5 3 7 0 4.5-3 6 0"/>',
 rain:'<path d="M7 15a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
 fan:'<circle cx="12" cy="12" r="1.8"/><path d="M12 10.2c0-4 .8-7 3.5-7 2 0 2.8 2 1 3.8zM13.8 12c4 0 7 .8 7 3.5 0 2-2 2.8-3.8 1zM12 13.8c0 4-.8 7-3.5 7-2 0-2.8-2-1-3.8zM10.2 12c-4 0-7-.8-7-3.5 0-2 2-2.8 3.8-1z"/>',
 noise:'<path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/>',
 wind:'<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
 play:'<path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/>',
 pause:'<path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z" fill="currentColor"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 back:'<path d="M15 5l-7 7 7 7"/>',
 chev:'<path d="M9 5l7 7-7 7"/>',
 bag:'<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.6a5 5 0 0 1 6 4.9"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
 heartf:'<path d="M12 20.5s-8-5-8-10.7A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8 2.6c0 5.7-8 10.7-8 10.7z" fill="currentColor"/>',
 pen:'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
 cloudoff:'<path d="M3 3l18 18"/><path d="M8.5 6.4A5.5 5.5 0 0 1 17.1 8.5 3.5 3.5 0 0 1 19.8 14M17 17H7a4 4 0 0 1-1.3-7.8"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 cake:'<path d="M4 21h16v-8H4zM4 16.5c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 4 0M12 13V9.5"/><path d="M12 7c-1-1-1-2.2 0-4 1 1.8 1 3 0 4z"/>'
};
const ic=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICP[n]||''}</svg>`;
const IC={moon:ic('moon'),sun:ic('sun'),bottle:ic('bottle'),diaper:ic('diaper'),heart:ic('heart'),plus:ic('plus')};
const EVI={sleep:'moon',feed:'bottle',diaper:'diaper',med:'pill',temp:'thermo',bath:'drop',note:'note'};


function seg(name,opts,val,id){return`<div class="seg" role="radiogroup"${id?` id="${id}"`:''}>${opts.map(([v,l])=>`<label><input type="radio" name="${name}" value="${esc(v)}"${String(val)===String(v)?' checked':''}><span>${l}</span></label>`).join('')}</div>`}
const fld=(label,inner)=>`<label class="fld"><span>${label}</span>${inner}</label>`;
