/* ============ eventos do DOM ============ */
/* Botão ocupado: desabilita, avisa leitores de tela (aria-busy) e mostra o que está acontecendo sem mudar a largura. */
function busy(el,on,label){if(!el)return;
 if(on){if(el.getAttribute('aria-busy'))return;el.setAttribute('aria-busy','true');el.classList.add('busy');el.dataset.wasDisabled=el.disabled?'1':'';el.disabled=true;
  if(label&&(el.innerText||'').trim()){el.style.minWidth=el.offsetWidth+'px';el.dataset.lbl=el.innerHTML;el.innerHTML=`<span class="spin" aria-hidden="true"></span>${label}`}return}
 if(!el.getAttribute('aria-busy'))return;el.removeAttribute('aria-busy');el.classList.remove('busy');el.disabled=!!el.dataset.wasDisabled;
 if(el.dataset.lbl!=null){el.innerHTML=el.dataset.lbl;delete el.dataset.lbl;el.style.minWidth=''}}
const SLOW_SAVE=8000;
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-act]');if(!el||el.disabled||el.getAttribute('aria-busy'))return;
 const act=el.dataset.act;if(!A[act])return;
 if(el.tagName==='BUTTON')e.preventDefault();
 const r=A[act](el.dataset.id,el);
 if(r&&r.then){const t=setTimeout(()=>busy(el,true),150);r.catch(err=>console.warn(err)).finally(()=>{clearTimeout(t);busy(el,false)})}
});
document.addEventListener('submit',async e=>{
 e.preventDefault();const f=e.target;
 if(f.id==='mf'&&M?.onSave){const btn=f.querySelector('button[type=submit]');if(btn?.getAttribute('aria-busy'))return;busy(btn,true,'Salvando…');const mine=M;
  /* internet muito lenta: o registro já está no aparelho; fecha e segue enviando (se o servidor recusar, desfaz e avisa) */
  const slow=setTimeout(()=>{if(M===mine){closeModal();toast('Salvo no aparelho. Enviando… a internet está lenta.')}},SLOW_SAVE);
  try{const r=await M.onSave(fdata(f),f);if(r!==false&&M===mine)closeModal()}catch(err){}finally{clearTimeout(slow);busy(btn,false)}return}
 if(f.id==='loginForm'){const fd=fdata(f),email=fd.email.trim(),btn=f.querySelector('button[type=submit]');
  if(LOGIN_MODE==='criar'&&fd.password!==fd.password2){toast('As senhas não são iguais.',true);return}
  if((fd.password||'').length<6){toast('A senha precisa ter pelo menos 6 caracteres.',true);return}
  busy(btn,true,LOGIN_MODE==='criar'?'Criando conta…':'Entrando…');let error;try{({error}=LOGIN_MODE==='criar'?await sb.auth.signUp({email,password:fd.password}):await sb.auth.signInWithPassword({email,password:fd.password}))}catch(e){error=e}finally{busy(btn,false)}
  if(error&&isNet(error)){toast('Sem conexão com o servidor. Confira a internet e toque de novo.',true);return}
  if(error)toast(/registered|already/i.test(error.message)?'Esse e-mail já tem conta. Toque em "Já tenho conta".':/invalid/i.test(error.message)?'E-mail ou senha incorretos.':'Não deu para entrar: '+error.message,true);return}
 if(f.id==='famCreate'||f.id==='famJoin'){const fd=fdata(f);const btn=f.querySelector('button[type=submit]');busy(btn,true,f.id==='famCreate'?'Criando…':'Entrando…');let r;
  try{r=f.id==='famCreate'?await sb.rpc('create_family',{p_name:'Família',p_display:fd.display.trim()}):await sb.rpc('join_family',{p_code:fd.code.trim(),p_display:fd.display.trim()})}catch(e){r={error:e}}finally{busy(btn,false)}
  if(r.error){toast(/codigo/i.test(r.error.message)?'Código não encontrado. Confira as letras e números.':'Não deu agora. Tente de novo.',true);return}
  await loadFamily();return}
 if(f.id==='nameForm'){const d=fdata(f).display.trim();if(!d)return;const btn=f.querySelector('button[type=submit]');busy(btn,true,'Salvando…');let error;try{({error}=await sb.from('members').update({display_name:d}).eq('family_id',FAM).eq('user_id',ME.id))}catch(e){error=e}finally{busy(btn,false)}if(error){toast('Não deu para salvar.',true);return}WHO=d;await loadMembers();toast('Nome salvo');return}
 if(f.id==='pwForm'&&M){return}
 if(f.id==='setupForm'){const fd=fdata(f);if(!fd.name.trim()||!fd.birth){toast('Informe o nome e a data de nascimento.',true);return}
  const cfg={name:fd.name.trim(),birth:fd.birth,sex:fd.sex,diaperItem:''},btn=f.querySelector('button[type=submit]');busy(btn,true,'Preparando…');
  try{if(+fd.qty>0){const id=newId();await w(store.set('inventory/'+id,{name:'Fralda',cat:'fralda',size:fd.size,qty:+fd.qty,min:30,unit:'un.',note:''}));cfg.diaperItem=id}
   await w(store.set('config/main',cfg));toast('Tudo pronto!')}catch(err){}finally{busy(btn,false)}return}
 if(f.id==='cfgForm'){const fd=fdata(f);if(!fd.name.trim()||!fd.birth){toast('Nome e nascimento são obrigatórios.',true);return}
  const o={...S.cfg};['name','birth','sex','blood','allergies','pedName','pedPhone','plan','card','diaperItem'].forEach(k=>o[k]=(fd[k]||'').trim());
  const btn=f.querySelector('button[type=submit]');busy(btn,true,'Salvando…');try{await w(store.set('config/main',o));toast('Dados salvos')}catch(err){}finally{busy(btn,false)}}
});
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.name==='quem'||t.name==='quem2'){WHO=t.value;lsSet('bebe-quem',WHO);toast('Registrando como '+WHO);render()}
 if(t.id==='x-file')uploadFiles(t);
 if(t.id==='albFile'&&t.files&&t.files.length)albUpload(t.files);
 if(t.name==='theme')setTheme(t.value);
 if(t.dataset&&t.dataset.pref)savePref(t.dataset.pref,t.checked);
 if(t.dataset&&t.dataset.prefh)savePref('mamadaH',+t.value);
 if(t.id==='dayPick'&&t.value)setDay(new Date(t.value+'T12:00').getTime());
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&M)closeModal()});
document.addEventListener('input',e=>{if(e.target.id==='sndVol'){SND.vol=+e.target.value;lsSet('ddb-snd-vol',String(SND.vol));if(SND.a)SND.a.volume=SND.vol}});
let toastT;function toast(msg,err){const t=$('#toast');t.setAttribute('role',err?'alert':'status');t.setAttribute('aria-live',err?'assertive':'polite');t.textContent=msg;t.className='toast'+(err?' err':'');t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,err?4500:2200)}
