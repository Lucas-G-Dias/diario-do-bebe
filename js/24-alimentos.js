/* ============ Introdução alimentar: visual, por grupo, com tentativas e reação ============ */
/* Marca sozinho a partir do registro "Comidinha" (campo alimento). Toque no alimento para registrar tentativa e reação. */
const FOOD_GROUPS=[
 ['Frutas','var(--feed)','Amassada, raspada ou em pedaços macios. Sem açúcar.',[['Banana','🍌'],['Maçã','🍎'],['Pera','🍐'],['Mamão','🥭'],['Manga','🥭'],['Abacate','🥑'],['Melancia','🍉'],['Melão','🍈'],['Laranja','🍊'],['Morango','🍓'],['Goiaba','🍏'],['Uva','🍇']]],
 ['Legumes e verduras','var(--growth)','Cozidos e amassados com garfo, sem liquidificar.',[['Abóbora','🎃'],['Cenoura','🥕'],['Batata-doce','🍠'],['Chuchu','🥒'],['Abobrinha','🥒'],['Brócolis','🥦'],['Beterraba','🟣'],['Mandioquinha','🥔'],['Couve','🥬'],['Espinafre','🥬'],['Tomate','🍅'],['Vagem','🫛']]],
 ['Cereais e raízes','var(--warn)','Bem cozidos. Arroz e feijão podem ir juntos no prato.',[['Arroz','🍚'],['Batata','🥔'],['Mandioca','🥔'],['Inhame','🥔'],['Milho','🌽'],['Aveia','🥣'],['Macarrão','🍝'],['Cuscuz','🌾']]],
 ['Feijões','var(--other)','O grão amassado, não só o caldo.',[['Feijão','🫘'],['Lentilha','🟤'],['Grão-de-bico','🟡'],['Ervilha','🫛']]],
 ['Carnes e ovo','var(--health)','Bem cozidos, desfiados ou moídos. Ovo inteiro bem cozido.',[['Frango','🍗'],['Carne bovina','🥩'],['Peixe','🐟'],['Ovo','🥚'],['Fígado','🥩'],['Carne de porco','🍖']]],
 ['Para observar alergia','var(--bad)','Ofereça um novo de cada vez e observe por 2 ou 3 dias.',[['Leite e derivados','🥛'],['Trigo','🌾'],['Amendoim','🥜'],['Soja','🫘'],['Castanhas','🌰'],['Frutos do mar','🦐']]]];
const FOOD_R=[['gostou','Gostou','😋','var(--ok)'],['neutro','Mais ou menos','😐','var(--warn)'],['recusou','Recusou','🙅','var(--other)'],['alergia','Teve reação','⚠️','var(--bad)']];
const FOOD_ALL=FOOD_GROUPS.flatMap(([g,c,,L])=>L.map(([n,e])=>({n,e,g,c})));
const fkey=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function foodsOffered(){const m=new Map();(S.foods||[]).forEach(f=>m.set(f.id,f));const sp=x=>' '+fkey(x).replace(/-/g,' ')+' ';
 allEv().filter(e=>e.type==='feed'&&e.kind==='solido'&&e.food).forEach(e=>{const txt=sp(e.food);
  FOOD_ALL.forEach(({n})=>{const k=fkey(n),nn=sp(n).trim();if(!m.has(k)&&(txt.includes(' '+nn+' ')||txt.includes(' '+nn+'s ')))m.set(k,{id:k,name:n,first:e.start,tries:1,auto:true})})});
 return m}
const foodGroupsDone=()=>{const m=foodsOffered();return FOOD_GROUPS.slice(0,5).filter(([, , ,L])=>L.some(([n])=>m.has(fkey(n)))).length};
let FOODF='todos';
/* sugestões: 3 alimentos novos, priorizando grupos que ainda faltam */
function foodNext(m){const miss=FOOD_GROUPS.slice(0,5).filter(([, , ,L])=>!L.some(([n])=>m.has(fkey(n)))).map(g=>g[0]);
 return FOOD_ALL.filter(f=>!m.has(fkey(f.n))&&f.g!=='Para observar alergia').sort((a,b)=>miss.includes(b.g)-miss.includes(a.g)).slice(0,3)}
VIEWS.alimentos=()=>{const a=age(),m=foodsOffered(),n=m.size,tot=FOOD_ALL.length,alerg=[...m.values()].filter(f=>f.reaction==='alergia'),nx=foodNext(m),gd=foodGroupsDone();
 const C=2*Math.PI*34,ring=`<svg class="fring" viewBox="0 0 84 84" role="img" aria-label="${n} de ${tot} alimentos"><circle cx="42" cy="42" r="34" fill="none" stroke="var(--line)" stroke-width="9"/><circle cx="42" cy="42" r="34" fill="none" stroke="var(--feed)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C*n/tot} ${C}" transform="rotate(-90 42 42)"/><text x="42" y="47" text-anchor="middle" font-size="18" font-weight="800" style="fill:var(--ink);font-family:var(--display)">${n}</text></svg>`;
 const filt=f=>{const x=m.get(fkey(f.n));return FOODF==='todos'||(FOODF==='provou'?!!x:FOODF==='falta'?!x:x&&x.reaction===FOODF)};
 return`${a&&a.m<6?`<div class="banner" role="status">A comidinha começa aos 6 meses${a.m>=4?`, daqui a uns ${Math.max(1,Math.round((Date.parse(S.cfg.birth+'T12:00')+6*30.44*DAY-Date.now())/DAY))} dias`:''}. Até lá, só leite (Guia Alimentar do Ministério da Saúde).</div>`:''}
 ${alerg.length?`<div class="alert"><span class="ic" style="--c:var(--bad)">${ic('thermo')}</span><div class="tx"><b>Reação registrada</b><span>${alerg.map(f=>esc(f.name)).join(', ')} · conte ao pediatra</span></div><button class="btn sm" data-act="tab" data-id="consulta" aria-label="Abrir Para a consulta">Consulta</button></div>`:''}
 <div class="card food-hero">${ring}<div class="grow"><b>${n} de ${tot} alimentos</b><span class="small muted">${gd} de 5 grupos no prato</span>
  <div class="gdots">${FOOD_GROUPS.slice(0,5).map(([g,c,,L])=>{const k=L.filter(([x])=>m.has(fkey(x))).length;return`<span style="--c:${c}" title="${g}: ${k} de ${L.length}" class="${k?'on':''}">${L[0][1]}</span>`}).join('')}</div></div>
  <button class="btn impact sm" data-act="foodReg">+ Comidinha</button></div>
 ${nx.length?`<div class="card"><div class="card-h"><h2>Para experimentar</h2><span class="small muted">grupos que faltam primeiro</span></div><div class="fnext">${nx.map(f=>`<button class="fnx" style="--c:${f.c}" data-act="foodOpen" data-id="${fkey(f.n)}"><span class="fe">${f.e}</span><b>${f.n}</b><small>${f.g}</small></button>`).join('')}</div></div>`:''}
 <div class="alb-tabs">${[['todos','Todos'],['provou','Já provou'],['falta','Ainda não'],['gostou','😋 Gostou'],['recusou','🙅 Recusou']].map(([k,l])=>`<button class="chip" aria-pressed="${FOODF===k}" data-act="foodF" data-id="${k}">${l}</button>`).join('')}</div>
 ${FOOD_GROUPS.map(([g,c,tip,L])=>{const V=L.map(([nm,e])=>({nm,e})).filter(f=>filt({n:f.nm}));if(!V.length)return'';const k=L.filter(([x])=>m.has(fkey(x))).length;
  return`<div class="card"><div class="card-h"><h2>${g}</h2><span class="small muted">${k} de ${L.length}</span></div><p class="hint" style="margin:0 0 8px">${tip}</p><div class="fgrid">${V.map(({nm,e})=>{const f=m.get(fkey(nm)),r=f&&FOOD_R.find(x=>x[0]===f.reaction);
   return`<button class="fcard${f?' on':''}" style="--c:${r?r[3]:c}" data-act="foodOpen" data-id="${fkey(nm)}" aria-label="${esc(nm)}: ${f?(r?r[1]:'oferecido')+(f.tries>1?`, ${f.tries} vezes`:''):'ainda não oferecido'}"><span class="fe">${e}</span><b>${esc(nm)}</b>${f?`<span class="fr">${r?r[2]:'✓'}${f.tries>1?` ×${f.tries}`:''}</span>`:''}</button>`}).join('')}</div></div>`}).join('')||'<div class="empty">Nenhum alimento neste filtro.</div>'}
 <div class="card tipcard"><b>Lembretes do Guia Alimentar</b><ul class="marks"><li>Aos 6 meses: fruta nos lanches e uma refeição salgada no almoço. Aos 7 meses, entra o jantar.</li><li>Recusou? É normal. Pode ser preciso oferecer de 8 a 10 vezes até aceitar.</li><li>Sem açúcar até os 2 anos e sem mel antes de 1 ano. Sem sal ou com bem pouco.</li></ul></div>`};
A.foodF=k=>{FOODF=k;render()};
A.foodReg=()=>openEventForm({type:'feed',kind:'solido',start:Date.now()},true);
A.foodOpen=k=>{const it=FOOD_ALL.find(f=>fkey(f.n)===k);if(!it)return;const f=foodsOffered().get(k)||{},saved=(S.foods||[]).some(x=>x.id===k);
 openModal({title:it.n,saveLabel:f.first?'Ofereci de novo hoje':'Ofereci hoje',onDelete:saved?async()=>{await w(store.del('foods/'+k));toast('Desmarcado')}:null,
  body:`<div class="fbig" style="--c:${it.c}"><span>${it.e}</span><small>${it.g}${f.first?` · ${f.tries||1} ${(f.tries||1)>1?'vezes':'vez'} · desde ${fmtD(f.first)}`:''}</small></div>
  <p class="hint" style="text-align:center;margin:0 0 10px">${FOOD_GROUPS.find(g=>g[0]===it.g)[2]}</p>
  <div class="fld"><span>Como foi?</span><div class="freact">${FOOD_R.map(([v,l,e,c])=>`<label style="--c:${c}"><input type="radio" name="reaction" value="${v}"${(f.reaction||'gostou')===v?' checked':''}><span><i>${e}</i>${l}</span></label>`).join('')}</div></div>`,
  onSave:async fd=>{const t=(f.tries||0)+1;await w(store.set('foods/'+k,{name:it.n,reaction:fd.reaction,first:f.first||Date.now(),last:Date.now(),tries:t,by:WHO}));
   toast(fd.reaction==='alergia'?'Registrado. Conte ao pediatra.':fd.reaction==='recusou'?`Tudo bem! Tente de novo outro dia (${t}ª vez).`:`${it.e} ${it.n} ✓ anotado no diário de sabores`)}})};
