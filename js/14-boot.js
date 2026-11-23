/* ============ início ============ */
function subscribeAll(){
 store.doc('config/main',d=>{S.cfg=d;render()});
 store.col('inventory',l=>{S.inv=l;render()});
 store.col('growth',l=>{S.growth=l;render()});
 store.col('agenda',l=>{S.agenda=l;render()});
 store.col('vaccines',l=>{S.vax=Object.fromEntries(l.map(x=>[x.id,x]));render()});
 store.col('milestones',l=>{S.ms=l;render()});
 store.col('exams',l=>{S.exams=l;render()});
 store.col('photos',l=>{S.photos=l;render()});
 store.col('enxoval',l=>{S.enx=l;render()});
 store.col('albums',l=>{S.albums=l;render()});
 store.col('questions',l=>{S.questions=l;render()});
 store.col('dev',l=>{S.dev=Object.fromEntries(l.map(x=>[x.id,x]));render()});
 store.col('foods',l=>{S.foods=l;render()});
 store.doc('game/main',d=>{S.game=d||{};render()});
 store.col('albnotes',l=>{S.albnotes=Object.fromEntries(l.map(x=>[x.id,x]));render()});
 subMonths();
}
let curYm=ymOf(Date.now());
setInterval(()=>{const ym=ymOf(Date.now());if(ym!==curYm){curYm=ym;if(FAM)subMonths()}if(!M&&S.cfg&&!['ajustes','tutorial','ajuda','sons','album'].includes(S.tab))render()},30000);
async function loadMembers(){const{data}=await sb.from('members').select('user_id,display_name').eq('family_id',FAM);MEMBERS=data||[];render()}
async function loadFamily(){
 try{OUTBOX=JSON.parse(lsGet(outKey())||'[]')}catch(e){OUTBOX=[]}
 let data,error;try{({data,error}=await sb.from('members').select('family_id,display_name,families(invite_code)').eq('user_id',ME.id).limit(1))}catch(e){error=e}
 if(error){let c=null;try{c=JSON.parse(lsGet('ddb-fam-'+ME.id)||'null')}catch(e){}if(!c){S.stale=true;AUTH='ready';return render()}data=[c];S.stale=true}
 if(!data||!data.length){FAM=null;AUTH='ready';return render()}
 FAM=data[0].family_id;WHO=data[0].display_name||'';INVITE=data[0].families?.invite_code||'';AUTH='ready';
 lsSet('ddb-fam-'+ME.id,JSON.stringify({family_id:FAM,display_name:WHO,families:{invite_code:INVITE}}));
 loadCache();flush();
 subscribeAll();loadMembers();checkPush();
 sb.channel('fam-'+FAM).on('postgres_changes',{event:'*',schema:'public',table:'docs',filter:'family_id=eq.'+FAM},p=>{const r=p.new;if(!r||!r.path)return;r.deleted?cache.delete(r.path):cache.set(r.path,r.data);touch(r.path)}).subscribe(st=>{if(st==='SUBSCRIBED')refetchAll()});
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&FAM)refetchAll()});
window.addEventListener('hashchange',()=>{const h=pageOf(location.hash.slice(1));if(location.hash.length>1&&h!==S.tab){S.tab=h;render()}});
{const h=location.hash.slice(1);S.tab=pageOf(h||S.tab)}
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(e=>console.warn('sw',e));
sb.auth.onAuthStateChange((ev,session)=>{
 if(ev==='PASSWORD_RECOVERY'){setTimeout(()=>openModal({title:'Nova senha',saveLabel:'Salvar senha',body:fld('Nova senha','<input type="password" name="pw" id="p-new" minlength="6" required autocomplete="new-password">'),onSave:async fd=>{if((fd.pw||'').length<6){toast('Mínimo de 6 caracteres.',true);return false}const{error}=await sb.auth.updateUser({password:fd.pw});if(error){toast('Não deu para trocar a senha.',true);return false}toast('Senha trocada')}}),300)}
 const u=session?.user||null;
 if(u&&(!ME||ME.id!==u.id)){ME=u;loadFamily()}
 else if(!u){ME=null;FAM=null;AUTH='ready';render()}
});
render();
