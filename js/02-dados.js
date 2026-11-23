/* ============ conexão com o Supabase ============ */
const SB_URL='https://tlkltayokmzzfreyhrvs.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsa2x0YXlva216emZyZXlocnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzNjU0MTksImV4cCI6MjExMDk0MTQxOX0.neKS33z_ombBfKXAKOBHb_PJhBACTsd406e8zAl4RXs';
const VAPID='BJDq6dRsXVri7GEmWuQp_wTXYz68C37K2EV0ikxQqs5Fwnh-u74mUF1PMTao-Flm7_EzxAbhG9X3S3IDHWkh1PE';
const sb=supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
let ME=null,FAM=null,INVITE='',MEMBERS=[],AUTH='loading';
/* ============ conexão com o Supabase + modo offline ============ */
const cache=new Map(),subs=[],pending=new Map();
let OUTBOX=[],FLUSHING=false,CACHE_T=null;
const outKey=()=>'ddb-out-'+(ME?.id||'x'),cacheKey=()=>'ddb-cache-'+FAM;
const isNet=e=>!navigator.onLine||/fetch|network|load failed|timeout|offline|aborted/i.test(String(e&&(e.message||e)||''));
const kids=pre=>{const out=[];pre+='/';cache.forEach((d,p)=>{if(p.startsWith(pre)&&!p.slice(pre.length).includes('/'))out.push({...d,id:p.slice(pre.length)})});return out};
const deliver=s=>s.doc?s.cb(cache.has(s.path)?cache.get(s.path):null):s.cb(kids(s.path));
const touch=path=>{subs.forEach(s=>{if(s.doc?s.path===path:(path.startsWith(s.path+'/')&&!path.slice(s.path.length+1).includes('/')))deliver(s)});saveCache()};
function saveNow(){clearTimeout(CACHE_T);if(!FAM)return;try{localStorage.setItem(cacheKey(),JSON.stringify(Object.fromEntries(cache)))}catch(e){}}
function saveCache(){clearTimeout(CACHE_T);CACHE_T=setTimeout(saveNow,800)}
addEventListener('pagehide',saveNow);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveNow()});
function loadCache(){try{const o=JSON.parse(localStorage.getItem(cacheKey())||'{}');CACHE_HIT=Object.keys(o).length>0;Object.entries(o).forEach(([k,v])=>{if(!cache.has(k))cache.set(k,v)})}catch(e){}
 OUTBOX.forEach(x=>x.op==='del'?cache.delete(x.path):cache.set(x.path,x.data))}
const mine=p=>(pending.get(p)||0)>Date.now()-15000||OUTBOX.some(x=>x.path===p);
/* Leitura em lote: todas as coleções pedidas no mesmo instante viram UMA consulta (antes era uma por coleção). */
const QSTATS={docs:0,ms:0};let FQ=new Set(),FQP=null,LAST_ALL=0,CACHE_HIT=false;
function fetchSub(s){FQ.add(s);if(!FQP)FQP=new Promise(r=>setTimeout(r,0)).then(runFetch);return FQP}
async function runFetch(){
 const list=[...FQ].filter(s=>subs.includes(s));FQ=new Set();FQP=null;if(!list.length||!FAM)return;
 if(list.length===subs.length)LAST_ALL=Date.now();
 const or=list.map(s=>s.doc?`path.eq.${s.path}`:`and(path.like.${s.path}/*,deleted.is.false)`).join(',');
 const t0=performance.now();QSTATS.docs++;let res;try{res=await sb.from('docs').select('path,data,deleted').eq('family_id',FAM).or(or)}catch(e){res={error:e}}
 QSTATS.ms=Math.round(performance.now()-t0);
 if(res.error){onDbErr(res.error);list.forEach(s=>{s.err=true;if(!s.doc||cache.has(s.path))deliver(s)});render();return}
 const rows=res.data||[],got=new Set(rows.map(r=>r.path));
 list.forEach(s=>{if(s.doc){if(!got.has(s.path)&&!mine(s.path))cache.delete(s.path);return}
  const pre=s.path+'/';[...cache.keys()].forEach(p=>{if(p.startsWith(pre)&&!p.slice(pre.length).includes('/')&&!got.has(p)&&!mine(p))cache.delete(p)})});
 rows.forEach(r=>{if(mine(r.path))return;r.deleted?cache.delete(r.path):cache.set(r.path,r.data)});
 list.forEach(s=>{s.loaded=true;s.err=false});markFresh();list.forEach(deliver);saveCache();render();
}
const refetchNow=()=>{subs.forEach(s=>FQ.add(s));if(!FQP)FQP=new Promise(r=>setTimeout(r,0)).then(runFetch);return FQP};
/* evita repetir a leitura completa se ela acabou de acontecer (ex.: abertura + conexão em tempo real) */
const refetchAll=(force)=>{if(!force&&Date.now()-LAST_ALL<4000)return;return refetchNow()};
function queue(op,path,data){OUTBOX=OUTBOX.filter(x=>x.path!==path);OUTBOX.push({op,path,data,ts:Date.now()});try{localStorage.setItem(outKey(),JSON.stringify(OUTBOX))}catch(e){}render()}
const row=(path,data,del,ts)=>({family_id:FAM,path,data:del?{}:data,deleted:!!del,updated_at:new Date(ts||Date.now()).toISOString(),updated_by:ME.id});
async function put(op,path,data){
 if(OUTBOX.length&&!FLUSHING)flush();
 if(!navigator.onLine){queue(op,path,data);return}
 let error;try{({error}=await sb.from('docs').upsert(row(path,data,op==='del')))}catch(e){error=e}
 if(error){if(isNet(error)){queue(op,path,data);return}throw error}
 if(OUTBOX.some(x=>x.path===path)){OUTBOX=OUTBOX.filter(x=>x.path!==path);try{localStorage.setItem(outKey(),JSON.stringify(OUTBOX))}catch(e){}}
}
async function flush(){
 if(FLUSHING||!OUTBOX.length||!FAM||!navigator.onLine)return;FLUSHING=true;const n=OUTBOX.length;let sent=0;
 try{while(OUTBOX.length){const x=OUTBOX[0];let error;try{({error}=await sb.from('docs').upsert(row(x.path,x.data,x.op==='del',x.ts)))}catch(e){error=e}
  if(error&&isNet(error))break;if(error)console.warn('registro descartado',x.path,error);else sent++;
  OUTBOX.shift();try{localStorage.setItem(outKey(),JSON.stringify(OUTBOX))}catch(e){}}}
 finally{FLUSHING=false}
 if(sent)toast(sent>1?`${sent} registros feitos sem internet foram enviados`:'Registro feito sem internet foi enviado');
 if(!OUTBOX.length&&n){S.stale=false;refetchAll(true)}render();
}
/* Interface otimista com desfazer seguro: guarda o valor anterior e o devolve se o servidor recusar. */
const snapOf=paths=>paths.map(p=>[p,cache.has(p),cache.get(p)]);
function rollback(snap){snap.forEach(([p,had,v])=>{pending.delete(p);had?cache.set(p,v):cache.delete(p)});subs.forEach(deliver);saveNow();render()}
const store={
 col(path,cb){const s={path,cb};subs.push(s);deliver(s);fetchSub(s);return()=>{const i=subs.indexOf(s);if(i>=0)subs.splice(i,1)}},
 doc(path,cb){const s={path,cb,doc:true};subs.push(s);if(cache.has(path))deliver(s);fetchSub(s);return()=>{const i=subs.indexOf(s);if(i>=0)subs.splice(i,1)}},
 async set(path,data){const snap=snapOf([path]);pending.set(path,Date.now());cache.set(path,data);touch(path);saveNow();try{await put('set',path,data)}catch(e){rollback(snap);throw e}},
 async del(path){const snap=snapOf([path]);pending.set(path,Date.now());cache.delete(path);touch(path);saveNow();try{await put('del',path,null)}catch(e){rollback(snap);throw e}},
 async delMany(paths){const snap=snapOf(paths);paths.forEach(p=>{pending.set(p,Date.now());cache.delete(p)});subs.forEach(deliver);saveNow();
  if(!navigator.onLine){paths.forEach(p=>queue('del',p,null));return}
  let error;try{({error}=await sb.from('docs').upsert(paths.map(p=>row(p,null,true))))}catch(e){error=e}
  if(error){if(isNet(error)){paths.forEach(p=>queue('del',p,null));return}rollback(snap);throw error}},
 async setMany(list){const snap=snapOf(list.map(x=>x[0]));list.forEach(([p,d])=>{pending.set(p,Date.now());cache.set(p,d)});subs.forEach(deliver);saveCache();
  if(!navigator.onLine){list.forEach(([p,d])=>queue('set',p,d));return}
  let error;try{({error}=await sb.from('docs').upsert(list.map(([p,d])=>row(p,d))))}catch(e){error=e}
  if(error){if(isNet(error)){list.forEach(([p,d])=>queue('set',p,d));return}rollback(snap);throw error}}
};
window.addEventListener('online',()=>{flush();if(FAM)refetchAll(true);render()});
window.addEventListener('offline',()=>render());
setInterval(()=>{if(OUTBOX.length)flush()},30000);
let staleTimer=null;
function markFresh(){if(S.stale){S.stale=false;render()}}
function onDbErr(e){console.warn('db',e);if(!S.stale){S.stale=true;render()}}
async function w(p){try{return await p}catch(e){const m=String(e&&(e.message||e)||'');toast(/fetch|network|Load failed/i.test(m)?'Sem internet agora. Tente de novo quando conectar.':(e&&e.code==='42501')?'Você não tem permissão para salvar nesta família.':'Não deu para salvar. Tente de novo.',true);throw e}}
