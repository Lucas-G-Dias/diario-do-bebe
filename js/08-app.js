/* ============ render (v2: app com navegação inferior) ============ */
const PAGES={inicio:'Início',diario:'Diário',sons:'Sons',menu:'Menu',estoque:'Estoque',crescimento:'Crescimento',agenda:'Agenda',exames:'Exames',saude:'Vacinas e saúde',fases:'Fase e marcos',ajustes:'Ajustes',tutorial:'Central de ajuda',ajuda:'Central de ajuda',conquistas:'Conquistas',album:'Álbum',fraldas:'Fraldas e lenços',enxoval:'Enxoval'};
const ALIAS={hoje:'inicio',registros:'diario'};
const pageOf=t=>{t=ALIAS[t]||t;return PAGES[t]?t:'inicio'};
const TABS=Object.entries(PAGES);
const ROOT=['inicio','diario','sons','menu'];
let LAST_TAB=null,ONB_SHOWN=false,ONB=0;
let RENDER_PENDING=false;
document.addEventListener('focusout',()=>{if(RENDER_PENDING){RENDER_PENDING=false;setTimeout(render,0)}});
function render(){
 const app=$('#app');
 const keep=k=>{if(app.dataset.screen===k)return true;app.dataset.screen=k;return false};
 const ae=document.activeElement;
 if(ae&&app.contains(ae)&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)&&!/^(radio|checkbox|range)$/.test(ae.type)&&ae.id!=='dayPick'){RENDER_PENDING=true;return}
 if(AUTH==='loading'){app.dataset.screen='';app.innerHTML=skelView('Abrindo o diário…');return}
 if(!ME){if(!keep('login-'+LOGIN_MODE))app.innerHTML=loginView();return}
 if(!FAM){if(!keep('family'))app.innerHTML=familyView();return}
 if(S.cfg===undefined){app.dataset.screen='';app.innerHTML=S.stale?`<div class="wrap">${BRAND}${errCard()}</div>`:skelView('Carregando os dados…');return}
 if(S.cfg===null){if(!keep('setup'))app.innerHTML=setupView();return}
 app.dataset.screen='main';
 S.tab=pageOf(S.tab);
 const a=age(),tab=S.tab,enter=LAST_TAB!==tab;LAST_TAB=tab;
 const scrollY=window.scrollY,dst=diaperStats();
 const off=!navigator.onLine,nq=OUTBOX.length;
 const banner=(off||nq)?`<div class="offline"><span class="ic" style="--c:var(--warn)">${ic('cloudoff')}</span><div><b>${off?'Sem internet':'Enviando registros…'}</b>${nq?`${nq} ${nq>1?'registros guardados':'registro guardado'} no celular${off?', enviados quando a conexão voltar.':'.'}`:'Pode registrar normalmente. Tudo é enviado quando a conexão voltar.'}</div></div>`:S.stale?`<div class="banner" role="status">Não deu para atualizar agora. Mostrando os últimos dados salvos. <button class="linkbtn" data-act="retry">Tentar de novo</button></div>`:'';
 const menuBadge=dst.st==='bad'||dst.st==='warn'||shopping().length>0||VAX.some(v=>vaxStatus(v).s==='late');
 const bar=tab==='inicio'
  ?`<span class="logo">${LOGO}</span><div class="grow"><div class="t1">${esc(S.cfg.name||'Bebê')}</div><div class="t2">${esc(ageText(a))}</div></div><button class="icon-btn" data-act="help" aria-label="Central de ajuda">${ic('help')}</button><button class="icon-btn" data-act="themeToggle" aria-label="${isDark()?'Usar tema claro':'Usar tema escuro'}">${ic(isDark()?'sun':'moon')}</button><button class="who-chip" data-act="tab" data-id="ajustes">${esc(WHO||'Você')}</button>`
  :ROOT.includes(tab)?`<div class="grow"><h1>${PAGES[tab]}</h1></div>${tab==='diario'?'<button class="btn sm" data-act="noteAdd">Anotação</button>':''}${tab==='menu'?`<button class="icon-btn" data-act="help" aria-label="Central de ajuda">${ic('help')}</button><button class="icon-btn" data-act="themeToggle" aria-label="${isDark()?'Usar tema claro':'Usar tema escuro'}">${ic(isDark()?'sun':'moon')}</button>`:''}`
  :`<button class="back" ${tab==='album'&&ALB.open?'data-act="albBack"':'data-act="tab" data-id="menu"'} aria-label="Voltar">${ic('back')}</button><div class="grow"><h1>${tab==='album'?esc(albTitle()):PAGES[tab]}</h1></div>${tab==='album'&&!ALB.open?`<button class="icon-btn" data-act="albAdd" aria-label="Adicionar fotos">${ic('plus')}</button>`:''}${tab==='enxoval'&&S.enx.length?`<button class="icon-btn" data-act="enxAdd" aria-label="Adicionar item">${ic('plus')}</button>`:''}`;
 const nb=(id,i,l,badge)=>`<button class="nb" data-act="tab" data-id="${id}"${(tab===id||(id==='menu'&&!ROOT.includes(tab)))?' aria-current="page"':''}>${ic(i)}${badge?'<span class="badge"></span>':''}${l}</button>`;
 app.innerHTML=`<header class="appbar"><div class="in">${bar}</div></header>
 <main class="wrap view${enter?' view-enter':''}">${banner}${pageBody(tab)}</main>
 <nav class="nav" aria-label="Navegação"><div class="in">${nb('inicio','home','Início')}${nb('diario','list','Diário')}<button class="fab" data-act="fab" aria-label="Novo registro: fralda, mamada, sono e mais" aria-haspopup="dialog">${ic('plus')}</button>${nb('sons','music','Sons')}${nb('menu','grid','Menu',menuBadge)}</div></nav>`;
 if(!enter)window.scrollTo(0,scrollY);
 hydrate();
 if(!ONB_SHOWN&&!lsGet('ddb-onb')){ONB_SHOWN=true;setTimeout(()=>startTour('main'),600)}else pageTour(tab);checkGame();
}

/* ---------- Início ---------- */
function tile(type,act,lbl,val,sub,cta,live,icn){return`<button class="now-t${live?' live':''}" style="--c:${EVC[type]}" data-act="${act}"><span class="ic" style="--c:${EVC[type]}">${ic(icn)}</span><span><span class="lbl">${lbl}</span><div class="val">${esc(val)}</div></span><span class="sub">${esc(sub)}</span><span class="cta">${cta}</span></button>`}
function ring(v,t,c,lab,sub){const r=38,C=2*Math.PI*r,f=Math.max(0,Math.min(1,v/t));return`<svg class="ring" width="96" height="96" viewBox="0 0 96 96" role="img" aria-label="${esc(lab)} de ${sub}"><circle class="rbg" cx="48" cy="48" r="${r}" fill="none" stroke-width="9"/><circle class="rfg" cx="48" cy="48" r="${r}" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-f)).toFixed(1)}" transform="rotate(-90 48 48)" style="--C:${C.toFixed(1)}"/><text x="48" y="49" text-anchor="middle" font-size="15">${esc(lab)}</text><text x="48" y="64" text-anchor="middle" font-size="10" style="fill:var(--muted);font-family:var(--body);font-weight:700">${sub}</text></svg>`}
function medNext(){const now=Date.now(),latest={};allEv().forEach(e=>{if(e.type!=='med')return;const k=(e.name||'').toLowerCase();if(!latest[k])latest[k]=e});
 return Object.values(latest).filter(e=>+e.remindEvery>0).map(e=>({ev:e,due:e.start+e.remindEvery*HR})).filter(m=>(!m.ev.remindUntil||m.due<=m.ev.remindUntil+MIN)&&m.due-now<4*HR&&now-m.due<6*HR)}
function homeAlerts(){
 const out=[],now=Date.now(),a=age();
 if((PUSH==='off'||PUSH==='ios-install')&&!(+lsGet('ddb-push-x')>now-3*DAY))out.push({c:'var(--accent)',i:'bell',t:'Ative os avisos',s:'Fralda acabando, consultas, vacinas e remédio na hora.',a:'pushPrompt',l:'Ativar',x:'pushX'});
 medNext().forEach(m=>out.push({c:'var(--health)',i:'pill',t:(m.due<=now?'Hora do remédio: ':'Próxima dose: ')+m.ev.name,s:(m.due<=now?'era às ':'às ')+fmtT(m.due)+(m.ev.dose?' · '+m.ev.dose:''),a:'medAgain',id:m.ev.id,l:'Dei agora'}));
 if(a&&a.m>0&&a.d===0){const ph=phaseOf(a),nova=PHASES.some(p=>p.from===a.m);out.push({c:'var(--growth)',i:'cake',t:`Hoje ${S.cfg.name||'o bebê'} completa ${a.m} ${a.m>1?'meses':'mês'}!`,s:nova?'Começa a fase: '+ph.name:'Que tal guardar uma conquista de hoje?',a:nova?'tab':'msAdd',id:'fases',l:nova?'Ver':'Registrar'})}

 const d=diaperStats();
 if(!d.items.length)out.push({c:'var(--diaper)',i:'diaper',t:'Cadastre as fraldas',s:'Por tamanho, para o app avisar antes de acabar.',a:'tab',id:'fraldas',l:'Cadastrar'});
 else if(d.st==='bad'||d.st==='warn')out.push({c:`var(--${d.st==='bad'?'bad':'warn'})`,i:'diaper',t:d.st==='bad'?'Fraldas acabando':'Comprar fraldas em breve',s:`Restam ${d.total}, dá para uns ${Math.floor(d.days)} dias`,a:'buyDiaper',l:'Comprei'});
 const wp=wipesAll();if(wp.n&&(wp.st==='bad'||wp.st==='warn'))out.push({c:`var(--${wp.st==='bad'?'bad':'warn'})`,i:'drop',t:wp.st==='bad'?'Lenços acabando':'Comprar lenços em breve',s:`Restam uns ${wp.total} lenços, dá para ${Math.max(0,Math.floor(wp.days))} dias`,a:'wipeAdd',l:'Comprei'});
 const sh=shopping().filter(i=>i.cat!=='lenco');if(sh.length)out.push({c:'var(--warn)',i:'bag',t:'Lista de compras',s:sh.map(i=>i.name).slice(0,3).join(', '),a:'tab',id:'estoque',l:'Ver'});
 const wait=S.exams.find(e=>e.status==='realizado'&&e.date&&dateOnly(e.date)<now-10*DAY);if(wait)out.push({c:'var(--health)',i:'flask',t:'Resultado de exame',s:wait.name+' ainda sem resultado',a:'exEdit',id:wait.id,l:'Abrir'});
 return out.slice(0,5);
}
VIEWS.inicio=()=>{
 const now=Date.now(),evs=allEv(),sl=ongoing('sleep'),fd=ongoing('feed');
 const lastSl=evs.find(e=>e.type==='sleep'&&e.end!=null),lastFeed=evs.find(e=>e.type==='feed'),lastDi=evs.find(e=>e.type==='diaper'),lastPeito=evs.find(e=>e.type==='feed'&&e.kind==='peito');
 const ds=dayStats(dayStart(now)),a=age(),ph=a?phaseOf(a):PHASES[0];
 const nextSide=lastPeito?(lastPeito.side==='E'?'direito':lastPeito.side==='D'?'esquerdo':''):'';
 const t1=sl?tile('sleep','sleepToggle','Dormindo',fmtDur(now-sl.start),'desde '+fmtT(sl.start),'Toque quando acordar',true,'moon')
  :tile('sleep','sleepToggle',lastSl?'Acordado':'Sono',lastSl?fmtDur(now-lastSl.end):'—',lastSl?'desde '+fmtT(lastSl.end):'sem registro','Toque quando dormir',false,'moon');
 const t2=fd?tile('feed','feedStop','Mamando',fmtDur(now-fd.start),'lado '+(SIDE[fd.side]||''),'Toque para encerrar',true,'bottle')
  :tile('feed','feedOpen','Mamada',lastFeed?ago(lastFeed.start):'—',lastFeed?(nextSide?'próximo peito: '+nextSide:evText(lastFeed).t):'sem registro','Registrar',false,'bottle');
 const t3=tile('diaper','diaperOpen','Fralda',lastDi?ago(lastDi.start):'—',lastDi?`${ds.diapers} ${ds.diapers===1?'troca':'trocas'} hoje`:'sem registro','Trocar',false,'diaper');
 const al=homeAlerts();
 const pct=ph.to<999&&a?Math.min(100,Math.max(3,(a.months-ph.from)/(ph.to-ph.from)*100)):100;
 const recent=ds.list.slice(0,5);
 return`<div class="now">${t1}${t2}${t3}</div>
 ${al.length?`<div class="alerts">${al.map(x=>`<div class="alert"><span class="ic" style="--c:${x.c}">${ic(x.i)}</span><div class="tx"><b>${esc(x.t)}</b>${x.s?`<span>${esc(x.s)}</span>`:''}</div><button class="btn sm" data-act="${x.a}"${x.id?` data-id="${esc(x.id)}"`:''} aria-label="${x.l}: ${esc(x.t)}">${x.l}</button>${x.x?`<button class="x" data-act="${x.x}" aria-label="Dispensar aviso: ${esc(x.t)}">×</button>`:''}</div>`).join('')}</div>`:''}
 ${quickRow()}
 ${nextsCard()}
 ${gameCard()}
 ${stockPanel()}
 <div class="card"><div class="card-h"><h2>Hoje</h2><button class="linkbtn" data-act="tab" data-id="diario">Ver diário</button></div>
  <div class="today">${ring(ds.sleep/HR,ph.sonoH[0],'var(--sleep)',fmtDur(ds.sleep),'de sono')}
   <div class="mini"><div class="v">${ds.feeds}</div><div class="k">${ds.feeds===1?'mamada':'mamadas'}${ds.ml?' · '+ds.ml+' ml':''}</div></div>
   <div class="mini"><div class="v">${ds.diapers}</div><div class="k">fraldas · ${ds.xixi} xixi, ${ds.coco} cocô</div></div></div>
  ${recent.length?`<div style="margin-top:12px">${timeline(recent,'')}</div>`:`<div class="empty" style="margin-top:12px">Nada registrado hoje. Toque em <b>Sono</b>, <b>Mamada</b> ou <b>Fralda</b> lá em cima.</div>`}
 </div>
 ${memoryCard()}
 ${a&&a.days>=0?`<div class="card phase" data-act="tab" data-id="fases"><span class="ic lg" style="--c:var(--growth)">${ic('sprout')}</span><div style="flex:1;min-width:0"><div class="small muted">Fase atual · ${Math.floor(a.days/7)} semanas</div><b>${esc(ph.name)}</b><div class="bar"><i style="width:${pct}%"></i></div></div><span class="chev muted">${ic('chev')}</span></div>`:''}`;
};
VIEWS.hoje=VIEWS.inicio;
VIEWS.diario=VIEWS.registros;

/* ---------- Menu ---------- */
VIEWS.menu=()=>{
 const d=diaperStats(),late=VAX.filter(v=>vaxStatus(v).s==='late').length,up=upcoming()[0],pend=S.exams.filter(e=>e.status!=='resultado').length;
 const g=[...S.growth].filter(x=>x.w).sort((a,b)=>b.date.localeCompare(a.date))[0];
 const T=(id,i,c,t,s,badge)=>`<button class="mtile" data-act="tab" data-id="${id}"><span class="ic" style="--c:${c}">${ic(i)}</span><span class="tx"><b>${t}</b><span>${esc(s)}</span></span>${badge?`<span class="pill bad">${badge}</span>`:''}<span class="chev">${ic('chev')}</span></button>`;
 return`<div class="mgroup"><div class="label">Saúde</div>
  ${T('saude','syringe','var(--health)','Vacinas e saúde',late?`${late} ${late>1?'vacinas atrasadas':'vacina atrasada'}`:'Caderneta, remédios e ficha',late?'!':'')}
  ${T('exames','flask','var(--health)','Exames',pend?`${pend} em andamento`:'Pedidos, resultados e anexos')}
  ${T('agenda','cal','var(--accent)','Agenda',up?`Próximo: ${fmtD(dateOnly(up.date))} · ${up.title}`:'Consultas e compromissos')}
  ${T('crescimento','growth','var(--growth)','Crescimento',g?`${num(g.w,2)} kg em ${fmtD(dateOnly(g.date))}`:'Peso, altura e curvas')}</div>
 <div class="mgroup"><div class="label">Casa</div>
  ${T('fraldas','diaper','var(--diaper)','Fraldas e lenços',d.items.length?`${d.total} fraldas ${activeSize()||''} · uns ${Math.floor(d.days||0)} dias`:'Quantidade por tamanho e lenços',d.st==='bad'||d.st==='warn'?'!':'')}
  ${T('enxoval','bag','var(--feed)','Enxoval',S.enx.length?(()=>{const t=enxStats(S.enx);return `${Math.round(t.done/t.n*100)}% pronto · faltam ${t.n-t.done}`})():'Lista sugerida e sua própria lista')}
  ${T('estoque','box','var(--other)','Estoque',S.inv.filter(i=>i.cat!=='fralda'&&i.cat!=='lenco').length?`${S.inv.filter(i=>i.cat!=='fralda'&&i.cat!=='lenco').length} itens · lista de compras`:'Higiene, remédios e outros itens',shopping().length?String(shopping().length):'')}</div>
 <div class="mgroup"><div class="label">Bebê</div>
  ${T('album','image','var(--feed)','Álbum de fotos',S.photos.length?`${S.photos.length} ${S.photos.length===1?'foto':'fotos'} · ${S.albums.length} ${S.albums.length===1?'álbum':'álbuns'}`:'Fotos separadas por fase')}
  ${T('fases','sprout','var(--growth)','Fase e marcos',age()?phaseOf(age()).name:'')}</div>
 <div class="mgroup"><div class="label">App</div>
  ${T('conquistas','trophy','var(--impact)','Conquistas','Sequência, níveis e medalhas da família')}
  ${T('ajuda','help','var(--accent)','Central de ajuda','Tour, explicações e atalhos')}
  ${T('ajustes','gear','var(--other)','Ajustes','Família, avisos e dados do bebê')}</div>`;
};

/* Central de ajuda: js/18-ajuda.js · tour: js/19-tour.js */

/* ---------- registrar (+) ---------- */
A.fab=()=>openModal({title:'Registrar',noFooter:true,body:`<div class="grid-act">${[
 ['feedOpen','bottle','var(--feed)','Mamada'],['diaperOpen','diaper','var(--diaper)','Fralda'],['sleepPast','moon','var(--sleep)','Sono'],
 ['medAdd','pill','var(--health)','Remédio'],['tempAdd','thermo','var(--health)','Temperatura'],['bathAdd','drop','var(--other)','Banho'],
 ['growthAdd','growth','var(--growth)','Peso e medida'],['exAdd','flask','var(--health)','Exame'],['agAdd','cal','var(--accent)','Compromisso'],
 ['msAdd','star','var(--feed)','Primeira vez'],['albQuick','image','var(--feed)','Foto'],['buyDiaper','bag','var(--diaper)','Comprei fraldas']
 ].map(([a,i,c,l])=>`<button type="button" class="choice" data-act="${a}"><span class="ic lg" style="--c:${c}">${ic(i)}</span>${l}</button>`).join('')}</div>`});
A.buyDiaper=()=>{const kg=lastWeight(),cur=activeSize()||(kg?sizeByKg(kg):'P');
 openModal({title:'Comprei fraldas',saveLabel:'Somar ao estoque',body:`<div class="fld"><span>Tamanho</span>${seg('size',SIZES.map(z=>[z,z]),cur)}</div>
  ${fld('Quantas fraldas vieram',`<input type="number" min="1" name="n" id="bd-n" inputmode="numeric" placeholder="Toque num número abaixo ou digite">`)}
  <div class="chips">${[20,30,40,50,60,80,100,150].map(n=>`<button type="button" class="chip" data-act="setBd" data-id="${n}">${n}</button>`).join('')}</div>
  ${fld('Marca (opcional)','<input name="brand" id="bd-b" placeholder="Ex.: Pampers">')}`,
  onSave:async fd=>{const n=+fd.n;if(!(n>0)){toast('Informe quantas fraldas vieram.',true);return false}const z=fd.size,items=frBySize(z),it=items.find(i=>i.id===S.cfg.diaperItem)||items[0],id=it?it.id:newId(),b=(fd.brand||'').trim();
   const o=it?{...strip(it),qty:(+it.qty||0)+n,...(b?{brand:b}:{})}:{name:'Fralda '+z+(b?' · '+b:''),brand:b,cat:'fralda',size:z,qty:n,min:30,goal:SIZE_GOAL[z],unit:'un.',note:''};
   await w(store.set('inventory/'+id,o));if(!S.cfg.diaperItem||!S.inv.some(i=>i.id===S.cfg.diaperItem))await w(store.set('config/main',{...S.cfg,diaperItem:id}));toast(`+${n} fraldas ${z} · agora ${o.qty}`)}})};
A.setBd=n=>{const el=$('#bd-n');if(el)el.value=n;document.querySelectorAll('[data-act=setBd]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===String(n)))};
A.medAgain=id=>{const e=allEv().find(x=>x.id===id);if(!e)return;addEvent({type:'med',name:e.name,dose:e.dose,start:Date.now(),remindEvery:e.remindEvery,remindUntil:e.remindUntil}).then(()=>toast('Dose registrada'+(e.remindEvery?' · próxima às '+fmtT(Date.now()+e.remindEvery*HR):'')))};
A.pushPrompt=()=>{if(PUSH==='ios-install'){openModal({title:'Primeiro, instale o app',noFooter:true,body:`<ol class="steps"><li>Abra este endereço no <b>Safari</b>.</li><li>Toque em <b>Compartilhar</b> (o quadrado com a seta).</li><li>Escolha <b>Adicionar à Tela de Início</b>.</li><li>Abra pelo ícone novo e toque em <b>Ativar avisos</b>.</li></ol>`});return}A.pushOn()};
A.pushX=()=>{lsSet('ddb-push-x',String(Date.now()));render()};
function medRemind(ev){const every=+ev.remindEvery||0,days=ev.remindUntil&&ev.start?Math.max(1,Math.round((ev.remindUntil-ev.start)/DAY)):3;
 return`<div class="frow">${fld('Lembrar a próxima dose',`<select name="remindEvery" id="f-rem">${[[0,'Não lembrar'],[4,'Daqui a 4 horas'],[6,'Daqui a 6 horas'],[8,'Daqui a 8 horas'],[12,'Daqui a 12 horas'],[24,'Daqui a 24 horas']].map(([v,l])=>`<option value="${v}"${every===v?' selected':''}>${l}</option>`).join('')}</select>`)}${fld('Durante',`<select name="remindDays" id="f-remd">${[1,2,3,5,7,10,14].map(d=>`<option value="${d}"${d===days?' selected':''}>${d} ${d>1?'dias':'dia'}</option>`).join('')}</select>`)}</div>`}
