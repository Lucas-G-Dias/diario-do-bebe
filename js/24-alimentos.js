/* ============ Introdução alimentar: o que já foi oferecido e como reagiu ============ */
/* Marca sozinho a partir do registro "Comidinha" (campo alimento). Toque no alimento só para dizer a reação. */
const FOOD_GROUPS=[
 ['Frutas','var(--feed)',['Banana','Maçã','Pera','Mamão','Manga','Abacate','Melancia','Melão','Laranja','Morango','Goiaba','Uva']],
 ['Legumes e verduras','var(--growth)',['Abóbora','Cenoura','Batata-doce','Chuchu','Abobrinha','Brócolis','Beterraba','Mandioquinha','Couve','Espinafre','Tomate','Vagem']],
 ['Cereais e raízes','var(--warn)',['Arroz','Batata','Mandioca','Inhame','Milho','Aveia','Macarrão','Cuscuz']],
 ['Feijões','var(--other)',['Feijão','Lentilha','Grão-de-bico','Ervilha']],
 ['Carnes e ovo','var(--health)',['Frango','Carne bovina','Peixe','Ovo','Fígado','Carne de porco']],
 ['Para observar alergia','var(--bad)',['Leite e derivados','Trigo','Amendoim','Soja','Castanhas','Frutos do mar']]];
const FOOD_R=[['gostou','Gostou','var(--ok)'],['neutro','Mais ou menos','var(--warn)'],['recusou','Recusou','var(--other)'],['alergia','Teve reação','var(--bad)']];
const fkey=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
/* alimentos oferecidos: marcados à mão + os que aparecem nos registros de comidinha */
function foodsOffered(){const m=new Map();(S.foods||[]).forEach(f=>m.set(f.id,f));
 const sp=x=>' '+fkey(x).replace(/-/g,' ')+' ';
 allEv().filter(e=>e.type==='feed'&&e.kind==='solido'&&e.food).forEach(e=>{const txt=sp(e.food);
  FOOD_GROUPS.forEach(([, ,L])=>L.forEach(n=>{const k=fkey(n),nn=sp(n).trim();if(!m.has(k)&&(txt.includes(' '+nn+' ')||txt.includes(' '+nn+'s ')))m.set(k,{id:k,name:n,first:e.start,auto:true})}))});
 return m}
const foodGroupsDone=()=>{const m=foodsOffered();return FOOD_GROUPS.slice(0,5).filter(([, ,L])=>L.some(n=>m.has(fkey(n)))).length};
VIEWS.alimentos=()=>{const a=age(),m=foodsOffered(),n=m.size,alerg=[...m.values()].filter(f=>f.reaction==='alergia');
 return`${a&&a.m<6?`<div class="banner" role="status">A comidinha começa aos 6 meses, com leite materno até 2 anos ou mais (Guia Alimentar do Ministério da Saúde). Dá para ir conhecendo a lista.</div>`:''}
 ${alerg.length?`<div class="alert"><span class="ic" style="--c:var(--bad)">${ic('thermo')}</span><div class="tx"><b>Reação registrada</b><span>${alerg.map(f=>esc(f.name)).join(', ')} · conte ao pediatra</span></div><button class="btn sm" data-act="tab" data-id="consulta" aria-label="Abrir Para a consulta">Consulta</button></div>`:''}
 <div class="card"><div class="card-h"><h2>${n} ${n===1?'alimento oferecido':'alimentos oferecidos'}</h2><span class="small muted">${foodGroupsDone()} de 5 grupos</span></div>
  <p class="hint" style="margin-top:0">Ao registrar <b>Mamada › Comidinha</b> com o nome do alimento, ele é marcado aqui sozinho. Toque num alimento para marcar ou dizer como foi.</p>
  ${FOOD_GROUPS.map(([g,c,L])=>`<div class="label" style="margin:12px 0 6px">${g}</div><div class="foods">${L.map(nm=>{const f=m.get(fkey(nm)),r=f&&FOOD_R.find(x=>x[0]===f.reaction);
   return`<button class="food${f?' on':''}" style="--c:${r?r[2]:c}" data-act="foodOpen" data-id="${fkey(nm)}" aria-label="${esc(nm)}: ${f?(r?r[1]:'oferecido'):'ainda não oferecido'}">${f?ic(r&&r[0]==='alergia'?'thermo':'check'):''}${esc(nm)}</button>`}).join('')}</div>`).join('')}
  <p class="hint">Sem açúcar até 2 anos e sem mel antes de 1 ano. Alimentos que costumam dar alergia: ofereça um novo de cada vez e observe por 2 ou 3 dias.</p></div>`};
A.foodOpen=k=>{let nm=k;FOOD_GROUPS.forEach(([, ,L])=>L.forEach(n=>{if(fkey(n)===k)nm=n}));const f=foodsOffered().get(k)||{};
 openModal({title:nm,saveLabel:'Salvar',onDelete:(S.foods||[]).some(x=>x.id===k)?async()=>{await w(store.del('foods/'+k));toast('Desmarcado')}:null,
  body:`<div class="fld"><span>Como foi?</span>${seg('reaction',FOOD_R.map(x=>[x[0],x[1]]),f.reaction||'gostou')}</div>${fld('Quando ofereceu',`<input type="date" name="date" id="fo-d" value="${isoDate(f.first||Date.now())}">`)}`,
  onSave:async fd=>{await w(store.set('foods/'+k,{name:nm,reaction:fd.reaction,first:dateOnly(fd.date)||Date.now(),by:WHO}));toast(fd.reaction==='alergia'?'Registrado. Conte ao pediatra.':nm+' marcado')}})};
