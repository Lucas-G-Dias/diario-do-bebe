/* ============ eventos do DOM ============ */
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-act]');if(!el||el.disabled)return;
 const act=el.dataset.act;if(!A[act])return;
 if(el.tagName==='BUTTON')e.preventDefault();
 Promise.resolve(A[act](el.dataset.id,el)).catch(err=>console.warn(err));
});
document.addEventListener('submit',async e=>{
 e.preventDefault();const f=e.target;
 if(f.id==='mf'&&M?.onSave){const btn=f.querySelector('button[type=submit]');btn&&(btn.disabled=true);try{const r=await M.onSave(fdata(f),f);if(r!==false)closeModal()}catch(err){}finally{btn&&(btn.disabled=false)}return}
 if(f.id==='loginForm'){const fd=fdata(f),email=fd.email.trim(),btn=f.querySelector('button[type=submit]');
  if(LOGIN_MODE==='criar'&&fd.password!==fd.password2){toast('As senhas não são iguais.',true);return}
  if((fd.password||'').length<6){toast('A senha precisa ter pelo menos 6 caracteres.',true);return}
  btn.disabled=true;const{error}=LOGIN_MODE==='criar'?await sb.auth.signUp({email,password:fd.password}):await sb.auth.signInWithPassword({email,password:fd.password});btn.disabled=false;
  if(error)toast(/registered|already/i.test(error.message)?'Esse e-mail já tem conta. Toque em "Já tenho conta".':/invalid/i.test(error.message)?'E-mail ou senha incorretos.':'Não deu para entrar: '+error.message,true);return}
 if(f.id==='famCreate'||f.id==='famJoin'){const fd=fdata(f);const btn=f.querySelector('button[type=submit]');btn.disabled=true;
  const r=f.id==='famCreate'?await sb.rpc('create_family',{p_name:'Família',p_display:fd.display.trim()}):await sb.rpc('join_family',{p_code:fd.code.trim(),p_display:fd.display.trim()});btn.disabled=false;
  if(r.error){toast(/codigo/i.test(r.error.message)?'Código não encontrado. Confira as letras e números.':'Não deu agora. Tente de novo.',true);return}
  await loadFamily();return}
 if(f.id==='nameForm'){const d=fdata(f).display.trim();if(!d)return;const{error}=await sb.from('members').update({display_name:d}).eq('family_id',FAM).eq('user_id',ME.id);if(error){toast('Não deu para salvar.',true);return}WHO=d;await loadMembers();toast('Nome salvo');return}
 if(f.id==='pwForm'&&M){return}
 if(f.id==='setupForm'){const fd=fdata(f);if(!fd.name.trim()||!fd.birth){toast('Informe o nome e a data de nascimento.',true);return}
  const cfg={name:fd.name.trim(),birth:fd.birth,sex:fd.sex,diaperItem:''};
  try{if(+fd.qty>0){const id=newId();await w(store.set('inventory/'+id,{name:'Fralda',cat:'fralda',size:fd.size,qty:+fd.qty,min:30,unit:'un.',note:''}));cfg.diaperItem=id}
   await w(store.set('config/main',cfg));toast('Tudo pronto!')}catch(err){}return}
 if(f.id==='cfgForm'){const fd=fdata(f);if(!fd.name.trim()||!fd.birth){toast('Nome e nascimento são obrigatórios.',true);return}
  const o={...S.cfg};['name','birth','sex','blood','allergies','pedName','pedPhone','plan','card','diaperItem'].forEach(k=>o[k]=(fd[k]||'').trim());
  try{await w(store.set('config/main',o));toast('Dados salvos')}catch(err){}}
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
let toastT;function toast(msg,err){const t=$('#toast');t.textContent=msg;t.className='toast'+(err?' err':'');t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,err?4500:2200)}
