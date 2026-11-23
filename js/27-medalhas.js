/* ============ Medalhas desenhadas: nível (bronze → lenda), fita da cor do grupo, brilho e história personalizada ============ */
const SERIES=[['first','r100','r1000','r5000'],['s3','s7','s30','s100','s365'],['fr10','fr100','fr500','fr1000','fr2500'],['mam50','mam500','mam1000'],['food1','food10','food30'],
 ['sono20','sono200'],['vax5','vax15'],['peso3','peso10'],['enx1','enx25','enx50','enx75','enx100'],['foto1','foto25','foto100'],['ms1','ms10']];
const TIERS={bronze:['Bronze','#FFD3A8','#B5652A'],prata:['Prata','#FFFFFF','#8E9BA7'],ouro:['Ouro','#FFE99A','#D99A00'],diamante:['Diamante','#C9FFF6','#2B9C8E'],lenda:['Lenda','#FFC24B','#C2307A'],especial:['Especial','#FFE2D4','#FF7A45']};
function tierOf(id){const s=SERIES.find(x=>x.includes(id));if(!s)return'especial';const k=['bronze','prata','ouro','diamante','lenda'],i=s.indexOf(id);
 return k[Math.min(k.length-1,s.length<=3?i+1:i)]}
function medalSvg(x,on,pct=0,big){const[id,icon,color]=x,t=TIERS[tierOf(id)],gid='mg'+id+(on?1:0)+(big?'b':'');
 const ring=!on&&pct>0?`<circle cx="40" cy="58" r="31" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${(pct*194.8).toFixed(1)} 300" transform="rotate(-90 40 58)"/>`:'';
 return`<svg class="medal${on?' on':''}" viewBox="0 0 80 96" width="${big?132:64}" height="${big?158:77}" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">${on?`<stop offset="0" stop-color="${t[1]}"/><stop offset="1" stop-color="${t[2]}"/>`:'<stop offset="0" style="stop-color:var(--surface2)"/><stop offset="1" style="stop-color:var(--line)"/>'}</linearGradient><clipPath id="c${gid}"><circle cx="40" cy="58" r="28"/></clipPath></defs>
 <path d="M22 2h14l8 24-14 8zM58 2H44l-8 24 14 8z" fill="${on?color:'var(--line)'}"/><path d="M22 2h14l2 6H24z" fill="#000" opacity=".12"/>
 <circle cx="40" cy="58" r="28" fill="url(#${gid})"/>${ring}<circle cx="40" cy="58" r="22" fill="none" stroke="#fff" stroke-opacity="${on?.6:.35}" stroke-width="1.6" stroke-dasharray="1.5 3"/>
 <g transform="translate(26 44) scale(1.17)" style="color:${on?'#fff':'var(--muted)'}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICP[on?icon:'lock']||''}</svg></g>
 ${on?`<g clip-path="url(#c${gid})"><rect class="shine" x="-30" y="20" width="14" height="90" fill="#fff" opacity=".35" transform="rotate(25 40 58)"/></g>`:''}</svg>`}
const MSTORY={fr:(n,v)=>`${n} já teve ${v} fraldas trocadas por vocês. Haja carinho (e lenço)!`,s:(n,v)=>`${v} dias seguidos cuidando e registrando tudo de ${n}. Rotina de campeões.`,
 mam:(n,v)=>`${v} mamadas registradas. Cada uma é um pouquinho de ${n} crescendo.`,r:(n,v)=>`${v} registros sobre ${n}. Vocês têm a história dele na palma da mão.`,
 food:(n,v)=>`${n} já provou ${v} ${v>1?'sabores':'sabor'} diferentes.`,sono:(n,v)=>`${v} sonos acompanhados. Que venham mais noites tranquilas!`,
 foto:(n,v)=>`${v} ${v>1?'memórias guardadas':'memória guardada'} de ${n}.`,enx:()=>'O enxoval está saindo do papel.',vax:(n)=>`A caderneta de ${n} está ficando completa. Proteção em dia!`};
function medalStory(x,g){const n=S.cfg?.name||'O bebê',[id,, , ,t,how,pr]=x,[,tot]=pr(g),k=Object.keys(MSTORY).find(p=>new RegExp('^'+p+'\\d').test(id)||(p==='r'&&id==='first'));
 return k?MSTORY[k](n,(tot||1).toLocaleString('pt-BR')):`${t}: ${how.charAt(0).toLowerCase()+how.slice(1)}. Conquista de vocês com ${n}.`}
A.medal=id=>{const x=BADGES.find(b=>b[0]===id);if(!x)return;$('#cele')?.remove();const g=gameStats(),on=g.got.includes(id),[cur,tot]=x[6](g),when=(S.game?.b||{})[id],t=TIERS[tierOf(id)];
 openModal({title:x[4],noFooter:true,body:`<div class="medal-big">${medalSvg(x,on,Math.min(1,cur/(tot||1)),true)}<span class="tier" style="--t1:${t[1]};--t2:${t[2]}">${t[0]}</span>
  <p>${on?esc(medalStory(x,g)):esc(x[5])+'.'}</p><p class="small muted">${on?(when?'Conquistada em '+fmtDY(when):'Conquistada'):`${Math.min(cur,tot).toLocaleString('pt-BR')} de ${tot.toLocaleString('pt-BR')} · faltam ${(tot-Math.min(cur,tot)).toLocaleString('pt-BR')}`}</p>
  ${on?`<button class="btn impact" data-act="medalShare" data-id="${id}">Compartilhar</button>`:''}</div>`})};
A.medalShare=async id=>{const x=BADGES.find(b=>b[0]===id),txt=`🏅 ${x[4]} (${TIERS[tierOf(id)][0]}) · ${medalStory(x,gameStats())} — Diário do Bebê`;
 try{if(navigator.share){await navigator.share({text:txt});return}}catch(e){if(e&&e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(txt);toast('Texto copiado. Cole no WhatsApp.')}catch(e){toast('Não deu para compartilhar aqui.',true)}};
