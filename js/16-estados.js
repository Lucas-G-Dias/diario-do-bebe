/* ============ estados de carregamento, erro e nova tentativa ============ */
/* Que coleções cada página precisa para não mostrar um "vazio" falso. EV = registros do mês atual. */
const PAGE_DATA={inicio:['inventory','agenda','vaccines','EV'],diario:['EV'],agenda:['agenda','vaccines'],saude:['vaccines'],exames:['exams'],crescimento:['growth'],fases:['milestones'],album:['photos','albums'],enxoval:['enxoval'],estoque:['inventory'],fraldas:['inventory']};
function pageState(tab){
 if(CACHE_HIT)return'ok'; // já há dados salvos no aparelho: mostra e atualiza por trás
 const ss=(PAGE_DATA[tab]||[]).map(p=>p==='EV'?'months/'+ymOf(Date.now())+'/events':p).map(p=>subs.find(x=>x.path===p)).filter(Boolean);
 if(ss.every(s=>s.loaded))return'ok';
 return ss.some(s=>s.err)?'err':'load';
}
function pageBody(tab){const st=pageState(tab);return st==='load'?skelBlocks(tab,'Carregando '+(PAGES[tab]||'').toLowerCase()+'…'):st==='err'?errCard():VIEWS[tab]()}
const sk=(h,w)=>`<span class="sk" style="height:${h}px;width:${w||'100%'}"></span>`;
function skelBlocks(tab,msg){
 const rows=n=>Array.from({length:n},()=>`<div class="sk-row">${sk(36,'36px')}<div class="sk-col">${sk(12,'60%')}${sk(10,'38%')}</div></div>`).join('');
 const home=`<div class="now">${[1,2,3].map(()=>`<div class="sk-tile">${sk(34,'34px')}${sk(10,'70%')}${sk(18,'50%')}</div>`).join('')}</div>`;
 return`<div class="skel" aria-busy="true"><p class="sr-only" role="status">${msg||'Carregando…'}</p><div aria-hidden="true">${tab==='inicio'||!tab?home:''}<div class="card">${sk(14,'40%')}${rows(tab==='inicio'||!tab?2:4)}</div></div></div>`;
}
const skelView=msg=>`<div class="wrap">${BRAND}${skelBlocks('inicio',msg)}</div>`;
const errCard=()=>`<div class="card err-card" role="alert"><b>Não deu para carregar</b><p class="small muted">O servidor não respondeu. Confira a internet. O que você já registrou continua guardado.</p><button class="btn primary" data-act="retry">Tentar de novo</button></div>`;
A.retry=async()=>{await refetchNow();if(!FAM&&ME)await loadFamily();if(S.stale)toast('Ainda sem resposta do servidor. Confira a internet.',true);else toast('Atualizado')};
