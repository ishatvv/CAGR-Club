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

/* ---------- logo ---------- */
function logoMark(){return '<svg class="lm" viewBox="0 0 32 32" aria-hidden="true"><rect class="lm-bg" width="32" height="32" rx="9"/><path class="lm-l" d="M7 23.5C14 23 20 19 25 9"/><circle class="lm-d" cx="25" cy="9" r="3.4"/></svg>'}
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
function eyebrow(t){return '<p class="eyebrow">'+t+'</p>'}
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
function creds(){return '<div class="creds" data-rv><span class="cr-l">Backed by</span><span class="cbadge"><b>CFA<sup>®</sup></b><small>Level I</small></span><span class="cbadge"><b>FRM<sup>®</sup></b><small>Part I &amp; II</small></span></div>'}
function joinBtn(cls,label){return '<a class="btn pri mag '+(cls||'')+'" href="'+inviteHref()+'"'+inviteAttr()+'>'+(label||'Join the club')+ico('arrow')+'</a>'}

/* ---------- showcase: chatbot vs analyst ---------- */
var AISEG=[['CementCo is a leading cement maker with ',0],['strong fundamentals',1],['. Revenue has grown at a ',0],['healthy 12% CAGR',2],[', and the company is well placed to ',0],['benefit from India’s infrastructure push',3],['. With robust margins and a solid balance sheet, ',0],['the stock looks attractively valued',4],[' for long-term investors.',0]];
var NOTES=['Which fundamentals? Not one number.','Price did that. Volumes grew 4% a year.','Every cement stock says this. It’s already in the 30× price.','Never checks capacity. Do the maths.'];
var AILEN=AISEG.reduce(function(s,x){return s+x[0].length},0);
var NEED=65000*Math.pow(1.12,5)/12*10/1200;
function aiHtml(nc){var out='',left=nc;AISEG.forEach(function(sg){if(left<=0)return;var t=sg[0].slice(0,left);left-=sg[0].length;out+=sg[1]?'<span class="cl" data-n="'+sg[1]+'">'+esc(t)+'<sup>'+sg[1]+'</sup></span>':esc(t)});return out+(nc<AILEN?'<span class="caret"></span>':'')}
function showHtml(){
  return '<section class="show" id="show"><div class="show-h" data-rv><p class="eyebrow">The problem</p><h2>A chatbot can write the report. <em>Can you tell if it’s true?</em></h2><p class="lede">Most of what AI says about a stock sounds right and checks nothing. CAGR Club trains the part it skips: reading the numbers, and doing the maths.</p></div>'+
  '<div class="doc" id="doc" data-step="0" data-rv><div class="doc-tabs">'+['The chatbot’s answer','An analyst marks it up','The maths it skipped'].map(function(t,k){return '<button type="button" class="dt" data-dt="'+k+'"><span>'+t+'</span><i></i></button>'}).join('')+'<button type="button" class="dt-re" id="dt-re" aria-label="Play again">'+ico('replay')+'</button></div>'+
  '<div class="doc-b"><div class="doc-ai"><div class="chat-q">Is CementCo a buy at 30× earnings?</div><p class="chat-who">'+ico('spark')+'Chatbot</p><p class="ai-t" id="ai-t">'+aiHtml(0)+'</p><span class="slop">Sounds right.<br>Checks nothing.</span></div>'+
  '<div class="doc-side"><ol class="notes">'+NOTES.map(function(n,k){return '<li class="note" data-k="'+(k+1)+'"><b>'+(k+1)+'</b>'+n+'</li>'}).join('')+'</ol>'+
  '<div class="analyst"><p class="eyebrow">The analyst’s version</p><p class="an-q">To earn 12% a year from ₹65,000 crore, CementCo must sell <b>'+Math.round(NEED)+' million tonnes</b> in year five.</p><div class="an-bars"><div><span>The price needs</span><i style="--w:100%"></i><b>'+NEED.toFixed(1)+' mt</b></div><div><span>Its plants make</span><i class="ok" style="--w:'+(40.5/NEED*100).toFixed(1)+'%"></i><b>40.5 mt</b></div></div><p class="an-v">The price assumes plants nobody has announced. <b>Not a buy until the capex is.</b></p><a class="link" href="#lesson-'+PRICED_LESSON+'">Learn this check'+ico('arrow')+'</a></div></div></div></div></section>'}
var showT=[];
function showClear(){showT.forEach(clearTimeout);showT=[]}
function showStep(k,auto){var d=$('doc');if(!d)return;showClear();d.dataset.step=k;d.classList.remove('run');void d.offsetWidth;d.classList.add('run');
  var ai=$('ai-t'),notes=$$('.note',d),cls;
  if(k===0){notes.forEach(function(n){n.classList.remove('on')});var nc=0;(function type(){nc=Math.min(AILEN,nc+(RM?AILEN:4));ai.innerHTML=aiHtml(nc);if(nc<AILEN)showT.push(setTimeout(type,22));else if(auto)showT.push(setTimeout(function(){showStep(1,true)},1100))})()}
  else{ai.innerHTML=aiHtml(AILEN);cls=$$('.cl',d);
    if(k===1){cls.forEach(function(c){c.classList.remove('hit')});notes.forEach(function(n){n.classList.remove('on')});
      [0,1,2,3].forEach(function(j){showT.push(setTimeout(function(){cls[j].classList.add('hit');notes[j].classList.add('on')},RM?0:350+j*850))});
      if(auto)showT.push(setTimeout(function(){showStep(2,true)},RM?0:4600))}
    else{cls.forEach(function(c){c.classList.add('hit')});notes.forEach(function(n){n.classList.add('on')})}}}
function bindShow(){var d=$('doc');if(!d)return;
  $$('.dt',d).forEach(function(b){b.addEventListener('click',function(){showStep(+b.dataset.dt,false)})});
  $('dt-re').addEventListener('click',function(){showStep(0,true)});
  if(!io){showStep(2,false);return}
  var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){o.disconnect();showStep(0,true)}},{threshold:.35});o.observe(d)}

/* ---------- views ---------- */
var R={},A={};
R.home=function(){var answered=Object.keys(ans).length;
  return '<section class="hero3"><canvas class="candles" id="candles" aria-hidden="true"></canvas><p class="eyebrow">Equity research, minus the AI slop</p><h1 class="split">'+splitWords([['Anyone can ask AI for a DCF.',0],['Few can tell you why it’s',1]])+' <em class="scrib"><span class="w"><span style="--i:13">wrong.</span></span><svg viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true"><path d="M4 20C60 8 140 6 296 14M30 26C110 18 200 18 270 22"/></svg></em></h1>'+
  '<div class="hero3-f"><p class="lede">CAGR Club teaches the judgment behind equity research: reading the accounts, catching the forecast that cannot happen, and building a view you can defend.</p><div class="row">'+joinBtn('xl')+'<a class="btn ghost xl mag" href="#roadmap">Start learning'+ico('arrow')+'</a></div></div>'+creds()+'</section>'+
  showHtml()+
  '<section class="sec"><div class="sec-h" data-rv><div><p class="eyebrow">The curriculum</p><h2>Four archives. <em>Read in order.</em></h2></div><a class="btn ghost mag" href="#roadmap">See every lesson'+ico('arrow')+'</a></div>'+folders()+'</section>'+
  '<section class="sec"><div class="sec-h" data-rv><div><p class="eyebrow">Practice</p><h2>Then you <em>do the reps.</em></h2></div></div><div class="trio">'+
   '<a class="card tc tilt" href="#daily" data-rv><h3>Today’s three</h3><p>Three questions, same for everyone, new every morning.</p><div class="mini-placards">'+todays.map(function(i,k){var a=ans[i];return '<div class="mp '+(a?(a.ok?'ok':'no'):'')+'"><b>'+(a?(a.ok?ico('check'):ico('x')):k+1)+'</b><small>'+QS[i].t+'</small></div>'}).join('')+'</div><span class="link">Play'+ico('arrow')+'</span></a>'+
   '<a class="card tc tilt" href="#practice" data-rv style="--d:90ms"><h3>The question bank</h3><p>Exact answers and full working. Watch the board fill in.</p><div class="mini-heat">'+QS.map(function(q,i){var a=ans[i];return '<i class="'+(a?(a.ok?'ok':'no'):'')+'"></i>'}).join('')+'</div><span class="link">Practise'+ico('arrow')+'</span></a>'+
   '<a class="card tc tilt" href="#flaw" data-rv style="--d:180ms"><h3>Flaw or fine?</h3><p>A forecast lands on your desk. Could the business really do it?</p><div class="mini-fz"><span class="no">'+ico('x')+'Flaw</span><span class="yes">'+ico('check')+'Fine</span></div><span class="link">Play'+ico('arrow')+'</span></a></div></section>'+
  nlHtml()+
  '<section class="sec faq-s"><div class="sec-h" data-rv><div><p class="eyebrow">Questions</p><h2>Before you <em>join.</em></h2></div></div><div class="faq">'+[['Is it free?','Yes. The lessons, practice, games and the Sunday Wrap are all free.'],['Who is behind it?','People who have passed the CFA® Program Level I and both parts of the FRM® exam. Every lesson is checked against filings and textbooks, not generated.'],['Why not just use AI?','Use it. But it is confident and wrong in exactly the places that cost money: capacity, cash conversion, what is already in the price. Here you learn to check it.'],['Is any of this investment advice?','No. Companies in examples are invented, and nothing here recommends buying or selling a security.']].map(function(f){return '<details data-rv><summary>'+f[0]+'</summary><p>'+f[1]+'</p></details>'}).join('')+'</div></section>'};
A.home=function(target){drawCandles();tilt($('view'));magnet($('view'));bindNl();bindShow();
  if(target)setTimeout(function(){scrollToEl($(target),80)},120)};
function drawCandles(){var c=$('candles');if(!c)return;var w=c.parentNode.clientWidth,h=c.parentNode.clientHeight,dpr=window.devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;c.style.width=w+'px';c.style.height=h+'px';var g=c.getContext('2d');g.scale(dpr,dpr);
  var r=rng(42),n=Math.floor(w/16),pts=[],up=cssv('--ink'),dn=cssv('--acc');
  for(var i=0;i<n;i++){var base=h*.92-Math.pow(i/n,2.2)*h*.75,o=base+(r()-.5)*h*.05,cl=base+(r()-.62)*h*.06,hi=Math.min(o,cl)-r()*h*.03,lo=Math.max(o,cl)+r()*h*.03,x=i*16+8;g.globalAlpha=.06;g.strokeStyle=g.fillStyle=cl<o?up:dn;g.beginPath();g.moveTo(x,hi);g.lineTo(x,lo);g.lineWidth=1;g.stroke();g.fillRect(x-4,Math.min(o,cl),8,Math.max(2,Math.abs(cl-o)));pts.push([x,base])}
  g.globalAlpha=.18;g.strokeStyle=dn;g.lineWidth=1.5;g.beginPath();pts.forEach(function(p,k){k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke()}

/* newsletter */
function nlHtml(){var me=store.get('nl',null);
  return '<section class="nl" id="signup"><div class="nl-card" data-rv><div class="nl-g"><div class="nl-l"><p class="eyebrow">The Sunday Wrap</p><h2>The week in Indian markets, <em>explained like an analyst would.</em></h2><p class="lede">What moved, the one number that mattered, and a chart worth saving. Five minutes, every Sunday morning. Your invite to the club comes with the first issue.</p>'+
  (me?'<div class="nl-done">'+ico('check')+'<span>You’re on the list as <b>'+esc(me)+'</b>. See you Sunday.</span></div>':'<form class="nl-f" id="nl-f" novalidate><label class="sr" for="nl-e">Email</label><input id="nl-e" type="email" autocomplete="email" placeholder="you@email.com" required><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn pri" type="submit">Get the wrap'+ico('arrow')+'</button></form><p class="small" id="nl-m">One email a week. No tips, no spam, unsubscribe any time.</p>')+'</div>'+
  '<div class="nl-r"><div class="stamp"><span class="st-mark">'+logoMark()+'</span><span class="st-v">₹0</span><span class="st-t">Sunday post</span></div><ol class="nl-toc"><li>What moved, and why</li><li>The one number that mattered</li><li>A chart worth saving</li><li>One question to sharpen you</li></ol></div></div></div></section>'}

function bindNl(){var f=$('nl-f');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var em=$('nl-e').value.trim(),m=$('nl-m'),b=f.querySelector('button');
  if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(em)){m.textContent='That email does not look right.';m.className='small bad';$('nl-e').focus();return}
  b.disabled=true;m.className='small';m.textContent='Adding you…';
  fetch('/api/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:em,website:f.website.value,src:'home'})}).then(function(r){return r.json().then(function(j){return {s:r.status,j:j}})}).then(function(x){
    if(x.s===200&&x.j.ok){store.set('nl',em);var r=f.getBoundingClientRect();confetti(r.left+r.width/2,r.top);f.outerHTML='<div class="nl-done">'+ico('check')+'<span>You’re on the list as <b>'+esc(em)+'</b>. See you Sunday.</span></div>';m.remove()}
    else if(x.s===400){m.textContent='That email does not look right.';m.className='small bad';b.disabled=false}
    else throw 0}).catch(function(){m.textContent='Sign-ups open in a few days. Please try again soon.';m.className='small bad';b.disabled=false})})}

R.roadmap=function(){var n=lessonCount(),tot=LESSONS.length,pc=n/tot,C=2*Math.PI*70;
  return '<section class="rm-head"><div class="sec" style="gap:18px"><p class="eyebrow">The curriculum</p><h1>Equity research, <em>in depth.</em></h1><p class="lede">Four archives, read in order: the statements, the business, the valuation, and the sector. Each goes deep enough that you could defend the numbers in an interview.</p><div class="row"><a class="btn pri mag" href="#lesson-'+nextLesson()+'">'+(n?'Continue reading':'Start the first lesson')+ico('arrow')+'</a></div></div><div class="ring"><svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="70" fill="none" stroke="var(--raised)" stroke-width="8"/><circle cx="80" cy="80" r="70" fill="none" stroke="var(--acc)" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-pc))+'"/></svg><div><b>'+Math.round(pc*100)+'%</b><span>read</span></div></div></section>'+
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

/* ---------- shell ---------- */
document.querySelector('.logo').innerHTML=logoMark()+'<span class="wm">CAGR<i>club</i></span>';
$('foot-brand').innerHTML=logoMark()+'<div><b>CAGR<i>club</i></b><span>Compound your edge.</span></div>';
$('nav').innerHTML=NAV.map(function(n){return '<a href="#'+n[0]+'" data-nav="'+n[0]+'">'+n[1]+'</a>'}).join('');
$('tabs').innerHTML=[['home','Home','home']].concat(NAV.slice(0,4)).map(function(n){return '<a href="#'+n[0]+'" data-nav="'+n[0]+'">'+ico(n[2])+n[1].replace('Flaw or fine','Flaw')+'</a>'}).join('');
$('find').innerHTML=ico('search')+'<span>Search</span><kbd>'+(/Mac|iPhone|iPad/.test(navigator.platform||'')?'⌘K':'Ctrl K')+'</kbd>';
$('totop').innerHTML='<svg class="tt-ring" viewBox="0 0 60 60"><circle cx="30" cy="30" r="27"/><circle id="tt-p" cx="30" cy="30" r="27" stroke-dasharray="169.6" stroke-dashoffset="169.6" transform="rotate(-90 30 30)"/></svg>'+ico('up');
$('totop').addEventListener('click',function(){if(lenis)lenis.scrollTo(0);else window.scrollTo({top:0,behavior:RM?'auto':'smooth'})});
function themeNow(){return document.documentElement.getAttribute('data-theme')||'light'}
function themeIcon(){$('theme').innerHTML=ico(themeNow()==='dark'?'sun':'moon')}
themeIcon();
$('theme').addEventListener('click',function(){var nx=themeNow()==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',nx);store.set('theme2',nx);themeIcon();drawCandles()});
window.addEventListener('resize',function(){clearTimeout(drawCandles.t);drawCandles.t=setTimeout(function(){drawCandles();},150)});

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
  clearTimers();showClear();lastView=name;
  v.innerHTML=R[name](p[1]);
  var key=name==='lesson'?'roadmap':(name==='reading'||name==='memos')?'library':name;
  $$('[data-nav]').forEach(function(a){a.classList.toggle('on',a.dataset.nav===key)});
  var jt=$('join-top');if(jt){jt.href=inviteHref();if(DISCORD_INVITE){jt.target='_blank';jt.rel='noopener'}}
  document.title=name==='lesson'?LESSONS[+p[1]-1].t+' · CAGR Club':name==='home'?'CAGR Club':TITLES[name]+' · CAGR Club';
  $('readbar').style.width='0';if(!(name==='roadmap'&&p[1]))toTop();
  if(A[name])A[name](p[1]);
  reveal(v);v.classList.remove('in');void v.offsetWidth;v.classList.add('in');syncStreak()}
window.addEventListener('hashchange',go);

function spy(){var hs=$$('.lesson article h2'),bs=$$('.rail button'),cur=0,i;
  for(i=0;i<hs.length;i++){if(hs[i].getBoundingClientRect().top<150)cur=i}
  for(i=0;i<bs.length;i++)bs[i].classList.toggle('on',i===cur);
  var d=document.documentElement,max=d.scrollHeight-window.innerHeight,pr=max>0?Math.min(1,window.scrollY/max):0;
  $('readbar').style.width=hs.length?pr*100+'%':'0';
  $('tt-p').setAttribute('stroke-dashoffset',(169.6*(1-pr)).toFixed(1));$('totop').classList.toggle('on',window.scrollY>700);}
var tick=false;window.addEventListener('scroll',function(){if(tick)return;tick=true;requestAnimationFrame(function(){tick=false;spy()})},{passive:true});

document.addEventListener('click',function(e){var t=e.target,b;
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
