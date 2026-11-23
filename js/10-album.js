/* ---------- álbum ---------- */
const ALB={mode:lsGet('ddb-alb-mode')||'fases',open:null};
const URLS=new Map(),ALB_COLORS=['var(--accent)','var(--feed)','var(--sleep)','var(--health)','var(--growth)','var(--diaper)'];
const PRE={name:'Antes de nascer',range:'gravidez'};
const phRange=p=>p.to<999?`${p.from} a ${p.to} meses`:`${p.from}+ meses`;
function phaseKey(p){if(!S.cfg?.birth||!p.date)return 0;const a=age(dateOnly(p.date));if(!a||a.days<0)return -1;const i=PHASES.findIndex(ph=>a.months>=ph.from&&a.months<ph.to);return i<0?PHASES.length-1:i}
const byDateAsc=(a,b)=>(a.date||'').localeCompare(b.date||'')||(a.createdAt||0)-(b.createdAt||0);
const photosDesc=()=>[...S.photos].sort((a,b)=>byDateAsc(b,a));
const photoAge=p=>{if(!S.cfg?.birth||!p.date)return'';const a=age(dateOnly(p.date));return!a||a.days<0?'antes de nascer':'com '+ageText(a)};
function imgTag(path,cls,alt){const c=URLS.get(path),ok=c&&c.exp>Date.now();return`<img${cls?` class="${cls}"`:''} ${ok?`src="${c.url}"`:''} data-p="${esc(path)}" alt="${esc(alt||'')}" loading="lazy" decoding="async">`}
let HYD=false;
async function hydrate(){if(HYD)return;const imgs=[...document.querySelectorAll('img[data-p]:not([src])')];if(!imgs.length)return;HYD=true;
 try{const need=[...new Set(imgs.map(i=>i.dataset.p))].filter(p=>!(URLS.get(p)?.exp>Date.now()));
  for(let i=0;i<need.length;i+=100){const{data}=await sb.storage.from('files').createSignedUrls(need.slice(i,i+100),6*3600);(data||[]).forEach(d=>{if(d.signedUrl&&d.path)URLS.set(d.path,{url:d.signedUrl,exp:Date.now()+5.5*HR})})}
  document.querySelectorAll('img[data-p]:not([src])').forEach(i=>{const c=URLS.get(i.dataset.p);if(c)i.src=c.url})}catch(e){console.warn(e)}finally{HYD=false}}
function mosaic(list,c,icn){const pick=[...list.filter(p=>p.fav),...list.filter(p=>!p.fav)].slice(0,3);
 if(!pick.length)return`<div class="mosaic n0" style="--c:${c}">${ic(icn||'image')}</div>`;
 return`<div class="mosaic n${pick.length}">${pick.map(p=>imgTag(p.thumb,'','')).join('')}</div>`}
function coverOf(al){const ph=S.photos.filter(p=>p.albumId===al.id);const cv=ph.find(p=>p.id===al.cover);return cv?[cv,...ph.filter(p=>p!==cv)]:ph}
function pgrid(list){return`<div class="pgrid">${list.map((p,i)=>`<button data-act="vw" data-id="${i}" aria-label="${esc(p.caption||'Foto')}">${imgTag(p.thumb,'','')}${p.fav?`<span class="fv">${ic('heartf')}</span>`:''}</button>`).join('')}</div>`}
let VIEWLIST=[];
function chapterList(){const o=ALB.open;if(!o)return[];
 if(o.kind==='phase')return S.photos.filter(p=>phaseKey(p)===o.key).sort(byDateAsc);
 if(o.kind==='album')return S.photos.filter(p=>p.albumId===o.id).sort(byDateAsc);return[]}
function albTitle(){const o=ALB.open;if(!o)return'Álbum';if(o.kind==='phase')return o.key<0?PRE.name:PHASES[o.key].name;const al=S.albums.find(x=>x.id===o.id);return al?al.title:'Álbum'}
VIEWS.album=()=>{
 if(ALB.open)return albumDetail();
 const all=photosDesc(),n=S.cfg?.name||'o bebê',a=age(),cur=a?PHASES.findIndex(ph=>a.months>=ph.from&&a.months<ph.to):0;
 const tabs=[['fases','Fases'],['albuns','Álbuns'],['todas','Todas'],['favoritas','Favoritas']];
 const head=`<div class="alb-head"><div class="alb-tabs">${tabs.map(([k,l])=>`<button class="chip" aria-pressed="${ALB.mode===k}" data-act="albMode" data-id="${k}">${l}</button>`).join('')}</div></div>`;
 if(!all.length&&ALB.mode!=='albuns')return head+`<div class="card empty-hero"><span class="ic lg" style="--c:var(--feed);margin:0 auto 10px">${ic('image')}</span><h2>Guarde as fotos de ${esc(n)}</h2><p class="muted small" style="max-width:340px;margin:8px auto 14px">Elas se organizam sozinhas pelas fases, pela data em que foram tiradas. Você também pode criar álbuns próprios, como "Primeiro Natal" ou "Visita dos avós".</p><button class="btn primary" data-act="albAdd">Adicionar fotos</button></div>`;
 if(ALB.mode==='fases'){const keys=[];const hasPre=all.some(p=>phaseKey(p)===-1);if(hasPre)keys.push(-1);for(let i=0;i<=Math.max(cur,0);i++)keys.push(i);
  return head+`<div class="chaps">${keys.reverse().map(k=>{const list=all.filter(p=>phaseKey(p)===k),ph=k<0?PRE:PHASES[k];if(!list.length)return`<button class="chap mini" data-act="albOpen" data-id="p${k}"><div class="meta"><span class="ic" style="--c:var(--growth)">${ic('sprout')}</span><div class="tx"><b>${esc(ph.name)}</b><span>${k<0?PRE.range:phRange(ph)} · sem fotos ainda</span></div>${k===cur?'<span class="pill ok">agora</span>':''}</div></button>`;
  return`<button class="chap" data-act="albOpen" data-id="p${k}">${mosaic(list,'var(--growth)','sprout')}<div class="meta"><div class="tx"><b>${esc(ph.name)}</b><span>${k<0?PRE.range:phRange(ph)} · ${list.length} ${list.length===1?'foto':'fotos'}</span></div>${k===cur?'<span class="pill ok">agora</span>':''}</div></button>`}).join('')}</div>`}
 if(ALB.mode==='albuns')return head+`<div class="chaps">${[...S.albums].sort((x,y)=>(y.createdAt||0)-(x.createdAt||0)).map(al=>{const list=coverOf(al),c=ALB_COLORS[al.color||0];return`<button class="chap" style="--c:${c}" data-act="albOpen" data-id="a${al.id}"><div class="stripe"></div>${mosaic(list,c,'image')}<div class="meta"><div class="tx"><b>${esc(al.title)}</b><span>${list.length} ${list.length===1?'foto':'fotos'}${al.desc?' · '+esc(al.desc):''}</span></div></div></button>`}).join('')}<button class="chap newc" data-act="albNew">${ic('plus')}Criar álbum</button></div>`;
 const list=ALB.mode==='favoritas'?all.filter(p=>p.fav):all;VIEWLIST=list;
 if(!list.length)return head+`<div class="empty">Toque no coração de uma foto para ela aparecer aqui.</div>`;
 const groups=[];list.forEach((p,i)=>{const k=(p.date||'').slice(0,7);let g=groups[groups.length-1];if(!g||g.k!==k){g={k,items:[]};groups.push(g)}g.items.push(p)});
 let idx=0;return head+groups.map(g=>{const [y,m]=g.k.split('-');const h=`<div><div class="month-h">${m?MOF[+m-1].replace(/^./,c=>c.toUpperCase())+' de '+y:'Sem data'}</div><div class="pgrid">${g.items.map(p=>`<button data-act="vw" data-id="${idx++}">${imgTag(p.thumb,'','')}${p.fav?`<span class="fv">${ic('heartf')}</span>`:''}</button>`).join('')}</div></div>`;return h}).join('');
};
function albumDetail(){const o=ALB.open,list=chapterList();VIEWLIST=list;
 let hero='';
 if(o.kind==='phase'){const ph=o.key<0?PRE:PHASES[o.key],note=S.albnotes[String(o.key)]?.text||'';
  hero=`<div class="card chap-hero"><div class="small muted">${o.key<0?PRE.range:phRange(ph)} · ${list.length} ${list.length===1?'foto':'fotos'}</div>${note?`<div class="notes">${esc(note)}</div>`:''}<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-act="albNote">${note?'Editar memórias':'Escrever memórias desta fase'}</button><button class="btn sm primary" data-act="albAdd">${ic('plus')}Fotos</button></div></div>`}
 else{const al=S.albums.find(x=>x.id===o.id);if(!al){ALB.open=null;return VIEWS.album()}
  hero=`<div class="card chap-hero" style="border-top:4px solid ${ALB_COLORS[al.color||0]}">${al.desc?`<div class="notes">${esc(al.desc)}</div>`:''}<div class="small muted">${list.length} ${list.length===1?'foto':'fotos'}</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-act="albEdit" data-id="${al.id}">Editar álbum</button><button class="btn sm primary" data-act="albAdd">${ic('plus')}Fotos</button></div></div>`}
 return hero+(list.length?pgrid(list):`<div class="empty">Nenhuma foto aqui ainda. Toque em <b>Fotos</b> para adicionar.</div>`)}
A.albMode=k=>{ALB.mode=k;lsSet('ddb-alb-mode',k);LAST_TAB=null;render()};
A.albOpen=id=>{ALB.open=id[0]==='p'?{kind:'phase',key:+id.slice(1)}:{kind:'album',id:id.slice(1)};LAST_TAB=null;render();window.scrollTo(0,0)};
A.albBack=()=>{ALB.open=null;LAST_TAB=null;render();window.scrollTo(0,0)};
A.albAdd=()=>{const f=$('#albFile');if(f){f.value='';f.click()}};
A.albNote=()=>{const k=String(ALB.open.key),cur=S.albnotes[k]?.text||'';openModal({title:'Memórias de '+esc(albTitle()),body:fld('Como foi essa fase',`<textarea name="text" id="an-text" style="min-height:160px" placeholder="O que vocês querem lembrar: manias, apelidos, músicas, quem visitou…">${esc(cur)}</textarea>`),onSave:async fd=>{await w(store.set('albnotes/'+k,{text:(fd.text||'').trim()}));toast('Memórias salvas')}})};
function albForm(al){return`${fld('Nome do álbum',`<input name="title" id="al-title" value="${esc(al.title||'')}" required placeholder="Ex.: Primeiro Natal">`)}${fld('Descrição (opcional)',`<textarea name="desc" id="al-desc" placeholder="Uma frase sobre esse momento">${esc(al.desc||'')}</textarea>`)}
 <div class="fld"><span>Cor</span><div class="swatches">${ALB_COLORS.map((c,i)=>`<label><input type="radio" name="color" value="${i}"${(al.color||0)===i?' checked':''}><span style="--c:${c}"></span></label>`).join('')}</div></div>`}
A.albNew=()=>openModal({title:'Novo álbum',saveLabel:'Criar',body:albForm({}),onSave:async fd=>{if(!fd.title.trim()){toast('Dê um nome ao álbum.',true);return false}const id=newId();await w(store.set('albums/'+id,{title:fd.title.trim(),desc:fd.desc.trim(),color:+fd.color||0,cover:'',createdAt:Date.now()}));ALB.open={kind:'album',id};toast('Álbum criado')}});
A.albEdit=id=>{const al=S.albums.find(x=>x.id===id);if(!al)return;openModal({title:'Editar álbum',body:albForm(al),onSave:async fd=>{if(!fd.title.trim())return false;await w(store.set('albums/'+id,{...strip(al),title:fd.title.trim(),desc:fd.desc.trim(),color:+fd.color||0}));toast('Álbum salvo')},
 onDelete:async()=>{for(const p of S.photos.filter(p=>p.albumId===id))await store.set('photos/'+p.id,{...strip(p),albumId:''});await w(store.del('albums/'+id));ALB.open=null;toast('Álbum apagado. As fotos continuam nas fases.')}})};
const albumSelect=sel=>`<select name="albumId" id="ph-alb"><option value="">Nenhum (só nas fases)</option>${[...S.albums].sort((a,b)=>a.title.localeCompare(b.title)).map(al=>`<option value="${al.id}"${sel===al.id?' selected':''}>${esc(al.title)}</option>`).join('')}</select>`;
/* envio */
async function exifDate(f){try{const b=new DataView(await f.slice(0,262144).arrayBuffer());if(b.getUint16(0)!==0xFFD8)return null;let o=2;
 while(o<b.byteLength-10){const m=b.getUint16(o);if(m===0xFFE1&&b.getUint32(o+4)===0x45786966){const t=o+10,le=b.getUint16(t)===0x4949,g16=x=>b.getUint16(x,le),g32=x=>b.getUint32(x,le);
  const rd=ifd=>{const n=g16(t+ifd),r={};for(let i=0;i<n;i++){const e=t+ifd+2+i*12;r[g16(e)]=e}return r};
  const str=e=>{const c=g32(e+4),off=c>4?t+g32(e+8):e+8;let s='';for(let i=0;i<c-1&&off+i<b.byteLength;i++)s+=String.fromCharCode(b.getUint8(off+i));return s};
  const i0=rd(g32(t+4));let d=null;if(i0[0x8769]){const ex=rd(g32(i0[0x8769]+8));if(ex[0x9003])d=str(ex[0x9003])}if(!d&&i0[0x0132])d=str(i0[0x0132]);
  const mm=d&&d.match(/^(\d{4}):(\d{2}):(\d{2})/);return mm&&+mm[1]>1990?`${mm[1]}-${mm[2]}-${mm[3]}`:null}
  if((m&0xFF00)!==0xFF00)return null;o+=2+b.getUint16(o+2)}}catch(e){}return null}
async function bitmap(f){try{return await createImageBitmap(f,{imageOrientation:'from-image'})}catch(e){const u=URL.createObjectURL(f);try{const im=new Image();im.src=u;await im.decode();return im}finally{setTimeout(()=>URL.revokeObjectURL(u),1000)}}}
function jpeg(src,max,q){const W=src.width,H=src.height,k=Math.min(1,max/Math.max(W,H)),c=document.createElement('canvas');c.width=Math.round(W*k);c.height=Math.round(H*k);c.getContext('2d').drawImage(src,0,0,c.width,c.height);return new Promise((res,rej)=>c.toBlob(b=>b?res({b,w:c.width,h:c.height}):rej(new Error('jpeg')),'image/jpeg',q))}
let UPL=null;
function upbar(){let el=$('#upbar');if(!UPL){el&&el.remove();return}if(!el){el=document.createElement('div');el.id='upbar';el.setAttribute('role','status');document.body.appendChild(el)}el.innerHTML=`Enviando ${Math.min(UPL.done+1,UPL.n)} de ${UPL.n}<i><b style="width:${UPL.done/UPL.n*100}%"></b></i>`}
function albUpload(fl){const files=[...fl].filter(f=>/^image\//.test(f.type)||/\.(heic|heif|jpe?g|png|webp)$/i.test(f.name));if(!files.length)return;
 const def=ALB.open?.kind==='album'?ALB.open.id:'';const urls=files.slice(0,7).map(f=>URL.createObjectURL(f));
 openModal({title:`Adicionar ${files.length} ${files.length>1?'fotos':'foto'}`,saveLabel:'Enviar',body:`<div class="up-prev">${urls.map(u=>`<img src="${u}" alt="">`).join('')}${files.length>7?`<span>+${files.length-7}</span>`:''}</div>
  ${fld('Álbum',albumSelect(def))}
  ${fld('Legenda (opcional)','<input name="caption" id="u-cap" placeholder="Ex.: primeiro banho de banheira">')}
  <label class="switch"><span class="tx">Usar a data em que cada foto foi tirada<div class="small muted">Desligado, todas ficam com a data abaixo.</div></span><input type="checkbox" name="exif" checked></label>
  ${fld('Data','<input type="date" name="date" id="u-date" value="'+isoDate(Date.now())+'">')}`,
  onSave:fd=>{uploadPhotos(files,fd);setTimeout(()=>urls.forEach(u=>URL.revokeObjectURL(u)),3000)}})}
async function uploadPhotos(files,fd){
 if(!navigator.onLine){toast('Para enviar fotos é preciso internet.',true);return}
 if(UPL){toast('Espere o envio atual terminar.',true);return}
 UPL={n:files.length,done:0};upbar();let fail=0,heic=0;const albumId=fd.albumId||'';
 for(const f of files){try{
   const date=fd.exif?((await exifDate(f))||isoDate(f.lastModified||Date.now())):(fd.date||isoDate(Date.now()));
   const src=await bitmap(f),full=await jpeg(src,1600,.85),th=await jpeg(src,480,.78);src.close&&src.close();
   const id=newId(),base=`${FAM}/fotos/${id}`;
   let r=await sb.storage.from('files').upload(base+'.jpg',full.b,{contentType:'image/jpeg'});if(r.error)throw r.error;
   r=await sb.storage.from('files').upload(base+'_t.jpg',th.b,{contentType:'image/jpeg'});if(r.error)throw r.error;
   await store.set('photos/'+id,{path:base+'.jpg',thumb:base+'_t.jpg',w:full.w,h:full.h,date,caption:(fd.caption||'').trim(),albumId,fav:false,by:WHO,createdAt:Date.now()});
   if(albumId){const al=S.albums.find(x=>x.id===albumId);if(al&&!al.cover)await store.set('albums/'+albumId,{...strip(al),cover:id})}
  }catch(e){console.warn(e);fail++;if(/heic|heif/i.test(f.type+f.name))heic++}
  UPL.done++;upbar()}
 UPL=null;upbar();
 toast(fail?(heic?`${fail} foto(s) em formato HEIC não abriram neste aparelho. Envie pelo iPhone ou como JPG.`:`${files.length-fail} enviada(s), ${fail} com erro.`):(files.length>1?`${files.length} fotos guardadas`:'Foto guardada'),!!fail);
}
/* visualizador */
const VW={list:[],i:0};
function openViewer(list,i){VW.list=list;VW.i=i;drawViewer()}
function drawViewer(){let el=$('#viewer');const p=VW.list[VW.i];if(!p){el&&el.remove();return}
 if(!el){el=document.createElement('div');el.id='viewer';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);document.body.style.overflow='hidden';
  let x0=null,y0=null;el.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  el.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))A[dx<0?'vwNext':'vwPrev']();else if(dy>90&&Math.abs(dy)>Math.abs(dx))A.vwClose()})}
 const th=URLS.get(p.thumb);
 el.innerHTML=`<div class="vw-top"><button class="vw-b" data-act="vwClose" aria-label="Fechar">${ic('x')}</button><span class="vw-n">${VW.i+1} de ${VW.list.length}</span><button class="vw-b${p.fav?' on':''}" data-act="vwFav" aria-label="Favorita">${ic(p.fav?'heartf':'heart')}</button><button class="vw-b" data-act="vwEdit" aria-label="Editar">${ic('pen')}</button></div>
 <div class="vw-img">${imgTag(p.path,'',p.caption||'Foto')}${VW.i>0?`<button class="vw-arrow l" data-act="vwPrev" aria-label="Anterior">${ic('back')}</button>`:''}${VW.i<VW.list.length-1?`<button class="vw-arrow r" data-act="vwNext" aria-label="Próxima">${ic('chev')}</button>`:''}</div>
 <div class="vw-cap">${p.caption?`<b>${esc(p.caption)}</b>`:''}<span>${p.date?fmtDY(dateOnly(p.date)):''}${photoAge(p)?' · '+photoAge(p):''}${p.by?' · por '+esc(p.by):''}</span></div>`;
 const img=el.querySelector('.vw-img img');if(img&&!img.src&&th&&th.exp>Date.now())img.src=th.url,img.removeAttribute('data-p'),preloadFull(img,p.path);
 hydrate();
}
async function preloadFull(img,path){let c=URLS.get(path);if(!c||c.exp<Date.now()){const{data}=await sb.storage.from('files').createSignedUrl(path,6*3600);if(!data)return;c={url:data.signedUrl,exp:Date.now()+5.5*HR};URLS.set(path,c)}const im=new Image();im.onload=()=>{img.src=c.url};im.src=c.url}
A.vw=i=>openViewer(VIEWLIST,+i);
A.vwClose=()=>{const el=$('#viewer');if(el){el.remove();document.body.style.overflow=''}};
A.vwNext=()=>{if(VW.i<VW.list.length-1){VW.i++;drawViewer()}};
A.vwPrev=()=>{if(VW.i>0){VW.i--;drawViewer()}};
A.vwFav=async()=>{const p=VW.list[VW.i];p.fav=!p.fav;drawViewer();await w(store.set('photos/'+p.id,{...strip(p),fav:p.fav}))};
A.vwEdit=()=>{const p=VW.list[VW.i];const al=p.albumId?S.albums.find(x=>x.id===p.albumId):null;
 openModal({title:'Editar foto',body:`${fld('Legenda',`<input name="caption" id="pe-cap" value="${esc(p.caption||'')}">`)}${fld('Data',`<input type="date" name="date" id="pe-date" value="${esc(p.date||'')}">`)}${fld('Álbum',albumSelect(p.albumId))}
  ${al?`<label class="switch"><span class="tx">Capa do álbum "${esc(al.title)}"</span><input type="checkbox" name="cover"${al.cover===p.id?' checked':''}></label>`:''}`,
  onSave:async fd=>{const o={...strip(p),caption:fd.caption.trim(),date:fd.date||p.date,albumId:fd.albumId||''};await w(store.set('photos/'+p.id,o));Object.assign(p,o);
   if(al&&fd.cover&&al.cover!==p.id)await store.set('albums/'+al.id,{...strip(al),cover:p.id});
   if(o.albumId&&o.albumId!==p.albumId){const na=S.albums.find(x=>x.id===o.albumId);if(na&&!na.cover)await store.set('albums/'+na.id,{...strip(na),cover:p.id})}
   toast('Foto salva');if($('#viewer'))drawViewer()},
  onDelete:async()=>{await sb.storage.from('files').remove([p.path,p.thumb]);await w(store.del('photos/'+p.id));VW.list.splice(VW.i,1);if(VW.i>=VW.list.length)VW.i=VW.list.length-1;if(VW.list.length)drawViewer();else A.vwClose();toast('Foto apagada')}})};
document.addEventListener('keydown',e=>{if(!$('#viewer'))return;if(e.key==='ArrowRight')A.vwNext();if(e.key==='ArrowLeft')A.vwPrev();if(e.key==='Escape'&&!M)A.vwClose()});
/* lembrança na Início */
function memoryCard(){if(!S.photos.length)return'';const old=S.photos.filter(p=>p.date&&dateOnly(p.date)<Date.now()-7*DAY),pool=(old.length?old:S.photos).slice().sort(byDateAsc),day=Math.floor(Date.now()/DAY),p=pool[day%pool.length];
 const dd=p.date?Math.round((dayStart(Date.now())-dayStart(dateOnly(p.date)))/DAY):0,quando=dd<1?'Hoje':dd<30?`Há ${dd} ${dd>1?'dias':'dia'}`:dd<365?`Há ${Math.round(dd/30.4)} ${Math.round(dd/30.4)>1?'meses':'mês'}`:`Há ${Math.floor(dd/365)} ${Math.floor(dd/365)>1?'anos':'ano'}`;
 VIEWLIST=pool;return`<button class="memory" data-act="vw" data-id="${pool.indexOf(p)}">${imgTag(p.path,'',p.caption||'')}<span class="tag">Lembrança</span><span class="mo"><b>${esc(p.caption||quando)}</b><span>${p.caption?quando+' · ':''}${esc(photoAge(p))}</span></span></button>`}
A.albQuick=()=>{closeModal();A.albAdd()};
