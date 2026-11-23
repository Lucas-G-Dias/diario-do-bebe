/* ============ acessibilidade: nome, dica, teclado e foco ============ */
const NATIVE='button,a,input,select,textarea,label,summary';
function a11yFix(){
 // itens clicáveis que não são botões de verdade (linhas, cartões): viram botões para teclado e leitor de tela
 document.querySelectorAll('[data-act]').forEach(el=>{if(el.matches(NATIVE))return;
  if(el.classList.contains('ov')){el.setAttribute('aria-hidden','true');return}
  if(!el.hasAttribute('role'))el.setAttribute('role','button');if(!el.hasAttribute('tabindex'))el.tabIndex=0});
 // botão só com ícone: a mesma frase do aria-label vira dica (tooltip) no computador
 document.querySelectorAll('button[aria-label]:not([title])').forEach(el=>{const t=(el.innerText||'').trim();if(!t||/^[×+−✕…]$/.test(t))el.title=el.getAttribute('aria-label')});
 const vw=$('#viewer');if(vw){vw.setAttribute('aria-label','Foto '+(VW.i+1)+' de '+VW.list.length);if(!M&&!vw.contains(document.activeElement))vw.querySelector('[data-act=vwClose]')?.focus({preventScroll:true})}
}
let A11Y_T=0;
new MutationObserver(()=>{if(!A11Y_T)A11Y_T=requestAnimationFrame(()=>{A11Y_T=0;a11yFix()})}).observe(document.body,{childList:true,subtree:true});
const focusables=box=>[...box.querySelectorAll('button,a[href],input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&(x.offsetParent||x.getClientRects().length));
document.addEventListener('keydown',e=>{const el=e.target;
 if((e.key==='Enter'||e.key===' ')&&el.matches&&el.matches('[role=button][data-act]')&&!el.matches(NATIVE)){e.preventDefault();el.click();return}
 const vw=$('#viewer');
 if(vw&&!M){if(e.key==='ArrowRight'){A.vwNext();return}if(e.key==='ArrowLeft'){A.vwPrev();return}if(e.key==='Escape'){A.vwClose();return}}
 if(e.key!=='Tab')return;const box=M?$('#modal .sheet'):vw;if(!box)return;const f=focusables(box);if(!f.length)return;
 const first=f[0],last=f[f.length-1],cur=document.activeElement;
 if(!box.contains(cur)){e.preventDefault();first.focus();return}
 if(e.shiftKey&&cur===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&cur===last){e.preventDefault();first.focus()}
});
