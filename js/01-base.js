/* ============ logo ============ */
const LOGO='<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="18" fill="#2B7A70"/><circle cx="50" cy="15" r="4.5" fill="#F2A65A"/><g fill="#FFFFFF"><ellipse cx="33" cy="40" rx="9.5" ry="13.5" transform="rotate(-14 33 40)"/><circle cx="25.5" cy="20" r="4.4"/><circle cx="33" cy="17.6" r="3.4"/><circle cx="39" cy="19.4" r="2.8"/><circle cx="43.4" cy="23.4" r="2.3"/><circle cx="46" cy="28.4" r="1.9"/></g></svg>';
const BRAND=`<div class="brand">${LOGO}Diário do Bebê</div>`;

/* ============ utilidades ============ */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const MIN=6e4,HR=36e5,DAY=864e5;
const MO=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const MOF=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const WD=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
const dayStart=t=>{const d=new Date(t);d.setHours(0,0,0,0);return d.getTime()};
const addDays=(t,n)=>{const d=new Date(t);d.setDate(d.getDate()+n);return d.getTime()};
const ymOf=t=>{const d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)};
const prevYm=ym=>{let[y,m]=ym.split('-').map(Number);m--;if(!m){m=12;y--}return y+'-'+pad(m)};
const fmtT=t=>{const d=new Date(t);return pad(d.getHours())+':'+pad(d.getMinutes())};
const fmtD=t=>{const d=new Date(t);return d.getDate()+' '+MO[d.getMonth()]};
const fmtDY=t=>{const d=new Date(t);return d.getDate()+' '+MO[d.getMonth()]+' '+d.getFullYear()};
const dateOnly=s=>s?new Date(s+'T12:00').getTime():null;
const isoDate=t=>{const d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
function fmtDur(ms){ms=Math.max(0,ms);const m=Math.round(ms/MIN);if(m<60)return m+' min';const h=Math.floor(m/60),r=m%60;if(h>=48)return Math.floor(h/24)+' dias';return h+'h'+(r?' '+pad(r):'')}
const ago=t=>'há '+fmtDur(Date.now()-t);
const toLocalInput=t=>{const d=new Date(t);return isoDate(t)+'T'+pad(d.getHours())+':'+pad(d.getMinutes())};
const fromLocalInput=v=>v?new Date(v).getTime():null;
const num=(v,d=1)=>(Math.round(v*10**d)/10**d).toLocaleString('pt-BR');
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const strip=o=>{const c={...o};delete c.id;delete c.ym;return c};

/* ============ dados de referência ============ */
const PHASES=[
 {from:0,to:1,name:'Recém-nascido',sonoH:[14,17],sono:'14 a 17 h por dia, em vários cochilos curtos',alim:'Leite materno ou fórmula em livre demanda, 8 a 12 vezes por dia',fraldas:'6 ou mais fraldas molhadas por dia',marcos:['Fixa o olhar em rostos próximos','Reage a sons altos','Reflexos de sucção e de agarrar','Levanta a cabeça por instantes de bruços'],dicas:['Dormir sempre de barriga para cima, no berço sem travesseiros nem bichinhos','Tempo de bruços acordado, poucos minutos por vez','Testes do pezinho, orelhinha, olhinho e coraçãozinho na primeira semana']},
 {from:1,to:3,name:'Primeiros sorrisos',sonoH:[14,17],sono:'14 a 17 h por dia',alim:'Livre demanda; as mamadas começam a espaçar',fraldas:'6 a 8 trocas por dia',marcos:['Sorriso social','Acompanha objetos com os olhos','Faz sons (arrulhos)','Sustenta melhor a cabeça de bruços'],dicas:['Converse e cante bastante','Primeiras vacinas da rotina aos 2 meses','As cólicas costumam melhorar por volta dos 3 meses']},
 {from:3,to:6,name:'Descobrindo as mãos',sonoH:[12,16],sono:'12 a 16 h por dia, contando os cochilos',alim:'Aleitamento exclusivo até os 6 meses',fraldas:'5 a 8 trocas por dia',marcos:['Sustenta a cabeça firme','Ri alto','Leva mãos e objetos à boca','Rola de bruços para as costas'],dicas:['É comum uma piora do sono por volta dos 4 meses','Ofereça brinquedos seguros para pegar e morder','Não deixe sozinho em cama ou trocador: ele já rola']},
 {from:6,to:9,name:'Hora de sentar e provar',sonoH:[12,16],sono:'12 a 16 h, com 2 a 3 cochilos',alim:'Início da alimentação complementar aos 6 meses, com água',fraldas:'5 a 7 trocas; as fezes mudam com a comida',marcos:['Senta com apoio, depois sem','Balbucia (ba-ba, da-da)','Passa objetos de uma mão para a outra','Estranha pessoas desconhecidas'],dicas:['Comida amassada, sem sal e sem açúcar','Mel só depois de 1 ano','Proteja tomadas, quinas e fios']},
 {from:9,to:12,name:'Explorador',sonoH:[12,16],sono:'12 a 16 h, com 2 cochilos',alim:'Comida da família amassada ou em pedaços; 3 refeições e lanches',fraldas:'4 a 6 trocas por dia',marcos:['Engatinha','Fica de pé com apoio','Faz o movimento de pinça','Dá tchau e bate palmas'],dicas:['Instale portões nas escadas','Deixe ele comer com as mãos','Leia livros com figuras grandes']},
 {from:12,to:18,name:'Primeiros passos',sonoH:[11,14],sono:'11 a 14 h, com 1 a 2 cochilos',alim:'Comida da família; o leite materno pode continuar',fraldas:'4 a 6 trocas por dia',marcos:['Anda sozinho','Fala as primeiras palavras','Aponta para o que quer','Bebe no copo'],dicas:['Vacinas de 12 e 15 meses','Evite telas antes dos 2 anos','Uma rotina previsível ajuda no sono e nas birras']},
 {from:18,to:24,name:'Pequeno falante',sonoH:[11,14],sono:'11 a 14 h, com 1 cochilo',alim:'3 refeições e 2 lanches por dia',fraldas:'Pode começar a mostrar sinais de desfralde',marcos:['Corre','Junta duas palavras','Imita os adultos','Rabisca com giz'],dicas:['Ofereça escolhas simples (esta ou aquela)','Observe sinais de prontidão para o desfralde','Dê nome às emoções dele']},
 {from:24,to:36,name:'Dois anos',sonoH:[11,14],sono:'11 a 14 h por dia',alim:'Mesma comida da família',fraldas:'O desfralde costuma acontecer entre 2 e 3 anos',marcos:['Fala frases curtas','Sobe e desce escadas','Brinca de faz de conta','Chuta bola'],dicas:['Paciência e elogios no desfralde','Incentive brincar com outras crianças']},
 {from:36,to:999,name:'Três anos ou mais',sonoH:[10,13],sono:'10 a 13 h por dia',alim:'Mesma comida da família',fraldas:'Geralmente já sem fralda de dia',marcos:['Conversa com frases completas','Pedala triciclo','Conta pequenas histórias'],dicas:['Vacinas dos 4 anos','Consultas de rotina anuais']}
];
// Calendário de vacinação infantil do SUS (PNI). Idade em meses.
const VAX=[
 ['bcg','BCG',0,'dose única'],['hepb0','Hepatite B',0,'ao nascer'],
 ['penta1','Penta (DTP+Hib+Hep B)',2,'1ª dose'],['vip1','VIP (poliomielite)',2,'1ª dose'],['pneu1','Pneumocócica 10V',2,'1ª dose'],['rota1','Rotavírus',2,'1ª dose'],
 ['menc1','Meningocócica C',3,'1ª dose'],
 ['penta2','Penta (DTP+Hib+Hep B)',4,'2ª dose'],['vip2','VIP (poliomielite)',4,'2ª dose'],['pneu2','Pneumocócica 10V',4,'2ª dose'],['rota2','Rotavírus',4,'2ª dose'],
 ['menc2','Meningocócica C',5,'2ª dose'],
 ['penta3','Penta (DTP+Hib+Hep B)',6,'3ª dose'],['vip3','VIP (poliomielite)',6,'3ª dose'],['covid1','Covid-19',6,'1ª dose'],['flu','Influenza',6,'anual, na campanha'],
 ['covid2','Covid-19',7,'2ª dose'],
 ['fa1','Febre amarela',9,'1ª dose'],['covid3','Covid-19',9,'3ª dose, se indicada'],
 ['pneur','Pneumocócica 10V',12,'reforço'],['menr','Meningocócica (C ou ACWY)',12,'reforço'],['scr1','Tríplice viral',12,'1ª dose'],
 ['dtp1','DTP',15,'1º reforço'],['vipr','VIP (poliomielite)',15,'reforço'],['hepa','Hepatite A',15,'dose única'],['tetra','Tetra viral (SCR + varicela)',15,'dose única'],
 ['dtp2','DTP',48,'2º reforço'],['fa2','Febre amarela',48,'reforço'],['var2','Varicela',48,'2ª dose']
];
// Curvas da OMS para meninos (aproximadas): idade em meses, P3, P50, P97
const WHO_M=[0,1,2,3,4,5,6,7,8,9,10,11,12,15,18,21,24];
const WHO_W={p3:[2.5,3.4,4.4,5.1,5.6,6.1,6.4,6.7,7.0,7.2,7.5,7.7,7.8,8.4,8.9,9.5,9.8],p50:[3.3,4.5,5.6,6.4,7.0,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6,10.3,10.9,11.5,12.2],p97:[4.3,5.7,7.0,7.9,8.6,9.2,9.7,10.2,10.5,10.9,11.2,11.5,11.8,12.6,13.3,14.0,14.8]};
const WHO_L={p3:[46.3,51.1,54.7,57.6,60.0,61.9,63.6,65.1,66.5,67.7,69.0,70.2,71.3,74.4,77.2,79.7,82.1],p50:[49.9,54.7,58.4,61.4,63.9,65.9,67.6,69.2,70.6,72.0,73.3,74.5,75.7,79.1,82.3,85.1,87.8],p97:[53.4,58.4,62.2,65.3,67.8,69.9,71.6,73.2,74.7,76.2,77.5,78.9,80.2,83.9,87.3,90.4,93.6]};
const INV_CATS=[['fralda','Fraldas'],['lenco','Lenços umedecidos'],['higiene','Higiene'],['alimentacao','Alimentação'],['roupa','Roupas'],['saude','Remédios e saúde'],['passeio','Passeio e quarto'],['brinquedo','Brinquedos'],['outro','Outros']];
const AG_TYPES=[['consulta','Consulta'],['vacina','Vacina'],['exame','Exame'],['outro','Outro']];
const EX_CATS=[['sangue','Sangue'],['urina','Urina e fezes'],['imagem','Imagem (ultrassom, raio-X)'],['triagem','Triagem neonatal'],['sentidos','Audição e visão'],['coracao','Coração'],['outro','Outro']];
const EX_ST=[['pedido','Pedido'],['agendado','Agendado'],['realizado','Feito'],['resultado','Com resultado']];
const SCREEN=[['pezinho','Teste do pezinho','entre o 3º e o 5º dia de vida'],['orelhinha','Teste da orelhinha','até 1 mês, de preferência antes da alta'],['olhinho','Teste do olhinho','antes da alta da maternidade'],['coracaozinho','Teste do coraçãozinho','entre 24 e 48 h de vida'],['linguinha','Teste da linguinha','antes da alta da maternidade']];
const EX_SUGG=['Hemograma','Ferritina','Vitamina D','Exame de urina (EAS)','Urocultura','Parasitológico de fezes','Ultrassom de quadril','Ultrassom transfontanela','Ultrassom de abdome','Ecocardiograma','Raio-X de tórax','BERA (audição)','Teste do pezinho ampliado','Tipagem sanguínea','Bilirrubina'];
const MS_SUGG=['Primeiro sorriso','Sustentou a cabeça','Primeira risada','Rolou sozinho','Primeira comidinha','Sentou sozinho','Primeiro dente','Engatinhou','Primeira palavra','Ficou de pé','Primeiros passos','Dormiu a noite toda','Primeiro corte de cabelo'];
const EVC={sleep:'var(--sleep)',feed:'var(--feed)',diaper:'var(--diaper)',med:'var(--health)',temp:'var(--health)',bath:'var(--other)',note:'var(--other)'};

/* ============ estado ============ */
const S={mode:null,loaded:{},cfg:undefined,ev:{},inv:[],growth:[],agenda:[],exams:[],enx:[],photos:[],albums:[],albnotes:{},vax:{},ms:[],tab:lsGet('bebe-tab')||'hoje',day:dayStart(Date.now()),hist:null,histEv:[],stale:false,ro:false};
let WHO='';
