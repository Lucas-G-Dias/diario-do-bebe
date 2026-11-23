/* ============ modal ============ */
let M=null;
let MCT=null;
let M_OPENER=null;
/* volta o foco para o botão que abriu o formulário (ou o equivalente, se a tela foi redesenhada) */
function restoreFocus(){const o=M_OPENER;M_OPENER=null;if(!o||o===document.body)return;
 let t=document.contains(o)?o:null;if(!t&&o.dataset&&o.dataset.act)t=document.querySelector(`[data-act="${o.dataset.act}"]${o.dataset.id?`[data-id="${CSS.escape(o.dataset.id)}"]`:''}`);
 if(t)setTimeout(()=>t.focus({preventScroll:true}),0)}
function openModal({title,body,onSave,onDelete,saveLabel='Salvar',mount,noFooter}){clearTimeout(MCT);if(!M)M_OPENER=document.activeElement;$('#modal').classList.remove('closing');
 $('#modal').innerHTML=`<div class="ov" data-act="mclose"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><header><h3 id="mt" tabindex="-1">${title}</h3><button class="x" type="button" data-act="mclose" aria-label="Fechar">×</button></header>
 <form id="mf" novalidate>${body}${noFooter?'':`<footer>${onDelete?'<button type="button" class="btn danger" data-act="mdel">Apagar</button>':''}<span class="sp"></span><button type="button" class="btn ghost" data-act="mclose">Cancelar</button>${onSave?`<button class="btn primary" type="submit">${saveLabel}</button>`:''}</footer>`}</form></div>`;
 M={onSave,onDelete};$('#modal').hidden=false;const f=$('#mf');mount&&mount(f);
 const first=f.querySelector('input:not([type=radio]):not([type=hidden]),select,textarea');if(first&&matchMedia('(min-width:720px)').matches)first.focus();else $('#mt').focus({preventScroll:true});
}
function closeModal(){const m=$('#modal');M=null;if(m.hidden)return;restoreFocus();m.classList.add('closing');clearTimeout(MCT);MCT=setTimeout(()=>{m.hidden=true;m.innerHTML='';m.classList.remove('closing')},190)}
const fdata=f=>Object.fromEntries(new FormData(f));

/* ---------- formulários de eventos ---------- */
function suggestSide(){const l=allEv().find(e=>e.type==='feed'&&e.kind==='peito');return l?(l.side==='E'?'D':l.side==='D'?'E':'E'):'E'}
function diaperSelect(sel){const fr=S.inv.filter(i=>i.cat==='fralda');if(!fr.length)return'';return fld('Descontar do pacote',`<select name="itemId" id="f-item"><option value="">Não descontar</option>${fr.map(i=>`<option value="${i.id}"${sel===i.id?' selected':''}>${esc(i.name)}${i.size?' '+esc(i.size):''} (${i.qty||0})</option>`).join('')}</select>`)}
function eventForm(ev,isNew){
 const t=ev.type;let h='';const endV=ev.end!=null?toLocalInput(ev.end):'';
 if(t==='feed')h+=seg('kind',[['peito','Peito'],['mamadeira','Mamadeira'],['solido','Comidinha']],ev.kind||'peito');
 if(t==='diaper')h+=seg('kind',[['xixi','Xixi'],['coco','Cocô'],['ambos','Xixi e cocô'],['seca','Seca']],ev.kind||'xixi');
 h+=fld(t==='sleep'||t==='feed'?'Início':'Horário',`<input type="datetime-local" name="start" id="f-start" value="${toLocalInput(ev.start||Date.now())}" required>`);
 if(t==='sleep')h+=fld('Fim (deixe vazio se ainda está dormindo)',`<input type="datetime-local" name="end" id="f-end" value="${endV}">`);
 if(t==='feed')h+=`<div data-show="peito" style="display:flex;flex-direction:column;gap:14px"><div class="fld"><span>Lado</span>${seg('side',[['E','Esquerdo'],['D','Direito'],['ambos','Os dois']],ev.side||suggestSide())}</div>
   ${fld('Fim (deixe vazio se está mamando agora)',`<input type="datetime-local" name="end" id="f-end" value="${endV}">`)}
   ${isNew?'<button type="button" class="btn" data-act="feedTimer" style="justify-content:center">Começar a mamar agora (cronômetro)</button>':''}</div>
  <div data-show="mamadeira" style="display:flex;flex-direction:column;gap:14px">${fld('Quantidade (ml)',`<input type="number" min="0" step="5" name="ml" id="f-ml" value="${ev.ml||''}" inputmode="numeric">`)}${seg('milk',[['formula','Fórmula'],['materno','Leite materno']],ev.milk||'formula')}</div>
  <div data-show="solido" style="display:flex;flex-direction:column;gap:14px">${fld('O que comeu',`<input name="food" id="f-food" value="${esc(ev.food||'')}" placeholder="Ex.: papinha de abóbora">`)}${seg('accept',[['bem','Comeu bem'],['pouco','Comeu pouco'],['recusou','Recusou']],ev.accept||'bem')}</div>`;
 if(t==='diaper')h+=diaperSelect(isNew?S.cfg.diaperItem:ev.itemId);
 if(t==='med'){const names=[...new Set(allEv().filter(e=>e.type==='med').map(e=>e.name))];h+=`<div class="frow">${fld('Remédio',`<input name="name" id="f-name" list="medlist" value="${esc(ev.name||'')}" required placeholder="Ex.: Vitamina D">`)}${fld('Dose',`<input name="dose" id="f-dose" value="${esc(ev.dose||'')}" placeholder="Ex.: 2 gotas">`)}</div><datalist id="medlist">${names.map(n=>`<option value="${esc(n)}">`).join('')}</datalist>`}
 if(t==='med')h+=medRemind(ev);
 if(t==='temp')h+=fld('Temperatura (°C)',`<input name="value" id="f-val" inputmode="decimal" value="${ev.value!=null?String(ev.value).replace('.',','):''}" required placeholder="Ex.: 36,8">`);
 if(t==='note')h+=fld('Anotação',`<textarea name="text" id="f-text" required>${esc(ev.text||'')}</textarea>`);
 if(t!=='note')h+=fld('Observação (opcional)',`<input name="note" id="f-note" value="${esc(ev.note||'')}">`);
 return h;
}
function evFromForm(fd,t){
 const o={type:t,start:fromLocalInput(fd.start)||Date.now(),note:(fd.note||'').trim()||undefined};
 if(t==='sleep')o.end=fromLocalInput(fd.end);
 if(t==='feed'){o.kind=fd.kind;if(fd.kind==='peito'){o.side=fd.side;o.end=fromLocalInput(fd.end)}else{o.end=o.start;o.side=undefined}
  if(fd.kind==='mamadeira'){o.ml=+fd.ml||0;o.milk=fd.milk}if(fd.kind==='solido'){o.food=(fd.food||'').trim();o.accept=fd.accept}}
 if(t==='diaper'){o.kind=fd.kind;o.itemId=fd.itemId||undefined}
 if(t==='med'){o.name=(fd.name||'').trim();o.dose=(fd.dose||'').trim();o.remindEvery=+fd.remindEvery||undefined;o.remindUntil=o.remindEvery?o.start+(+fd.remindDays||3)*DAY:undefined;if(!o.name){toast('Informe o nome do remédio.',true);return null}}
 if(t==='temp'){o.value=parseFloat(String(fd.value).replace(',','.'));if(!(o.value>30&&o.value<45)){toast('Informe uma temperatura válida, como 36,8.',true);return null}}
 if(t==='note'){o.text=(fd.text||'').trim();if(!o.text){toast('Escreva a anotação.',true);return null}}
 if(o.end!=null&&o.end<o.start){toast('O fim precisa ser depois do início.',true);return null}
 return o;
}
const TITLES={sleep:'Sono',feed:'Mamada',diaper:'Troca de fralda',med:'Remédio',temp:'Temperatura',bath:'Banho',note:'Anotação'};
function wireShow(f){const upd=()=>{const k=f.querySelector('input[name=kind]:checked')?.value;f.querySelectorAll('[data-show]').forEach(el=>el.hidden=el.dataset.show!==k)};f.querySelectorAll('input[name=kind]').forEach(r=>r.addEventListener('change',upd));upd()}
function openEventForm(ev,isNew){
 openModal({title:isNew?'Registrar '+TITLES[ev.type].toLowerCase():TITLES[ev.type],body:eventForm(ev,isNew)+(ev.by&&!isNew?`<div class="hint">Registrado por ${esc(ev.by)}</div>`:''),mount:wireShow,
  onSave:async fd=>{const o=evFromForm(fd,ev.type);if(!o)return false;if(isNew)await addEvent(o);else await updateEvent(ev,o);toast('Salvo')},
  onDelete:isNew?null:async()=>{await deleteEvent(ev);toast('Registro apagado')}});
}

/* ============ ações ============ */
const A={};
A.tab=id=>{id=pageOf(id);if(document.activeElement&&document.activeElement.matches('input,textarea,select'))document.activeElement.blur();if(M)closeModal();S.tab=id;lsSet('bebe-tab',id);try{history.replaceState(null,'','#'+id)}catch(e){}render();window.scrollTo(0,0)};
A.sleepToggle=async()=>{const sl=ongoing('sleep');if(sl){await updateEvent(sl,{end:Date.now()});toast('Acordou · dormiu '+fmtDur(Date.now()-sl.start))}else{await addEvent({type:'sleep',start:Date.now(),end:null});toast('Sono iniciado')}};
A.sleepPast=()=>openEventForm({type:'sleep',start:Date.now()-HR,end:Date.now()},true);
A.feedOpen=()=>openEventForm({type:'feed',kind:'peito',start:Date.now()-15*MIN,end:Date.now()},true);
A.feedStop=async()=>{const f=ongoing('feed');if(f){await updateEvent(f,{end:Date.now()});toast('Mamada de '+fmtDur(Date.now()-f.start))}};
A.feedTimer=async()=>{const f=$('#mf');const side=f.querySelector('input[name=side]:checked')?.value||'E';closeModal();await addEvent({type:'feed',kind:'peito',side,start:Date.now(),end:null});toast('Mamada iniciada · lado '+SIDE[side])};
A.diaperOpen=()=>openModal({title:'Troca de fralda',noFooter:true,body:`
 <div class="choices">${[['xixi','Xixi','var(--diaper)'],['coco','Cocô','var(--feed)'],['ambos','Xixi e cocô','var(--sleep)'],['seca','Seca','var(--other)']].map(([k,l,c])=>`<button type="button" class="choice" style="--c:${c}" data-act="diaperRec" data-id="${k}"><span class="ic lg" style="--c:${c}">${ic('diaper')}</span>${l}</button>`).join('')}</div>
 ${fld('Horário',`<input type="datetime-local" name="start" id="f-start" value="${toLocalInput(Date.now())}">`)}${diaperSelect(S.cfg.diaperItem)}
 <div class="hint">Toque no tipo para registrar. ${S.inv.some(i=>i.cat==='fralda')?'A fralda é descontada do estoque.':'Cadastre as fraldas no Estoque para o desconto automático.'}</div>`});
A.diaperRec=async kind=>{const f=$('#mf');const start=fromLocalInput(f.querySelector('[name=start]').value)||Date.now();const sel=f.querySelector('[name=itemId]');const itemId=(sel?sel.value:S.cfg.diaperItem)||undefined;closeModal();await addEvent({type:'diaper',kind,start,itemId});const d=diaperStats();toast('Fralda registrada'+(d.items.length?' · restam '+d.total:''))};
A.healthOpen=()=>openModal({title:'Saúde',noFooter:true,body:`<div class="choices"><button type="button" class="choice" style="--c:var(--health)" data-act="medAdd"><i></i>Remédio</button><button type="button" class="choice" style="--c:var(--health)" data-act="tempAdd"><i></i>Temperatura</button><button type="button" class="choice" style="--c:var(--accent)" data-act="vaxGo"><i></i>Vacinas</button></div>`});
A.medAdd=()=>openEventForm({type:'med',start:Date.now()},true);
A.tempAdd=()=>openEventForm({type:'temp',start:Date.now()},true);
A.vaxGo=()=>{closeModal();A.tab('saude')};
A.moreOpen=()=>openModal({title:'Registrar',noFooter:true,body:`<div class="choices">
 <button type="button" class="choice" style="--c:var(--other)" data-act="bathAdd"><i></i>Banho</button>
 <button type="button" class="choice" style="--c:var(--other)" data-act="noteAdd"><i></i>Anotação</button>
 <button type="button" class="choice" style="--c:var(--sleep)" data-act="sleepPast"><i></i>Sono passado</button>
 <button type="button" class="choice" style="--c:var(--growth)" data-act="growthAdd"><i></i>Peso e medida</button>
 <button type="button" class="choice" style="--c:var(--accent)" data-act="agAdd"><i></i>Compromisso</button>
 <button type="button" class="choice" style="--c:var(--health)" data-act="exAdd"><i></i>Exame</button>
 <button type="button" class="choice" style="--c:var(--feed)" data-act="msAdd"><i></i>Primeira vez</button></div>`});
A.bathAdd=async()=>{closeModal();await addEvent({type:'bath',start:Date.now()});toast('Banho registrado')};
A.noteAdd=()=>openEventForm({type:'note',start:S.tab==='diario'&&S.day!==dayStart(Date.now())?S.day+12*HR:Date.now()},true);
A.ev=id=>{const e=allEv().find(x=>x.id===id);if(e)openEventForm(e,false)};
A.dayPrev=()=>setDay(addDays(S.day,-1));A.dayNext=()=>setDay(Math.min(dayStart(Date.now()),addDays(S.day,1)));A.dayToday=()=>setDay(dayStart(Date.now()));
function setDay(t){S.day=dayStart(t);const ym=ymOf(S.day),cur=ymOf(Date.now());S.hist=(ym===cur||ym===prevYm(cur))?null:ym;subMonths();render()}

/* estoque */
function invForm(i){return`${fld(i.cat==='fralda'?'Marca ou nome (opcional)':'Nome',`<input name="name" id="i-name" value="${esc(i.name||'')}" placeholder="${i.cat==='fralda'?'Ex.: Pampers':'Ex.: Pomada para assaduras'}">`)}
 <div class="frow">${fld('Categoria',`<select name="cat" id="i-cat">${INV_CATS.map(([k,l])=>`<option value="${k}"${(i.cat||'outro')===k?' selected':''}>${l}</option>`).join('')}</select>`)}${fld('Tamanho',sizeSelect('size','i-size',SIZES,normSize(i.size)||i.size||'','Sem tamanho'))}</div>
 <div class="frow">${fld('Quantidade agora',`<input type="number" min="0" name="qty" id="i-qty" value="${i.qty??''}" required>`)}${fld('Avisar quando chegar a',`<input type="number" min="0" name="min" id="i-min" value="${i.min??''}" placeholder="Ex.: 20">`)}${fld('Unidade',`<input name="unit" id="i-unit" value="${esc(i.unit||'')}" placeholder="un., pacotes, ml…">`)}</div>
 ${fld('Observação',`<input name="note" id="i-note" value="${esc(i.note||'')}">`)}`}
function invFromForm(fd){if(!fd.name.trim()&&fd.cat==='fralda')fd.name='Fralda '+(fd.size||'');if(!fd.name.trim()){toast('Dê um nome ao item.',true);return null}return{name:fd.name.trim(),cat:fd.cat,size:fd.size.trim(),qty:Math.max(0,+fd.qty||0),min:Math.max(0,+fd.min||0),unit:fd.unit.trim(),note:fd.note.trim()}}
A.invAdd=cat=>{cat=cat||(S.inv.some(i=>i.cat==='fralda')?'higiene':'fralda');openModal({title:'Novo item no estoque',body:invForm({cat,min:cat==='fralda'?30:''}),onSave:async fd=>{const o=invFromForm(fd);if(!o)return false;const id=newId();await w(store.set('inventory/'+id,o));
 if(o.cat==='fralda'&&!S.cfg.diaperItem)await w(store.set('config/main',{...S.cfg,diaperItem:id}));toast('Item adicionado')}})};
A.invEdit=id=>{const i=S.inv.find(x=>x.id===id);if(!i)return;openModal({title:'Editar item',body:invForm(i)+(i.cat==='fralda'?`<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="active" id="i-active"${S.cfg.diaperItem===id?' checked':''}> Esta é a fralda em uso agora</label>`:''),
 onSave:async fd=>{const o=invFromForm(fd);if(!o)return false;await w(store.set('inventory/'+id,o));if(o.cat==='fralda'){const want=fd.active?id:(S.cfg.diaperItem===id?'':S.cfg.diaperItem);if(want!==S.cfg.diaperItem)await w(store.set('config/main',{...S.cfg,diaperItem:want}))}toast('Salvo')},
 onDelete:async()=>{await w(store.del('inventory/'+id));if(S.cfg.diaperItem===id)await w(store.set('config/main',{...S.cfg,diaperItem:''}));toast('Item removido')}})};
A.invInc=id=>adjustItem(id,1);A.invDec=id=>adjustItem(id,-1);
A.invBuy=id=>{const i=S.inv.find(x=>x.id===id);if(!i)return;openModal({title:'Registrar compra · '+esc(i.name),saveLabel:'Somar ao estoque',body:`${fld('Quantas '+(i.cat==='fralda'?'fraldas':esc(i.unit||'unidades'))+' chegaram?',`<input type="number" min="1" name="n" id="b-n" required inputmode="numeric" placeholder="Ex.: ${i.cat==='fralda'?'80':'2'}">`)}
 ${i.cat==='fralda'?`<div style="display:flex;gap:8px;flex-wrap:wrap">${[20,40,60,80,100].map(n=>`<button type="button" class="btn sm" data-act="setN" data-id="${n}">${n}</button>`).join('')}</div>`:''}<div class="hint">Hoje: ${i.qty||0}</div>`,
 onSave:async fd=>{const n=+fd.n;if(!(n>0)){toast('Informe a quantidade.',true);return false}await adjustItem(id,n);toast('Estoque atualizado: '+((+i.qty||0)+n))}})};
A.setN=n=>{$('#b-n').value=n};

/* crescimento */
function growthForm(g){return`${fld('Data',`<input type="date" name="date" id="g-date" value="${g.date||isoDate(Date.now())}" required>`)}
 <div class="frow">${fld('Peso (kg)',`<input name="w" id="g-w" inputmode="decimal" value="${g.w?String(g.w).replace('.',','):''}" placeholder="Ex.: 5,240">`)}${fld('Comprimento (cm)',`<input name="l" id="g-l" inputmode="decimal" value="${g.l?String(g.l).replace('.',','):''}" placeholder="Ex.: 58,5">`)}${fld('Cabeça (cm)',`<input name="hc" id="g-hc" inputmode="decimal" value="${g.hc?String(g.hc).replace('.',','):''}" placeholder="Ex.: 39">`)}</div>
 ${fld('Observação',`<input name="note" id="g-note" value="${esc(g.note||'')}" placeholder="Ex.: consulta de 2 meses">`)}`}
const pnum=v=>{const n=parseFloat(String(v||'').replace(',','.'));return n>0?n:null};
function growthFromForm(fd){const o={date:fd.date,w:pnum(fd.w),l:pnum(fd.l),hc:pnum(fd.hc),note:fd.note.trim()};if(!o.date||!(o.w||o.l||o.hc)){toast('Informe a data e pelo menos uma medida.',true);return null}if(o.w&&o.w>40)o.w=o.w/1000;Object.keys(o).forEach(k=>o[k]==null&&delete o[k]);return o}
A.growthAdd=()=>openModal({title:'Nova medida',body:growthForm({}),onSave:async fd=>{const o=growthFromForm(fd);if(!o)return false;await w(store.set('growth/'+newId(),o));toast('Medida salva')}});
A.growthEdit=id=>{const g=S.growth.find(x=>x.id===id);if(!g)return;openModal({title:'Editar medida',body:growthForm(g),onSave:async fd=>{const o=growthFromForm(fd);if(!o)return false;await w(store.set('growth/'+id,o));toast('Salvo')},onDelete:async()=>{await w(store.del('growth/'+id));toast('Medida apagada')}})};

/* agenda */
function agForm(a){return`${fld('O quê',`<input name="title" id="a-title" value="${esc(a.title||'')}" required placeholder="Ex.: Consulta de 2 meses">`)}
 ${seg('type',AG_TYPES,a.type||'consulta')}
 <div class="frow">${fld('Data',`<input type="date" name="date" id="a-date" value="${a.date||isoDate(Date.now())}" required>`)}${fld('Hora',`<input type="time" name="time" id="a-time" value="${a.time||''}">`)}</div>
 ${fld('Local',`<input name="place" id="a-place" value="${esc(a.place||'')}">`)}${fld('Anotações',`<textarea name="notes" id="a-notes" placeholder="Dúvidas para levar ao pediatra, documentos…">${esc(a.notes||'')}</textarea>`)}`}
function agFromForm(fd,old){if(!fd.title.trim()||!fd.date){toast('Informe o que é e a data.',true);return null}return{title:fd.title.trim(),type:fd.type,date:fd.date,time:fd.time,place:fd.place.trim(),notes:fd.notes.trim(),done:old?.done||false}}
A.agAdd=()=>openModal({title:'Novo compromisso',body:agForm({}),onSave:async fd=>{const o=agFromForm(fd);if(!o)return false;await w(store.set('agenda/'+newId(),o));toast('Compromisso salvo')}});
A.agEdit=id=>{const a=S.agenda.find(x=>x.id===id);if(!a)return;openModal({title:'Editar compromisso',body:agForm(a),onSave:async fd=>{const o=agFromForm(fd,a);if(!o)return false;await w(store.set('agenda/'+id,o));toast('Salvo')},onDelete:async()=>{await w(store.del('agenda/'+id));toast('Compromisso apagado')}})};
A.agDone=id=>{const a=S.agenda.find(x=>x.id===id);if(a)w(store.set('agenda/'+id,{...strip(a),done:!a.done}))};

/* vacinas */
A.vax=id=>{const v=VAX.find(x=>x[0]===id),cur=S.vax[id]||{};const st=vaxStatus(v);
 openModal({title:esc(v[1])+' · '+esc(v[3]),saveLabel:cur.done?'Salvar':'Marcar como aplicada',body:`<div class="hint">${esc(st.l)}</div>
  ${fld('Data da aplicação',`<input type="date" name="date" id="v-date" value="${cur.date||isoDate(Date.now())}">`)}${fld('Local, lote ou observação',`<input name="note" id="v-note" value="${esc(cur.note||'')}">`)}
  ${cur.done?'':'<button type="button" class="btn" data-act="vaxSched" data-id="'+id+'">Agendar na agenda</button>'}`,
  onSave:async fd=>{await w(store.set('vaccines/'+id,{done:true,date:fd.date,note:fd.note.trim()}));toast('Vacina marcada como aplicada')},
  onDelete:cur.done?async()=>{await w(store.del('vaccines/'+id));toast('Marcação removida')}:null});
};
A.vaxSched=id=>{const v=VAX.find(x=>x[0]===id),st=vaxStatus(v);closeModal();openModal({title:'Novo compromisso',body:agForm({title:'Vacina: '+v[1]+' ('+v[3]+')',type:'vacina',date:isoDate(Math.max(st.due||Date.now(),Date.now()))}),onSave:async fd=>{const o=agFromForm(fd);if(!o)return false;await w(store.set('agenda/'+newId(),o));toast('Compromisso salvo')}})};

/* exames */
let XF=[],UPLOADING=0;
const fpath=f=>f.path||f.id;
const filesHtml=()=>XF.length?XF.map(f=>`<span class="file"><a href="#" data-act="fileOpen" data-id="${esc(fpath(f))}">${esc(f.name)}</a><button type="button" data-act="xfDel" data-id="${esc(fpath(f))}" aria-label="Remover anexo ${esc(f.name)}">×</button></span>`).join(''):'<span class="hint">Nenhum anexo</span>';
function exForm(e){XF=[...(e.files||[])];
 return`${fld('Exame',`<input name="name" id="x-name" list="exlist" value="${esc(e.name||'')}" required placeholder="Ex.: Ultrassom de quadril">`)}<datalist id="exlist">${EX_SUGG.map(n=>`<option value="${n}">`).join('')}</datalist>
 <div class="frow">${fld('Tipo',`<select name="cat" id="x-cat">${EX_CATS.map(([k,l])=>`<option value="${k}"${(e.cat||'outro')===k?' selected':''}>${l}</option>`).join('')}</select>`)}${fld('Pedido por',`<input name="reqBy" id="x-req" value="${esc(e.reqBy||'')}" placeholder="Ex.: Dra. Ana, pediatra">`)}</div>
 <div class="fld"><span>Situação</span>${seg('status',EX_ST,e.status||'pedido')}</div>
 <div class="frow">${fld('Data do pedido',`<input type="date" name="reqDate" id="x-rd" value="${e.reqDate||''}">`)}${fld('Data do exame',`<input type="date" name="date" id="x-date" value="${e.date||''}">`)}${fld('Hora',`<input type="time" name="time" id="x-time" value="${e.time||''}">`)}</div>
 ${fld('Local ou laboratório',`<input name="place" id="x-place" value="${esc(e.place||'')}">`)}
 <div data-res style="display:flex;flex-direction:column;gap:14px">
  ${fld('Data do resultado',`<input type="date" name="resultDate" id="x-resd" value="${e.resultDate||''}">`)}
  <div class="fld"><span>Como veio</span>${seg('outcome',[['normal','Normal'],['alterado','Alterado'],['aguardando','Falta o médico ver']],e.outcome||'normal')}</div>
  ${fld('O que diz o resultado',`<textarea name="result" id="x-res" placeholder="Valores principais, o que o médico falou…">${esc(e.result||'')}</textarea>`)}
 </div>
 <div class="fld"><span>Anexos (foto ou PDF do pedido e do resultado)</span><div class="files" id="x-files" aria-live="polite">${filesHtml()}</div>
  <input type="file" id="x-file" accept="image/png,image/jpeg,image/webp,image/heic,application/pdf" multiple></div>
 ${fld('Observações',`<textarea name="notes" id="x-notes" placeholder="Preparo, jejum, documentos para levar…">${esc(e.notes||'')}</textarea>`)}
 <input type="hidden" name="screen" value="${esc(e.screen||'')}">`}
function wireEx(f){const upd=()=>{const k=f.querySelector('input[name=status]:checked')?.value;f.querySelector('[data-res]').hidden=k!=='resultado'};f.querySelectorAll('input[name=status]').forEach(r=>r.addEventListener('change',upd));upd()}
function exFromForm(fd,old){if(UPLOADING){toast('Espere o anexo terminar de enviar.',true);return null}if(!fd.name.trim()){toast('Informe o nome do exame.',true);return null}
 const o={name:fd.name.trim(),cat:fd.cat,reqBy:fd.reqBy.trim(),status:fd.status,reqDate:fd.reqDate,date:fd.date,time:fd.time,place:fd.place.trim(),notes:fd.notes.trim(),files:XF,screen:fd.screen||'',gcal:!!old?.gcal&&old.date===fd.date&&old.time===fd.time};
 if(o.status==='agendado'&&!o.date){toast('Informe a data do exame agendado.',true);return null}
 if(o.status==='resultado'){o.outcome=fd.outcome;o.result=fd.result.trim();o.resultDate=fd.resultDate||isoDate(Date.now())}
 return o}
function openExam(e,isNew){openModal({title:isNew?'Novo exame':esc(e.name),body:exForm(e),mount:wireEx,
 onSave:async fd=>{const o=exFromForm(fd,e);if(!o)return false;await w(store.set('exams/'+(isNew?newId():e.id),o));toast('Exame salvo')},
 onDelete:isNew?null:async()=>{await w(store.del('exams/'+e.id));toast('Exame apagado')}})}
A.exAdd=()=>openExam({reqDate:isoDate(Date.now())},true);
A.exEdit=id=>{const e=S.exams.find(x=>x.id===id);if(e)openExam(e,false)};
A.exScreen=k=>{const e=S.exams.find(x=>x.screen===k);if(e)return openExam(e,false);const sc=SCREEN.find(x=>x[0]===k);openExam({name:sc[1],cat:'triagem',screen:k,status:'realizado',date:isoDate(Date.now())},true)};
A.xfDel=id=>{XF=XF.filter(f=>fpath(f)!==id);const el=$('#x-files');if(el)el.innerHTML=filesHtml()};
async function uploadFiles(input){const files=[...input.files];input.value='';if(!navigator.onLine){toast('Para anexar arquivos é preciso internet.',true);return}
 for(const f of files){if(f.size>20*1024*1024){toast(f.name+' passa de 20 MB.',true);continue}
  UPLOADING++;const el=$('#x-files');if(el)el.insertAdjacentHTML('beforeend',`<span class="file" data-up>Enviando ${esc(f.name)}…</span>`);
  try{const safe=f.name.normalize('NFD').replace(/[^\w.-]+/g,'_').slice(-60);const path=`${FAM}/${Date.now().toString(36)}-${safe}`;const{error}=await sb.storage.from('files').upload(path,f,{contentType:f.type||undefined});if(error)throw{code:/mime|type/i.test(error.message)?'unsupported_type':/size|large/i.test(error.message)?'too_large':'x'};XF.push({path,name:f.name,type:f.type})}
  catch(e){toast(e?.code==='unsupported_type'?'Formato não aceito. Use foto (JPG ou PNG) ou PDF.':e?.code==='too_large'?'Arquivo grande demais (máx. 20 MB).':e?.code==='quota_or_state'?'O espaço para anexos acabou.':'Não deu para enviar '+f.name+'.',true)}
  finally{UPLOADING--;const e2=$('#x-files');if(e2)e2.innerHTML=filesHtml()}}}

A.fileOpen=async(p,el)=>{const win=window.open('about:blank','_blank');const{data,error}=await sb.storage.from('files').createSignedUrl(p,3600);if(error||!data){win&&win.close();toast('Não deu para abrir o arquivo.',true);return}if(win)win.location.href=data.signedUrl;else location.href=data.signedUrl};

/* conta e família */
A.loginMode=()=>{LOGIN_MODE=LOGIN_MODE==='criar'?'entrar':'criar';render()};
A.forgot=async()=>{const em=$('#l-email')?.value.trim();if(!em){toast('Digite seu e-mail primeiro.',true);return}const{error}=await sb.auth.resetPasswordForEmail(em,{redirectTo:location.origin+location.pathname});toast(error?'Não deu para enviar agora. Tente mais tarde.':'Enviamos um link para trocar a senha. Veja seu e-mail.',!!error)};
A.logout=async()=>{await sb.auth.signOut();location.hash='';location.reload()};
A.copyCode=async()=>{try{await navigator.clipboard.writeText(INVITE);toast('Código copiado')}catch(e){toast('Código: '+INVITE)}};

/* notificações */
const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
let PUSH='checking';
function b64u(s){const p='='.repeat((4-s.length%4)%4);const b=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(b,c=>c.charCodeAt(0))}
async function checkPush(){
 if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){PUSH=isIOS&&!standalone?'ios-install':'unsupported';return render()}
 if(Notification.permission==='denied'){PUSH='denied';return render()}
 try{const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();PUSH=sub?'on':'off';SUB_EP=sub?sub.endpoint:null;
  if(sub&&FAM){await sb.from('push_subs').upsert({endpoint:sub.endpoint,family_id:FAM,user_id:ME.id,sub:sub.toJSON()});const{data:pr}=await sb.from('push_subs').select('prefs').eq('endpoint',sub.endpoint).maybeSingle();MYPREFS=pr?.prefs||{}}}catch(e){PUSH='off'}
 render();
}
function pushCard(){
 if(PUSH==='on')return`<p class="small" style="margin-top:0"><span class="pill ok">Ativados neste aparelho</span></p><div>${PREFS.map(([k,l])=>`<label class="switch"><span class="tx">${l}</span><input type="checkbox" data-pref="${k}"${prefOn(k)?' checked':''}></label>${k==='mamada'&&prefOn('mamada')?`<label class="switch"><span class="tx muted">Avisar depois de</span><select data-prefh="1" style="border:1px solid var(--line);border-radius:9px;padding:6px;background:var(--surface2)">${[2,3,4].map(h=>`<option value="${h}"${(MYPREFS.mamadaH||3)===h?' selected':''}>${h} horas</option>`).join('')}</select></label>`:''}`).join('')}</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn sm" data-act="pushTest">Enviar um teste</button><button class="btn sm ghost" data-act="pushOff">Desativar</button></div>`;
 const what='<p class="small muted" style="margin-top:0">Fralda acabando, consulta na véspera e 2 h antes, hora do remédio, vacinas e exames.</p>';
 if(PUSH==='off')return what+'<button class="btn primary" data-act="pushOn">Ativar avisos</button>';
 if(PUSH==='ios-install')return what+'<p class="small">No iPhone, instale o app primeiro: no Safari, toque em <b>Compartilhar</b> e em <b>Adicionar à Tela de Início</b>. Depois abra pelo ícone e volte aqui.</p>';
 if(PUSH==='denied')return what+'<p class="small">Os avisos foram bloqueados neste aparelho. Libere nas configurações do celular para este app e abra de novo.</p>';
 if(PUSH==='unsupported')return what+'<p class="small">Este navegador não recebe avisos. Use o Chrome no Android ou o app instalado no iPhone.</p>';
 return what+'<p class="small muted">Verificando…</p>';
}
A.pushOn=()=>{Notification.requestPermission().then(async perm=>{
 if(perm!=='granted'){toast('Sem permissão, não dá para avisar. Você pode liberar depois.',true);return checkPush()}
 try{const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(VAPID)});
  const{error}=await sb.from('push_subs').upsert({endpoint:sub.endpoint,family_id:FAM,user_id:ME.id,sub:sub.toJSON()});if(error)throw error;toast('Notificações ativadas')}
 catch(e){console.warn(e);toast('Não deu para ativar agora. Tente de novo.',true)}
 checkPush()})};
A.pushOff=async()=>{try{const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();if(sub){await sb.from('push_subs').delete().eq('endpoint',sub.endpoint);await sub.unsubscribe()}toast('Notificações desativadas')}catch(e){}checkPush()};
A.pushTest=async()=>{const{data,error}=await sb.functions.invoke('notify',{body:{test:true}});toast(error?'Não deu para enviar o teste.':(data&&data.sent)?'Teste enviado. Deve chegar em segundos.':'Nenhum aparelho ativo encontrado.',!!error||!(data&&data.sent))};

/* marcos */
function msForm(m){return`${fld('Conquista',`<input name="title" id="m-title" list="mslist" value="${esc(m.title||'')}" required placeholder="Ex.: Primeiro sorriso">`)}<datalist id="mslist">${MS_SUGG.map(s=>`<option value="${s}">`).join('')}</datalist>
 ${fld('Data',`<input type="date" name="date" id="m-date" value="${m.date||isoDate(Date.now())}" required>`)}${fld('Como foi',`<textarea name="note" id="m-note">${esc(m.note||'')}</textarea>`)}`}
const msFromForm=fd=>{if(!fd.title.trim()){toast('Dê um nome à conquista.',true);return null}return{title:fd.title.trim(),date:fd.date,note:fd.note.trim()}};
A.msAdd=()=>openModal({title:'Primeira vez',body:msForm({}),onSave:async fd=>{const o=msFromForm(fd);if(!o)return false;await w(store.set('milestones/'+newId(),o));toast('Conquista guardada')}});
A.msEdit=id=>{const m=S.ms.find(x=>x.id===id);if(!m)return;openModal({title:'Editar conquista',body:msForm(m),onSave:async fd=>{const o=msFromForm(fd);if(!o)return false;await w(store.set('milestones/'+id,o));toast('Salvo')},onDelete:async()=>{await w(store.del('milestones/'+id));toast('Apagado')}})};

A.mclose=closeModal;
A.mdel=async(id,btn)=>{if(!btn.classList.contains('armed')){btn.classList.add('armed');btn.textContent='Toque de novo para apagar';return}const fn=M?.onDelete;closeModal();if(fn)await fn()};
