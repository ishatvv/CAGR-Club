(function(){
'use strict';
/* Paste the Discord invite link here once the server exists, e.g. 'https://discord.gg/abc123'.
   Until then, "Join the club" takes people to the email sign-up. */
var DISCORD_INVITE='';

var $=function(id){return document.getElementById(id)};
var $$=function(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))};
var store={get:function(k,d){try{var v=localStorage.getItem('cc.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:function(k,v){try{localStorage.setItem('cc.'+k,JSON.stringify(v))}catch(e){}}};
var inr=function(n){return Math.round(n).toLocaleString('en-IN')};
function money(n){return n>=1e7?'₹'+(n/1e7).toFixed(2)+' cr':n>=1e5?'₹'+(n/1e5).toFixed(2)+' lakh':'₹'+inr(n)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function pad2(n){return (n<10?'0':'')+n}
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE=window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;

var I={replay:'<path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/>',map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".5"/>',cal:'<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>',book:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>',home:'<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',search:'<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',flame:'<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',check:'<path d="m5 12 5 5 9-10"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',left:'<path d="M19 12H5M11 6l-6 6 6 6"/>',spark:'<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>',flag:'<path d="M5 21V4h11l-2 4 2 4H5"/>',bolt:'<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',up:'<path d="M12 19V5M6 11l6-6 6 6"/>'};
function ico(n){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+I[n]+'</svg>'}

/* ---------- mascot ---------- */
function monkey(cls,bare){return '<svg class="mk '+(cls||'')+'" viewBox="20 18 361 364" aria-hidden="true">'+(bare?'':'<circle class="mk-bg" cx="200" cy="200" r="168"/>')+'<path class="mk-b" fill-rule="evenodd" d="'+MK.body+'"/><path class="mk-b" d="'+MK.nose+'"/>'+MK.eyes.map(function(e){return '<g class="mk-eye" data-cx="'+e[0]+'" data-cy="'+e[1]+'"><circle class="mk-e" cx="'+e[0]+'" cy="'+e[1]+'" r="'+e[2]+'"/></g>'}).join('')+'</svg>'}
function logoMark(){return monkey('mk-logo')}
var eyeQ=false,ptr={x:innerWidth*.3,y:innerHeight*.4};
function eyes(){eyeQ=false;$$('svg.mk').forEach(function(s){var r=s.getBoundingClientRect();if(!r.width||r.bottom<0||r.top>innerHeight)return;var k=r.width/361,big=s.classList.contains('mk-bgm');
  $$('.mk-eye',s).forEach(function(g){var ex=r.left+(+g.dataset.cx-20)*k,ey=r.top+(+g.dataset.cy-18)*k,dx=ptr.x-ex,dy=ptr.y-ey,d=Math.sqrt(dx*dx+dy*dy)||1,m=Math.min(big?6:4.5,d/(big?60:40));g.style.transform='translate('+(dx/d*m).toFixed(2)+'px,'+(dy/d*m).toFixed(2)+'px)'})})}
function eyeReq(){if(!eyeQ){eyeQ=true;requestAnimationFrame(eyes)}}
window.addEventListener('pointermove',function(e){ptr.x=e.clientX;ptr.y=e.clientY;eyeReq()},{passive:true});
(function blink(){setTimeout(function(){$$('svg.mk').forEach(function(s){s.classList.add('blink')});setTimeout(function(){$$('svg.mk').forEach(function(s){s.classList.remove('blink')})},170);blink()},2600+Math.random()*3600)})();
/* ---------- state ---------- */
var done=store.get('done',{}),ans=store.get('ans',{}),uid=0,timers=[];
var DAY=Math.floor(Date.now()/864e5),BASE=Math.floor(Date.UTC(2026,10,14)/864e5);
function daySet(d){var t=[(d*7)%QS.length,(d*7+13)%QS.length,(d*7+29)%QS.length];if(t[1]===t[0])t[1]=(t[1]+1)%QS.length;if(t[2]===t[0]||t[2]===t[1])t[2]=(t[2]+2)%QS.length;return t}
var todays=daySet(DAY);
var PTS={Easy:1,Medium:2,Hard:3};
var NAV=[['roadmap','Curriculum','map'],['practice','Practice','target'],['daily','Daily','cal'],['flaw','Flaw or fine','flag'],['library','Library','book']];
var PRICED_LESSON=Math.max(1,LESSONS.findIndex?LESSONS.findIndex(function(l){return l.w==='priced'})+1:13);

/* ---------- smooth scroll ---------- */
var lenis=null;
try{if(window.Lenis&&!RM){lenis=new Lenis({lerp:.09,smoothWheel:true});(function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now())}}catch(e){lenis=null}
function toTop(){if(lenis)lenis.scrollTo(0,{immediate:true});else window.scrollTo(0,0)}
function scrollToEl(el,off){if(!el)return;if(lenis)lenis.scrollTo(el,{offset:-(off==null?90:off)});else window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-(off==null?90:off),behavior:RM?'auto':'smooth'})}

/* ---------- helpers ---------- */
function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){t.hidden=true},2400)}
function every(ms,fn){var h=setInterval(fn,ms);timers.push(h);return h}
function clearTimers(){timers.forEach(clearInterval);timers=[]}
function slider(id,label,min,max,step,val){return '<label class="sl" for="'+id+'"><span class="sl-top"><span>'+label+'</span><output id="'+id+'o"></output></span><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'"></label>'}
function bindSliders(el,fn){$$('input[type=range]',el).forEach(function(r){var f=function(){r.style.setProperty('--p',((r.value-r.min)/(r.max-r.min)*100)+'%')};f();r.addEventListener('input',function(){f();fn()})});fn()}
function lessonCount(){return LESSONS.filter(function(_,i){return done[i+1]}).length}
function modDone(m){return m.l.filter(function(n){return done[n]}).length}
function nextLesson(){for(var i=1;i<=LESSONS.length;i++)if(!done[i])return i;return 1}
function modOf(n){for(var i=0;i<MODULES.length;i++)if(MODULES[i].l.indexOf(n)>-1)return i;return 0}
function streakNow(){var s=store.get('streak',{last:-1,n:0});return (s.last===DAY||s.last===DAY-1)?s.n:0}
function syncStreak(){if(todays.every(function(i){return ans[i]})){var s=store.get('streak',{last:-1,n:0});if(s.last!==DAY)store.set('streak',{last:DAY,n:s.last===DAY-1?s.n+1:1})}$('streak').innerHTML=ico('flame')+streakNow()}
function dailyNo(){return Math.max(1,DAY-BASE+1)}
function untilNext(){var ms=(DAY+1)*864e5-Date.now();return pad2(Math.floor(ms/36e5))+':'+pad2(Math.floor(ms%36e5/6e4))+':'+pad2(Math.floor(ms%6e4/1e3))}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function cssv(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}
function inviteHref(){return DISCORD_INVITE||'#signup'}
function inviteAttr(){return DISCORD_INVITE?' target="_blank" rel="noopener"':''}
function mono(){return ''}
function eyebrow(t){return ''}
function countUp(root){$$('[data-count]',root).forEach(function(el){var n=+el.dataset.count;if(RM){el.textContent=n;return}var t0=performance.now();(function f(t){var p=Math.min(1,(t-t0)/1100),e=1-Math.pow(1-p,4);el.textContent=Math.round(n*e);if(p<1)requestAnimationFrame(f)})(t0)})}
function tilt(root){if(RM||!FINE)return;$$('.tilt',root).forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(900px) rotateX('+(-y*7)+'deg) rotateY('+(x*9)+'deg) translateY(-4px)';c.style.setProperty('--mx',(x+.5)*100+'%');c.style.setProperty('--my',(y+.5)*100+'%')});c.addEventListener('pointerleave',function(){c.style.transform=''})})}
function magnet(root){if(RM||!FINE)return;$$('.mag',root).forEach(function(b){b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.22).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.32).toFixed(1)+'px)'});b.addEventListener('pointerleave',function(){b.style.transform=''})})}
var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'}):null;
function reveal(root){$$('[data-rv]',root).forEach(function(el,k){if(!io||RM){el.classList.add('in');return}io.observe(el)})}
function sparkPath(seed,w,h,up){var r=rng(seed),pts=[],v=.15;for(var i=0;i<=24;i++){v+=(r()-.38)*.09*(up?1:.5);v=Math.max(.05,Math.min(.95,v+(up?.012:0)));pts.push([i/24*w,h-v*h])}return 'M'+pts.map(function(p){return p[0].toFixed(1)+' '+p[1].toFixed(1)}).join('L')}
function splitWords(parts){var n=0;return parts.map(function(p){var w=p[0].split(' ').map(function(t){return '<span class="w"><span style="--i:'+(n++)+'">'+t+'</span></span>'}).join(' ');return p[1]?'<em>'+w+'</em>':w}).join(' ')}

/* ---------- confetti ---------- */
function confetti(x,y){if(RM)return;var c=document.createElement('canvas'),dpr=window.devicePixelRatio||1;c.className='confetti';c.width=innerWidth*dpr;c.height=innerHeight*dpr;document.body.appendChild(c);var g=c.getContext('2d');g.scale(dpr,dpr);
  var cols=[cssv('--acc'),cssv('--pos'),cssv('--gold'),cssv('--ink')],P=[];for(var i=0;i<120;i++){var a=Math.random()*Math.PI*2,s=4+Math.random()*7;P.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-5,w:5+Math.random()*5,h:3+Math.random()*4,c:cols[i%4],rot:Math.random()*6})}
  var t0=performance.now();(function f(t){var p=(t-t0)/1500;g.clearRect(0,0,innerWidth,innerHeight);P.forEach(function(q){q.vy+=.25;q.vx*=.985;q.x+=q.vx;q.y+=q.vy;q.rot+=.15;g.save();g.globalAlpha=Math.max(0,1-p);g.translate(q.x,q.y);g.rotate(q.rot);g.fillStyle=q.c;g.fillRect(-q.w/2,-q.h/2,q.w,q.h);g.restore()});if(p<1)requestAnimationFrame(f);else c.remove()})(t0)}

/* ---------- questions ---------- */
function parseNum(v){v=String(v).replace(/[,₹%\s×x]/g,'').replace('−','-');return v===''?NaN:parseFloat(v)}
function tolOf(q){return q.tol!=null?q.tol:Math.max(Math.abs(q.a)*0.01,0.05)}
function fmtAns(q){if(q.type==='mcq')return q.o[q.a];var n=Math.abs(q.a).toLocaleString('en-IN',{maximumFractionDigits:2}),sg=q.a<0?'−':'';if(q.unit==='₹ cr')return sg+'₹'+n+' crore';if(q.unit==='%'||q.unit==='×')return sg+n+q.unit;return sg+n+(q.unit?' '+q.unit:'')}
function qBody(i){var q=QS[i],a=ans[i],h='<p class="q-q">'+q.q+'</p>';
  if(q.type==='mcq'){h+='<div class="opts">'+q.o.map(function(o,k){var c='';if(a){if(k===q.a)c=' right';else if(a.v===k)c=' wrong'}return '<button type="button" class="opt'+c+'" data-opt="'+k+'" data-qi="'+i+'"'+(a?' disabled':'')+'><b>'+'ABCD'[k]+'</b><span>'+o+'</span></button>'}).join('')+'</div>'}
  else{h+='<div class="numrow"><input class="field" type="text" inputmode="decimal" placeholder="Your answer" aria-label="Your answer" data-num="'+i+'"'+(a?' value="'+esc(a.v)+'" disabled':'')+'>'+(q.unit?'<span class="unit">'+q.unit+'</span>':'')+(a?'':'<button type="button" class="btn pri sm" data-check="'+i+'">Check</button><button type="button" class="link" data-give="'+i+'">Show answer</button>')+'</div>'}
  if(a)h+='<div class="fb '+(a.ok?'ok':'no')+'"><b>'+(a.ok?'Correct. +'+PTS[q.d]+' pts':'Answer: '+fmtAns(q))+'</b><span>'+q.s+'</span></div>';
  return h}
var onAnswered=[];
function answer(i,v,ok,src){ans[i]={ok:ok,v:v,t:Date.now()};store.set('ans',ans);syncStreak();
  if(ok&&src){var r=src.getBoundingClientRect();confetti(r.left+r.width/2,r.top+r.height/2)}
  onAnswered.forEach(function(f){f(i,ok)})}
function checkNum(i,src){var q=QS[i],inp=document.querySelector('[data-num="'+i+'"]:not([disabled])'),v=parseNum(inp?inp.value:'');if(isNaN(v)){toast('Type a number first');if(inp)inp.focus();return}answer(i,inp.value,Math.abs(v-q.a)<=tolOf(q)+1e-9,src)}

/* ---------- lesson widgets ---------- */
function curveSvg(id,rate,years,W,H){var l=6,t=10,b=26,max=Math.pow(1+rate,years),a=[],s=[],i;
  var X=function(k){return l+k/years*(W-2*l)},Y=function(v){return H-b-((v-1)/(max-1||1))*(H-b-t)};
  for(i=0;i<=years;i++){a.push(X(i).toFixed(1)+' '+Y(Math.pow(1+rate,i)).toFixed(1));s.push(X(i).toFixed(1)+' '+Y(1+rate*i).toFixed(1))}
  var gl='';for(i=1;i<=3;i++){var yy=t+(H-b-t)*i/4;gl+='<line x1="'+l+'" x2="'+(W-l)+'" y1="'+yy+'" y2="'+yy+'" stroke="var(--line)" stroke-dasharray="3 5"/>'}
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Growth over '+years+' years at '+Math.round(rate*100)+' percent"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--pos)" stop-opacity=".35"/><stop offset="1" stop-color="var(--pos)" stop-opacity="0"/></linearGradient></defs>'+gl+'<path d="M'+a.join('L')+'L'+X(years)+' '+(H-b)+'L'+l+' '+(H-b)+'Z" fill="url(#'+id+')"/><path d="M'+s.join('L')+'" fill="none" stroke="var(--faint)" stroke-width="1.6" stroke-dasharray="5 5"/><path d="M'+a.join('L')+'" fill="none" stroke="var(--pos)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="'+X(years)+'" cy="'+Y(max)+'" r="6" fill="var(--gold)" stroke="var(--bg)" stroke-width="2"/><text x="'+l+'" y="'+(H-6)+'">Today</text><text x="'+(W-l)+'" y="'+(H-6)+'" text-anchor="end">Year '+years+'</text></svg>'}
function mountCagr(el){var id='c'+(++uid);
  el.innerHTML='<div class="w"><div class="ctl">'+slider(id+'r','Growth rate a year',2,30,1,15)+slider(id+'y','Years',1,30,1,20)+'</div><div class="chart" id="'+id+'c"></div></div><div class="kvs"><div class="kv"><span>₹1 lakh grows to</span><b class="hi" id="'+id+'v"></b></div><div class="kv"><span>Multiple of your money</span><b id="'+id+'m"></b></div><div class="kv"><span>Without compounding</span><b id="'+id+'s"></b></div></div><p class="cap">The dashed line is the same rate with no compounding: growth on the original amount only.</p>';
  bindSliders(el,function(){var r=+$(id+'r').value/100,n=+$(id+'y').value,m=Math.pow(1+r,n);$(id+'c').innerHTML=curveSvg(id+'g',r,n,440,210);$(id+'ro').textContent=Math.round(r*100)+'%';$(id+'yo').textContent=n;$(id+'v').textContent=money(1e5*m);$(id+'m').textContent=m.toFixed(m<10?2:1)+'×';$(id+'s').textContent=money(1e5*(1+r*n))})}
function mountPnl(el){var id='p'+(++uid);
  el.innerHTML='<div class="w"><div class="ctl">'+slider(id+'r','Revenue (₹ crore)',500,2000,50,1000)+slider(id+'g','Gross margin',20,60,1,40)+slider(id+'o','Operating costs, share of revenue',10,40,1,25)+'</div><div id="'+id+'b"></div></div><p class="cap">Interest is fixed at ₹30 crore and tax at 25% of profit before tax.</p>';
  bindSliders(el,function(){var r=+$(id+'r').value,g=+$(id+'g').value/100,o=+$(id+'o').value/100,gp=r*g,op=gp-r*o,pbt=op-30,np=pbt-Math.max(0,pbt*.25);
    $(id+'ro').textContent='₹'+inr(r)+' cr';$(id+'go').textContent=Math.round(g*100)+'%';$(id+'oo').textContent=Math.round(o*100)+'%';
    var row=function(l,v,c){return '<div class="hb"><span>'+l+'</span><span class="trk"><i class="'+(v<0?'neg':c)+'" style="width:'+Math.max(1.5,Math.abs(v)/r*100)+'%"></i></span><span>'+(v<0?'−':'')+'₹'+inr(Math.abs(v))+' <small>'+Math.round(v/r*100)+'%</small></span></div>'};
    $(id+'b').innerHTML=row('Revenue',r,'m')+row('Gross profit',gp,'')+row('Operating profit',op,'')+row('Net profit',np,'a')})}
function mountDcf(el){var id='d'+(++uid);
  el.innerHTML='<div class="w"><div class="ctl">'+slider(id+'f','Cash flow next year (₹ crore)',50,500,10,100)+slider(id+'w','Discount rate',6,16,.5,10)+slider(id+'g','Growth forever',0,8,.5,5)+'</div><div><div class="scroll" id="'+id+'t"></div><p class="cap" id="'+id+'n"></p></div></div>';
  bindSliders(el,function(){var f=+$(id+'f').value,w=+$(id+'w').value,g=+$(id+'g').value,val=function(W,G){return W-G<=0?null:f/((W-G)/100)};
    $(id+'fo').textContent='₹'+inr(f)+' cr';$(id+'wo').textContent=w+'%';$(id+'go').textContent=g+'%';
    var h='<table><tr><th>Rate ↓ Growth →</th>';[-1,0,1].forEach(function(d){h+='<th>'+(g+d)+'%</th>'});h+='</tr>';
    [-1,0,1].forEach(function(dw){h+='<tr><th>'+(w+dw)+'%</th>';[-1,0,1].forEach(function(dg){var v=val(w+dw,g+dg);h+='<td'+(!dw&&!dg?' class="mid"':'')+'>'+(v==null?'none':'₹'+inr(v))+'</td>'});h+='</tr>'});
    $(id+'t').innerHTML=h+'</table>';var lo=val(w+1,g-1),hi=val(w-1,g+1),mid=val(w,g);
    $(id+'n').textContent=mid==null?'Growth must stay below the discount rate, or the value has no limit.':'Values in ₹ crore. One point each way moves the answer from ₹'+inr(lo)+' cr to '+(hi==null?'no finite value':'₹'+inr(hi)+' cr')+'.'})}
function mountPriced(el){var id='x'+(++uid),EV=65000,CAP=40.5;
  el.innerHTML='<div class="w"><div class="ctl">'+slider(id+'r','Return investors need',8,18,1,12)+slider(id+'n','Years',3,10,1,5)+slider(id+'m','Value ÷ profit at the end',6,20,1,12)+slider(id+'u','Profit per tonne (₹)',800,2000,50,1200)+'</div><div class="out" id="'+id+'o"></div></div><p class="cap">CementCo is invented. It is valued at ₹65,000 crore today, and its running and announced plants can make 40.5 million tonnes a year.</p>';
  bindSliders(el,function(){var r=+$(id+'r').value/100,n=+$(id+'n').value,m=+$(id+'m').value,u=+$(id+'u').value,need=EV*Math.pow(1+r,n)/m*10/u,ratio=need/CAP,mx=Math.max(need,CAP);
    $(id+'ro').textContent=Math.round(r*100)+'%';$(id+'no').textContent=n;$(id+'mo').textContent=m+'×';$(id+'uo').textContent='₹'+inr(u);
    var c=ratio<=1?'good':ratio<=1.3?'mid':'bad',wd=ratio<=1?'Within reach':ratio<=1.3?'A stretch':'Needs '+ratio.toFixed(1)+'× its capacity';
    $(id+'o').innerHTML='<span class="verd '+c+'">'+wd+'</span><span>To earn that return, CementCo must sell <b>'+need.toFixed(1)+' million tonnes</b> a year in '+n+' years.</span><div style="width:100%"><div class="hb"><span>Price needs</span><span class="trk"><i class="'+(ratio>1?'neg':'a')+'" style="width:'+(need/mx*100)+'%"></i></span><span>'+need.toFixed(1)+' mt</span></div><div class="hb"><span>Plants can make</span><span class="trk"><i class="g" style="width:'+(CAP/mx*100)+'%"></i></span><span>'+CAP+' mt</span></div></div>'})}
function mountDrill(el){var av=0,score=0,asked=0,left=0,h=null;
  el.innerHTML='<div class="drill"><div class="drill-l">'+eyebrow('Speed round · 60 seconds')+'<div class="big" id="m-q">As many as you can in a minute.</div><div class="row"><input class="field" id="m-a" type="text" inputmode="decimal" aria-label="Your answer" placeholder="Answer, then Enter" disabled><button class="btn pri sm" id="m-go" type="button">Start</button></div><span class="small" id="m-s">Percentages, growth and P/E. Answers within 2% count.</span></div><div class="drill-r"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--raised)" stroke-width="8"/><circle id="m-ring" cx="60" cy="60" r="52" fill="none" stroke="var(--gold)" stroke-width="8" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="0" transform="rotate(-90 60 60)"/></svg><div><b id="m-sc">0</b><span id="m-t">60s</span></div></div></div>';
  var rnd=function(a){return a[Math.floor(Math.random()*a.length)]};
  function next(){var k=Math.floor(Math.random()*3);
    if(k===0){var p=rnd([5,12,15,18,25,35,40]),n=rnd([240,360,480,640,800,1200]);av=p*n/100;$('m-q').textContent='What is '+p+'% of '+n+'?'}
    else if(k===1){var a=rnd([200,400,500,800]),g=rnd([10,15,20,25,30,40,60]);av=g;$('m-q').textContent='Sales go from '+a+' to '+(a*(100+g)/100)+'. Growth in %?'}
    else{var e=rnd([8,12,15,20,25,40]),pe=rnd([12,15,18,22,30]);av=pe;$('m-q').textContent='Price '+(e*pe)+', EPS '+e+'. P/E?'}
    asked++;$('m-a').value='';$('m-a').focus()}
  function draw(){$('m-sc').textContent=score;$('m-t').textContent=left+'s';$('m-ring').setAttribute('stroke-dashoffset',326.7*(1-left/60))}
  function end(){clearInterval(h);h=null;$('m-a').disabled=true;$('m-go').textContent='Go again';$('m-q').textContent=score+' right in 60 seconds';$('m-s').textContent=(asked-1)+' answered';if(score>=5){var r=$('m-sc').getBoundingClientRect();confetti(r.left+r.width/2,r.top)}}
  $('m-go').addEventListener('click',function(){score=0;asked=0;left=60;$('m-a').disabled=false;$('m-go').textContent='Restart';clearInterval(h);h=every(1000,function(){if(!$('m-s')){clearInterval(h);return}left--;draw();if(left<=0)end()});draw();next()});
  $('m-a').addEventListener('keydown',function(e){if(e.key!=='Enter'||!h||this.value==='')return;e.stopPropagation();if(Math.abs(parseNum(this.value)-av)<=Math.abs(av)*.02){score++;var s=this;s.classList.add('flash-ok');setTimeout(function(){s.classList.remove('flash-ok')},250)}draw();next()})}
var MOUNT={priced:mountPriced,cagr:mountCagr,dcf:mountDcf,pnl:mountPnl};

/* ---------- archive folders ---------- */
var FOLD=[{c:'ver',a:'ledger',ts:'serif'},{c:'cob',a:'rings',ts:'italic'},{c:'och',a:'dots',ts:'serif'},{c:'ink',a:'waves',ts:'italic'}];
function art(kind,seed){var r=rng(seed),s='',i,j;
  if(kind==='ledger'){for(i=0;i<18;i++)s+='<line x1="0" x2="200" y1="'+(28+i*12)+'" y2="'+(28+i*12)+'"/>';s+='<line class="acc" x1="30" x2="30" y1="150" y2="250"/>';[['Revenue','1,000'],['EBITDA','240'],['Interest','30'],['Profit','96']].forEach(function(t,k){s+='<text class="mn" x="40" y="'+(184+k*12)+'">'+t[0]+'</text><text class="mn" x="150" y="'+(184+k*12)+'" text-anchor="end">'+t[1]+'</text>'})}
  else if(kind==='rings'){for(i=0;i<22;i++)s+='<circle cx="150" cy="196" r="'+(8+i*10)+'"/>';s+='<circle class="fillacc" cx="150" cy="196" r="20"/>'}
  else if(kind==='dots'){for(i=0;i<23;i++)for(j=0;j<28;j++){var x=i*9+4,y=j*9+4,v=Math.max(0,(y/250)*1.2-.2+Math.sin(x/30)*.12);if(v>.05)s+='<circle class="fill" cx="'+x+'" cy="'+y+'" r="'+(v*3.4).toFixed(2)+'"/>'}s+='<path class="acc" d="M10 226C70 214 120 176 190 70" stroke-width="3"/>'}
  else if(kind==='waves'){for(i=0;i<20;i++){var d='M0 '+(70+i*10);for(j=0;j<=20;j++)d+=' L'+(j*10)+' '+(70+i*10+Math.sin(j*.55+i*.35)*(6+i*.6)).toFixed(1);s+='<path d="'+d+'"/>'}}
  return '<svg class="f-art" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+s+'</svg>'}
function folders(){return '<div class="folders">'+MODULES.map(function(m,i){var f=FOLD[i%FOLD.length],d=modDone(m),words=m.t.split(' ');
  var last=words[words.length-1],head=words.slice(0,-1).join(' '),title=words.length<3&&f.ts!=='italic'?m.t:head+'<br>'+(f.ts==='italic'?'<i>'+last+'</i>':last);
  return '<a class="fold-w" href="#roadmap-'+(i+1)+'" data-cur="Open" data-rv style="--d:'+(i*90)+'ms"><span class="folder f-'+f.c+'"><span class="f-back"></span><span class="f-paper"><b>'+LESSONS[m.l[0]-1].t+'</b><i></i><i></i><i></i><i></i></span><span class="f-front">'+art(f.a,i*17+3)+'<span class="f-t ts-'+f.ts+'">'+title+'</span>'+(d?'<span class="f-done">'+d+' read</span>':'')+'</span></span><span class="f-cap">'+m.d+'</span></a>'}).join('')+'</div>'}

/* ---------- shared blocks ---------- */
function creds(){return '<p class="backed" data-rv>Backed by CFA® charterholders and FRM® holders</p>'}
function joinBtn(cls,label){return '<a class="btn pri mag '+(cls||'')+'" href="'+inviteHref()+'"'+inviteAttr()+' data-join>'+(label||'Join the club')+ico('arrow')+'</a>'}

/* ---------- story: chatbot vs analyst (scroll-driven) ---------- */
var AISEG=[['CementCo is a leading cement maker with ',0],['strong fundamentals',1],['. Revenue has grown at a ',0],['healthy 12% CAGR',2],[', and the company is well placed to ',0],['benefit from India’s infrastructure push',3],['. With robust margins and a solid balance sheet, ',0],['the stock looks attractively valued for long-term investors',4],['.',0]];
var NOTES=['Which fundamentals? Not one number.','Price did the work. Volumes grew 4% a year.','Every cement stock says this. It is already in the 30× price.','Never checks capacity. The arithmetic says no.'];
var AILEN=AISEG.reduce(function(s,x){return s+x[0].length},0);
var NEED=65000*Math.pow(1.12,5)/12*10/1200;
function aiHtml(nc,hit){var out='',left=nc;AISEG.forEach(function(sg){if(left<=0)return;var t=sg[0].slice(0,left);left-=sg[0].length;out+=sg[1]?'<span class="cl'+(hit>=sg[1]?' hit':'')+'" data-n="'+sg[1]+'">'+esc(t)+(hit>=sg[1]?'<sup>'+sg[1]+'</sup>':'')+'</span>':esc(t)});return out+(nc<AILEN?'<span class="caret"></span>':'')}
function storyHtml(){
  return '<section class="story" id="story"><div class="story-pin"><h2 class="rv-h" id="rv-h">'+revealWords('Next, learn to check the answer.')+'<svg class="tailsvg" viewBox="0 0 260 120" aria-hidden="true"><path id="tail" pathLength="1" d="M4 112C70 110 120 96 160 70C196 46 214 20 236 22C254 24 256 48 238 54C222 60 214 44 226 38"/></svg></h2>'+
  '<div class="story-g"><div class="st-cap"><p class="sc on" data-s="0"><b>01</b>Ask a chatbot if CementCo is a buy at 30× earnings. It sounds like an analyst.</p><p class="sc" data-s="1"><b>02</b>Read it like one. Every line is either unfalsifiable or wrong.</p><p class="sc" data-s="2"><b>03</b>Now do the arithmetic. That is what we teach, and what AI skips.</p></div>'+
  '<div class="st-stage"><div class="chat" id="st-chat"><div class="chat-q"><span>You</span>Is CementCo a buy at 30× earnings?</div><div class="chat-a"><span class="chat-who">'+ico('spark')+'Chatbot</span><p id="st-ai">'+aiHtml(AILEN,0)+'</p><div class="notes" id="st-notes">'+NOTES.map(function(n,k){return '<p class="note" data-k="'+(k+1)+'"><b>'+(k+1)+'</b>'+n+'</p>'}).join('')+'</div><span class="stamp-slop">SLOP</span></div></div>'+
  '<div class="analyst" id="st-an"><div class="an-h">'+monkey('mk-xs')+'<div><b>The analyst’s version</b><span class="mono-s">CementCo · price check</span></div></div><p>At ₹65,000 crore, earning 12% a year means CementCo must sell <b>about '+Math.round(NEED)+' million tonnes</b> in year five. Its plants, including announced ones, make <b>40.5</b>.</p><div class="an-bars"><div><span>Price needs</span><i style="--w:100%"></i><b>'+NEED.toFixed(1)+' mt</b></div><div><span>Plants make</span><i class="ok" style="--w:'+(40.5/NEED*100).toFixed(1)+'%"></i><b>40.5 mt</b></div></div><p class="an-v"><b>Verdict:</b> the price assumes plants nobody has announced. Pass until the capex is.</p><a class="link" href="#lesson-'+PRICED_LESSON+'">Run this check yourself'+ico('arrow')+'</a></div></div></div></div></section>'}
var stKey=-1,stStep=-1;
function storyTick(){var s=$('story');if(!s)return;
  if(s.classList.contains('static')){if(stStep!==9){stStep=9;$('st-ai').innerHTML=aiHtml(AILEN,9);s.dataset.step='2';$$('.note',s).forEach(function(n){n.classList.add('on')});$$('.sc',s).forEach(function(n){n.classList.add('on')})}return}
  var r=s.getBoundingClientRect(),tot=s.offsetHeight-innerHeight,p=Math.max(0,Math.min(1,-r.top/(tot||1)));
  var step=p<.3?0:p<.64?1:2,nc=Math.round(Math.min(1,.18+p/.26)*AILEN),hit=step===0?0:Math.min(4,Math.floor((p-.3)/.3*5)+1);if(step===2)hit=4;
  var key=nc*10+hit;if(key!==stKey){stKey=key;$('st-ai').innerHTML=aiHtml(nc,hit)}
  $$('.note',s).forEach(function(n){n.classList.toggle('on',+n.dataset.k<=hit)});
  if(step!==stStep){stStep=step;s.dataset.step=step;$$('.sc',s).forEach(function(c){c.classList.toggle('on',+c.dataset.s===step)})}}
function setStoryMode(){var s=$('story');if(!s)return;s.classList.toggle('static',RM||innerWidth<900);stStep=-1;stKey=-1;storyTick()}
function showClear(){}

/* ---------- views ---------- */
var R={},A={};
/* ---------- landing: explainer ---------- */
var LA={rings:'<circle cx="32" cy="32" r="26"/><circle cx="32" cy="40" r="18"/><circle cx="32" cy="46" r="12"/><circle cx="32" cy="50" r="6"/>',
 gold:'<rect x="12" y="6" width="40" height="52"/><path d="M12 31h40M32 31v27M32 44h20M42 44v14M42 51h10"/><path d="M12 31A25 25 0 0 1 37 6M32 31a20 20 0 0 1 20 20"/>',
 globe:'<circle cx="32" cy="32" r="26"/><ellipse cx="32" cy="32" rx="12" ry="26"/><path d="M6 32h52M10 18h44M10 46h44"/><path d="M14 14l36 36M50 14 14 50" opacity=".4"/>',
 candles:'<path d="M14 18v32M30 10v40M46 22v26"/><rect x="9" y="24" width="10" height="16"/><rect x="25" y="16" width="10" height="20"/><rect x="41" y="28" width="10" height="12"/><path d="M6 56h52"/>',
 folder:'<path d="M8 16h18l5 6h25v32H8z"/><path d="M8 28h48"/><path d="M16 38h20M16 44h28"/>',
 mail:'<rect x="8" y="14" width="48" height="36" rx="3"/><path d="m8 18 24 18 24-18"/><path d="M8 50l18-16M56 50 38 34"/>',
 bell:'<path d="M6 50C18 50 22 14 32 14S46 50 58 50"/><path d="M32 14v36M20 50v-6M44 50v-6"/>',
 bars:'<path d="M8 56h48"/><rect x="12" y="36" width="8" height="20"/><rect x="26" y="26" width="8" height="30"/><rect x="40" y="16" width="8" height="40"/>',
 net:'<circle cx="16" cy="18" r="5"/><circle cx="46" cy="14" r="5"/><circle cx="32" cy="38" r="6"/><circle cx="14" cy="50" r="5"/><circle cx="50" cy="48" r="5"/><path d="M20 21l8 12M42 18l-7 15M28 42l-10 6M37 41l9 5"/>'};
function qviz(n){
  if(n==='tabs')return ['#2B9D79','#E9C46A','#E07A5F','#8AB6D6'].map(function(c,k){return '<i style="--c:'+c+';--k:'+k+'"></i>'}).join('');
  if(n==='daily')return '<span>?</span><span>?</span><span>?</span><em data-cd>'+untilNext()+'</em>';
  if(n==='spark')return '<svg viewBox="0 0 120 50" preserveAspectRatio="none"><path d="'+sparkPath(11,120,46,true)+'"/></svg><em>+3 pts</em>';
  if(n==='ff')return '<span class="n">'+ico('x')+'Flaw</span><span class="y">'+ico('check')+'Fine</span>';
  if(n==='term'){var g=GLOSSARY[DAY%GLOSSARY.length];return '<b>'+esc(g.t)+'</b><i></i><i></i>'}
  if(n==='stamp')return '<span class="stp">'+monkey('mk-stp')+'<em>₹0</em></span><span class="env"></span>';
  return ''}
function la(n){return '<svg class="la" viewBox="0 0 64 64" aria-hidden="true">'+LA[n]+'</svg>'}
var FI={
 dcf:'<path d="M3 20h18"/><rect x="4" y="9" width="3" height="11"/><rect x="9" y="11" width="3" height="9"/><rect x="14" y="13" width="3" height="7"/><path d="M21 5H6m0 0 3-2.5M6 5l3 2.5"/>',
 pnl:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h5M8 16h8"/><path d="M16 11.5v1"/>',
 wacc:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12l6.5 5.5"/>',
 cycle:'<path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3"/><path d="M18 3v3.7h-3.7M6 21v-3.7h3.7"/>',
 pct:'<path d="M18 6 6 18"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
 moat:'<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
 bank:'<path d="M3 9.5 12 4l9 5.5"/><path d="M4 20h16M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/>',
 factory:'<path d="M3 21V10l5 3V10l5 3V5h4l1 16z"/><path d="M3 21h18"/>',
 people:'<circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.5"/><path d="M2.5 20c.5-3.5 2.8-5.5 5.5-5.5s5 2 5.5 5.5M14 15c2.8-.6 6 .8 7 4.5"/>',
 cash:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v5M18 9.5v5"/>',
 spread:'<path d="M3 17c4-1 6-6 9-6s5 3 9 2"/><path d="M3 11c4-1 6-5 9-5s5 2 9 1" opacity=".55"/><path d="M15 8.5v4.5"/>',
 unit:'<path d="M20.5 13.5 13 21l-9-9V4h8z"/><circle cx="8.5" cy="8.5" r="1.5"/>'};
function fi(n){return '<svg class="fi-i" viewBox="0 0 24 24" aria-hidden="true">'+FI[n]+'</svg>'}
var VAST=[['DCF','dcf',6,16],['EBITDA','pnl',20,8],['WACC','wacc',34,18],['Working capital','cycle',62,10],['ROCE','pct',78,20],['Moats','moat',92,9],['Bank NIM','bank',8,74],['Capex cycles','factory',22,86],['Consensus','people',40,76],['Free cash flow','cash',60,86],['Credit spreads','spread',76,74],['Unit economics','unit',92,84]];
function vastHtml(){return '<section class="vast" id="vast"><div class="vast-pin"><h2 class="vast-t">Every number<br><span class="dim">has a story.</span></h2>'+VAST.map(function(v,k){return '<span class="vc" data-k="'+k+'" style="left:'+v[2]+'%;top:'+v[3]+'%">'+fi(v[1])+'<small>'+v[0]+'</small></span>'}).join('')+'</div></section>'}
function mapHtml(){var W=900,H=660,rx=70,ry=H/2,ax=330,lx=590,cols=['#4FD1A5','#F2C14E','#F2765E','#8AB6D6'],p='',t='',n=0,tot=LESSONS.length;
  MODULES.forEach(function(m,i){var ay=H*(i+.5)/MODULES.length,c=cols[i%4];
    p+='<path class="ml" style="--d:'+(i*120)+'ms" stroke="'+c+'" d="M'+rx+' '+ry+'C'+(rx+150)+' '+ry+','+(ax-150)+' '+ay+','+ax+' '+ay+'" pathLength="1"/>';
    m.l.forEach(function(k){var ly=18+n*(H-36)/(tot-1);n++;
      p+='<path class="ml leaf" style="--d:'+(500+n*35)+'ms" stroke="'+c+'" d="M'+ax+' '+ay+'C'+(ax+130)+' '+ay+','+(lx-130)+' '+ly+','+lx+' '+ly+'" pathLength="1"/>';
      var L=LESSONS[k-1].t;t+='<a href="#lesson-'+k+'"><circle class="mn" cx="'+lx+'" cy="'+ly+'" r="3.2" fill="'+c+'"/><text class="mt" x="'+(lx+12)+'" y="'+(ly+4)+'" style="--d:'+(600+n*35)+'ms">'+esc(L.length>40?L.slice(0,38)+'…':L)+'</text></a>'});
    t+='<a href="#roadmap-'+(i+1)+'"><circle class="an" cx="'+ax+'" cy="'+ay+'" r="6" fill="'+c+'"/><text class="at" x="'+ax+'" y="'+(ay-14)+'" text-anchor="middle">'+m.t+'</text></a>'});
  return '<section class="map" id="map"><div class="map-l" data-rv><h2>So we put it <span class="dim">in order.</span></h2><p class="lede">'+LESSONS.length+' lessons in '+MODULES.length+' archives, read in sequence. Every concept builds on the one before, so nothing is left as a black box.</p><a class="btn pri mag" href="#roadmap">Explore the curriculum'+ico('arrow')+'</a></div><div class="map-r"><svg class="mapsvg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Curriculum map"><g fill="none">'+p+'</g>'+t+'<g class="root"><circle cx="'+rx+'" cy="'+ry+'" r="34" class="rootc"/><svg x="'+(rx-28)+'" y="'+(ry-28)+'" width="56" height="56" viewBox="20 18 361 364">'+monkeyInner()+'</svg></g></svg></div></section>'}
function monkeyInner(){return '<circle class="mk-bg" cx="200" cy="200" r="168"/><path class="mk-b" fill-rule="evenodd" d="'+MK.body+'"/><path class="mk-b" d="'+MK.nose+'"/>'+MK.eyes.map(function(e){return '<circle class="mk-e" cx="'+e[0]+'" cy="'+e[1]+'" r="'+e[2]+'"/>'}).join('')}
function revealWords(t){return t.split(' ').map(function(w){return '<span class="rw">'+w+'</span>'}).join(' ')}
var ptab=0;
function practiseHtml(){return '<section class="prac"><div class="sec-h" data-rv><div><h2>Then practise <span class="dim">until it’s instinct.</span></h2><p class="lede">Read once, then answer until you stop needing to think.</p></div></div><div class="pt-card" data-rv><div class="pt-top"><div class="pt-tabs">'+['Question bank','Daily three','Speed round'].map(function(t,k){return '<button type="button" class="pt'+(k===ptab?' on':'')+'" data-ptab="'+k+'"><i>'+(k+1)+'</i>'+t+'</button>'}).join('')+'</div><a class="btn pri sm" id="pt-go" href="#practice">Open practice'+ico('arrow')+'</a></div><div class="pt-body" id="pt-body">'+ptBody()+'</div></div></section>'}
function ptBody(){
  if(ptab===2)return '<div class="pt-speed"><div><h3>60 seconds. As many as you can.</h3><p class="small">Percentages, growth and P/E, the arithmetic every interview opens with.</p></div><a class="btn ghost" href="#practice">Start a round'+ico('arrow')+'</a></div>';
  var ids=ptab===1?todays:[0,8,15,22,30,40].filter(function(i){return QS[i]});
  return '<div class="pt-list">'+ids.map(function(i){var q=QS[i],lv=PTS[q.d];return '<button type="button" class="pq" data-pq="'+i+'"><span><b>'+q.q.replace(/<[^>]+>/g,'')+'</b><small>'+q.t+'</small></span><i class="lv l'+lv+'"><em></em><em></em><em></em></i></button>'}).join('')+'</div>'}
var mg={i:0,s:0,n:0,st:0,best:store.get('mgbest',0),done:false};
function mgHtml(){return '<section class="exp"><div class="sec-h" data-rv><div><h2>Now put it <span class="dim">to the test.</span></h2><p class="lede">Twelve forecasts. Spot the ones the business could never deliver.</p></div><a class="btn ghost sm" href="#flaw">Open the full game'+ico('arrow')+'</a></div><div class="mg card" id="mg" data-rv></div></section>'}
function mgRender(){var el=$('mg');if(!el)return;var f=FLAWS[mg.i%FLAWS.length];
  el.innerHTML='<div class="mg-top"><div class="mg-tags"><span class="tag on">Flaw or fine</span><span class="tag">Case '+pad2(mg.i%FLAWS.length+1)+'</span></div><div class="mg-chips"><span>Score <b>'+mg.s+' / '+mg.n+'</b></span><span>Accuracy <b>'+(mg.n?Math.round(mg.s/mg.n*100):0)+'%</b></span><span>Streak <b>'+mg.st+'</b></span><span>Best <b>'+mg.best+'</b></span></div></div><p class="mg-q">'+f[0]+'</p>'+
  (mg.done?'<div class="mg-v '+(mg.ok?'ok':'no')+'"><b>'+(mg.ok?'Correct.':'Not quite.')+'</b> It’s '+(f[1]?'a flaw':'fine')+'. '+f[2]+'</div><button type="button" class="btn mg-next" id="mg-next">Next case'+ico('arrow')+'</button>':'<p class="mg-hint">Flaws are hard to spot because every number looks plausible on its own. That is the whole skill.</p><div class="mg-btns"><button type="button" class="mg-b no" data-mg="1">'+ico('x')+'Flaw</button><button type="button" class="mg-b yes" data-mg="0">'+ico('check')+'Fine</button></div>')}
function mgAnswer(saidFlaw,src){var f=FLAWS[mg.i%FLAWS.length];mg.ok=saidFlaw===f[1];mg.n++;if(mg.ok){mg.s++;mg.st++;if(mg.st>mg.best){mg.best=mg.st;store.set('mgbest',mg.best)}var r=src.getBoundingClientRect();confetti(r.left+r.width/2,r.top)}else mg.st=0;mg.done=true;mgRender()}
function faqHtml(){return '<section class="faq2"><div data-rv><h2>Before you <span class="dim">start.</span></h2><p class="lede">What it costs, where to start and how much time it takes.</p></div><div class="faq" data-rv>'+[['Is it free?','Yes. The lessons, practice, games and the Sunday Wrap are all free.'],['Do I need a finance background?','No. The first archive starts from how to read a profit and loss statement.'],['Who is behind it?','Practitioners, including CFA® charterholders and FRM® holders. Every lesson is checked against filings and textbooks, not generated.'],['How much time should I spend each day?','Ten minutes for the daily three keeps the habit. A lesson takes about eight. One a day finishes the curriculum in under a month.'],['How is this different from reading a textbook?','Every idea is tied to a real-looking company, a number you have to work out, and a check you can run. You practise judgment, not definitions.'],['Is any of this investment advice?','No. Companies in examples are invented, and nothing here recommends buying or selling a security.']].map(function(f){return '<details><summary>'+f[0]+'</summary><p>'+f[1]+'</p></details>'}).join('')+'</div></section>'}
function ctaHtml(){return '<section class="cta2" data-rv><div class="cta-l"><canvas class="cta-ascii" id="cta-ascii" aria-hidden="true"></canvas><h2>You’re ready when the numbers start talking.</h2><p>Start with the map. Read the archive. Prove it in practice.</p><div class="row"><a class="btn pri" href="#roadmap">Start learning'+ico('arrow')+'</a><a class="btn ghost" href="#roadmap">View curriculum</a></div></div><div class="cta-r">'+[[MODULES.length,'archives'],[LESSONS.length,'lessons'],[QS.length,'practice questions'],[GLOSSARY.length,'glossary terms'],[FLAWS.length,'forecast cases'],[3,'questions every morning']].map(function(s){return '<div><b data-count="'+s[0]+'">'+s[0]+'</b><span>'+s[1]+'</span></div>'}).join('')+'</div></section>'}
R.home=function(){
  return '<section class="qh"><canvas class="ascii" id="ascii" aria-hidden="true"></canvas><div class="qh-in"><h1 class="split">'+splitWords([['Finance, learned',0],['for real.',0]])+'</h1><p class="lede">CAGR Club takes you from your first balance sheet to the final-round interview: lessons in order, practice every day, and a club doing the same.</p><div class="row">'+joinBtn('xl')+'</div>'+creds()+'</div>'+
  '<div class="qcards">'+[['tabs','Curriculum',MODULES.length+' archives · '+LESSONS.length+' lessons','#roadmap'],['daily','Daily three','A short set, every morning','#daily'],['spark','Practice',QS.length+' questions · speed rounds','#practice'],['ff','Flaw or fine',FLAWS.length+' forecast cases','#flaw'],['term','Library',GLOSSARY.length+' terms · reading list','#library'],['stamp','The Sunday Wrap','Five minutes on the week, every Sunday','#signup']].map(function(c,k){return '<a class="qc" href="'+c[3]+'" data-rv style="--d:'+(k*70)+'ms"><div class="qv qv-'+c[0]+'">'+qviz(c[0])+'</div><b>'+c[1]+'</b><small>'+c[2]+'</small></a>'}).join('')+'</div></section>'+
  vastHtml()+'<section class="sec arch2"><div class="sec-h" data-rv><div><h2>We teach you <span class="dim">to read it.</span></h2><p class="lede">'+LESSONS.length+' lessons in '+MODULES.length+' archives, read in order, each one deep enough to defend in an interview.</p></div><a class="btn ghost mag" href="#roadmap">Open the curriculum'+ico('arrow')+'</a></div>'+folders()+'</section>'+storyHtml()+practiseHtml()+mgHtml()+faqHtml()+ctaHtml()};
A.home=function(target){countUp($('view'));magnet($('view'));setStoryMode();mgRender();asciiStart();ctaAscii();
  tilt($('view'));every(1000,function(){$$('[data-cd]').forEach(function(e){e.textContent=untilNext()})});
  homeTick();if(target)setTimeout(function(){scrollToEl($(target),80)},150)};
function homeTick(){var v=$('vast');if(v){var r=v.getBoundingClientRect(),tot=v.offsetHeight-innerHeight,p=Math.max(0,Math.min(1,-r.top/(tot||1)));
    v.querySelector('.vast-t').style.opacity=(1-p*.75).toFixed(3);v.querySelector('.vast-t').style.transform='scale('+(1-p*.06).toFixed(3)+')';
    $$('.vc',v).forEach(function(c,k){var q=Math.max(0,Math.min(1,p*2.2-k*.07));c.style.opacity=q.toFixed(3);c.style.transform='translateY('+((1-q)*90).toFixed(1)+'px) scale('+(.85+q*.15).toFixed(3)+')'})}
  var h=$('rv-h');if(h){var s=$('story').getBoundingClientRect(),ratio=Math.max(0,Math.min(1,(innerHeight*.95-s.top)/(innerHeight*.75))),ws=$$('.rw',h),n=Math.round(ratio*ws.length);ws.forEach(function(w,k){w.classList.toggle('lit',k<n)});var tl=$('tail');if(tl)tl.style.strokeDashoffset=(1-ratio).toFixed(3)}}

/* ascii monkey */
var asc={raf:0,last:0,chars:null};
function asciiStart(){var c=$('ascii');if(!c)return;cancelAnimationFrame(asc.raf);
  var host=c.parentNode,w=host.clientWidth,h=Math.min(host.clientHeight,innerHeight*1.05),dpr=Math.min(2,window.devicePixelRatio||1);c.width=w*dpr;c.height=h*dpr;c.style.height=h+'px';
  var g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  var cs=innerWidth<620?9:12,lh=cs*1.35,cols=Math.ceil(w/cs),rows=Math.ceil(h/lh);
  var size=Math.min(h*.92,w*(innerWidth<900?1.05:.52)),ox=innerWidth<900?w*.5-size*.5:w*.7-size*.5,oy=innerWidth<900?h*.18:h*.04,k=size/361;
  var off=document.createElement('canvas');off.width=cols;off.height=rows;var og=off.getContext('2d');og.setTransform(k/cs,0,0,k/lh,(ox-20*k)/cs,(oy-18*k)/lh);
  og.fillStyle='#000';og.fill(new Path2D(MK.body),'evenodd');og.fill(new Path2D(MK.nose));var mask=og.getImageData(0,0,cols,rows).data;
  var D='#$%@&8BWM',S='0123456789₹%.:+-',grid=[];for(var i=0;i<cols*rows;i++)grid.push(Math.random());
  var dark=themeNow()==='dark',inC=dark?'115,224,183':'30,133,102',outC=dark?'111,168,148':'60,100,85';
  function draw(t){g.clearRect(0,0,w,h);g.font='500 '+(cs*.92)+'px "Geist Mono",ui-monospace,monospace';g.textBaseline='top';
    var ex=MK.eyes.map(function(e){var cr=c.getBoundingClientRect(),cx=ox+(e[0]-20)*k,cy=oy+(e[1]-18)*k,dx=ptr.x-(cx+cr.left),dy=ptr.y-(cy+cr.top),d=Math.sqrt(dx*dx+dy*dy)||1,m=Math.min(e[2]*k*.55,d/30);return [cx+dx/d*m,cy+dy/d*m,e[2]*k*.62]});
    for(var y=0;y<rows;y++)for(var x=0;x<cols;x++){var idx=y*cols+x,v=grid[idx],inside=mask[idx*4+3]>100,px=x*cs,py=y*lh,eye=false;
      for(var e=0;e<2;e++){var ddx=px+cs/2-ex[e][0],ddy=py+lh/2-ex[e][1];if(ddx*ddx+ddy*ddy<ex[e][2]*ex[e][2])eye=true}
      var fade=Math.max(0,1-py/h*1.05)*(innerWidth<900?.45:1);
      if(eye){g.fillStyle=dark?'rgba(242,193,78,'+(.95*fade+.05)+')':'rgba(17,33,27,'+(.85*fade+.1)+')';g.fillText('@',px,py)}
      else if(inside){g.fillStyle='rgba('+inC+','+((.28+v*.45)*fade).toFixed(3)+')';g.fillText(D[(v*D.length)|0],px,py)}
      else if(v>.55){g.fillStyle='rgba('+outC+','+((v-.55)*.32*fade).toFixed(3)+')';g.fillText(S[(v*S.length*7|0)%S.length],px,py)}}}
  function loop(t){asc.raf=requestAnimationFrame(loop);if(t-asc.last<90)return;asc.last=t;var r=c.getBoundingClientRect();if(r.bottom<0)return;for(var i=0;i<grid.length*.035;i++)grid[(Math.random()*grid.length)|0]=Math.random();draw(t)}
  draw(0);if(!RM)asc.raf=requestAnimationFrame(loop)}
function ctaAscii(){var c=$('cta-ascii');if(!c)return;var w=c.parentNode.clientWidth,h=c.parentNode.clientHeight,dpr=Math.min(2,window.devicePixelRatio||1);c.width=w*dpr;c.height=h*dpr;var g=c.getContext('2d');g.scale(dpr,dpr);g.font='500 11px "Geist Mono",monospace';var S='0123456789₹%#$';
  for(var y=0;y<h;y+=15)for(var x=0;x<w;x+=10){var a=Math.max(0,(y/h-.35))*.5*Math.random();if(a>.02){g.fillStyle='rgba(180,240,215,'+a.toFixed(3)+')';g.fillText(S[(Math.random()*S.length)|0],x,y)}}}
function drawCandles(){asciiStart()}
/* newsletter */
function nlHtml(){var me=store.get('nl',null);
  return '<section class="nl" id="signup"><div class="nl-card" data-rv><div class="nl-g"><div class="nl-l"><h2>The week in Indian markets, <em>explained like an analyst would.</em></h2><p class="lede">What moved, the one number that mattered, and a chart worth saving. Five minutes, every Sunday morning. Your invite to the club comes with the first issue.</p>'+
  (me?'<div class="nl-done">'+ico('check')+'<span>You’re on the list as <b>'+esc(me)+'</b>. See you Sunday.</span></div>':'<form class="nl-f" id="nl-f" novalidate><label class="sr" for="nl-e">Email</label><input id="nl-e" type="email" autocomplete="email" placeholder="you@email.com" required><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn pri" type="submit">Get the wrap'+ico('arrow')+'</button></form><p class="small" id="nl-m">One email a week. No tips, no spam, unsubscribe any time.</p>')+'</div>'+
  '<div class="nl-r"><div class="stamp"><span class="st-mark">'+logoMark()+'</span><span class="st-v">₹0</span><span class="st-t">Sunday post</span></div><ol class="nl-toc"><li>What moved, and why</li><li>The one number that mattered</li><li>A chart worth saving</li><li>One question to sharpen you</li></ol></div></div></div></section>'}

function bindNl(){bindForm('nl')}
function bindForm(px){var f=$(px+'-f');if(!f||f.dataset.bound)return;f.dataset.bound=1;f.addEventListener('submit',function(e){e.preventDefault();var inp=$(px+'-e'),em=inp.value.trim(),m=$(px+'-m'),b=f.querySelector('button');
  if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(em)){m.textContent='That email does not look right.';m.className='small bad';inp.focus();return}
  b.disabled=true;m.className='small';m.textContent='Adding you…';
  fetch('/api/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:em,website:f.website.value,src:px})}).then(function(r){return r.json().then(function(j){return {s:r.status,j:j}})}).then(function(x){
    if(x.s===200&&x.j.ok){store.set('nl',em);var r=f.getBoundingClientRect();confetti(r.left+r.width/2,r.top);f.outerHTML='<div class="nl-done">'+ico('check')+'<span>You’re in as <b>'+esc(em)+'</b>. Your invite is on its way.</span></div>';if(m)m.remove()}
    else if(x.s===400){m.textContent='That email does not look right.';m.className='small bad';b.disabled=false}
    else throw 0}).catch(function(){m.textContent='Sign-ups open in a few days. Please try again soon.';m.className='small bad';b.disabled=false})})}
function formHtml(px,btn){return '<form class="nl-f" id="'+px+'-f" novalidate><label class="sr" for="'+px+'-e">Email</label><input id="'+px+'-e" type="email" autocomplete="email" placeholder="you@example.com" required><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn pri sm" type="submit">'+btn+'</button></form><p class="small" id="'+px+'-m"></p>'}
function openJoin(){var me=store.get('nl',null),j=$('jm');if(!j){j=document.createElement('div');j.id='jm';j.className='jm';document.body.appendChild(j);j.addEventListener('click',function(e){if(e.target===j||e.target.closest('#jm-x'))closeJoin()})}
  j.innerHTML='<div class="jm-card" role="dialog" aria-modal="true" aria-label="Join the club"><button class="ibtn" id="jm-x" type="button" aria-label="Close">'+ico('x')+'</button>'+monkey('mk-jm')+'<h3>Join the club</h3><p>Leave your email and we’ll send your invite, plus the Sunday Wrap: what moved in markets, the number that mattered, and a chart worth saving.</p>'+(me?'<div class="nl-done">'+ico('check')+'<span>You’re already in as <b>'+esc(me)+'</b>.</span></div>':formHtml('jm','Get my invite'))+'<p class="jm-n">Free. One email a week. Unsubscribe any time.</p></div>';
  j.hidden=false;document.body.classList.add('modal-open');if(lenis)lenis.stop();bindForm('jm');setTimeout(function(){var i=$('jm-e');if(i)i.focus()},80);eyeReq()}
function closeJoin(){var j=$('jm');if(j)j.hidden=true;document.body.classList.remove('modal-open');if(lenis)lenis.start()}

R.roadmap=function(){var n=lessonCount(),tot=LESSONS.length,pc=n/tot,C=2*Math.PI*70;
  return '<section class="rm-head"><div class="sec" style="gap:18px"><h1>Equity research, <em>in depth.</em></h1><p class="lede">Four archives, read in order: the statements, the business, the valuation, and the sector. Each goes deep enough that you could defend the numbers in an interview.</p><div class="row"><a class="btn pri mag" href="#lesson-'+nextLesson()+'">'+(n?'Continue reading':'Start the first lesson')+ico('arrow')+'</a></div></div><div class="ring"><svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="70" fill="none" stroke="var(--raised)" stroke-width="8"/><circle cx="80" cy="80" r="70" fill="none" stroke="var(--acc)" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-pc))+'"/></svg><div><b>'+Math.round(pc*100)+'%</b><span>read</span></div></div></section>'+
  folders()+
  '<section class="mods">'+MODULES.map(function(m,i){
    return '<div class="module" id="mod-'+(i+1)+'" data-rv><span class="m-n">'+(i+1)+'</span><div class="m-b"><h2>'+m.t+'</h2><p>'+m.d+'</p><div class="ls">'+m.l.map(function(k){var L=LESSONS[k-1];return '<a class="l'+(done[k]?' done':'')+'" href="#lesson-'+k+'"><span class="k">'+(done[k]?ico('check'):k)+'</span><span><b>'+L.t+'</b><small>'+L.sum+'</small></span></a>'}).join('')+'</div></div></div>'}).join('')+'</section>'+
  '<p class="small soon-note">Risk, investment banking and private equity tracks come later. Equity research first, done properly.</p>'};
A.roadmap=function(open){tilt($('view'));magnet($('view'));if(open){var el=$('mod-'+open);if(el)setTimeout(function(){scrollToEl(el)},80)}};

R.lesson=function(k){var n=+k,L=LESSONS[n-1];if(!L)return R.roadmap();var mi=modOf(n),rail='',body='';
  L.secs.forEach(function(s,i){body+='<h2 id="s'+i+'">'+s[0]+'</h2><p>'+s[1]+'</p>';rail+='<button type="button" data-jump="s'+i+'">'+s[0]+'</button>'});
  if(L.w){body+='<h2 id="sw">Try it</h2><div class="card pad" id="lw"></div>';rail+='<button type="button" data-jump="sw">Try it</button>'}
  rail+='<button type="button" data-jump="se">Worked example</button><button type="button" data-jump="sc">Check yourself</button>';
  return '<div class="lesson"><article><div class="crumbs"><a href="#roadmap">Roadmap</a><span>/</span><a href="#roadmap-'+(mi+1)+'">'+pad2(mi+1)+' · '+MODULES[mi].t+'</a></div><p class="mono-s">LESSON '+pad2(n)+' OF '+LESSONS.length+' · ABOUT '+L.min+' MIN</p><h1 class="big-serif">'+L.t+'</h1><p class="lede">'+L.sum+'</p><div class="key">'+L.key+'</div>'+body+
  '<h2 id="se">Worked example</h2><div class="worked">'+L.ex+'</div><h2 id="sc">Check yourself</h2><div class="reveal"><p>'+L.cq+'</p><div id="ca"><button class="btn ghost sm" type="button" id="ca-b">Reveal the answer</button></div></div>'+
  '<div class="done-row"><span>'+(done[n]?'You finished this lesson.':'Finished reading?')+'</span><button class="btn sm '+(done[n]?'ghost':'pri')+'" type="button" data-done="'+n+'">'+(done[n]?'Mark as not done':'Mark complete')+'</button></div>'+
  '<nav class="pn">'+(n>1?'<a href="#lesson-'+(n-1)+'"><small>Previous</small>'+LESSONS[n-2].t+'</a>':'<span></span>')+(n<LESSONS.length?'<a href="#lesson-'+(n+1)+'"><small>Next</small>'+LESSONS[n].t+'</a>':'<a href="#practice"><small>Next</small>Test yourself in practice</a>')+'</nav></article><aside class="rail"><p class="mono-s">ON THIS PAGE</p>'+rail+'</aside></div>'};
A.lesson=function(k){var L=LESSONS[+k-1];if(!L)return;if(L.w)MOUNT[L.w]($('lw'));$('ca-b').addEventListener('click',function(){$('ca').innerHTML='<p style="font-weight:500">'+L.ca+'</p>'});spy()};

/* ---------- practice ---------- */
var px={topic:'All',diff:'All',show:'All',cur:null,dir:1};
function topics(){var o=[];QS.forEach(function(q){if(o.indexOf(q.t)<0)o.push(q.t)});return o}
function pxList(){return QS.map(function(_,i){return i}).filter(function(i){var q=QS[i],a=ans[i];return (px.topic==='All'||q.t===px.topic)&&(px.diff==='All'||q.d===px.diff)&&(px.show==='All'||(px.show==='New'&&!a)||(px.show==='Missed'&&a&&!a.ok))})}
function book(){var keys=Object.keys(ans).filter(function(k){return QS[k]}).sort(function(a,b){return (ans[a].t||0)-(ans[b].t||0)}),pts=0,ok=0,series=[0];keys.forEach(function(k){if(ans[k].ok){ok++;pts+=PTS[QS[k].d]}series.push(pts)});
  var best=null,bv=-1;topics().forEach(function(t){var tot=0,c=0;QS.forEach(function(q,i){if(q.t===t){tot++;if(ans[i]&&ans[i].ok)c++}});if(c>0&&c/tot>bv){bv=c/tot;best=t}});
  return {n:keys.length,ok:ok,pts:pts,series:series,best:best}}
function pxStats(){var b=book(),max=QS.reduce(function(s,q){return s+PTS[q.d]},0),W=240,H=48,s=b.series,mx=Math.max(4,s[s.length-1]),acc=b.n?Math.round(b.ok/b.n*100):0,C=2*Math.PI*20;
  var path=s.map(function(v,k){return (k?'L':'M')+(s.length>1?k/(s.length-1)*W:0).toFixed(1)+' '+(H-3-v/mx*(H-8)).toFixed(1)}).join('');
  return '<div class="pst"><span class="mono-s">ANSWERED</span><b>'+b.n+'<small>/'+QS.length+'</small></b><span class="pbar"><i style="width:'+(b.n/QS.length*100)+'%"></i></span></div>'+
  '<div class="pst acc"><div><span class="mono-s">ACCURACY</span><b>'+acc+'<small>%</small></b></div><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="none" stroke="var(--raised)" stroke-width="5"/><circle cx="24" cy="24" r="20" fill="none" stroke="var(--pos)" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-acc/100))+'" transform="rotate(-90 24 24)"/></svg></div>'+
  '<div class="pst wide"><div><span class="mono-s">POINTS</span><b>'+b.pts+'<small>/'+max+'</small></b></div><svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true"><path d="'+path+(s.length>1?'L'+W+' '+H+'L0 '+H+'Z':'')+'" class="area"/><path d="'+path+'" class="ln"/></svg></div>'+
  '<div class="pst"><span class="mono-s">STRONGEST</span><b class="sm">'+(b.best||'Not yet')+'</b><span class="mono-s">STREAK '+streakNow()+'</span></div>'}
function pxSide(){var tp=topics();function cnt(t){var tot=0,c=0;QS.forEach(function(q,i){if(t==='All'||q.t===t){tot++;if(ans[i]&&ans[i].ok)c++}});return [c,tot]}
  return '<p class="mono-s">TOPICS</p><div class="tps">'+['All'].concat(tp).map(function(t){var c=cnt(t);return '<button type="button" class="tp'+(px.topic===t?' on':'')+'" data-tp="'+t+'"><span>'+(t==='All'?'All topics':t)+'</span><b>'+c[0]+'/'+c[1]+'</b><i style="--p:'+(c[0]/c[1]*100)+'%"></i></button>'}).join('')+'</div>'+
  '<p class="mono-s">DIFFICULTY</p><div class="seg">'+['All','Easy','Medium','Hard'].map(function(d){return '<button type="button" data-pd="'+d+'"'+(d===px.diff?' class="on"':'')+'>'+d+'</button>'}).join('')+'</div>'+
  '<p class="mono-s">SHOW</p><div class="seg">'+[['All','All'],['New','Unanswered'],['Missed','Missed']].map(function(d){return '<button type="button" data-ps="'+d[0]+'"'+(d[0]===px.show?' class="on"':'')+'>'+d[1]+'</button>'}).join('')+'</div>'+
  '<button class="link rnd" type="button" id="p-rand">'+ico('spark')+'Surprise me</button>'}
function pxDesk(){var list=pxList();
  if(!list.length)return '<div class="desk-empty"><h3 class="mid-serif">Nothing here.</h3><p class="small">No questions match these filters. '+(px.show==='Missed'?'You have not missed any yet.':'Try another topic or difficulty.')+'</p></div>';
  if(px.cur==null||list.indexOf(px.cur)<0){px.cur=list.filter(function(i){return !ans[i]})[0];if(px.cur==null)px.cur=list[0]}
  var i=px.cur,q=QS[i],a=ans[i],pos=list.indexOf(i);
  return '<div class="desk-in '+(a?(a.ok?'ok':'no'):'')+(px.dir<0?' back':'')+'"><div class="desk-top"><span class="qnum">'+pad2(i+1)+'</span><div class="tags"><span class="tag">'+q.t+'</span><span class="tag d-'+q.d+'">'+q.d+' · '+PTS[q.d]+' pt'+(PTS[q.d]>1?'s':'')+'</span>'+(a?'<span class="tag '+(a.ok?'t-ok':'t-no')+'">'+(a.ok?'Correct':'Missed')+'</span>':'')+'</div></div>'+
  '<div class="desk-body">'+qBody(i)+'</div><div class="desk-f"><button class="btn ghost sm" type="button" data-pxnav="-1"'+(pos<=0?' disabled':'')+'>'+ico('left')+'Prev</button><span class="kh mono-s">'+(q.type==='mcq'?'A–D TO PICK':'ENTER TO CHECK')+' · ← → TO MOVE</span><button class="btn '+(a?'pri':'ghost')+' sm" type="button" data-pxnav="1"'+(pos>=list.length-1?' disabled':'')+'>'+(a?'Next':'Skip')+ico('arrow')+'</button></div></div>'}
function pxDots(){var list=pxList();return list.map(function(i){var a=ans[i];return '<button type="button" class="qd '+(a?(a.ok?'ok':'no'):'')+(i===px.cur?' cur':'')+'" data-pxgo="'+i+'" title="Q'+(i+1)+' · '+esc(QS[i].t)+'"></button>'}).join('')}
R.practice=function(){return '<section class="px"><div class="px-head"><h1>Reps, <em>not reading.</em></h1><p class="lede">One question at a time, each with one exact answer and the full working. Pick an answer before you peek. That is the habit AI cannot build for you.</p></div><div class="pstats" id="pstats">'+pxStats()+'</div>'+
  '<div class="px-g"><aside class="px-side" id="pside">'+pxSide()+'</aside><div class="px-main"><div class="desk" id="desk">'+pxDesk()+'</div><div class="qdots" id="qdots">'+pxDots()+'</div></div></div></section><section class="card pad" id="drill"></section><div class="row" style="justify-content:flex-end"><button class="link" type="button" id="q-reset">Reset my answers</button></div>'};
A.practice=function(){mountDrill($('drill'));$('q-reset').addEventListener('click',function(){ans={};store.set('ans',ans);pxRefresh(true);syncStreak();toast('Answers cleared')})};
function pxRefresh(all){if(!$('desk'))return;$('desk').innerHTML=pxDesk();$('qdots').innerHTML=pxDots();if(all!==false){$('pstats').innerHTML=pxStats();$('pside').innerHTML=pxSide()}}
function pxMove(d){var list=pxList(),p=list.indexOf(px.cur)+d;if(list[p]==null)return;px.cur=list[p];px.dir=d;pxRefresh(false);var f=$('desk').querySelector('input:not([disabled])');if(f&&FINE)f.focus()}
onAnswered.push(function(i){if($('desk')&&px.cur===i)pxRefresh(true)});

/* ---------- daily ---------- */
function placard(i,k){var q=QS[i],a=ans[i];
  var front='<div class="pf"><div class="pf-top"><span class="tag">Q'+(k+1)+'</span><span class="tag">'+q.t+'</span><span class="tag d-'+q.d+'">'+q.d+'</span></div>'+qBody(i)+'</div>';
  var back=a?'<div class="pb '+(a.ok?'ok':'no')+'"><div class="pb-mark"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34"/>'+(a.ok?'<path d="M24 41l11 11 21-24"/>':'<path d="M27 27l26 26M53 27 27 53"/>')+'</svg></div><span class="pb-k">Q'+(k+1)+' · '+q.t+'</span><h3>'+(a.ok?'Correct':'Missed it')+'</h3><p class="pb-pts">'+(a.ok?'+'+PTS[q.d]+' pts':'0 pts')+'</p><p class="pb-a"><span>Answer</span>'+esc(fmtAns(q))+'</p><p class="pb-s">'+q.s+'</p></div>':'';
  return '<div class="flip'+(a?' on':'')+'" id="pl-'+i+'"><div class="fi">'+front+back+'</div></div>'}
function scoreCard(){var n=todays.filter(function(i){return ans[i]}).length;if(n<3)return '';var c=todays.filter(function(i){return ans[i].ok}).length,pts=todays.reduce(function(s,i){return s+(ans[i].ok?PTS[QS[i].d]:0)},0);
  return '<div class="scorecard" id="scorecard"><div class="sc-l"><span class="mono-s">DAILY #'+dailyNo()+' · COMPLETE</span><h2 class="big-serif">'+c+' of 3</h2><div class="sq big">'+todays.map(function(i){return '<i class="'+(ans[i].ok?'ok':'no')+'"></i>'}).join('')+'</div><p>'+pts+' points today · Next set in <b data-cd>'+untilNext()+'</b></p></div><div class="sc-r"><div class="sc-flame">'+ico('flame')+'<b>'+streakNow()+'</b><span>day streak</span></div><button class="btn pri" type="button" id="d-share">Copy my result</button></div></div>'}
R.daily=function(){var term=GLOSSARY[DAY%GLOSSARY.length];
  return '<section class="sec">'+mono('DAILY #'+dailyNo(),new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'}).toUpperCase())+'<div class="daily-h"><div class="sec" style="gap:12px"><h1 class="big-serif">Today’s <em>three.</em></h1><p class="lede">Same three for everyone. Answer a card and it flips into your placard. Finish all three to keep your streak.</p></div><div class="next-in"><span class="mono-s">NEXT SET IN</span><b data-cd>'+untilNext()+'</b></div></div><div class="placards">'+todays.map(placard).join('')+'</div><div id="sc-slot">'+scoreCard()+'</div>'+
  '<div class="card term-day">'+eyebrow('Term of the day')+'<h3 class="mid-serif">'+term.t+'</h3><p>'+term.d+'</p>'+(term.f?'<code class="fx">'+term.f+'</code>':'')+'<a class="link" href="#library">Open the glossary'+ico('arrow')+'</a></div></section>'};
A.daily=function(){every(1000,function(){$$('[data-cd]').forEach(function(e){e.textContent=untilNext()})});bindShare()};
function bindShare(){var b=$('d-share');if(b)b.addEventListener('click',function(){var txt='CAGR Club Daily #'+dailyNo()+'  '+todays.map(function(i){return ans[i].ok?'🟩':'🟥'}).join('')+'\nStreak: '+streakNow()+'\ncagrclub.com';try{navigator.clipboard.writeText(txt).then(function(){toast('Copied. Paste it anywhere.')},function(){toast(txt)})}catch(e){toast(txt)}})}
onAnswered.push(function(i){var el=$('pl-'+i);if(!el)return;var k=todays.indexOf(i),tmp=document.createElement('div');tmp.innerHTML=placard(i,k);var nw=tmp.firstChild;nw.classList.remove('on');el.replaceWith(nw);void nw.offsetWidth;requestAnimationFrame(function(){requestAnimationFrame(function(){nw.classList.add('on')})});
  if(todays.every(function(x){return ans[x]})){setTimeout(function(){if(!$('sc-slot'))return;$('sc-slot').innerHTML=scoreCard();bindShare();var s=$('scorecard');if(s){scrollToEl(s,140);var r=s.getBoundingClientRect();confetti(r.left+r.width/2,r.top+40)}},900)}});

/* ---------- flaw or fine ---------- */
var fz={i:0,right:0,res:[]};
R.flaw=function(){return '<section class="flaw-page">'+mono('GAME',FLAWS.length+' CASES')+'<div class="sec" style="gap:14px;max-width:660px;align-items:center;text-align:center"><h1 class="big-serif">Flaw <em>or fine?</em></h1><p class="lede">A forecast lands on your desk. Could the business really do this? Drag the card left for flaw or right for fine, or use the buttons or arrow keys.</p></div><div class="fz-score" id="fz-score"></div><div class="deck" id="deck"></div><div class="fz-btns"><button class="fz-b no" type="button" id="fz-no">'+ico('x')+'Flaw</button><button class="fz-b yes" type="button" id="fz-yes">'+ico('check')+'Fine</button></div><div id="fz-res" class="fz-res"></div></section>'};
A.flaw=function(){fz={i:0,right:0,res:[]};$('fz-res').innerHTML='';renderDeck();$('fz-no').onclick=function(){decide(true)};$('fz-yes').onclick=function(){decide(false)}};
function renderDeck(){var d=$('deck');if(!d)return;$('fz-score').innerHTML='<span class="mono-s">CASE '+pad2(Math.min(fz.i+1,FLAWS.length))+' / '+FLAWS.length+'</span><span class="dots">'+FLAWS.map(function(_,k){return '<i class="'+(fz.res[k]===true?'ok':fz.res[k]===false?'no':k===fz.i?'cur':'')+'"></i>'}).join('')+'</span><span class="mono-s">'+fz.right+' RIGHT</span>';
  if(fz.i>=FLAWS.length){d.innerHTML='<div class="fcard end"><h2 class="big-serif">'+fz.right+' of '+FLAWS.length+'</h2><p>'+(fz.right>=10?'Sharp. You would catch most broken models before they reach a client.':fz.right>=7?'Solid. Revisit the ones you missed in the modelling archive.':'Worth another round. The modelling archive covers how drivers break.')+'</p><button class="btn pri" type="button" id="fz-again">Play again</button></div>';$('fz-again').addEventListener('click',A.flaw);$('fz-no').disabled=$('fz-yes').disabled=true;if(fz.right>=7){var r=d.getBoundingClientRect();confetti(r.left+r.width/2,r.top+60)}return}
  $('fz-no').disabled=$('fz-yes').disabled=false;
  var h='';for(var k=Math.min(FLAWS.length-1,fz.i+2);k>=fz.i;k--){h+='<div class="fcard'+(k===fz.i?' top':' under u'+(k-fz.i))+'"'+(k===fz.i?' id="fz-top"':'')+'><span class="mono-s">CASE '+pad2(k+1)+'</span><p>'+FLAWS[k][0]+'</p><span class="fc-hint mono-s">← FLAW · FINE →</span><div class="stamp no">FLAW</div><div class="stamp yes">FINE</div></div>'}
  d.innerHTML=h;drag($('fz-top'))}
function drag(c){if(!c)return;var sx=0,dx=0,on=false;
  c.addEventListener('pointerdown',function(e){on=true;sx=e.clientX;dx=0;try{c.setPointerCapture(e.pointerId)}catch(_){}c.style.transition='none'});
  c.addEventListener('pointermove',function(e){if(!on)return;dx=e.clientX-sx;c.style.transform='translateX('+dx+'px) rotate('+dx/18+'deg)';c.style.setProperty('--no',Math.max(0,-dx/120));c.style.setProperty('--yes',Math.max(0,dx/120))});
  var up=function(){if(!on)return;on=false;c.style.transition='';if(Math.abs(dx)>110)decide(dx<0);else{c.style.transform='';c.style.setProperty('--no',0);c.style.setProperty('--yes',0)}};
  c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up)}
function decide(saidFlaw){if(fz.i>=FLAWS.length||fz.lock)return;var f=FLAWS[fz.i],ok=saidFlaw===f[1],c=$('fz-top');fz.lock=true;fz.res[fz.i]=ok;if(ok)fz.right++;
  if(c){c.style.transition='transform .45s cubic-bezier(.3,.7,.3,1),opacity .45s';c.style.setProperty(saidFlaw?'--no':'--yes',1);c.style.transform='translateX('+(saidFlaw?-1:1)*700+'px) rotate('+(saidFlaw?-24:24)+'deg)';c.style.opacity='0'}
  $('fz-res').innerHTML='<div class="fz-v '+(ok?'ok':'no')+'"><b>'+(ok?'Correct.':'Not quite.')+'</b> Case '+(fz.i+1)+' is '+(f[1]?'a flaw':'fine')+'. '+f[2]+'</div>';
  if(ok&&c){var r=c.getBoundingClientRect();confetti(r.left+r.width/2,r.top+r.height/2)}
  setTimeout(function(){fz.i++;fz.lock=false;renderDeck()},RM?50:430)}

/* ---------- library ---------- */
var gQ='',gCat='All',rType='All';
function libTabs(on){return '<div class="seg lib-tabs">'+[['library','Glossary'],['reading','Reading list']].map(function(t){return '<a href="#'+t[0]+'"'+(t[0]===on?' class="on"':'')+'>'+t[1]+'</a>'}).join('')+'</div>'}
function gFilter(){return GLOSSARY.filter(function(g){return (gCat==='All'||g.c===gCat)&&(!gQ||(g.t+' '+g.d+' '+(g.f||'')).toLowerCase().indexOf(gQ)>-1)}).sort(function(a,b){return a.t.localeCompare(b.t)})}
function gHtml(){var list=gFilter(),by={},letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');list.forEach(function(g){var L=g.t[0].toUpperCase();(by[L]=by[L]||[]).push(g)});
  $('az').innerHTML=letters.map(function(L){return by[L]?'<button type="button" data-az="'+L+'">'+L+'</button>':'<span>'+L+'</span>'}).join('');
  $('g-n').textContent=list.length+' of '+GLOSSARY.length+' terms';
  $('g-l').innerHTML=list.length?letters.filter(function(L){return by[L]}).map(function(L){return '<div class="g-grp" id="az-'+L+'"><span class="g-L">'+L+'</span><div class="g-items">'+by[L].map(function(g){return '<article class="g-i"><div class="g-h"><h3>'+g.t+'</h3><span class="tag">'+g.c+'</span></div><p>'+g.d+'</p>'+(g.f?'<code class="fx">'+g.f+'</code>':'')+(g.l?'<a class="link" href="#lesson-'+g.l+'">Lesson '+g.l+': '+LESSONS[g.l-1].t+ico('arrow')+'</a>':'')+'</article>'}).join('')+'</div></div>'}).join(''):'<p class="small">No terms match. Try a shorter word or another category.</p>'}
R.library=function(){var cats=['All'];GLOSSARY.forEach(function(g){if(cats.indexOf(g.c)<0)cats.push(g.c)});var td=GLOSSARY[DAY%GLOSSARY.length];
  return '<section class="sec">'+mono('LIBRARY',GLOSSARY.length+' TERMS / '+LINKS.length+' READS')+'<h1 class="big-serif">The analyst’s <em>dictionary.</em></h1><p class="lede">Every term you will meet on the desk, in one plain sentence, with the formula where there is one and a link to the lesson that teaches it.</p>'+libTabs('library')+
  '<div class="gl-top"><div class="card term-day hero-term">'+eyebrow('Term of the day')+'<h3 class="mid-serif">'+td.t+'</h3><p>'+td.d+'</p>'+(td.f?'<code class="fx">'+td.f+'</code>':'')+'</div><div class="gl-stats">'+cats.slice(1).map(function(c){var n=GLOSSARY.filter(function(g){return g.c===c}).length;return '<button type="button" class="gs" data-gcat="'+c+'"><b>'+n+'</b><span>'+c+'</span></button>'}).join('')+'</div></div>'+
  '<div class="gl-bar"><input class="field" id="g-s" type="search" placeholder="Search '+GLOSSARY.length+' terms" aria-label="Search terms" value="'+esc(gQ)+'"><div class="chips">'+cats.map(function(c){return '<button type="button" class="chip'+(c===gCat?' on':'')+'" data-gc="'+c+'">'+c+'</button>'}).join('')+'</div><div class="az" id="az"></div><span class="mono-s" id="g-n"></span></div><div id="g-l"></div></section>'};
A.library=function(){gHtml();$('g-s').addEventListener('input',function(){gQ=this.value.trim().toLowerCase();gHtml()})};
R.reading=function(){var types=['All'];LINKS.forEach(function(l){if(types.indexOf(l.type)<0)types.push(l.type)});
  return '<section class="sec">'+mono('LIBRARY','READING LIST')+'<h1 class="big-serif">Reading <em>list.</em></h1><p class="lede">Articles, research papers, books and data sources worth your time, each with a line on why.</p>'+libTabs('reading')+'<div class="chips">'+types.map(function(t){return '<button type="button" class="chip'+(t===rType?' on':'')+'" data-rt="'+t+'">'+t+'</button>'}).join('')+'</div><div class="reads" id="r-l"></div></section>'};
function rHtml(){$('r-l').innerHTML=LINKS.filter(function(l){return rType==='All'||l.type===rType}).map(function(l){var host='';try{host=new URL(l.url).hostname.replace(/^www\./,'')}catch(e){}var tk={'Article':0,'Research paper':1,'Book':2,'Data':3,'Regulator':1}[l.type]||0;return '<a class="read tilt" href="'+esc(l.url)+'" target="_blank" rel="noopener" data-cur="Read"><div class="read-top"><span class="rtype t'+tk+'">'+esc(l.type)+'</span><span class="mono-s">'+esc((l.level||'').toUpperCase())+'</span></div><h3 class="mid-serif">'+esc(l.title)+'</h3><p>'+esc(l.note)+'</p><div class="read-f"><span>'+esc(l.src)+(host?' · '+host:'')+'</span>'+ico('ext')+'</div></a>'}).join('');tilt($('r-l'))}
A.reading=rHtml;
R.memos=function(){return '<section class="sec">'+mono('LIBRARY','MEMOS')+'<h1 class="big-serif">Memos.</h1><p class="lede">Short notes, one idea each.</p>'+libTabs('memos')+'<div class="memos">'+MEMOS.map(function(m,k){return '<article class="card memo"><span class="memo-n">'+pad2(k+1)+'</span><h3 class="mid-serif">'+m[0]+'</h3><p>'+m[1]+'</p></article>'}).join('')+'</div></section>'};

/* ---------- footer ---------- */
function renderFoot(){var me=store.get('nl',null);$('foot').innerHTML='<div class="ft"><div class="ft-brand"><div class="ft-mk">'+monkey('mk-ft',true)+'</div>'+monkey('mk-logo')+'<b>Learn finance, for free.</b><span class="small">Questions or ideas? Say hello in the club.</span></div><div class="ft-main"><div class="ft-cols"><div><b>Explore</b><a href="#daily">Daily</a><a href="#flaw">Flaw or fine</a></div><div><b>Learn</b><a href="#roadmap">Curriculum</a><a href="#practice">Practice</a><a href="#library">Glossary</a></div><div><b>More</b><a href="#reading">Reading list</a><a href="'+inviteHref()+'">Join the club</a></div></div><div class="ft-nl" id="signup"><b>The Sunday Wrap</b><p class="small">What moved, the number that mattered, and a chart worth saving. Every Sunday. No spam.</p>'+(me?'<div class="nl-done">'+ico('check')+'<span>You’re on the list as <b>'+esc(me)+'</b>.</span></div>':'<form class="nl-f" id="nl-f" novalidate><label class="sr" for="nl-e">Email</label><input id="nl-e" type="email" autocomplete="email" placeholder="you@example.com" required><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn pri sm" type="submit">Subscribe</button></form><p class="small" id="nl-m"></p>')+'</div><p class="foot-legal">Education only, not investment advice. Companies in examples are invented. CFA® and Chartered Financial Analyst® are trademarks owned by CFA Institute. FRM® is a trademark of GARP. Neither organisation endorses or is affiliated with CAGR Club.</p></div></div>';bindNl()}
/* ---------- shell ---------- */
document.querySelector('.logo').innerHTML=logoMark()+'<span class="wm">CAGR<i>club</i></span>';
renderFoot();$('bgmk').innerHTML=monkey('mk-bgm',true);
$('nav').innerHTML=NAV.map(function(n){return '<a href="#'+n[0]+'" data-nav="'+n[0]+'">'+ico(n[2])+n[1]+'</a>'}).join('');
$('tabs').innerHTML=[['home','Home','home']].concat(NAV.slice(0,4)).map(function(n){return '<a href="#'+n[0]+'" data-nav="'+n[0]+'">'+ico(n[2])+n[1].replace('Flaw or fine','Flaw')+'</a>'}).join('');
$('find').innerHTML=ico('search')+'<span>Search</span><kbd>'+(/Mac|iPhone|iPad/.test(navigator.platform||'')?'⌘K':'Ctrl K')+'</kbd>';
$('totop').innerHTML='<svg class="tt-ring" viewBox="0 0 60 60"><circle cx="30" cy="30" r="27"/><circle id="tt-p" cx="30" cy="30" r="27" stroke-dasharray="169.6" stroke-dashoffset="169.6" transform="rotate(-90 30 30)"/></svg>'+ico('up');
$('totop').addEventListener('click',function(){if(lenis)lenis.scrollTo(0);else window.scrollTo({top:0,behavior:RM?'auto':'smooth'})});
function themeNow(){return document.documentElement.getAttribute('data-theme')||'dark'}
function themeIcon(){$('theme').innerHTML=ico(themeNow()==='dark'?'sun':'moon')}
themeIcon();
$('theme').addEventListener('click',function(){var nx=themeNow()==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',nx);store.set('theme3',nx);themeIcon();drawCandles()});
window.addEventListener('resize',function(){clearTimeout(drawCandles.t);drawCandles.t=setTimeout(function(){drawCandles();setStoryMode();},150)});

/* custom cursor */
if(FINE&&!RM){var cur=$('cur'),cx=-100,cy=-100,tx=-100,ty=-100;document.body.classList.add('has-cur');
  window.addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;cur.classList.add('live');var t=e.target.closest&&e.target.closest('a,button,input,summary,[data-cur],.tq,.opt');cur.classList.toggle('big',!!t);var lab=t&&t.dataset&&t.dataset.cur;cur.classList.toggle('lab',!!lab);cur.firstChild.textContent=lab||''},{passive:true});
  document.addEventListener('pointerleave',function(){tx=ty=-100});
  (function loop(){cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;cur.style.transform='translate('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px)';requestAnimationFrame(loop)})()}

function parse(){var h=(location.hash||'').replace('#',''),m;
  if((m=h.match(/^lesson-(\d+)$/)))return ['lesson',m[1]];if((m=h.match(/^roadmap-(\d+)$/)))return ['roadmap',m[1]];
  if(/^road-|^roadmaps$/.test(h))return ['roadmap'];if(h==='questions')return ['practice'];if(h==='tools')return ['flaw'];if(h==='glossary')return ['library'];
  if(h==='join'||h==='signup'||h==='community'||h==='wrap')return ['home','signup'];
  return [R[h]&&h!=='lesson'?h:'home']}
var TITLES={home:'CAGR Club',roadmap:'Curriculum',practice:'Practice',daily:'Daily',flaw:'Flaw or fine',library:'Glossary',reading:'Reading list',memos:'Memos'};
var lastView=null;
function go(){var p=parse(),name=p[0],v=$('view');
  if(name==='home'&&p[1]&&lastView==='home'&&$(p[1])){scrollToEl($(p[1]),80);return}
  clearTimers();showClear();lastView=name;document.body.dataset.view=name;cancelAnimationFrame(asc.raf);
  v.innerHTML=R[name](p[1]);
  var key=name==='lesson'?'roadmap':(name==='reading'||name==='memos')?'library':name;
  $$('[data-nav]').forEach(function(a){a.classList.toggle('on',a.dataset.nav===key)});
  var jt=$('join-top');if(jt){jt.href=inviteHref();if(DISCORD_INVITE){jt.target='_blank';jt.rel='noopener'}}
  document.title=name==='lesson'?LESSONS[+p[1]-1].t+' · CAGR Club':name==='home'?'CAGR Club':TITLES[name]+' · CAGR Club';
  $('readbar').style.width='0';if(!(name==='roadmap'&&p[1]))toTop();
  if(A[name])A[name](p[1]);
  reveal(v);v.classList.remove('in');void v.offsetWidth;v.classList.add('in');syncStreak();eyeReq()}
window.addEventListener('hashchange',go);

function spy(){var hs=$$('.lesson article h2'),bs=$$('.rail button'),cur=0,i;
  for(i=0;i<hs.length;i++){if(hs[i].getBoundingClientRect().top<150)cur=i}
  for(i=0;i<bs.length;i++)bs[i].classList.toggle('on',i===cur);
  var d=document.documentElement,max=d.scrollHeight-window.innerHeight,pr=max>0?Math.min(1,window.scrollY/max):0;
  $('readbar').style.width=hs.length?pr*100+'%':'0';
  document.body.classList.toggle('scrolled',window.scrollY>30);$('tt-p').setAttribute('stroke-dashoffset',(169.6*(1-pr)).toFixed(1));$('totop').classList.toggle('on',window.scrollY>700);}
var tick=false;window.addEventListener('scroll',function(){if(tick)return;tick=true;requestAnimationFrame(function(){tick=false;spy();storyTick();homeTick();eyeReq()})},{passive:true});

document.addEventListener('click',function(e){var t=e.target,b;
  if(!DISCORD_INVITE&&(b=t.closest('[data-join],#join-top,a[href="#signup"],a[href="#join"]'))){e.preventDefault();openJoin();return}
  if((b=t.closest('[data-ptab]'))){ptab=+b.dataset.ptab;$$('[data-ptab]').forEach(function(x){x.classList.toggle('on',x===b)});$('pt-body').innerHTML=ptBody();return}
  if((b=t.closest('[data-pq]'))){px.topic='All';px.diff='All';px.show='All';px.cur=+b.dataset.pq;location.hash='practice';return}
  if((b=t.closest('[data-mg]'))){mgAnswer(b.dataset.mg==='1',b);return}
  if((b=t.closest('#mg-next'))){mg.i++;mg.done=false;mgRender();return}
  if((b=t.closest('[data-opt]'))){var qi=+b.dataset.qi,k=+b.dataset.opt;answer(qi,k,k===QS[qi].a,b);return}
  if((b=t.closest('[data-check]'))){checkNum(+b.dataset.check,b);return}
  if((b=t.closest('[data-give]'))){answer(+b.dataset.give,'—',false);return}
  if((b=t.closest('[data-pxnav]'))){pxMove(+b.dataset.pxnav);return}
  if((b=t.closest('[data-pxgo]'))){var ni=+b.dataset.pxgo,ls=pxList();px.dir=ls.indexOf(ni)<ls.indexOf(px.cur)?-1:1;px.cur=ni;pxRefresh(false);return}
  if((b=t.closest('[data-tp]'))){px.topic=b.dataset.tp;px.cur=null;px.dir=1;pxRefresh(true);return}
  if((b=t.closest('[data-pd]'))){px.diff=b.dataset.pd;px.cur=null;pxRefresh(true);return}
  if((b=t.closest('[data-ps]'))){px.show=b.dataset.ps;px.cur=null;pxRefresh(true);return}
  if((b=t.closest('#p-rand'))){var pool=QS.map(function(_,k){return k}).filter(function(k){return !ans[k]});if(!pool.length)pool=QS.map(function(_,k){return k});px.topic='All';px.diff='All';px.show='All';px.cur=pool[Math.floor(Math.random()*pool.length)];pxRefresh(true);return}
  if((b=t.closest('[data-gc]'))){gCat=b.dataset.gc;$$('[data-gc]').forEach(function(x){x.classList.toggle('on',x===b)});gHtml();return}
  if((b=t.closest('[data-gcat]'))){gCat=b.dataset.gcat;$$('[data-gc]').forEach(function(x){x.classList.toggle('on',x.dataset.gc===gCat)});gHtml();scrollToEl($('g-s'),160);return}
  if((b=t.closest('[data-az]'))){scrollToEl($('az-'+b.dataset.az),240);return}
  if((b=t.closest('[data-rt]'))){rType=b.dataset.rt;$$('[data-rt]').forEach(function(x){x.classList.toggle('on',x===b)});rHtml();return}
  if((b=t.closest('[data-jump]'))){scrollToEl($(b.dataset.jump));return}
  if((b=t.closest('[data-done]'))){var n=b.dataset.done;done[n]=!done[n];store.set('done',done);toast(done[n]?'Lesson complete':'Marked as not done');if(done[n]){var r=b.getBoundingClientRect();confetti(r.left+r.width/2,r.top)}var y=window.scrollY;$('view').innerHTML=R.lesson(n);A.lesson(n);reveal($('view'));window.scrollTo(0,y);return}
  if(t===$('pal'))closePal()});
document.addEventListener('keydown',function(e){var t=e.target,inp=t.tagName==='INPUT'||t.tagName==='TEXTAREA';
  if(e.key==='Escape'&&$('jm')&&!$('jm').hidden){closeJoin();return}
  if(e.key==='Enter'&&t.dataset&&t.dataset.num!=null){e.preventDefault();checkNum(+t.dataset.num,t);return}
  if(!$('pal').hidden||e.metaKey||e.ctrlKey||e.altKey)return;
  if($('desk')&&!inp){var k=e.key.toLowerCase(),idx='abcd'.indexOf(k);if(idx<0&&'1234'.indexOf(k)>-1)idx=+k-1;
    if(idx>-1){var o=$('desk').querySelector('[data-opt="'+idx+'"]:not([disabled])');if(o){o.click();e.preventDefault()}return}
    if(e.key==='ArrowRight'||(e.key==='Enter'&&ans[px.cur])){pxMove(1);e.preventDefault();return}
    if(e.key==='ArrowLeft'){pxMove(-1);e.preventDefault();return}}
  if($('deck')&&!inp){if(e.key==='ArrowLeft')decide(true);else if(e.key==='ArrowRight')decide(false)}});

/* ---------- search ---------- */
var IDX=[],sel=0,hits=[];
[['home','Home'],['signup','The Sunday Wrap']].concat(NAV).concat([['reading','Reading list']]).forEach(function(n){IDX.push([n[1],'Page',function(){location.hash=n[0]}])});
LESSONS.forEach(function(l,i){IDX.push([l.t,'Lesson '+(i+1),function(){location.hash='lesson-'+(i+1)}])});
MODULES.forEach(function(m,i){IDX.push([m.t,'Archive '+(i+1),function(){location.hash='roadmap-'+(i+1)}])});
GLOSSARY.forEach(function(g){IDX.push([g.t,'Term',function(){gQ=g.t.toLowerCase();gCat='All';if(location.hash==='#library')go();else location.hash='library'}])});
LINKS.forEach(function(l){IDX.push([l.title,'Reading',function(){location.hash='reading'}])});
QS.forEach(function(q,i){IDX.push([q.q,'Question',function(){px.topic='All';px.diff='All';px.show='All';px.cur=i;if(location.hash==='#practice')pxRefresh(true);else location.hash='practice'}])});
function palRender(){var s=$('pal-in').value.trim().toLowerCase();hits=IDX.filter(function(x){return !s||x[0].toLowerCase().indexOf(s)>-1}).slice(0,s?10:8);if(sel>=hits.length)sel=0;
  $('pal-out').innerHTML=hits.length?hits.map(function(h,i){return '<button type="button" class="pal-r'+(i===sel?' sel':'')+'" data-i="'+i+'"><span>'+h[0]+'</span><small>'+h[1]+'</small></button>'}).join(''):'<p class="pal-e">Nothing matches. Try a shorter word.</p>'}
function openPal(){$('pal').hidden=false;if(lenis)lenis.stop();$('pal-in').value='';sel=0;palRender();$('pal-in').focus()}
function closePal(){$('pal').hidden=true;if(lenis)lenis.start()}
function pick(i){var h=hits[i];if(!h)return;closePal();h[2]()}
$('find').addEventListener('click',openPal);$('pal-in').addEventListener('input',function(){sel=0;palRender()});
$('pal-out').addEventListener('click',function(e){var b=e.target.closest('.pal-r');if(b)pick(+b.dataset.i)});
document.addEventListener('keydown',function(e){
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('pal').hidden?openPal():closePal();return}
  if($('pal').hidden)return;
  if(e.key==='Escape')closePal();
  else if(e.key==='ArrowDown'){e.preventDefault();sel=(sel+1)%Math.max(1,hits.length);palRender()}
  else if(e.key==='ArrowUp'){e.preventDefault();sel=(sel-1+hits.length)%Math.max(1,hits.length);palRender()}
  else if(e.key==='Enter'){e.preventDefault();pick(sel)}});

document.body.classList.add('ready');go();
})();
