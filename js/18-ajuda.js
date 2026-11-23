/* ============ Central de ajuda: explicações curtas com imagem, atalhos e tour ============ */
Object.assign(ICP,{
 help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><path d="M12 17.5h.01"/>',
 trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9.5 17h5"/>',
 flame:'<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z"/>',
 keys:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
 route:'<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
 medal:'<circle cx="12" cy="15" r="6"/><path d="M8.5 3h7L13 9.2M8.5 3 11 9.2"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'});
let HELP_FROM='inicio';
A.help=()=>{if(S.tab!=='ajuda'&&S.tab!=='tutorial')HELP_FROM=S.tab;A.tab('ajuda')};
/* "imagens": miniaturas feitas com os próprios componentes do app, para a pessoa reconhecer na tela */
const mini=(i,c,l)=>`<span class="mt" style="--c:${c}"><span class="ic" style="--c:${c}">${ic(i)}</span>${l}</span>`;
const ART={
 tiles:`<div class="hart">${mini('moon','var(--sleep)','Sono')}${mini('bottle','var(--feed)','Mamada')}${mini('diaper','var(--diaper)','Fralda')}</div>`,
 fab:`<div class="hart nav"><span>${ic('home')}</span><span>${ic('list')}</span><span class="mfab">${ic('plus')}</span><span>${ic('music')}</span><span>${ic('grid')}</span></div>`,
 sizes:`<div class="hart col">${['RN',62,'P',88,'M',35].reduce((a,v,i,arr)=>i%2?a:a+`<span class="mbar"><b>${v}</b><i style="width:${arr[i+1]}%"></i></span>`,'')}</div>`,
 cal:`<div class="hart col"><span class="mrow"><b>Amanhã</b> 10:00 · Pediatra</span><span class="mrow"><b>Hoje</b> · Hepatite B</span></div>`,
 photo:`<div class="hart">${[1,2,3].map(n=>`<span class="mph" style="--h:${n*40}"></span>`).join('')}</div>`,
 bell:`<div class="hart col"><span class="mnot">${ic('bell')}<span><b>Fraldas acabando</b><br>Restam 24 fraldas P, dá para 3 dias.</span></span></div>`,
 game:`<div class="hart"><span class="mflame">${ic('flame')}<b>7</b></span>${['medal','star','diaper'].map(i=>`<span class="mmed">${ic(i)}</span>`).join('')}</div>`,
 keys:`<div class="hart">${['F','M','S','?'].map(k=>`<kbd>${k}</kbd>`).join('')}</div>`,
 family:`<div class="hart"><span class="mav">P</span><span class="mav b">M</span><span class="mrow">aparece na hora para os dois</span></div>`};
const HELP=[
 ['Dia a dia','tiles','moon','var(--sleep)','Registrar sono, mamada e fralda','inicio',['Na Início, toque no cartão. O horário é marcado sozinho.','Sono e mamada no peito contam o tempo: toque de novo para parar.','Esqueceu de registrar? Use <b>+</b> e ajuste o horário.']],
 ['Dia a dia','fab','plus','var(--impact)','O botão +','inicio',['Remédio, temperatura, banho, peso, exame, compromisso, primeira vez e foto.','Tudo o que não é sono, mamada ou fralda começa aqui.']],
 ['Dia a dia','tiles','list','var(--other)','Corrigir ou apagar','diario',['Abra o <b>Diário</b> e toque no registro.','Mude e salve, ou toque em <b>Apagar</b>.']],
 ['Dia a dia','keys','bolt','var(--impact)','Atalhos','inicio',['Na Início, a faixa <b>Repetir</b> refaz a última mamadeira ou fralda num toque.','Segure o ícone do app no celular: Fralda, Mamada, Sono e Foto.','No computador: <kbd>F</kbd> fralda, <kbd>M</kbd> mamada, <kbd>S</kbd> sono, <kbd>N</kbd> novo registro, <kbd>D</kbd> diário, <kbd>A</kbd> agenda, <kbd>C</kbd> conquistas, <kbd>?</kbd> ajuda.']],
 ['Estoque','sizes','diaper','var(--diaper)','Fraldas por tamanho e lenços','fraldas',['Em <b>Menu › Fraldas e lenços</b>, toque no tamanho e diga quantas tem.','Marque o tamanho em uso: cada troca desconta dele.','Lenços: toque em <b>Abri</b> ao abrir um pacote. O app calcula quanto dura e avisa antes de acabar.']],
 ['Estoque','sizes','bag','var(--feed)','Enxoval','enxoval',['Comece pela lista sugerida.','Toque na situação para passar de Falta › Pesquisando › Comprado › Ganhou.']],
 ['Saúde','cal','cal','var(--accent)','Agenda e vacinas','agenda',['<b>Novo compromisso</b> para consultas. Aviso na véspera e 2 h antes.','As vacinas do SUS aparecem pela idade. Toque para marcar como aplicada ou agendar.']],
 ['Saúde','cal','flask','var(--health)','Exames com anexo','exames',['<b>+ › Exame</b>, com foto ou PDF do pedido.','Saiu o resultado? Abra o exame, mude para <b>Com resultado</b> e anexe.']],
 ['Saúde','cal','note','var(--health)','Para a consulta','consulta',['Lembrou de uma dúvida? Anote em <b>Menu › Para a consulta</b> na hora.','Na consulta, mostre o <b>resumo dos últimos 14 dias</b>: sono, mamadas, fraldas, febre, remédios e peso. Dá para enviar pelo WhatsApp ou imprimir.']],
 ['Saúde','tiles','sprout','var(--growth)','Marcos do desenvolvimento','fases',['Em <b>Fase e marcos</b> aparecem os 4 marcos da Caderneta para a idade.','Viu acontecer? Um toque marca a data. O que não aparecer até a idade seguinte vai para o resumo da consulta.']],
 ['Dia a dia','tiles','moon','var(--sleep)','Previsão da próxima soneca','inicio',['Quando o bebê acorda, o cartão Sono mostra o horário provável do próximo sono, pela idade.','É uma estimativa: sinais de sono (bocejo, esfregar os olhos) valem mais.']],
 ['Dia a dia','tiles','bottle','var(--feed)','Introdução alimentar','alimentos',['Registre <b>Mamada › Comidinha</b> com o nome do alimento: ele é marcado sozinho.','Em <b>Menu › Introdução alimentar</b>, toque no alimento para dizer se gostou ou se teve reação.']],
 ['Família e avisos','tiles','note','var(--other)','Cópia de segurança','ajustes',['Em <b>Ajustes</b>, toque em <b>Baixar uma cópia de todos os dados</b> e guarde o arquivo.']],
 ['Saúde','bell','pill','var(--health)','Remédio com lembrete','inicio',['<b>+ › Remédio</b>, com nome e dose.','Escolha de quanto em quanto tempo lembrar. Na hora aparece <b>Dei agora</b>.']],
 ['Memórias','photo','image','var(--feed)','Álbum por fases','album',['<b>+ › Foto</b>: as fotos vão sozinhas para a fase certa, pela data.','Crie álbuns, escreva memórias e marque favoritas com o coração.']],
 ['Memórias','game','trophy','var(--impact)','Conquistas e sequência','conquistas',['Cada dia com pelo menos um registro mantém a <b>sequência</b> acesa.','Registros, fotos e medidas dão pontos e sobem o nível da família.','Medalhas aparecem quando vocês chegam a marcos, como 100 trocas.']],
 ['Família e avisos','family','users','var(--accent)','Usar em família','ajustes',['Em <b>Ajustes</b>, copie o código de convite.','A outra pessoa cria a conta e entra com o código. Tudo aparece na hora para os dois.']],
 ['Família e avisos','bell','bell','var(--warn)','Instalar e receber avisos','ajustes',['iPhone: no Safari, <b>Compartilhar › Adicionar à Tela de Início</b>. Android: <b>⋮ › Instalar app</b>.','Abra pelo ícone e toque em <b>Ativar avisos</b>. Em Ajustes, escolha o que receber.']],
 ['Família e avisos','tiles','cloudoff','var(--warn)','Sem internet','inicio',['Pode registrar normalmente: fica guardado no celular e vai sozinho quando a conexão voltar.','Fotos e anexos precisam de internet.']]];
VIEWS.ajuda=()=>{const from=PAGES[HELP_FROM]&&TOURS[HELP_FROM]?HELP_FROM:'';let g='';
 return`<div class="help-top">
  <button class="hcard impact" data-act="tourMain"><span class="ic lg">${ic('route')}</span><b>Fazer o tour</b><span>1 minuto, passando por cada lugar</span></button>
  ${from?`<button class="hcard" data-act="tourHere"><span class="ic lg" style="--c:var(--accent)">${ic('route')}</span><b>Tour de ${esc(PAGES[from])}</b><span>Só o que tem nessa tela</span></button>`:''}
 </div>
 <label class="hsearch">${ic('search')}<input id="helpQ" type="search" placeholder="Buscar: fralda, vacina, foto…" aria-label="Buscar na ajuda" autocomplete="off"></label>
 <div id="helpList">${HELP.map(([grp,art,i,c,t,go,st])=>`${grp!==g?`<h2 class="hgrp">${g=grp}</h2>`:''}<details class="howto" data-k="${esc((t+' '+st.join(' ')).toLowerCase().replace(/<[^>]+>/g,''))}"><summary><span class="ic" style="--c:${c}">${ic(i)}</span>${t}</summary>${ART[art]}<ol>${st.map(s=>`<li>${s}</li>`).join('')}</ol>${go&&go!=='inicio'?`<button class="linkbtn" data-act="tab" data-id="${go}" aria-label="Abrir ${esc(PAGES[go])}">Abrir ${esc(PAGES[go])} ›</button>`:''}</details>`).join('')}
 <p class="hint" id="helpNone" hidden>Nada encontrado. Tente outra palavra.</p></div>`};
VIEWS.tutorial=VIEWS.ajuda;
document.addEventListener('input',e=>{if(e.target.id!=='helpQ')return;const q=e.target.value.trim().toLowerCase();let n=0;
 document.querySelectorAll('#helpList .howto').forEach(d=>{const ok=!q||d.dataset.k.includes(q);d.hidden=!ok;if(ok)n++;if(q&&ok)d.open=true});
 document.querySelectorAll('#helpList .hgrp').forEach(h=>{let x=h.nextElementSibling,any=false;while(x&&!x.matches('.hgrp')){if(x.matches('.howto')&&!x.hidden)any=true;x=x.nextElementSibling}h.hidden=!any});
 $('#helpNone').hidden=n>0});
A.tourMain=()=>startTour('main');
A.tourHere=()=>{A.tab(HELP_FROM);setTimeout(()=>startTour(HELP_FROM),250)};
