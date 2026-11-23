/* ---------- sons ---------- */
const SOUNDS=[
 ['utero','Útero','Batimento e som abafado, como na barriga','heart','var(--health)'],
 ['shh','Shhh','O "shhh" ritmado do colo','wind','var(--accent)'],
 ['ninar','Canção de ninar','Caixinha de música','music','var(--feed)'],
 ['chuva','Chuva','Constante e suave','rain','var(--sleep)'],
 ['mar','Ondas do mar','Lentas e regulares','wave','var(--diaper)'],
 ['ventilador','Ventilador','Zumbido constante','fan','var(--other)'],
 ['branco','Ruído branco','O clássico, mais agudo','noise','var(--other)'],
 ['rosa','Ruído rosa','Mais suave que o branco','noise','var(--health)'],
 ['marrom','Ruído marrom','Grave, como num avião','noise','var(--growth)'],
 ['coracao','Coração','Só o batimento, calmo','heart','var(--bad)']];
const SR=22050;
function synth(id){
 const len={utero:20,shh:22,ninar:28,chuva:24,mar:24,ventilador:20,branco:20,rosa:20,marrom:20,coracao:20}[id];
 const L=len*SR,X=Math.round(1.5*SR),N=L+X,a=new Float32Array(N),W=()=>Math.random()*2-1;
 let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;const pink=()=>{const w=W();b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;const o=b0+b1+b2+b3+b4+b5+b6+w*.5362;b6=w*.115926;return o*.11};
 let br=0;const brown=()=>{br=(br+.02*W())/1.02;return br*3.5};
 const lp=f=>{const k=1-Math.exp(-2*Math.PI*f/SR);let y=0;return x=>(y+=k*(x-y))};
 const P=60/72,sh=x=>x<0||x>.25?0:Math.sin(2*Math.PI*52*x)*Math.exp(-x/.055)*(1-Math.exp(-x/.004)),thump=t=>{const tp=t%P;return sh(tp)+.65*sh(tp-.3)};
 const gain={branco:.5,rosa:.75,marrom:.85,utero:.9,coracao:.9,shh:.7,chuva:.75,mar:.85,ventilador:.75,ninar:.8}[id];
 switch(id){
  case'branco':for(let i=0;i<N;i++)a[i]=W();break;
  case'rosa':for(let i=0;i<N;i++)a[i]=pink();break;
  case'marrom':for(let i=0;i<N;i++)a[i]=brown();break;
  case'utero':{const f=lp(320),f2=lp(160);for(let i=0;i<N;i++){const t=i/SR,tp=(t%P)/P;a[i]=f2(f(brown()))*(.8+.2*Math.sin(2*Math.PI*tp))*1.6+thump(t)*.55}break}
  case'coracao':{const f=lp(250);for(let i=0;i<N;i++){const t=i/SR;a[i]=thump(t)*.9+f(brown())*.25}break}
  case'shh':{const f=lp(1400),Q=2.2;for(let i=0;i<N;i++){const t=i/SR,w=W(),x=t%Q,env=x<.3?x/.3:x<1.5?1:x<2?1-(x-1.5)/.5*.85:.15;a[i]=(w-f(w))*env}break}
  case'chuva':{const f=lp(2500),g=lp(900);let drop=0;for(let i=0;i<N;i++){if(Math.random()<.0009)drop=.6+Math.random()*.6;drop*=.9975;a[i]=f(pink())*.8+g(W())*drop*.5}break}
  case'mar':{const f=lp(600),g=lp(1800);for(let i=0;i<N;i++){const t=i/SR,env=.2+.8*Math.pow(.5-.5*Math.cos(2*Math.PI*(t%8)/8),1.6);a[i]=(f(brown())*.7+g(pink())*.5*env)*(.35+.65*env)}break}
  case'ventilador':{const f=lp(700);for(let i=0;i<N;i++){const t=i/SR;a[i]=(f(brown())*.8+pink()*.25)*(1+.05*Math.sin(Math.PI*t))+Math.sin(2*Math.PI*100*t)*.02}break}
  case'ninar':{const q=.55,F={C:523.25,D:587.33,E:659.25,F:698.46,G:783.99,A:880};let t0=.2;const notes=[];['CCGGAAG','FFEEDDC','GGFFEED','GGFFEED','CCGGAAG','FFEEDDC'].forEach(l=>[...l].forEach((n,j)=>{notes.push([t0,F[n]]);t0+=j===6?2*q:q}));
   for(const[o,fr]of notes){const s0=Math.round(o*SR),n=3*SR;for(let k=0;k<n&&s0+k<N;k++){const t=k/SR,e=Math.exp(-t/.8)*(1-Math.exp(-t/.003));a[s0+k]+=(Math.sin(2*Math.PI*fr*t)+.35*Math.sin(4*Math.PI*fr*t)+.12*Math.sin(6.02*Math.PI*fr*t))*e*.32}}
   for(let i=L;i<N;i++)a[i-L]+=a[i];break}
 }
 if(id!=='ninar')for(let i=0;i<X;i++){const t=i/X;a[i]=a[i]*Math.sqrt(t)+a[L+i]*Math.sqrt(1-t)}
 let pk=0;for(let i=0;i<L;i++)pk=Math.max(pk,Math.abs(a[i]));const g=.85*gain/(pk||1),out=new Int16Array(L);
 for(let i=0;i<L;i++)out[i]=Math.max(-1,Math.min(1,a[i]*g))*32767;return out}
function wav(pcm){const b=new ArrayBuffer(44+pcm.length*2),v=new DataView(b),w=(o,s)=>[...s].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));
 w(0,'RIFF');v.setUint32(4,36+pcm.length*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,SR,true);v.setUint32(28,SR*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,pcm.length*2,true);new Int16Array(b,44).set(pcm);return new Blob([b],{type:'audio/wav'})}
const SND={id:null,a:null,urls:{},mins:+(lsGet('ddb-snd-min')??30),vol:+(lsGet('ddb-snd-vol')||.7),end:0,iv:null};
if(!Number.isFinite(SND.mins))SND.mins=30;
const sname=id=>(SOUNDS.find(s=>s[0]===id)||[])[1]||'';
const sndOn=()=>SND.a&&SND.id&&!SND.a.paused;
function sndPlay(id){
 if(SND.id===id&&sndOn())return sndStop();
 if(!SND.a){SND.a=new Audio();SND.a.loop=true;SND.a.setAttribute('playsinline','');SND.a.addEventListener('pause',()=>{drawPlayer();if(S.tab==='sons')render()});SND.a.addEventListener('play',()=>{drawPlayer();if(S.tab==='sons')render()})}
 if(!SND.urls[id])SND.urls[id]=URL.createObjectURL(wav(synth(id)));
 SND.a.src=SND.urls[id];SND.a.volume=SND.vol;SND.id=id;SND.end=SND.mins?Date.now()+SND.mins*MIN:0;
 SND.a.play().catch(()=>{toast('Toque de novo para tocar.',true)});
 if('mediaSession' in navigator){try{navigator.mediaSession.metadata=new MediaMetadata({title:sname(id),artist:'Diário do Bebê',artwork:[{src:'icons/icon-512.png',sizes:'512x512',type:'image/png'}]});navigator.mediaSession.setActionHandler('pause',()=>SND.a.pause());navigator.mediaSession.setActionHandler('play',()=>SND.a.play());navigator.mediaSession.setActionHandler('stop',()=>sndStop())}catch(e){}}
 clearInterval(SND.iv);SND.iv=setInterval(sndTick,1000);drawPlayer();render();
}
function sndStop(){if(SND.a){SND.a.pause();SND.a.volume=SND.vol}SND.id=null;clearInterval(SND.iv);drawPlayer();render()}
function sndTick(){if(!SND.id)return;if(SND.end){const r=SND.end-Date.now();if(r<=0)return sndStop();if(r<20000&&SND.a)SND.a.volume=Math.max(0,SND.vol*r/20000)}drawPlayer()}
function drawPlayer(){const el=$('#player');if(!el)return;if(!SND.id){el.hidden=true;document.body.classList.remove('playing');return}
 el.hidden=false;document.body.classList.add('playing');const s=SOUNDS.find(x=>x[0]===SND.id),on=sndOn();
 const rem=SND.end?Math.max(0,Math.ceil((SND.end-Date.now())/MIN)):0;
 el.innerHTML=`<div class="in"><span class="ic" style="--c:${s[4]};background:rgb(255 255 255 / .12);color:inherit">${ic(s[3])}</span><div class="tx"><b>${s[1]}</b>${on?(SND.end?`desliga em ${rem} min`:'tocando sem timer'):'pausado'}</div><button class="pb" data-act="sndToggle" aria-label="${on?'Pausar':'Tocar'}">${ic(on?'pause':'play')}</button><button class="pb" data-act="sndStop" aria-label="Parar">${ic('x')}</button></div>`}
A.snd=id=>sndPlay(id);
A.sndStop=()=>sndStop();
A.sndToggle=()=>{if(!SND.a)return;if(SND.a.paused){if(SND.end&&SND.end<Date.now()+MIN&&SND.mins)SND.end=Date.now()+SND.mins*MIN;SND.a.volume=SND.vol;SND.a.play().catch(()=>{})}else SND.a.pause()};
A.sndMin=m=>{SND.mins=+m;lsSet('ddb-snd-min',String(SND.mins));if(SND.id)SND.end=SND.mins?Date.now()+SND.mins*MIN:0;drawPlayer();render()};
VIEWS.sons=()=>`<div class="snd-grid">${SOUNDS.map(([id,n,d,i,c])=>{const on=SND.id===id;return`<button class="snd${on?' on':''}" style="--c:${c}" data-act="snd" data-id="${id}" aria-pressed="${on}"><span class="ic" style="--c:${c}">${ic(i)}</span>${on&&sndOn()?'<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>':''}<span><b>${n}</b><br><span class="d">${d}</span></span></button>`}).join('')}</div>
 <div class="card"><div class="card-h"><h2>Desligar depois de</h2></div><div class="chips">${[[15,'15 min'],[30,'30 min'],[60,'1 hora'],[0,'Não desligar']].map(([m,l])=>`<button class="chip" aria-pressed="${SND.mins===m}" data-act="sndMin" data-id="${m}">${l}</button>`).join('')}</div>
 ${isIOS?'':`<div class="label" style="margin-top:16px">Volume</div><input type="range" id="sndVol" min="0" max="1" step="0.05" value="${SND.vol}" aria-label="Volume">`}
 <p class="small muted" style="margin:14px 0 0">Deixe o celular a uns 2 metros do berço, com volume baixo.${isIOS?' No iPhone, o volume é o dos botões do aparelho.':''}</p></div>`;

/* ---------- preferências de aviso ---------- */
const PREFS=[['fralda','Fraldas acabando',1],['compras','Lista de compras',1],['agenda','Consultas e exames (véspera e 2 h antes)',1],['remedios','Hora do remédio',1],['vacinas','Vacinas chegando ou atrasadas',1],['exames','Resultado de exame pendente',1],['marcos','Mesversário e nova fase',1],['mamada','Tempo desde a última mamada',0],['resumo','Resumo do dia, às 21h',0]];
let MYPREFS={},SUB_EP=null;
const prefOn=k=>MYPREFS[k]??!!(PREFS.find(p=>p[0]===k)||[])[2];
async function savePref(k,v){MYPREFS[k]=v;render();if(!SUB_EP)return;const{error}=await sb.from('push_subs').update({prefs:MYPREFS}).eq('endpoint',SUB_EP);if(error)toast('Não deu para salvar a preferência.',true)}

/* ---------- tema ---------- */
function applyTheme(){const t=lsGet('ddb-theme')||'auto',r=document.documentElement;if(t==='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',t);
 const dark=t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);const m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',dark?'#0F161C':'#EEF3F5')}
applyTheme();try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme)}catch(e){}
const isDark=()=>{const t=lsGet('ddb-theme')||'auto';return t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches)};
A.themeToggle=()=>{lsSet('ddb-theme',isDark()?'light':'dark');applyTheme();render()};
function setTheme(v){lsSet('ddb-theme',v);applyTheme();render()}
