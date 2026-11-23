/* ---------- Agenda ---------- */
function agRow(a){if(a._exam){const t=dateOnly(a.date),d=Math.round((dayStart(t)-dayStart(Date.now()))/DAY);const when=d===0?'Hoje':d===1?'Amanhã':d>1&&d<7?WD[new Date(t).getDay()]:fmtDY(t);
 return`<div class="row"><div style="min-width:64px"><div class="ttl">${when}</div><div class="small muted num">${a.time||''}</div></div><div class="main"><div class="ttl">${esc(a.title)}</div><div class="small muted">Exame${a.place?' · '+esc(a.place):''}</div></div>${gcBtn('exGcal',a)}<button class="btn sm ghost" data-act="exEdit" data-id="${a.id}">Abrir</button></div>`}
 const t=dateOnly(a.date),d=Math.round((dayStart(t)-dayStart(Date.now()))/DAY);const tp=(AG_TYPES.find(x=>x[0]===a.type)||AG_TYPES[3])[1];
 const when=d===0?'Hoje':d===1?'Amanhã':d>1&&d<7?WD[new Date(t).getDay()]:fmtDY(t);
 return`<div class="row" ${a.done?'style="opacity:.6"':''}><div style="min-width:64px"><div class="ttl">${when}</div><div class="small muted num">${a.time||''}</div></div><div class="main"><div class="ttl">${esc(a.title)}</div><div class="small muted">${tp}${a.place?' · '+esc(a.place):''}${a.notes?' · '+esc(a.notes):''}</div></div>
 ${a.done?'':gcBtn('agGcal',a)}<button class="btn sm${a.done?'':' ghost'}" data-act="agDone" data-id="${a.id}">${a.done?'Feito':'Marcar feito'}</button><button class="btn sm ghost" data-act="agEdit" data-id="${a.id}">Editar</button></div>`}
VIEWS.agenda=()=>{
 const up=upcoming(),t0=dayStart(Date.now());const past=S.agenda.filter(a=>a.done||dateOnly(a.date)<t0).sort((a,b)=>b.date.localeCompare(a.date));
 const byMonth={};up.forEach(a=>{const k=a.date.slice(0,7);(byMonth[k]=byMonth[k]||[]).push(a)});
 const vsoon=VAX.filter(v=>['late','soon'].includes(vaxStatus(v).s));
 return`
 <div class="sec-h sec-top"><button class="btn primary" data-act="agAdd">Novo compromisso</button></div>
 ${vsoon.length?`<div class="card"><div class="card-h"><h2>Vacinas para agendar</h2><button class="linkbtn" data-act="tab" data-id="saude">Ver caderneta</button></div><div class="vlist">${vsoon.map(v=>{const st=vaxStatus(v);return`<button class="vchip ${st.s}" data-act="vax" data-id="${v[0]}"><b>${esc(v[1])}</b>${esc(v[3])} · ${esc(st.l)}</button>`}).join('')}</div></div>`:''}
 ${Object.keys(byMonth).length?Object.entries(byMonth).map(([k,list])=>`<div class="card"><div class="card-h"><h2>${MOF[+k.slice(5)-1]} de ${k.slice(0,4)}</h2></div><div class="rows">${list.map(agRow).join('')}</div></div>`).join(''):`<div class="empty">Nenhum compromisso pela frente. Marque consultas do pediatra, vacinas, exames e o que mais precisar lembrar.</div>`}
 ${past.length?`<details class="card"><summary style="cursor:pointer;font-weight:700">Anteriores e concluídos (${past.length})</summary><div class="rows" style="margin-top:8px">${past.map(agRow).join('')}</div></details>`:''}`;
};

/* ---------- Exames ---------- */
const gcBtn=()=>'';
function exPill(e){if(e.status==='resultado')return e.outcome==='alterado'?'<span class="pill bad">Alterado</span>':e.outcome==='normal'?'<span class="pill ok">Normal</span>':'<span class="pill neutral">Ver resultado</span>';
 if(e.status==='realizado')return'<span class="pill warn">Aguardando resultado</span>';if(e.status==='agendado')return'<span class="pill" style="--c:var(--accent)">Agendado</span>';return'<span class="pill neutral">Falta agendar</span>'}
function exRow(e){const cat=(EX_CATS.find(c=>c[0]===e.cat)||EX_CATS[6])[1];const when=e.date?fmtDY(dateOnly(e.date))+(e.time?' às '+e.time:''):(e.reqDate?'pedido em '+fmtDY(dateOnly(e.reqDate)):'sem data');
 const nf=(e.files||[]).length;
 return`<div class="row"><div class="main" data-act="exEdit" data-id="${e.id}" style="cursor:pointer"><div class="ttl">${esc(e.name)} ${exPill(e)}</div>
 <div class="small muted">${cat} · ${when}${e.place?' · '+esc(e.place):''}${e.reqBy?' · pedido por '+esc(e.reqBy):''}${nf?` · ${nf} anexo${nf>1?'s':''}`:''}</div>
 ${e.status==='resultado'&&e.result?`<div class="snip">${esc(e.result.length>160?e.result.slice(0,160)+'…':e.result)}</div>`:''}</div>
 ${e.status==='agendado'&&e.date?gcBtn('exGcal',e):''}<button class="btn sm ghost" data-act="exEdit" data-id="${e.id}">Abrir</button></div>`}
VIEWS.exames=()=>{
 const by=k=>S.exams.filter(e=>e.status===k);
 const pend=S.exams.filter(e=>e.status==='pedido'||e.status==='agendado').sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
 const wait=by('realizado').sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 const done=by('resultado').sort((a,b)=>(b.resultDate||b.date||'').localeCompare(a.resultDate||a.date||''));
 const alt=done.filter(e=>e.outcome==='alterado').length;
 return`
 <div class="sec-h sec-top"><button class="btn primary" data-act="exAdd">Novo exame</button></div>
 <div class="stats">
  <div class="stat"><div class="v">${pend.length}</div><div class="k">para fazer</div></div>
  <div class="stat"><div class="v">${wait.length}</div><div class="k">aguardando resultado</div></div>
  <div class="stat"><div class="v">${done.length}</div><div class="k">com resultado</div></div>
  <div class="stat"><div class="v" style="${alt?'color:var(--bad)':''}">${alt}</div><div class="k">alterados</div></div>
 </div>
 <div class="card"><div class="card-h"><h2>Triagem neonatal</h2><span class="small muted">os testes dos primeiros dias</span></div>
  <div class="vlist">${SCREEN.map(sc=>{const e=S.exams.find(x=>x.screen===sc[0]);const ok=e&&(e.status==='realizado'||e.status==='resultado');const cls=e?.outcome==='alterado'?'late':ok?'done':'';
   const txt=!e?sc[2]:e.status==='resultado'?(e.outcome==='alterado'?'resultado alterado':e.outcome==='normal'?'resultado normal':'com resultado'):e.status==='realizado'?'feito, aguardando resultado':e.status==='agendado'&&e.date?'agendado para '+fmtD(dateOnly(e.date)):'pedido';
   return`<button class="vchip ${cls}" data-act="exScreen" data-id="${sc[0]}"><b>${sc[1]}</b>${esc(txt)}</button>`}).join('')}</div></div>
 ${!S.exams.length?`<div class="empty">Nenhum exame ainda. Registre o pedido do médico, agende, anexe a foto ou o PDF do resultado e anote o que deu. Fica tudo num lugar só para mostrar nas consultas.</div>`:''}
 ${pend.length?`<div class="card"><div class="card-h"><h2>Para fazer</h2></div><div class="rows">${pend.map(exRow).join('')}</div></div>`:''}
 ${wait.length?`<div class="card"><div class="card-h"><h2>Aguardando resultado</h2></div><div class="rows">${wait.map(exRow).join('')}</div></div>`:''}
 ${done.length?`<div class="card"><div class="card-h"><h2>Resultados</h2></div><div class="rows">${done.map(exRow).join('')}</div></div>`:''}`;
};

/* ---------- Saúde ---------- */
VIEWS.saude=()=>{
 const c=S.cfg,groups={};VAX.forEach(v=>(groups[v[2]]=groups[v[2]]||[]).push(v));
 const doneN=VAX.filter(v=>S.vax[v[0]]?.done).length,lateN=VAX.filter(v=>vaxStatus(v).s==='late').length;
 const hl=allEv().filter(e=>e.type==='med'||e.type==='temp').slice(0,12);
 const whenL=m=>m===0?'Ao nascer':m<12?m+' meses':m===12?'12 meses':m<24?m+' meses':(m/12)+' anos';
 return`
 <div class="sec-h sec-top"><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="medAdd">Registrar remédio</button><button class="btn" data-act="tempAdd">Registrar temperatura</button></div></div>
 <div class="grid g2">
  <div class="card"><div class="card-h"><h2>Ficha do bebê</h2><button class="linkbtn" data-act="tab" data-id="ajustes">Editar</button></div>
   <div class="rows">
    ${[['Tipo sanguíneo',c.blood],['Alergias',c.allergies],['Pediatra',c.pedName],['Telefone do pediatra',c.pedPhone],['Plano de saúde',c.plan],['Carteirinha / SUS',c.card]].map(([k,v])=>`<div class="row"><div class="main"><div class="small muted">${k}</div><div class="ttl" style="user-select:all">${v?esc(v):'<span class="muted" style="font-weight:400">não informado</span>'}</div></div></div>`).join('')}
   </div></div>
  <div class="card"><div class="card-h"><h2>Remédios e temperatura</h2></div>
   ${hl.length?`<ul class="tl">${hl.map(e=>{const x=evText(e);return`<li data-act="ev" data-id="${e.id}" style="--c:${EVC[e.type]}"><span class="t">${fmtD(e.start)}</span><span class="ic" style="--c:${EVC[e.type]}">${ic(EVI[e.type])}</span><span><div class="ttl">${esc(x.t)}</div><div class="ds">${fmtT(e.start)}${x.d?' · '+esc(x.d):''}${e.note?' · '+esc(e.note):''}</div></span><span class="by">${esc(e.by||'')}</span></li>`}).join('')}</ul>`:`<div class="empty">Nenhum remédio ou temperatura registrado. Útil para mostrar ao pediatra o que foi dado e quando.</div>`}</div>
 </div>
 <div class="card"><div class="card-h"><h2>Caderneta de vacinação</h2><span class="small muted">${doneN} de ${VAX.length} aplicadas${lateN?` · <b style="color:var(--bad)">${lateN} atrasada${lateN>1?'s':''}</b>`:''}</span></div>
  <div class="hint" style="margin-bottom:6px">Calendário infantil do SUS. Toque numa vacina para marcar como aplicada. Confira sempre com a caderneta e o pediatra, porque o calendário muda com o tempo.</div>
  ${Object.entries(groups).map(([m,list])=>`<div class="vgroup"><div class="when">${whenL(+m)}</div><div class="vlist">${list.map(v=>{const st=vaxStatus(v);return`<button class="vchip ${st.s}" data-act="vax" data-id="${v[0]}"><b>${esc(v[1])}</b>${esc(v[3])}${st.l?' · '+esc(st.l):''}</button>`}).join('')}</div></div>`).join('')}
 </div>`;
};

/* ---------- Fases ---------- */
VIEWS.fases=()=>{
 const a=age();if(!a)return'';const ph=phaseOf(a),ms=[...S.ms].sort((x,y)=>y.date.localeCompare(x.date));
 const nextAt=ph.to<999?new Date(new Date(S.cfg.birth+'T12:00').setMonth(new Date(S.cfg.birth+'T12:00').getMonth()+ph.to)).getTime():null;
 return`
 <div class="sec-h sec-top"></div>
 <div class="card phase-hero">
  <div><div class="label">Fase atual · ${esc(ageText(a))}</div><h2 style="font-size:28px;margin:4px 0 8px">${esc(ph.name)}</h2>
   ${nextAt?`<div class="muted small">Próxima fase em ${Math.max(0,Math.ceil((nextAt-Date.now())/DAY))} dias</div>`:''}
   <div class="label" style="margin-top:14px">O que costuma aparecer agora</div><ul class="marks">${ph.marcos.map(m=>`<li>${esc(m)}</li>`).join('')}</ul>
   <div class="label" style="margin-top:14px">Dicas para esta fase</div><ul class="marks">${ph.dicas.map(m=>`<li>${esc(m)}</li>`).join('')}</ul>
   <div class="hint" style="margin-top:10px">Cada bebê tem seu ritmo. Se algo preocupar, converse com o pediatra.</div></div>
  <div class="facts"><div class="fact"><div class="label">Sono</div>${esc(ph.sono)}</div><div class="fact"><div class="label">Alimentação</div>${esc(ph.alim)}</div><div class="fact"><div class="label">Fraldas</div>${esc(ph.fraldas)}</div></div>
 </div>
 <div class="card"><div class="card-h"><h2>Linha das fases</h2></div><div class="ptrack">${PHASES.map(p=>`<div class="pstep ${p===ph?'now':a.months>=p.to?'past':''}"><div class="label">${p.from===0?'0':p.from}${p.to<999?'–'+p.to+' meses':'+ meses'}</div><b>${esc(p.name)}</b></div>`).join('')}</div></div>
 <div class="card"><div class="card-h"><h2>Primeiras vezes</h2><button class="btn primary sm" data-act="msAdd">Registrar conquista</button></div>
  ${ms.length?`<div class="rows">${ms.map(m=>`<div class="row" data-act="msEdit" data-id="${m.id}" style="cursor:pointer"><div style="min-width:90px" class="ttl small">${fmtDY(dateOnly(m.date))}</div><div class="main"><div class="ttl">${esc(m.title)}</div><div class="small muted">com ${esc(ageText(age(dateOnly(m.date))))}${m.note?' · '+esc(m.note):''}</div></div></div>`).join('')}</div>`:`<div class="empty">Guarde aqui o primeiro sorriso, o primeiro dente, os primeiros passos… com a data e a idade.</div>`}
 </div>`;
};

/* ---------- Ajustes ---------- */
VIEWS.ajustes=()=>{const c=S.cfg,fr=S.inv.filter(i=>i.cat==='fralda');return`
 <div class="sec-h sec-top"></div>
 <div class="grid g2">
 <form class="card" id="cfgForm" style="display:flex;flex-direction:column;gap:14px"><h2>Dados do bebê</h2>
  ${fld('Nome',`<input name="name" id="c-name" value="${esc(c.name)}" required>`)}
  <div class="frow">${fld('Nascimento',`<input type="date" name="birth" id="c-birth" value="${esc(c.birth)}" required>`)}${fld('Sexo',`<select name="sex" id="c-sex"><option value="m"${c.sex!=='f'?' selected':''}>Menino</option><option value="f"${c.sex==='f'?' selected':''}>Menina</option></select>`)}</div>
  <div class="frow">${fld('Tipo sanguíneo',`<input name="blood" id="c-blood" value="${esc(c.blood||'')}" placeholder="Ex.: O+">`)}${fld('Alergias',`<input name="allergies" id="c-all" value="${esc(c.allergies||'')}" placeholder="Nenhuma conhecida">`)}</div>
  <div class="frow">${fld('Pediatra',`<input name="pedName" id="c-ped" value="${esc(c.pedName||'')}">`)}${fld('Telefone do pediatra',`<input name="pedPhone" id="c-pedp" value="${esc(c.pedPhone||'')}" inputmode="tel">`)}</div>
  <div class="frow">${fld('Plano de saúde',`<input name="plan" id="c-plan" value="${esc(c.plan||'')}">`)}${fld('Carteirinha / cartão SUS',`<input name="card" id="c-card" value="${esc(c.card||'')}">`)}</div>
  ${fld('Fralda em uso (desconta a cada troca)',`<select name="diaperItem" id="c-di"><option value="">Nenhuma</option>${fr.map(i=>`<option value="${i.id}"${c.diaperItem===i.id?' selected':''}>${esc(i.name)}${i.size?' '+esc(i.size):''}</option>`).join('')}</select>`)}
  <div><button class="btn primary" type="submit">Salvar dados</button></div>
 </form>
 <div class="grid" style="align-content:start">
  <div class="card"><h2>Aparência</h2><div style="margin-top:10px">${seg('theme',[['auto','Automático'],['light','Claro'],['dark','Escuro']],lsGet('ddb-theme')||'auto')}</div><p class="small muted" style="margin:8px 0 0">Automático segue o modo do celular.</p></div>
  <div class="card"><h2>Avisos neste aparelho</h2>${pushCard()}</div>
  <div class="card"><h2>Família</h2>
   <p class="small">Para sua esposa usar junto, ela abre o app, cria a conta dela e entra com este código:</p>
   <div class="code">${esc(INVITE)}</div>
   <button class="btn sm" data-act="copyCode" style="margin-top:8px">Copiar código</button>
   <div class="label" style="margin-top:14px">Quem participa</div>
   <div class="rows">${MEMBERS.map(m=>`<div class="row"><div class="main"><div class="ttl">${esc(m.display_name||'Sem nome')}</div></div>${m.user_id===ME.id?'<span class="pill neutral">você</span>':''}</div>`).join('')}</div></div>
  <form class="card" id="nameForm" style="display:flex;flex-direction:column;gap:10px"><h2>Seu nome nos registros</h2>${fld('Como você aparece',`<input name="display" id="n-disp" value="${esc(WHO)}" required>`)}<div><button class="btn" type="submit">Salvar nome</button></div></form>
  <div class="card"><h2>Instalar no celular</h2>
   <p class="small"><b>iPhone (Safari):</b> toque em <b>Compartilhar</b> (o quadrado com a seta) e escolha <b>Adicionar à Tela de Início</b>.</p>
   <p class="small"><b>Android (Chrome):</b> toque no menu <b>⋮</b> e escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</p>
   <p class="small muted">Conta: ${esc(ME.email||'')} · <button class="linkbtn" data-act="logout">Sair</button></p></div>
 </div></div>`};
