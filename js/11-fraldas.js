/* ---------- fraldas e lenços ---------- */
const SIZES=['RN','P','M','G','XG','XXG'];
const SIZE_KG={RN:'até 4,5 kg',P:'3 a 6 kg',M:'5,5 a 9,5 kg',G:'9 a 12,5 kg',XG:'11 a 15 kg',XXG:'acima de 14 kg'};
const SIZE_GOAL={RN:60,P:300,M:600,G:600,XG:300,XXG:150};
const sizeByKg=kg=>kg<4.5?'RN':kg<6?'P':kg<9.5?'M':kg<12.5?'G':kg<15?'XG':'XXG';
const normSize=s=>{s=String(s||'').toUpperCase().replace(/\s/g,'');if(s==='XGG')s='XXG';if(s==='RM')s='RN';return SIZES.includes(s)?s:''};
const frBySize=sz=>S.inv.filter(i=>i.cat==='fralda'&&normSize(i.size)===sz);
const sizeQty=sz=>frBySize(sz).reduce((s,i)=>s+(+i.qty||0),0);
const sizeGoal=sz=>{const it=frBySize(sz).find(i=>+i.goal>0);return it?+it.goal:SIZE_GOAL[sz]};
const activeSize=()=>{const it=S.inv.find(i=>i.id===S.cfg.diaperItem);return it?normSize(it.size):''};
const lastWeight=()=>{const g=[...S.growth].filter(x=>x.w).sort((a,b)=>b.date.localeCompare(a.date))[0];return g?+g.w:null};
function wipeStats(it){const op=(it.opened||[]).filter(t=>t>Date.now()-21*DAY);let perWeek=null;if(op.length>=2){const span=Math.max(DAY,Date.now()-Math.min(...op));perWeek=op.length/(span/(7*DAY))}
 return{perWeek,days:perWeek?(+it.qty||0)/perWeek*7:null}}
VIEWS.fraldas=()=>{
 const d=diaperStats(),cur=activeSize(),kg=lastWeight(),ind=kg?sizeByKg(kg):'',wipes=S.inv.filter(i=>i.cat==='lenco');
 const days=[...Array(7)].map((_,i)=>addDays(dayStart(Date.now()),i-6)),st=days.map(dayStats);
 const max=Math.max(1,...SIZES.map(z=>Math.max(sizeQty(z),sizeGoal(z))));
 const tone=d.st==='bad'?'bad':d.st==='warn'?'warn':'ok';
 return`<div class="card fr-hero">
  <div class="card-h"><div><div class="small muted">Em uso</div><h2 style="font-size:22px">${cur?'Tamanho '+cur:'Escolha o tamanho em uso'}</h2></div>${d.items.length?`<span class="pill ${d.st}">${d.label}</span>`:''}</div>
  <div class="stats">
   <div class="stat"><div class="v">${d.total}</div><div class="k">fraldas ${cur?cur:''} em casa</div></div>
   <div class="stat"><div class="v">${d.days!=null&&d.items.length?Math.floor(d.days):'—'}</div><div class="k">dias até acabar</div></div>
   <div class="stat"><div class="v">${d.today}</div><div class="k">trocas hoje</div></div>
   <div class="stat"><div class="v">${num(d.avg)}</div><div class="k">por dia ${d.est?'(estimativa)':'(média 7 dias)'}</div></div>
  </div>
  <div class="meter" style="--c:var(--${tone});margin-top:12px"><i style="width:${d.days!=null?Math.min(100,d.days/14*100):0}%"></i></div>
  ${kg?`<p class="small" style="margin:10px 0 0">Pelo último peso (${num(kg,2)} kg), o tamanho indicado é <b>${ind}</b> (${SIZE_KG[ind]}).${cur&&ind!==cur?` <span class="pill warn">talvez seja hora de trocar</span>`:''}</p>`:''}
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn sm primary" data-act="buyDiaper">Comprei fraldas</button><button class="btn sm" data-act="frSize" data-id="${cur||'P'}">Editar tamanho ${cur||''}</button></div></div>
 <div class="card"><div class="card-h"><h2>Por tamanho</h2><span class="small muted">tem / meta</span></div>
  <div class="szchart">${SIZES.map(z=>{const q=sizeQty(z),g=sizeGoal(z),on=z===cur;return`<button class="szrow${on?' on':''}" data-act="frSize" data-id="${z}">
   <span class="sz"><b>${z}</b><span>${SIZE_KG[z]}</span></span>
   <span class="szbar"><i style="width:${q/max*100}%;--c:${on?'var(--accent)':q>=g?'var(--ok)':q?'var(--diaper)':'var(--line)'}"></i><s style="left:${g/max*100}%"></s></span>
   <span class="szn"><b>${q}</b>/${g}</span></button>`}).join('')}</div>
  <p class="small muted" style="margin:10px 0 0">A meta é uma sugestão de quanto ter de cada tamanho ao longo do uso. Toque num tamanho para mudar a quantidade, a meta ou usar esse tamanho.</p></div>
 <div class="card"><div class="card-h"><h2>Lenços umedecidos</h2><button class="btn sm primary" data-act="wipeAdd">Comprei / adicionar</button></div>
  ${(()=>{const wp=wipesAll();if(!wp.n)return`<div class="empty">Cadastre os pacotes de lenço para saber quantos tem e quando comprar.</div>`;const per=wipePer();
  return`<div class="stats" style="margin-bottom:10px"><div class="stat"><div class="v">${wp.total.toLocaleString('pt-BR')}</div><div class="k">lenços em casa</div></div><div class="stat"><div class="v">${wp.packs}</div><div class="k">pacotes fechados</div></div><div class="stat"><div class="v">${wp.days!=null?Math.floor(wp.days):'—'}</div><div class="k">dias até acabar</div></div><div class="stat"><div class="v">~${Math.round(wp.avg)}</div><div class="k">por dia ${wp.est?'(estimativa)':'(pelas trocas)'}</div></div></div>
  ${wp.open?`<p class="small" style="margin:0 0 6px">Pacote aberto: <b>${esc(wp.open.name)}</b>, com uns <b>${+wp.open.openLeft||0}</b> lenços. Cada troca desconta sozinha: xixi ${per.xixi}, cocô ${per.coco}. <button class="linkbtn" data-act="wipePer">Ajustar</button></p>`:''}
  <div class="rows">${wipeItems().sort((a,b)=>wipeLeft(b)-wipeLeft(a)).map(it=>{const low=+it.min>0&&(+it.qty||0)<=+it.min&&!(+it.openLeft>0);const on=wp.open&&wp.open.id===it.id;return`<div class="row"><div class="main" data-act="wipeEdit" data-id="${it.id}" style="cursor:pointer"><div class="ttl">${esc(it.name)} ${on?'<span class="pill ok">aberto</span>':''}${low?' <span class="pill bad">comprar</span>':''}</div><div class="small muted">${+it.perPack?`${wipeLeft(it).toLocaleString('pt-BR')} lenços · ${it.perPack} por pacote`:'falta informar lenços por pacote'}${+it.openLeft>0?` · aberto ~${it.openLeft}`:''}</div></div>
   <div class="qty"><button class="iconbtn" data-act="invDec" data-id="${it.id}" aria-label="Menos um pacote">−</button><span class="n">${it.qty||0}</span><button class="iconbtn" data-act="invInc" data-id="${it.id}" aria-label="Mais um pacote">+</button></div><button class="btn sm" data-act="wipeOpen" data-id="${it.id}">Abri</button></div>`}).join('')}</div>`})()}</div>
 <div class="card"><div class="card-h"><h2>Trocas por dia</h2><span class="small muted">últimos 7 dias</span></div>${bars(st.map(x=>x.diapers),days.map(t=>WD[new Date(t).getDay()].slice(0,3)),'var(--diaper)')}</div>`;
};
A.frSize=z=>{const items=frBySize(z),it=items.find(i=>i.id===S.cfg.diaperItem)||items[0],q=sizeQty(z),on=activeSize()===z;
 openModal({title:'Fralda tamanho '+z,body:`<p class="small muted" style="margin:0">${SIZE_KG[z]}</p>
  <div class="frow">${fld('Quantas tem agora',`<input type="number" min="0" name="qty" id="fz-q" value="${it?+it.qty||0:0}" inputmode="numeric">`)}${fld('Meta para esse tamanho',`<input type="number" min="0" name="goal" id="fz-g" value="${sizeGoal(z)}" inputmode="numeric">`)}</div>
  <div class="frow">${fld('Marca (opcional)',`<input name="brand" id="fz-b" value="${esc(it?.brand||'')}" placeholder="Ex.: Pampers">`)}${fld('Avisar quando chegar a',`<input type="number" min="0" name="min" id="fz-m" value="${it?it.min??30:30}" inputmode="numeric">`)}</div>
  ${items.length>1?`<p class="small muted">Há ${items.length} cadastros desse tamanho somando ${q}. Esta tela altera o principal.</p>`:''}
  <label class="switch"><span class="tx">Este é o tamanho em uso<div class="small muted">Cada troca registrada desconta deste tamanho.</div></span><input type="checkbox" name="active"${on?' checked':''}></label>`,
  onSave:async fd=>{const o={...(it?strip(it):{cat:'fralda',size:z,unit:'un.',note:''}),name:'Fralda '+z+(fd.brand.trim()?' · '+fd.brand.trim():''),brand:fd.brand.trim(),qty:Math.max(0,+fd.qty||0),goal:Math.max(0,+fd.goal||0),min:Math.max(0,+fd.min||0),size:z};
   const id=it?it.id:newId();await w(store.set('inventory/'+id,o));if(fd.active&&S.cfg.diaperItem!==id)await w(store.set('config/main',{...S.cfg,diaperItem:id}));toast('Tamanho '+z+' salvo')}})};
function wipeForm(it){const pp=[44,48,50,64,80,88,96,120,140];return`${fld('Marca',`<input name="name" id="wp-n" value="${esc(it.name||'')}" required list="wp-names" autocomplete="off" placeholder="Ex.: Huggies Recém-nascido">`)}<datalist id="wp-names">${wipeItems().map(i=>`<option value="${esc(i.name)}">`).join('')}</datalist>
 <div class="frow">${fld(it.id?'Pacotes fechados':'Quantos pacotes',`<input type="number" min="0" name="qty" id="wp-q" value="${it.id?+it.qty||0:''}" inputmode="numeric" placeholder="Ex.: 4">`)}${fld('Lenços por pacote',`<input type="number" min="0" name="perPack" id="wp-p" value="${+it.perPack||''}" inputmode="numeric" placeholder="Ex.: 48">`)}</div>
 <div class="chips">${pp.map(n=>`<button type="button" class="chip" data-act="setPP" data-id="${n}" aria-pressed="${+it.perPack===n}">${n} por pacote</button>`).join('')}</div>
 ${it.id?`<div class="frow">${fld('Lenços no pacote aberto',`<input type="number" min="0" name="openLeft" id="wp-o" value="${+it.openLeft||0}" inputmode="numeric">`)}${fld('Avisar com (pacotes)',`<input type="number" min="0" name="min" id="wp-m" value="${it.min??2}" inputmode="numeric">`)}</div>`:''}`}
A.setPP=n=>{const el=$('#wp-p');if(el)el.value=n;document.querySelectorAll('[data-act=setPP]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===String(n)))};
A.wipeAdd=()=>openModal({title:'Comprei lenços',saveLabel:'Somar ao estoque',body:wipeForm({})+'<p class="small muted" style="margin:0">Se a marca já estiver cadastrada, os pacotes são somados a ela.</p>',
 onSave:async fd=>{const name=fd.name.trim(),q=Math.max(0,+fd.qty||0),pp=+fd.perPack||0;if(!name){toast('Informe a marca.',true);return false}if(!q){toast('Informe quantos pacotes.',true);return false}
  const ex=wipeItems().find(i=>i.name.trim().toLowerCase()===name.toLowerCase());
  if(ex){await w(store.set('inventory/'+ex.id,{...strip(ex),qty:(+ex.qty||0)+q,perPack:pp||+ex.perPack||0}));toast(`+${q} ${q>1?'pacotes':'pacote'} de ${ex.name}`)}
  else{await w(store.set('inventory/'+newId(),{name,cat:'lenco',qty:q,perPack:pp,openLeft:0,min:2,unit:'pacotes',note:'',opened:[]}));toast('Lenços cadastrados')}}});
A.wipeEdit=id=>{const it=S.inv.find(i=>i.id===id);if(!it)return;openModal({title:'Editar lenço',body:wipeForm(it)+`<label class="switch"><span class="tx">Usar este primeiro<div class="small muted">As trocas descontam deste pacote.</div></span><input type="checkbox" name="first"${S.cfg.wipeItem===id?' checked':''}></label>`,
 onSave:async fd=>{if(!fd.name.trim())return false;await w(store.set('inventory/'+id,{...strip(it),name:fd.name.trim(),qty:Math.max(0,+fd.qty||0),perPack:+fd.perPack||0,openLeft:Math.max(0,+fd.openLeft||0),min:Math.max(0,+fd.min||0)}));
  if(fd.first&&S.cfg.wipeItem!==id)await w(store.set('config/main',{...S.cfg,wipeItem:id}));toast('Salvo')},
 onDelete:async()=>{await w(store.del('inventory/'+id));toast('Removido')}})};
A.wipePer=()=>{const p=wipePer();openModal({title:'Lenços por troca',body:`<p class="small muted" style="margin:0">Quantos lenços vocês costumam usar em cada troca. O app desconta do pacote aberto sozinho.</p><div class="frow">${fld('Xixi',`<input type="number" min="0" name="xixi" value="${p.xixi}" inputmode="numeric">`)}${fld('Cocô',`<input type="number" min="0" name="coco" value="${p.coco}" inputmode="numeric">`)}${fld('Xixi e cocô',`<input type="number" min="0" name="ambos" value="${p.ambos}" inputmode="numeric">`)}</div>`,
 onSave:async fd=>{await w(store.set('config/main',{...S.cfg,wipesPer:{xixi:+fd.xixi||0,coco:+fd.coco||0,ambos:+fd.ambos||0,seca:0}}));toast('Salvo')}})};
A.wipeOpen=async id=>{const it=S.inv.find(i=>i.id===id);if(!it)return;if(!(+it.qty>0)){toast('Não há pacotes fechados. Toque em Comprei para somar.',true);return}
 const opened=[...(it.opened||[]),Date.now()].slice(-12);await w(store.set('inventory/'+id,{...strip(it),qty:+it.qty-1,openLeft:+it.perPack||0,opened}));if(S.cfg.wipeItem!==id)await store.set('config/main',{...S.cfg,wipeItem:id});toast(`Pacote de ${it.name} aberto · ${+it.qty-1} fechados`)};
