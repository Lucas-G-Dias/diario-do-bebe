/* ============ Tour guiado: destaca cada lugar com um balão (passo X de N), pode refazer sempre ============ */
const TOURS={
 main:[
  {t:'Bem-vindos ao Diário do Bebê! 👋',p:()=>`Vamos mostrar rapidinho onde fica tudo de ${esc(S.cfg?.name||'o bebê')}. Pode pular e rever quando quiser no botão de ajuda (?).`},
  {s:'.now',t:'Registre em um toque',p:'Sono, Mamada e Fralda. Toque quando acontecer: o horário é marcado sozinho.'},
  {s:'.repeat',t:'Repetir rápido',p:'O que vocês fazem sempre aparece aqui. Um toque repete a última mamadeira ou fralda.'},
  {s:'.nexts',t:'O que vem por aí',p:'Próxima consulta, vacina, exame e pesagem, sem precisar procurar.'},
  {s:'.game',t:'Sequência da família',p:'Cada dia com registro mantém a chama acesa e libera medalhas.'},
  {s:'.fab',t:'Todo o resto fica no +',p:'Remédio, temperatura, banho, peso, exame, compromisso, primeira vez e foto.'},
  {s:'.nb[data-id=diario]',t:'Diário',p:'A linha do tempo de cada dia, para ver o que passou e corrigir.'},
  {s:'.nb[data-id=sons]',t:'Sons para acalmar',p:'Útero, shhh, chuva e ruído branco, com timer. Funcionam sem internet.'},
  {s:'.nb[data-id=menu]',t:'Menu',p:'Fraldas, estoque, agenda, exames, vacinas, álbum e enxoval. Na primeira vez em cada tela, um tour curto explica o que fazer ali.'},
  {s:'[data-act=help]',t:'Ajuda sempre aqui',p:'Explicações com imagens, atalhos e este tour de novo.',x:()=>PUSH==='off'?'<button class="btn sm" data-act="tourPush">Ativar avisos</button>':''}],
 diario:[{s:'#dayPick',t:'Escolha o dia',p:'Volte em qualquer dia para ver ou corrigir os registros.'},{s:'[data-act=noteAdd]',t:'Anotação',p:'Para o que não tem botão próprio: uma observação, um sintoma, uma dúvida para o pediatra.'},{s:'main .card:last-child',t:'Toque para corrigir',p:'Cada registro abre para editar ou apagar.'}],
 fraldas:[{s:'.szchart',t:'Quantas tem de cada tamanho',p:'Toque no tamanho para dizer quantas tem, a meta e qual está em uso. A troca desconta do tamanho em uso.'},{s:'[data-act=wipeAdd],[data-act=wipeOpen]',t:'Lenços',p:'Cadastre os pacotes e toque em Abri quando abrir um. O app estima quanto dura.'}],
 album:[{s:'[data-act=albAdd]',t:'Adicionar fotos',p:'Escolha várias de uma vez. Elas vão sozinhas para a fase certa pela data.'},{s:'.alb-tabs',t:'Fases, álbuns e favoritas',p:'Veja por fase do bebê, por álbum que vocês criarem ou só as favoritas.'}],
 enxoval:[{s:'.ring, main .card',t:'Quanto já tem',p:'O gráfico mostra o que falta, o que está em pesquisa e o que já foi comprado ou ganho.'},{s:'[data-act=enxCheck]',t:'Marque num toque',p:'Toque na situação do item para avançar: Falta › Pesquisando › Comprado › Ganhou.'}],
 agenda:[{s:'[data-act=agAdd]',t:'Novo compromisso',p:'Consulta, vacina ou exame. Chega aviso na véspera e 2 horas antes.'},{s:'[data-act=vaxOpen],[data-act=vaxDone],main .card:nth-of-type(2)',t:'Vacinas do SUS',p:'Aparecem pela idade. Toque para marcar como aplicada ou para agendar.'}],
 consulta:[{s:'#qForm',t:'Anote na hora',p:'Lembrou de uma dúvida às 3 da manhã? Escreva aqui. Na consulta, é só abrir.'},{s:'.sumlist',t:'Resumo pronto',p:'Sono, mamadas, fraldas, febre, remédios e peso dos últimos 14 dias, para mostrar ou enviar ao pediatra.'}],
 alimentos:[{s:'.foods',t:'O que já provou',p:'Registrando a comidinha com o nome do alimento, ele é marcado sozinho. Toque para dizer como foi.'}],
 conquistas:[{s:'.lvl',t:'Nível da família',p:'Registros, fotos, medidas e vacinas dão pontos. Os dois somam juntos.'},{s:'.streak14',t:'Sequência',p:'Cada bolinha é um dia com registro. Não deixe a chama apagar!'},{s:'.badges',t:'Medalhas',p:'As cinzas mostram como liberar.'}]};
let TOUR=null;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const shown=el=>el&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden';
async function startTour(id){const def=TOURS[id];if(!def||!S.cfg)return;if(M)closeModal();
 const tab=id==='main'?'inicio':id;if(S.tab!==tab){A.tab(tab);await wait(300)}else window.scrollTo(0,0);
 // só os passos cujo lugar existe agora (ex.: sem compras, o cartão de compras não aparece)
 const steps=def.filter(st=>!st.s||shown(document.querySelector(st.s)));if(!steps.length)return;
 TOUR={id,steps,i:0};lsSet('ddb-tour-'+id,'1');drawTour()}
function pageTour(tab){if(TOUR||M||tab==='inicio'||!TOURS[tab]||lsGet('ddb-tour-'+tab)||!lsGet('ddb-onb'))return;
 lsSet('ddb-tour-'+tab,'1');setTimeout(()=>{if(!TOUR&&!M&&S.tab===tab)startTour(tab)},700)}
async function drawTour(){const T=TOUR;if(!T)return;const st=T.steps[T.i],n=T.steps.length,last=T.i===n-1;
 let ov=$('#tour');if(!ov){ov=document.createElement('div');ov.id='tour';document.body.appendChild(ov)}
 const el=st.s?document.querySelector(st.s):null;
 if(el){el.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});await wait(330);if(TOUR!==T)return}
 const r=el?el.getBoundingClientRect():null,pad=6,p=typeof st.p==='function'?st.p():st.p;
 ov.innerHTML=`<div class="t-shade"${r?` style="top:${r.top-pad}px;left:${r.left-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px"`:' data-center'}></div>
 <div class="t-pop" role="dialog" aria-modal="true" aria-labelledby="tp-h" aria-describedby="tp-p"><i class="t-arrow"></i><div class="t-n">Passo ${T.i+1} de ${n}</div><h3 id="tp-h" tabindex="-1">${st.t}</h3><p id="tp-p">${p}</p>${st.x?st.x():''}
 <div class="t-acts"><button class="linkbtn" data-act="tourEnd">Pular tutorial</button><span class="sp"></span><button class="btn sm ghost" data-act="tourPrev"${T.i?'':' disabled'}>‹ Anterior</button><button class="btn sm impact" data-act="tourNext">${last?'Concluir':'Próximo ›'}</button></div></div>`;
 placeTour(r,pad);ov.querySelector('#tp-h').focus({preventScroll:true})}
function placeTour(r,pad){const pop=$('#tour .t-pop');if(!pop)return;const pw=pop.offsetWidth,ph=pop.offsetHeight,vw=innerWidth,vh=innerHeight,ar=pop.querySelector('.t-arrow');
 if(!r){pop.style.left=(vw-pw)/2+'px';pop.style.top=Math.max(12,(vh-ph)/2)+'px';ar.hidden=true;return}
 const below=r.bottom+pad+14+ph<=vh-8,top=below?r.bottom+pad+14:Math.max(8,r.top-pad-14-ph),left=Math.min(Math.max(12,r.left+r.width/2-pw/2),vw-pw-12);
 pop.style.top=top+'px';pop.style.left=left+'px';ar.className='t-arrow '+(below?'up':'down');ar.style.left=Math.min(Math.max(18,r.left+r.width/2-left),pw-18)+'px'}
function endTour(done){const T=TOUR;TOUR=null;$('#tour')?.remove();if(!T)return;
 if(T.id==='main'){lsSet('ddb-onb','1');toast(done?'Pronto! O tour fica sempre no botão de ajuda (?).':'Tudo bem. O tour fica no botão de ajuda (?).')}
 window.scrollTo(0,0)}
A.tourNext=()=>{if(!TOUR)return;if(TOUR.i>=TOUR.steps.length-1)return endTour(true);TOUR.i++;drawTour()};
A.tourPrev=()=>{if(!TOUR||!TOUR.i)return;TOUR.i--;drawTour()};
A.tourEnd=()=>endTour(false);
A.tourPush=()=>{endTour(true);A.pushPrompt?A.pushPrompt():A.pushOn()};
A.showOnb=()=>startTour('main');
document.addEventListener('keydown',e=>{if(!TOUR)return;if(e.key==='Escape'){e.preventDefault();endTour(false)}else if(e.key==='ArrowRight')A.tourNext();else if(e.key==='ArrowLeft')A.tourPrev()});
addEventListener('resize',()=>{if(TOUR)drawTour()});
/* a tela pode mudar durante o tour (dados chegando, outro aparelho registrando): o destaque acompanha o lugar */
setInterval(()=>{if(!TOUR||!$('#tour'))return;const st=TOUR.steps[TOUR.i];if(!st.s)return;const el=document.querySelector(st.s),sh=$('#tour .t-shade');if(!el||!sh)return;
 const r=el.getBoundingClientRect(),pad=6,k=`${Math.round(r.top)},${Math.round(r.left)},${Math.round(r.width)},${Math.round(r.height)}`;if(sh.dataset.k===k)return;sh.dataset.k=k;
 if(r.bottom<0||r.top>innerHeight){el.scrollIntoView({block:'center'});return}
 Object.assign(sh.style,{top:r.top-pad+'px',left:r.left-pad+'px',width:r.width+pad*2+'px',height:r.height+pad*2+'px'});placeTour(r,pad)},400);
