/* ---------- Início: próximos (consulta, vacina, exame, peso) ---------- */
const relDay=t=>{const d=Math.round((dayStart(t)-dayStart(Date.now()))/DAY);return d<0?`atrasada há ${-d} ${-d>1?'dias':'dia'}`:d===0?'hoje':d===1?'amanhã':d<7?`em ${d} dias`:fmtDY(t)};
function nextVaccine(){if(!S.cfg?.birth)return null;return VAX.filter(v=>!S.vax[v[0]]?.done).map(v=>({v,st:vaxStatus(v)})).filter(x=>x.st.due).sort((a,b)=>a.st.due-b.st.due)[0]||null}
function nxTile(k,i,c,title,sub,soon,act,id){return`<button class="nx" style="--c:${c}" data-act="${act}"${id?` data-id="${esc(id)}"`:''}><span class="k">${ic(i)}${k}</span><b>${esc(title)}</b><span class="${soon?'soon':''}">${esc(sub)}</span></button>`}
function nextsCard(){
 const up=upcoming(),cons=up.find(x=>!x._exam&&x.type==='consulta'),ex=up.find(x=>x._exam),vac=nextVaccine();
 const g=[...S.growth].filter(x=>x.w).sort((a,b)=>b.date.localeCompare(a.date))[0];
 const when=x=>relDay(dateOnly(x.date))+(x.time?' às '+x.time:''),near=x=>dateOnly(x.date)<dayStart(Date.now())+2*DAY;
 const t=[
  cons?nxTile('Consulta','cal','var(--accent)',cons.title,when(cons),near(cons),'tab','agenda'):nxTile('Consulta','cal','var(--accent)','Nenhuma marcada','Toque para marcar',false,'agAdd'),
  vac?nxTile('Vacina','syringe',vac.st.s==='late'?'var(--bad)':'var(--health)',vac.v[1],`${vac.v[3]} · ${relDay(vac.st.due)}`,vac.st.s==='late'||vac.st.s==='soon','tab','saude'):nxTile('Vacina','syringe','var(--health)','Caderneta em dia','Ver vacinas',false,'tab','saude'),
  ex?nxTile('Exame','flask','var(--health)',ex.title.replace(/^Exame: /,''),when(ex),near(ex),'tab','exames'):nxTile('Exame','flask','var(--health)','Nenhum agendado','Ver exames',false,'tab','exames'),
  g?nxTile('Peso','growth','var(--growth)',num(g.w,2)+' kg',`em ${fmtD(dateOnly(g.date))}${S.growth.find(x=>x.l&&x.date===g.date)?' · '+num(S.growth.find(x=>x.l&&x.date===g.date).l)+' cm':''}`,false,'tab','crescimento'):nxTile('Peso','growth','var(--growth)','Sem medida','Toque para registrar',false,'growthAdd')];
 return`<div class="card"><div class="card-h"><h2>Próximos</h2><button class="linkbtn" data-act="tab" data-id="agenda">Agenda</button></div><div class="nexts">${t.join('')}</div></div>`}
