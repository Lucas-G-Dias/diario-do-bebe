/* ============ Marcos do desenvolvimento (vigilância da Caderneta da Criança, MS) + previsão da próxima soneca ============ */
/* [id, mês, texto, área] — 4 marcos por idade, como no instrumento da Caderneta. Não é diagnóstico. */
const DEV=[
 ['d2a',2,'Olha para o seu rosto quando você fala','Social'],['d2b',2,'Reage a sons (assusta, para, procura)','Linguagem'],['d2c',2,'De bruços, levanta a cabeça','Motor'],['d2d',2,'Sorri quando você sorri','Social'],
 ['d4a',4,'Responde quando brincam com ele (sorri, vocaliza)','Social'],['d4b',4,'Segura objetos colocados na mão','Motor fino'],['d4c',4,'Faz sons (vocaliza)','Linguagem'],['d4d',4,'De bruços, apoia-se nos antebraços','Motor'],
 ['d6a',6,'Tenta pegar objetos ao alcance','Motor fino'],['d6b',6,'Leva objetos à boca','Motor fino'],['d6c',6,'Vira a cabeça para o lado do som','Linguagem'],['d6d',6,'Rola sozinho','Motor'],
 ['d9a',9,'Brinca de esconde-achou','Social'],['d9b',9,'Passa objetos de uma mão para a outra','Motor fino'],['d9c',9,'Repete sílabas (papa, mama)','Linguagem'],['d9d',9,'Senta sem apoio','Motor'],
 ['d12a',12,'Imita gestos (tchau, bater palmas)','Social'],['d12b',12,'Pega objetos pequenos com a ponta dos dedos (pinça)','Motor fino'],['d12c',12,'Faz "conversa" sem palavras (jargão)','Linguagem'],['d12d',12,'Anda com apoio','Motor'],
 ['d15a',15,'Faz gestos quando você pede','Social'],['d15b',15,'Coloca bloquinhos dentro de um pote','Motor fino'],['d15c',15,'Fala uma palavra','Linguagem'],['d15d',15,'Anda sem apoio','Motor'],
 ['d18a',18,'Mostra dois objetos quando você pede','Social'],['d18b',18,'Rabisca sozinho','Motor fino'],['d18c',18,'Fala três palavras','Linguagem'],['d18d',18,'Anda para trás','Motor'],
 ['d24a',24,'Tira alguma peça de roupa','Social'],['d24b',24,'Empilha 3 bloquinhos','Motor fino'],['d24c',24,'Aponta duas figuras quando você pede','Linguagem'],['d24d',24,'Chuta a bola','Motor']];
const DEV_EMO={Social:'🤗',Linguagem:'🗣️',Motor:'🚼','Motor fino':'✋'};
const DEV_AGES=[...new Set(DEV.map(x=>x[1]))];
/* marcos da idade atual (a faixa que já chegou) */
function devBand(){const a=age();if(!a)return null;const m=a.m;return DEV_AGES.filter(x=>x<=m).pop()||null}
function devNow(){const b=devBand();return b?DEV.filter(x=>x[1]===b):[]}
function devCard(){const a=age();if(!a)return'';const b=devBand(),m=a.m,next=DEV_AGES.find(x=>x>m),dv=S.dev||{};
 const late=DEV.filter(x=>x[1]<b&&!dv[x[0]]),cur=devNow(),nxt=next?DEV.filter(x=>x[1]===next):[];
 const item=x=>`<button class="devi${dv[x[0]]?' on':''}" data-act="devTog" data-id="${x[0]}" aria-pressed="${!!dv[x[0]]}"><span class="ck" aria-hidden="true">${dv[x[0]]?ic('check'):''}</span><span class="devemo" aria-hidden="true">${DEV_EMO[x[3]]||'⭐'}</span><span><b>${x[2]}</b><small>${x[3]}${dv[x[0]]?' · visto em '+fmtD(dv[x[0]].at):''}</small></span></button>`;
 return`<div class="card"><div class="card-h"><h2>Marcos do desenvolvimento</h2><span class="small muted">${b?`${cur.filter(x=>dv[x[0]]).length} de ${cur.length} · ${b} meses`:''}</span></div>
 ${b?cur.map(item).join(''):`<p class="hint">Os primeiros marcos da Caderneta são aos 2 meses${next?`, daqui a ${Math.max(1,Math.round((Date.parse(S.cfg.birth+'T12:00')+next*30.44*DAY-Date.now())/DAY))} dias`:''}.</p>`}
 ${late.length?`<details class="devmore"><summary>${late.length} ${late.length>1?'marcos':'marco'} de idades anteriores sem marcar</summary>${late.map(item).join('')}</details>`:''}
 ${nxt.length?`<details class="devmore"><summary>O que vem aos ${next} meses</summary><ul class="marks">${nxt.map(x=>`<li>${x[2]}</li>`).join('')}</ul></details>`:''}
 <p class="hint">Baseado no acompanhamento da Caderneta da Criança (Ministério da Saúde). Cada criança tem seu ritmo. Se algo não aparecer até a idade seguinte, leve a dúvida ao pediatra: dá para anotar em Para a consulta.</p></div>`}
A.devTog=id=>{const dv=S.dev||{};return dv[id]?w(store.del('dev/'+id)):w(store.set('dev/'+id,{at:Date.now(),by:WHO})).then(()=>toast('Marco registrado'))};
/* janela de sono: tempo acordado que costuma caber em cada idade (guias de sono infantil; é uma estimativa) */
const WAKE=[[1,[45,60]],[2,[60,90]],[3,[75,105]],[5,[90,150]],[7,[120,180]],[9,[150,210]],[12,[180,240]],[18,[240,330]],[99,[300,360]]];
function napHint(){const a=age();if(!a||ongoing('sleep'))return null;const m=a.months;
 const last=allEv().filter(e=>e.type==='sleep'&&e.end).sort((x,y)=>y.end-x.end)[0];if(!last||Date.now()-last.end>8*HR)return null;
 const[lo,hi]=(WAKE.find(([mx])=>m<mx)||WAKE[WAKE.length-1])[1],t0=last.end+lo*MIN,t1=last.end+hi*MIN,now=Date.now();
 return{t0,t1,txt:now>t1?'já passou da janela de sono':now>=t0?'na janela de sono agora':`sono por volta de ${fmtT(t0)}–${fmtT(t1)}`,now:now>=t0}}
