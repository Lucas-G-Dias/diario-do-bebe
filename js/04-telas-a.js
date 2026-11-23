/* ---------- login e família ---------- */
let LOGIN_MODE='entrar';
function loginView(){const novo=LOGIN_MODE==='criar';return`<div class="wrap">${BRAND}<div class="card auth">
 <div><h2 style="font-size:24px">${novo?'Criar sua conta':'Entrar'}</h2><p class="muted small" style="margin:6px 0 0">${novo?'Use seu e-mail e escolha uma senha. Cada pessoa da família cria a própria conta.':'Entre com o e-mail e a senha que você cadastrou.'}</p></div>
 <form id="loginForm">
  ${fld('E-mail','<input type="email" name="email" id="l-email" autocomplete="email" required inputmode="email">')}
  ${fld('Senha',`<input type="password" name="password" id="l-pass" autocomplete="${novo?'new-password':'current-password'}" minlength="6" required>`)}
  ${novo?fld('Repita a senha','<input type="password" name="password2" id="l-pass2" autocomplete="new-password" minlength="6" required>'):''}
  <button class="btn primary" type="submit" style="justify-content:center;padding:12px">${novo?'Criar conta':'Entrar'}</button>
 </form>
 <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><button class="linkbtn" data-act="loginMode">${novo?'Já tenho conta':'Criar uma conta'}</button>${novo?'':'<button class="linkbtn" data-act="forgot">Esqueci a senha</button>'}</div>
</div></div>`}
function familyView(){return`<div class="wrap">${BRAND}<div class="auth">
 <div class="card"><h2>Primeira vez aqui?</h2><p class="small muted">Crie o espaço da família e depois convide quem vai usar junto com você.</p>
  <form id="famCreate">${fld('Como você quer aparecer nos registros','<input name="display" id="f-disp1" required placeholder="Ex.: Pai, Mãe, Lucas">')}<button class="btn primary" type="submit" style="justify-content:center">Criar a família</button></form></div>
 <div class="card"><h2>Recebeu um código?</h2><p class="small muted">Se alguém da família já criou o espaço, entre com o código de convite que aparece no app da outra pessoa, em Ajustes.</p>
  <form id="famJoin">${fld('Código de convite','<input name="code" id="f-code" required autocapitalize="characters" placeholder="Ex.: 3FA9C21B" style="text-transform:uppercase;letter-spacing:.1em">')}${fld('Como você quer aparecer nos registros','<input name="display" id="f-disp2" required placeholder="Ex.: Mãe">')}<button class="btn" type="submit" style="justify-content:center">Entrar na família</button></form></div>
 <div style="text-align:center"><button class="linkbtn" data-act="logout">Sair da conta ${esc(ME.email||'')}</button></div>
</div></div>`}

/* ---------- configuração inicial ---------- */
function setupView(){return`<div class="wrap">${BRAND}<div class="card setup">
 <h2>Vamos começar</h2><p class="muted">Preencha os dados do bebê. Você e sua esposa vão ver e editar as mesmas informações.</p>
 <form id="setupForm" style="display:flex;flex-direction:column;gap:14px">
  ${fld('Nome do bebê','<input name="name" id="s-name" required placeholder="Ex.: Miguel">')}
  <div class="frow">${fld('Data de nascimento','<input type="date" name="birth" id="s-birth" required>')}${fld('Sexo','<select name="sex" id="s-sex"><option value="m">Menino</option><option value="f">Menina</option></select>')}</div>
  <div class="label" style="margin-top:6px">Fraldas em casa (opcional)</div>
  <div class="frow">${fld('Tamanho','<select name="size" id="s-size"><option>RN</option><option selected>P</option><option>M</option><option>G</option><option>XG</option><option>XXG</option></select>')}${fld('Quantas tem agora','<input type="number" min="0" name="qty" id="s-qty" placeholder="Ex.: 80">')}</div>
  <button class="btn primary" type="submit" style="justify-content:center;padding:12px">Começar a usar</button>
 </form></div></div>`}

/* ---------- Hoje ---------- */
const VIEWS={};
/* ---------- Registros ---------- */
VIEWS.registros=()=>{
 const t0=S.day,isToday=t0===dayStart(Date.now()),ds=dayStats(t0);
 const days=[...Array(7)].map((_,i)=>addDays(dayStart(Date.now()),i-6)),st=days.map(dayStats);
 const lbl=days.map(d=>WD[new Date(d).getDay()].slice(0,3));const a=age(),ph=a?phaseOf(a):null;
 const avgSleep=st.reduce((s,x)=>s+x.sleep,0)/7/HR;
 return`
 <div class="sec-h sec-top">
  <div style="display:flex;gap:6px;align-items:center"><button class="iconbtn" data-act="dayPrev" aria-label="Dia anterior">‹</button>
  <input type="date" id="dayPick" aria-label="Escolher o dia do diário" title="Escolher o dia" value="${isoDate(t0)}" max="${isoDate(Date.now())}" style="border:1px solid var(--line);background:var(--surface);border-radius:9px;padding:6px 8px">
  <button class="iconbtn" data-act="dayNext" aria-label="Próximo dia"${isToday?' disabled':''}>›</button>${isToday?'':'<button class="btn sm" data-act="dayToday">Hoje</button>'}</div></div>
 <div class="stats">
  <div class="stat"><div class="v">${fmtDur(ds.sleep)}</div><div class="k">de sono</div></div>
  <div class="stat"><div class="v">${ds.feeds}</div><div class="k">mamadas${ds.ml?` · ${ds.ml} ml`:''}</div></div>
  <div class="stat"><div class="v">${ds.diapers}</div><div class="k">fraldas · ${ds.xixi} xixi, ${ds.coco} cocô</div></div>
  <div class="stat"><div class="v">${ds.list.filter(e=>e.type==='med'||e.type==='temp').length}</div><div class="k">registros de saúde</div></div>
 </div>
 <div class="card"><div class="card-h"><h2>${WD[new Date(t0).getDay()]}, ${fmtDY(t0)}</h2></div>
  ${timeline(ds.list,'Nenhum registro neste dia.')}</div>
 <div class="sec-h"><h2>Últimos 7 dias</h2></div>
 <div class="grid g3">
  <div class="card"><div class="card-h"><h2>Sono por dia</h2><span class="small muted">média ${num(avgSleep)} h</span></div>${bars(st.map(x=>x.sleep/HR),lbl,'var(--sleep)',{fmt:v=>num(v),ref:ph?ph.sonoH:null,unit:'h'})}${ph?`<div class="hint">Faixa sombreada: sono esperado para a idade (${ph.sonoH[0]} a ${ph.sonoH[1]} h)</div>`:''}</div>
  <div class="card"><div class="card-h"><h2>Mamadas por dia</h2><span class="small muted">média ${num(st.reduce((s,x)=>s+x.feeds,0)/7)}</span></div>${bars(st.map(x=>x.feeds),lbl,'var(--feed)')}</div>
  <div class="card"><div class="card-h"><h2>Fraldas por dia</h2><span class="small muted">média ${num(st.reduce((s,x)=>s+x.diapers,0)/7)}</span></div>${bars(st.map(x=>x.diapers),lbl,'var(--diaper)')}</div>
 </div>`;
};
function niceMax(v){if(v<=0)return 1;const p=10**Math.floor(Math.log10(v)),f=v/p;return(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p}
function bars(vals,labels,color,o={}){
 const fmt=o.fmt||(v=>Math.round(v)),W=320,H=170,pl=26,pr=6,pt=18,pb=22,cw=W-pl-pr,chh=H-pt-pb;
 const mx=niceMax(Math.max(...vals,o.ref?o.ref[1]:0,1)),y=v=>pt+chh-(v/mx)*chh,bw=cw/vals.length;
 let s=`<svg class="ch" viewBox="0 0 ${W} ${H}" role="img"><g class="grid">`;
 for(let i=0;i<=4;i++){const v=mx*i/4;s+=`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl-4}" y="${y(v)+3}" text-anchor="end">${num(v)}</text>`}
 s+='</g>';
 if(o.ref)s+=`<rect x="${pl}" width="${cw}" y="${y(o.ref[1])}" height="${y(o.ref[0])-y(o.ref[1])}" fill="${color}" opacity=".12"/>`;
 vals.forEach((v,i)=>{const x=pl+i*bw+bw*.2,w=bw*.6;if(v>0)s+=`<rect x="${x}" y="${y(v)}" width="${w}" height="${pt+chh-y(v)}" rx="3" fill="${color}"/><text class="vlab" x="${x+w/2}" y="${y(v)-4}" text-anchor="middle">${fmt(v)}</text>`;
  s+=`<text x="${x+w/2}" y="${H-6}" text-anchor="middle">${labels[i]}</text>`});
 return s+'</svg>';
}

/* ---------- Estoque ---------- */
VIEWS.estoque=()=>{
 const dst=diaperStats(),sh=shopping();
 const groups=INV_CATS.map(([k,l])=>[k,l,S.inv.filter(i=>(i.cat||'outro')===k).sort((a,b)=>a.name.localeCompare(b.name))]).filter(g=>g[2].length&&g[0]!=='fralda'&&g[0]!=='lenco');
 const pct=dst.days!=null?Math.min(100,dst.days/14*100):0;
 return`
 <div class="sec-h sec-top"><button class="btn primary" data-act="invAdd">Adicionar item</button></div>
 <button class="mtile" data-act="tab" data-id="fraldas"><span class="ic" style="--c:var(--diaper)">${ic('diaper')}</span><span class="tx"><b>Fraldas e lenços</b><span>${dst.items.length?`${dst.total} fraldas ${activeSize()||''} · uns ${Math.floor(dst.days||0)} dias`:'Quantidade por tamanho e lenços'}</span></span>${dst.st==='bad'||dst.st==='warn'?'<span class="pill bad">!</span>':''}<span class="chev">${ic('chev')}</span></button>
 ${sh.length?`<div class="card"><div class="card-h"><h2>Lista de compras</h2><span class="small muted">itens no mínimo ou abaixo</span></div><div class="rows">${sh.map(i=>`<div class="row"><div class="main"><div class="ttl">${esc(i.name)}${i.size?' '+esc(i.size):''}</div><div class="small muted">restam ${i.qty||0} · mínimo ${i.min} ${esc(i.unit||'')}</div></div><button class="btn sm" data-act="invBuy" data-id="${i.id}">Registrar compra</button></div>`).join('')}</div></div>`:''}
 ${groups.length?`<div class="grid g2">${groups.map(([k,l,items])=>`<div class="card"><div class="card-h"><h2>${l}</h2><span class="small muted">${items.length} ${items.length>1?'itens':'item'}</span></div><div class="rows">${items.map(invRow).join('')}</div></div>`).join('')}</div>`:`<div class="empty">Cadastre também lenços, pomada, roupas, mamadeiras, remédios e o que mais quiser controlar. Defina um <b>mínimo</b> e o item entra na lista de compras quando chegar nele.</div>`}`;
};
function invRow(i){const low=(+i.min||0)>0&&(+i.qty||0)<=(+i.min||0);const active=S.cfg.diaperItem===i.id;
 return`<div class="row"><div class="main"><div class="ttl">${esc(i.name)}${i.size?` <span class="pill neutral">${esc(i.size)}</span>`:''}${active?' <span class="pill ok">em uso</span>':''}${low?' <span class="pill bad">comprar</span>':''}</div><div class="small muted">${i.min?`mínimo ${i.min} ${esc(i.unit||'un.')}`:esc(i.unit||'unidades')}${i.note?' · '+esc(i.note):''}</div></div>
 <div class="qty"><button class="iconbtn" data-act="invDec" data-id="${i.id}" aria-label="Tirar 1 de ${esc(i.name)}">−</button><span class="n">${i.qty||0}</span><button class="iconbtn" data-act="invInc" data-id="${i.id}" aria-label="Somar 1 a ${esc(i.name)}">+</button></div>
 <button class="btn sm" data-act="invBuy" data-id="${i.id}" aria-label="Compra de ${esc(i.name)}: somar ao estoque" title="Registrar compra e somar ao estoque">Compra</button><button class="btn sm ghost" data-act="invEdit" data-id="${i.id}" aria-label="Editar ${esc(i.name)}">Editar</button></div>`}

/* ---------- Crescimento ---------- */
VIEWS.crescimento=()=>{
 const g=[...S.growth].sort((a,b)=>a.date.localeCompare(b.date)),last=g[g.length-1],prev=g[g.length-2];
 const lastW=[...g].reverse().find(x=>x.w),lastL=[...g].reverse().find(x=>x.l),lastHc=[...g].reverse().find(x=>x.hc);
 const diff=(k)=>{const arr=g.filter(x=>x[k]);if(arr.length<2)return'';const a2=arr[arr.length-1],a1=arr[arr.length-2];const d=a2[k]-a1[k];return`${d>=0?'+':''}${num(d,k==='w'?2:1)} desde ${fmtD(dateOnly(a1.date))}`};
 const boy=S.cfg.sex!=='f';
 return`
 <div class="sec-h sec-top"><button class="btn primary" data-act="growthAdd">Nova medida</button></div>
 <div class="grid g3">
  <div class="card tile" style="--c:var(--growth)"><div class="label">Peso</div><div class="big">${lastW?num(lastW.w,2)+' kg':'—'}</div><div class="sub">${lastW?diff('w')||'em '+fmtDY(dateOnly(lastW.date)):'sem medidas'}</div></div>
  <div class="card tile" style="--c:var(--growth)"><div class="label">Comprimento</div><div class="big">${lastL?num(lastL.l)+' cm':'—'}</div><div class="sub">${lastL?diff('l')||'em '+fmtDY(dateOnly(lastL.date)):'sem medidas'}</div></div>
  <div class="card tile" style="--c:var(--growth)"><div class="label">Perímetro cefálico</div><div class="big">${lastHc?num(lastHc.hc)+' cm':'—'}</div><div class="sub">${lastHc?diff('hc')||'em '+fmtDY(dateOnly(lastHc.date)):'sem medidas'}</div></div>
 </div>
 <div class="grid g2">
  <div class="card"><div class="card-h"><h2>Peso por idade</h2><span class="small muted">kg × meses</span></div>${growthChart(g,'w',boy?WHO_W:null)}</div>
  <div class="card"><div class="card-h"><h2>Comprimento por idade</h2><span class="small muted">cm × meses</span></div>${growthChart(g,'l',boy?WHO_L:null)}</div>
 </div>
 <div class="hint">${boy?'Faixa sombreada: entre os percentis 3 e 97 das curvas da OMS para meninos; linha tracejada: mediana. Valores aproximados; quem interpreta é o pediatra.':'As curvas de referência aparecem só para meninos nesta versão.'}</div>
 <div class="card"><div class="card-h"><h2>Histórico de medidas</h2></div>
  ${g.length?`<div class="tbl-wrap"><table><thead><tr><th>Data</th><th>Idade</th><th class="num">Peso</th><th class="num">Comprimento</th><th class="num">Cabeça</th><th>Obs.</th></tr></thead><tbody>${[...g].reverse().map(x=>{const a=age(dateOnly(x.date));return`<tr class="click" data-act="growthEdit" data-id="${x.id}"><td>${fmtDY(dateOnly(x.date))}</td><td>${esc(ageText(a))}</td><td class="num">${x.w?num(x.w,2)+' kg':'—'}</td><td class="num">${x.l?num(x.l)+' cm':'—'}</td><td class="num">${x.hc?num(x.hc)+' cm':'—'}</td><td>${esc(x.note||'')}</td></tr>`}).join('')}</tbody></table></div>`:`<div class="empty">Anote peso e comprimento de cada consulta para acompanhar a curva. Comece pelas medidas do nascimento.</div>`}
 </div>`;
};
function interp(arr,m){if(m<=WHO_M[0])return arr[0];for(let i=1;i<WHO_M.length;i++)if(m<=WHO_M[i]){const t=(m-WHO_M[i-1])/(WHO_M[i]-WHO_M[i-1]);return arr[i-1]+t*(arr[i]-arr[i-1])}return arr[arr.length-1]}
function growthChart(g,k,ref){
 const pts=g.filter(x=>x[k]).map(x=>{const a=age(dateOnly(x.date));return{m:a?a.months:0,v:+x[k]}}).filter(p=>p.m>=0);
 const a=age(),maxM=Math.min(24,Math.max(6,Math.ceil(Math.max(a?a.months:0,...pts.map(p=>p.m))+1)));
 if(!pts.length&&!ref)return`<div class="empty">Sem medidas ainda.</div>`;
 let lo=Infinity,hi=-Infinity;pts.forEach(p=>{lo=Math.min(lo,p.v);hi=Math.max(hi,p.v)});
 if(ref){lo=Math.min(lo,ref.p3[0]);hi=Math.max(hi,interp(ref.p97,maxM))}
 const span=hi-lo||1;lo=Math.floor(lo-span*.05);hi=Math.ceil(hi+span*.05);
 const W=340,H=210,pl=30,pr=10,pt=10,pb=24,X=m=>pl+m/maxM*(W-pl-pr),Y=v=>pt+(H-pt-pb)*(1-(v-lo)/(hi-lo));
 let s=`<svg class="ch" viewBox="0 0 ${W} ${H}" role="img"><g class="grid">`;
 const step=niceMax((hi-lo)/5);for(let v=Math.ceil(lo/step)*step;v<=hi;v+=step)s+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${pl-4}" y="${Y(v)+3}" text-anchor="end">${num(v)}</text>`;
 const xs=maxM<=12?1:3;for(let m=0;m<=maxM;m+=xs)s+=`<text x="${X(m)}" y="${H-8}" text-anchor="middle">${m}</text>`;
 s+='</g>';
 if(ref){const ms=[];for(let m=0;m<=maxM;m+=.5)ms.push(m);
  s+=`<polygon points="${ms.map(m=>X(m)+','+Y(interp(ref.p97,m))).join(' ')} ${ms.slice().reverse().map(m=>X(m)+','+Y(interp(ref.p3,m))).join(' ')}" fill="var(--growth)" opacity=".13"/>`;
  s+=`<polyline points="${ms.map(m=>X(m)+','+Y(interp(ref.p50,m))).join(' ')}" fill="none" stroke="var(--growth)" stroke-dasharray="4 4" stroke-width="1.5" opacity=".8"/>`}
 if(pts.length>1)s+=`<polyline points="${pts.map(p=>X(p.m)+','+Y(p.v)).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>`;
 pts.forEach((p,i)=>s+=`<circle cx="${X(p.m)}" cy="${Y(p.v)}" r="${i===pts.length-1?5:3.5}" fill="var(--accent)" stroke="var(--surface)" stroke-width="1.5"/>`);
 return s+'</svg>';
}
