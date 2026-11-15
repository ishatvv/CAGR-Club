(function(){
'use strict';
/* Paste the Discord invite link here once the server exists, e.g. 'https://discord.gg/abc123'. */
var DISCORD_INVITE='';

var $=function(id){return document.getElementById(id)};
var $$=function(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))};
var store={get:function(k,d){try{var v=localStorage.getItem('cc.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:function(k,v){try{localStorage.setItem('cc.'+k,JSON.stringify(v))}catch(e){}}};
var inr=function(n){return Math.round(n).toLocaleString('en-IN')};
function money(n){return n>=1e7?'₹'+(n/1e7).toFixed(2)+' cr':n>=1e5?'₹'+(n/1e5).toFixed(2)+' lakh':'₹'+inr(n)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

var I={home:'<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".5"/>',cal:'<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>',book:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>',chat:'<path d="M4 5h16v11H9l-5 4z"/>',search:'<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',flame:'<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',check:'<path d="m5 12 5 5 9-10"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',left:'<path d="M19 12H5M11 6l-6 6 6 6"/>',spark:'<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>',flag:'<path d="M5 21V4h11l-2 4 2 4H5"/>',bolt:'<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',layers:'<path d="m12 3 9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/>',bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20h4"/>'};
function ico(n){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+I[n]+'</svg>'}
function logoSvg(){return '<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="cc-lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8366FF"/><stop offset="1" stop-color="#3B1FD6"/></linearGradient></defs><rect width="40" height="40" rx="12" fill="url(#cc-lg)"/><g fill="#fff" fill-opacity=".2"><rect x="7.5" y="26" width="5" height="7" rx="1.6"/><rect x="14.2" y="23" width="5" height="10" rx="1.6"/><rect x="20.9" y="18" width="5" height="15" rx="1.6"/><rect x="27.6" y="10.5" width="5" height="22.5" rx="1.6"/></g><path d="M8.5 27C17 26.5 24.5 22 30 10.5" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><circle cx="30" cy="10.5" r="3.6" fill="#FFC83D" stroke="#fff" stroke-width="1.6"/></svg>'}

var done=store.get('done',{}),ans=store.get('ans',{}),uid=0,timers=[];
var DAY=Math.floor(Date.now()/864e5),BASE=Math.floor(Date.UTC(2026,10,14)/864e5);
function daySet(d){var t=[(d*7)%QS.length,(d*7+13)%QS.length,(d*7+29)%QS.length];if(t[1]===t[0])t[1]=(t[1]+1)%QS.length;if(t[2]===t[0]||t[2]===t[1])t[2]=(t[2]+2)%QS.length;return t}
var todays=daySet(DAY);
var PTS={Easy:1,Medium:2,Hard:3};
var NAV=[['roadmap','Roadmap','map'],['practice','Practice','target'],['daily','Daily','cal'],['flaw','Flaw or fine','flag'],['library','Library','book']];

/* ---------- helpers ---------- */
function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){t.hidden=true},2200)}
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
function untilNext(){var ms=(DAY+1)*864e5-Date.now(),h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);return (h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function cssv(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}
function inviteHref(){return DISCORD_INVITE||'#home'}
function countUp(root){$$('[data-count]',root).forEach(function(el){var n=+el.dataset.count;if(RM){el.textContent=n;return}var t0=performance.now();(function f(t){var p=Math.min(1,(t-t0)/900),e=1-Math.pow(1-p,3);el.textContent=Math.round(n*e);if(p<1)requestAnimationFrame(f)})(t0)})}
function tilt(root){if(RM||!window.matchMedia('(hover:hover)').matches)return;$$('.tilt',root).forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(800px) rotateX('+(-y*6)+'deg) rotateY('+(x*8)+'deg) translateY(-3px)';c.style.setProperty('--mx',(x+.5)*100+'%');c.style.setProperty('--my',(y+.5)*100+'%')});c.addEventListener('pointerleave',function(){c.style.transform=''})})}
function sparkPath(seed,w,h,up){var r=rng(seed),pts=[],v=.15;for(var i=0;i<=24;i++){v+=(r()-.38)*.09*(up?1:.5);v=Math.max(.05,Math.min(.95,v+(up?.012:0)));pts.push([i/24*w,h-v*h])}return 'M'+pts.map(function(p){return p[0].toFixed(1)+' '+p[1].toFixed(1)}).join('L')}

/* ---------- confetti ---------- */
function confetti(x,y){if(RM)return;var c=document.createElement('canvas'),dpr=window.devicePixelRatio||1;c.className='confetti';c.width=innerWidth*dpr;c.height=innerHeight*dpr;document.body.appendChild(c);var g=c.getContext('2d');g.scale(dpr,dpr);
  var cols=[cssv('--violet'),cssv('--pink'),cssv('--mint'),cssv('--sun')],P=[];for(var i=0;i<110;i++){var a=Math.random()*Math.PI*2,s=4+Math.random()*7;P.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-5,w:5+Math.random()*5,h:3+Math.random()*4,c:cols[i%4],rot:Math.random()*6})}
  var t0=performance.now();(function f(t){var p=(t-t0)/1500;g.clearRect(0,0,innerWidth,innerHeight);P.forEach(function(q){q.vy+=.25;q.vx*=.985;q.x+=q.vx;q.y+=q.vy;q.rot+=.15;g.save();g.globalAlpha=Math.max(0,1-p);g.translate(q.x,q.y);g.rotate(q.rot);g.fillStyle=q.c;g.fillRect(-q.w/2,-q.h/2,q.w,q.h);g.restore()});if(p<1)requestAnimationFrame(f);else c.remove()})(t0)}

/* ---------- questions ---------- */
function parseNum(v){v=String(v).replace(/[,₹%\s×x]/g,'').replace('−','-');return v===''?NaN:parseFloat(v)}
function tolOf(q){return q.tol!=null?q.tol:Math.max(Math.abs(q.a)*0.01,0.05)}
function fmtAns(q){if(q.type==='mcq')return q.o[q.a];var n=Math.abs(q.a).toLocaleString('en-IN',{maximumFractionDigits:2}),sg=q.a<0?'−':'';if(q.unit==='₹ cr')return sg+'₹'+n+' crore';if(q.unit==='%'||q.unit==='×')return sg+n+q.unit;return sg+n+(q.unit?' '+q.unit:'')}
function qBody(i){var q=QS[i],a=ans[i],h='<p class="q-q">'+q.q+'</p>';
  if(q.type==='mcq'){h+='<div class="opts">'+q.o.map(function(o,k){var c='';if(a){if(k===q.a)c=' right';else if(a.v===k)c=' wrong'}return '<button type="button" class="opt'+c+'" data-opt="'+k+'" data-qi="'+i+'"'+(a?' disabled':'')+'><b>'+'ABCD'[k]+'</b>'+o+'</button>'}).join('')+'</div>'}
  else{h+='<div class="numrow"><input class="field" type="text" inputmode="decimal" placeholder="Your answer" aria-label="Your answer" data-num="'+i+'"'+(a?' value="'+esc(a.v)+'" disabled':'')+'>'+(q.unit?'<span class="unit">'+q.unit+'</span>':'')+(a?'':'<button type="button" class="btn sm" data-check="'+i+'">Check</button><button type="button" class="link" data-give="'+i+'">Show answer</button>')+'</div>'}
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
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Growth over '+years+' years at '+Math.round(rate*100)+' percent"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--violet)" stop-opacity=".35"/><stop offset="1" stop-color="var(--violet)" stop-opacity="0"/></linearGradient></defs>'+gl+'<path d="M'+a.join('L')+'L'+X(years)+' '+(H-b)+'L'+l+' '+(H-b)+'Z" fill="url(#'+id+')"/><path d="M'+s.join('L')+'" fill="none" stroke="var(--faint)" stroke-width="1.6" stroke-dasharray="5 5"/><path d="M'+a.join('L')+'" fill="none" stroke="var(--violet)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="'+X(years)+'" cy="'+Y(max)+'" r="6" fill="var(--sun)" stroke="var(--edge)" stroke-width="2"/><text x="'+l+'" y="'+(H-6)+'">Today</text><text x="'+(W-l)+'" y="'+(H-6)+'" text-anchor="end">Year '+years+'</text></svg>'}
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
  el.innerHTML='<div class="drill"><div class="drill-l"><span class="pill" style="align-self:flex-start">'+ico('bolt')+'Speed round</span><div class="big" id="m-q">60 seconds. As many as you can.</div><div class="row"><input class="field" id="m-a" type="text" inputmode="decimal" aria-label="Your answer" placeholder="Answer, then Enter" disabled style="width:200px"><button class="btn sm" id="m-go" type="button">Start</button></div><span class="small" id="m-s">Percentages, growth and P/E. Answers within 2% count.</span></div><div class="drill-r"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--raised)" stroke-width="10"/><circle id="m-ring" cx="60" cy="60" r="52" fill="none" stroke="var(--pink)" stroke-width="10" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="0" transform="rotate(-90 60 60)"/></svg><div><b id="m-sc">0</b><span id="m-t">60s</span></div></div></div>';
  var rnd=function(a){return a[Math.floor(Math.random()*a.length)]};
  function next(){var k=Math.floor(Math.random()*3);
    if(k===0){var p=rnd([5,12,15,18,25,35,40]),n=rnd([240,360,480,640,800,1200]);av=p*n/100;$('m-q').textContent='What is '+p+'% of '+n+'?'}
    else if(k===1){var a=rnd([200,400,500,800]),g=rnd([10,15,20,25,30,40,60]);av=g;$('m-q').textContent='Sales go from '+a+' to '+(a*(100+g)/100)+'. Growth in %?'}
    else{var e=rnd([8,12,15,20,25,40]),pe=rnd([12,15,18,22,30]);av=pe;$('m-q').textContent='Price '+(e*pe)+', EPS '+e+'. P/E?'}
    asked++;$('m-a').value='';$('m-a').focus()}
  function draw(){$('m-sc').textContent=score;$('m-t').textContent=left+'s';$('m-ring').setAttribute('stroke-dashoffset',326.7*(1-left/60))}
  function end(){clearInterval(h);h=null;$('m-a').disabled=true;$('m-go').textContent='Go again';$('m-q').textContent=score+' right in 60 seconds';$('m-s').textContent=(asked-1)+' answered';if(score>=5){var r=$('m-sc').getBoundingClientRect();confetti(r.left+r.width/2,r.top)}}
  $('m-go').addEventListener('click',function(){score=0;asked=0;left=60;$('m-a').disabled=false;$('m-go').textContent='Restart';clearInterval(h);h=every(1000,function(){if(!$('m-s')){clearInterval(h);return}left--;draw();if(left<=0)end()});draw();next()});
  $('m-a').addEventListener('keydown',function(e){if(e.key!=='Enter'||!h||this.value==='')return;if(Math.abs(parseNum(this.value)-av)<=Math.abs(av)*.02){score++;var s=this;s.classList.add('flash-ok');setTimeout(function(){s.classList.remove('flash-ok')},250)}draw();next()})}
var MOUNT={priced:mountPriced,cagr:mountCagr,dcf:mountDcf,pnl:mountPnl};

/* ---------- shared blocks ---------- */
function pathBlock(){return '<div class="path">'+MODULES.map(function(m,i){var d=modDone(m),all=d===m.l.length;return '<a class="mod tilt'+(all?' done':'')+'" href="#roadmap-'+(i+1)+'"><span class="n">'+(all?ico('check'):i+1)+'</span><b>'+m.t+'</b><small>'+m.l.length+' lessons'+(d?' · '+d+' done':'')+'</small><span class="mini-bar"><i style="width:'+(d/m.l.length*100)+'%"></i></span></a>'}).join('')+'</div>'}
function roleCards(){return '<div class="roles">'+ROLES.map(function(r,k){var pc=r.live?lessonCount()/LESSONS.length:0,sp=sparkPath(k*31+5,200,50,true);
  return '<article class="role tilt '+r.hue+(r.live?' live':' locked')+'"><div class="role-top"><span class="role-sym">'+r.sym+'</span>'+(r.live?'<span class="live-pill"><i></i>Live</span>':'<span class="soon-pill">'+ico('clock')+'Listing soon</span>')+'</div><h3>'+r.t+'</h3><p>'+r.d+'</p><svg class="role-spark" viewBox="0 0 200 54" preserveAspectRatio="none" aria-hidden="true"><path d="'+sp+'L200 54L0 54Z" class="area"/><path d="'+sp+'" class="ln"/></svg><div class="role-mods">'+r.mods.slice(0,3).map(function(m){return '<span>'+m+'</span>'}).join('')+'<span class="more">+'+(r.mods.length-3)+' more</span></div>'+
   (r.live?'<div class="role-f"><span class="small">'+LESSONS.length+' lessons · '+Math.round(pc*100)+'% done</span><a class="btn sm" href="#lesson-'+nextLesson()+'">'+(lessonCount()?'Continue':'Start')+ico('arrow')+'</a></div>':'<div class="role-f"><span class="small">Curriculum in the works</span><a class="btn sm alt" href="'+inviteHref()+'"'+(DISCORD_INVITE?' target="_blank" rel="noopener"':'')+'>'+ico('bell')+'Get notified</a></div><div class="lock-glass" aria-hidden="true">'+ico('lock')+'</div>')+'</article>'}).join('')+'</div>'}
function joinBtn(cls){return DISCORD_INVITE?'<a class="btn '+(cls||'')+'" href="'+DISCORD_INVITE+'" target="_blank" rel="noopener">'+ico('chat')+'Join the Discord</a>':'<span class="btn soon '+(cls||'')+'" aria-disabled="true">'+ico('chat')+'Invite opens soon</span>'}

/* ---------- views ---------- */
var R={},A={};
R.home=function(){var q=QS[todays[0]],no=dailyNo(),L=LESSONS[(Math.floor((DAY-BASE)/7)%LESSONS.length)];
  var opts=q.type==='mcq'?'<div class="dm-opts">'+q.o.map(function(o,k){return '<span><b>'+'ABCD'[k]+'</b>'+o+'</span>'}).join('')+'</div>':'';
  var T=[['EBITDA','profit before interest, tax, depreciation'],['ROCE','return on capital employed'],['DCF','value from future cash'],['WACC','the blended cost of capital'],['P/E','price per rupee of earnings'],['CAGR','the steady yearly growth rate'],['NIM','a bank\'s lending spread'],['FCF','cash left after capex'],['EV','what the whole business costs'],['CCC','days cash is stuck in operations']];
  var tape=T.map(function(t){return '<span><b>'+t[0]+'</b><i>'+t[1]+'</i></span>'}).join('');
  var week=[];for(var k=0;k<7;k++){var d=DAY+k,qi=daySet(d)[0],dt=new Date(d*864e5),sun=dt.getUTCDay()===0;week.push([k===0?'Today':dt.toLocaleDateString('en-GB',{weekday:'short',timeZone:'UTC'}),QS[qi].t+' · '+QS[qi].d,sun?LESSONS[(Math.floor((d-BASE)/7)%LESSONS.length)].t:'',sun])}
  var answered=Object.keys(ans).length;
  return '<section class="lp-hero"><canvas class="candles" id="candles" aria-hidden="true"></canvas><div class="lp-copy"><span class="eyebrow-pill"><i></i>Free community for future analysts</span><h1>The club for people who want to <span class="hl">become analysts</span>.</h1><p class="lede">CAGR Club is a Discord and a free curriculum for people learning equity research in India. A question every morning. A lesson every Sunday. A pit for stock pitches. And people chasing the same seat.</p><div class="row">'+joinBtn('xl')+'<a class="btn alt xl" href="#roadmap">Explore the roadmap</a></div><div class="proof"><div><b data-count="'+LESSONS.length+'">'+LESSONS.length+'</b><span>lessons</span></div><div><b data-count="'+QS.length+'">'+QS.length+'</b><span>exact-answer questions</span></div><div><b data-count="'+GLOSSARY.length+'">'+GLOSSARY.length+'</b><span>glossary terms</span></div><div><b data-count="4">4</b><span>career tracks</span></div></div></div>'+
  '<div class="dm-wrap"><span class="float f1">'+ico('clock')+'Posts at 8:30 IST</span><span class="float f2">'+ico('layers')+'Spoiler answers</span><span class="float f3">'+ico('book')+'Lesson every Sunday</span><div class="dm" aria-hidden="true"><div class="dm-bar"><span class="dm-dots"><i></i><i></i><i></i></span><b># daily-set</b><small>CAGR Club</small></div><div class="dm-body">'+
   '<div class="dm-msg m1"><span class="dm-av">'+logoSvg()+'</span><div><p class="dm-who">CAGR Club <em>BOT</em> <small>Today at 8:30</small></p><div class="dm-embed"><p class="dm-t">Daily #'+no+' · '+q.t+' · '+q.d+'</p><p>'+q.q+'</p>'+opts+'<p class="dm-f">Reply with your answer before you open the spoiler.</p></div><p class="dm-spoil"><b>Answer:</b> <span class="sp" tabindex="0" role="button" aria-label="Reveal answer">'+esc(fmtAns(q))+'</span> <small>click to reveal</small></p></div></div>'+
   '<div class="dm-msg m2"><span class="dm-av pink">'+ico('book')+'</span><div><p class="dm-who">CAGR Club <em>BOT</em> <small>Sunday at 10:00</small></p><div class="dm-embed pink"><p class="dm-t">Lesson of the week</p><p><b>'+L.t+'</b></p><p class="dm-f">Full lesson in the thread · one of '+LESSONS.length+'</p></div></div></div>'+
   '<div class="dm-input">Message #daily-set</div></div></div></div></section>'+
  '<div class="tape" aria-hidden="true"><div class="tape-in">'+tape+tape+'</div></div>'+
  '<section class="sec"><div class="sec-h"><div><h2>What happens inside the club</h2><p>Four rituals, each in its own channel, so there is always something to do and nothing gets lost in one long chat.</p></div></div><div class="rituals">'+
   [['8:30 IST, daily','Daily question','#daily-set','One question with an exact answer. Reply first, then open the spoiler.','violet'],['Sundays, 10:00 IST','Lesson of the week','#lesson-notes','A full lesson from the roadmap, with a thread for questions.','pink'],['Any time','The pitch pit','#pitch-pit','Post a stock pitch in a set template and get structured feedback.','mint'],['Results weeks','Earnings season','#earnings-season','One thread per company: expected, reported, what changed.','sun']].map(function(r){return '<article class="rit tilt '+r[4]+'"><span class="rit-when">'+r[0]+'</span><h3>'+r[1]+'</h3><code>'+r[2]+'</code><p>'+r[3]+'</p></article>'}).join('')+'</div></section>'+
  '<section class="sec"><div class="sec-h"><div><h2>Four seats. One live today.</h2><p>Equity research is open now. Credit, investment banking and private equity tracks are being built.</p></div><a class="btn sm alt" href="#roadmap">See the roadmap</a></div>'+roleCards()+'</section>'+
  '<section class="duo"><a class="card duo-c tilt" href="#daily"><div class="sec-h" style="align-items:center"><h3>Today\'s three</h3><span class="pill">'+ico('clock')+'<span data-cd>'+untilNext()+'</span></span></div><div class="mini-placards">'+todays.map(function(i,k){var a=ans[i];return '<div class="mp '+(a?(a.ok?'ok':'no'):'')+'"><span>Q'+(k+1)+'</span><b>'+(a?(a.ok?ico('check'):ico('x')):'?')+'</b><small>'+QS[i].t+'</small></div>'}).join('')+'</div><p class="small">Same three for everyone. Each card flips into a placard when you answer.</p><span class="btn sm">Play today\'s set'+ico('arrow')+'</span></a>'+
  '<a class="card duo-c tilt" href="#practice"><div class="sec-h" style="align-items:center"><h3>Practice heatmap</h3><span class="pill">'+answered+' / '+QS.length+'</span></div><div class="mini-heat">'+QS.map(function(q,i){var a=ans[i];return '<i class="'+(a?(a.ok?'ok':'no'):'')+'"></i>'}).join('')+'</div><p class="small">Every question is a tile, grouped by topic like a market map. Green when you get it right.</p><span class="btn sm alt">Open practice'+ico('arrow')+'</span></a></section>'+
  '<section class="flaw-band"><div class="fb-copy"><span class="pill" style="align-self:flex-start">'+ico('flag')+'Game</span><h2>Flaw or fine?</h2><p class="lede">A forecast lands on your desk. Could the business really do this? Swipe left for flaw, right for fine. '+FLAWS.length+' cases.</p><a class="btn" href="#flaw" style="align-self:flex-start">Play Flaw or fine'+ico('arrow')+'</a></div><div class="fb-stack" aria-hidden="true"><div class="fs c3"></div><div class="fs c2"></div><div class="fs c1"><span class="pill">Case 1</span><p>'+FLAWS[0][0]+'</p><div class="fs-btns"><span class="no">'+ico('x')+'Flaw</span><span class="yes">'+ico('check')+'Fine</span></div></div></div></section>'+
  '<section class="sec"><div class="sec-h"><div><h2>The next seven days in #daily-set</h2><p>Real upcoming topics, plus Sunday\'s lesson. Posts go out automatically.</p></div></div><div class="week">'+week.map(function(d){return '<div class="wk'+(d[3]?' sun':'')+'"><b>'+d[0]+'</b><span>8:30 · '+d[1]+'</span>'+(d[2]?'<span>10:00 · Lesson: '+d[2]+'</span>':'')+'</div>'}).join('')+'</div></section>'+
  '<section class="final"><div class="final-logo">'+logoSvg()+'</div><h2>Pull up a chair.</h2><p class="lede">Free and open to anyone learning equity research. No tips, no calls, no paid groups.</p><div class="row" style="justify-content:center">'+joinBtn('xl')+'</div></section>'+
  '<section class="sec"><h2>Questions people ask first</h2><div class="faq">'+[['Is it free?','Yes. The Discord, the lessons, the questions and the games are all free.'],['Do I need a finance background?','No. Many members start with lesson 1, on reading a profit and loss statement.'],['Will anyone tell me what to buy?','No. Recommending trades is against the rules. The club is about learning how to analyse businesses.'],['Is this run by a company?','It is an independent learning community, not a broker, adviser or course seller.'],['Is any of this investment advice?','No. Companies in examples are invented, and nothing here recommends buying or selling a security.']].map(function(f){return '<details><summary>'+f[0]+'</summary><p>'+f[1]+'</p></details>'}).join('')+'</div></section>'};
A.home=function(){var sp=document.querySelector('.sp');if(sp){var r=function(){sp.classList.add('open')};sp.addEventListener('click',r);sp.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();r()}})}
  drawCandles();countUp($('view'));tilt($('view'));every(1000,function(){$$('[data-cd]').forEach(function(e){e.textContent=untilNext()})})};
function drawCandles(){var c=$('candles');if(!c)return;var w=c.parentNode.clientWidth,h=c.parentNode.clientHeight,dpr=window.devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;c.style.width=w+'px';c.style.height=h+'px';var g=c.getContext('2d');g.scale(dpr,dpr);
  var r=rng(42),n=Math.floor(w/18),pts=[];
  var up=cssv('--mint'),dn=cssv('--pink');
  for(var i=0;i<n;i++){var base=h*.86-Math.pow(i/n,2.1)*h*.62,o=base+(r()-.5)*h*.05,cl=base+(r()-.62)*h*.06,hi=Math.min(o,cl)-r()*h*.03,lo=Math.max(o,cl)+r()*h*.03,x=i*18+9;g.globalAlpha=.14;g.strokeStyle=g.fillStyle=cl<o?up:dn;g.beginPath();g.moveTo(x,hi);g.lineTo(x,lo);g.lineWidth=1.2;g.stroke();g.fillRect(x-5,Math.min(o,cl),10,Math.max(2,Math.abs(cl-o)));pts.push([x,base])}
  g.globalAlpha=.3;g.strokeStyle=cssv('--violet');g.lineWidth=2;g.beginPath();pts.forEach(function(p,k){k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke()}

R.roadmap=function(){var n=lessonCount(),tot=LESSONS.length,pc=n/tot,C=2*Math.PI*70;
  return '<section class="sec"><span class="pill" style="align-self:flex-start">'+ico('map')+'Roadmaps</span><h1>Pick your seat.</h1><p class="lede">Four analyst tracks. Equity research is live with '+tot+' lessons; the other three are being built and will list here when they are ready.</p>'+roleCards()+'</section>'+
  '<section class="rm-head" id="era"><div class="sec" style="gap:16px"><span class="live-pill" style="align-self:flex-start"><i></i>Live track</span><h2 style="font-size:clamp(28px,4vw,44px)">Equity Research Analyst</h2><p class="lede">From reading the three statements to writing an initiation note and pitching a stock. '+tot+' lessons in '+MODULES.length+' modules, about four hours of reading, done in order.</p><div class="row"><a class="btn" href="#lesson-'+nextLesson()+'">'+(n?'Continue lesson '+nextLesson():'Start lesson 1')+ico('arrow')+'</a></div></div><div class="ring"><svg viewBox="0 0 160 160"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--violet)"/><stop offset="1" stop-color="var(--pink)"/></linearGradient></defs><circle cx="80" cy="80" r="70" fill="none" stroke="var(--raised)" stroke-width="14"/><circle cx="80" cy="80" r="70" fill="none" stroke="url(#rg)" stroke-width="14" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-pc))+'"/></svg><div><b>'+Math.round(pc*100)+'%</b><span>'+n+' of '+tot+' done</span></div></div></section>'+
  pathBlock()+
  '<section class="card pad" style="padding-block:6px">'+MODULES.map(function(m,i){var d=modDone(m),all=d===m.l.length;
    return '<div class="module" id="mod-'+(i+1)+'"><span class="m-n'+(all?' done':'')+'">'+(i+1)+'</span><div class="m-b"><h3 style="font:600 21px/1.2 var(--display);letter-spacing:-.02em">'+m.t+'</h3><p>'+m.d+' <span class="small">'+d+' of '+m.l.length+' done</span></p><div class="ls">'+m.l.map(function(k){var L=LESSONS[k-1];return '<a class="l'+(done[k]?' done':'')+'" href="#lesson-'+k+'"><span class="k">'+(done[k]?ico('check'):k)+'</span><span><b>'+L.t+'</b><small>'+L.min+' min'+(L.w?' · interactive':'')+'</small></span></a>'}).join('')+'</div></div></div>'}).join('')+'</section>'};
A.roadmap=function(open){tilt($('view'));if(open){var el=$('mod-'+open);if(el)setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'start'})},60)}};

R.lesson=function(k){var n=+k,L=LESSONS[n-1];if(!L)return R.roadmap();var mi=modOf(n),rail='',body='';
  L.secs.forEach(function(s,i){body+='<h2 id="s'+i+'">'+s[0]+'</h2><p>'+s[1]+'</p>';rail+='<button type="button" data-jump="s'+i+'">'+s[0]+'</button>'});
  if(L.w){body+='<h2 id="sw">Try it</h2><div class="card pad" id="lw"></div>';rail+='<button type="button" data-jump="sw">Try it</button>'}
  rail+='<button type="button" data-jump="se">Worked example</button><button type="button" data-jump="sc">Check yourself</button>';
  return '<div class="lesson"><article><div class="crumbs"><a href="#roadmap">Roadmap</a><span>/</span><a href="#roadmap-'+(mi+1)+'">Module '+(mi+1)+': '+MODULES[mi].t+'</a></div><p class="small">Lesson '+n+' of '+LESSONS.length+' · about '+L.min+' minutes</p><h1 style="font-size:clamp(30px,4.4vw,46px)">'+L.t+'</h1><p class="lede">'+L.sum+'</p><div class="key">'+L.key+'</div>'+body+
  '<h2 id="se">Worked example</h2><div class="worked">'+L.ex+'</div><h2 id="sc">Check yourself</h2><div class="reveal"><p>'+L.cq+'</p><div id="ca"><button class="btn sm alt" type="button" id="ca-b">Reveal the answer</button></div></div>'+
  '<div class="done-row"><span>'+(done[n]?'You finished this lesson.':'Finished reading?')+'</span><button class="btn sm'+(done[n]?' alt':'')+'" type="button" data-done="'+n+'">'+(done[n]?'Mark as not done':'Mark complete')+'</button></div>'+
  '<nav class="pn">'+(n>1?'<a href="#lesson-'+(n-1)+'"><small>Previous</small>'+LESSONS[n-2].t+'</a>':'<span></span>')+(n<LESSONS.length?'<a href="#lesson-'+(n+1)+'"><small>Next</small>'+LESSONS[n].t+'</a>':'<a href="#practice"><small>Next</small>Test yourself in practice</a>')+'</nav></article><aside class="rail"><p>On this page</p>'+rail+'</aside></div>'};
A.lesson=function(k){var L=LESSONS[+k-1];if(!L)return;if(L.w)MOUNT[L.w]($('lw'));$('ca-b').addEventListener('click',function(){$('ca').innerHTML='<p style="font-weight:500">'+L.ca+'</p>'});spy()};

/* practice */
var pDiff='All',pShow='All',modalQ=null,modalList=[];
function topics(){var o=[];QS.forEach(function(q){if(o.indexOf(q.t)<0)o.push(q.t)});return o}
function book(){var keys=Object.keys(ans).filter(function(k){return QS[k]}).sort(function(a,b){return (ans[a].t||0)-(ans[b].t||0)}),pts=0,ok=0,series=[0];keys.forEach(function(k){if(ans[k].ok){ok++;pts+=PTS[QS[k].d]}series.push(pts)});
  var best=null,bv=-1;topics().forEach(function(t){var tot=0,c=0;QS.forEach(function(q,i){if(q.t===t){tot++;if(ans[i]&&ans[i].ok)c++}});if(c>0&&c/tot>bv){bv=c/tot;best=t}});
  return {n:keys.length,ok:ok,pts:pts,series:series,best:best}}
function bookHtml(){var b=book(),max=QS.reduce(function(s,q){return s+PTS[q.d]},0),W=260,H=64,s=b.series,mx=Math.max(4,s[s.length-1]);
  var path=s.map(function(v,k){return (k?'L':'M')+(s.length>1?k/(s.length-1)*W:0).toFixed(1)+' '+(H-4-v/mx*(H-10)).toFixed(1)}).join('');
  return '<div class="book"><div class="bk"><span>Answered</span><b>'+b.n+'<small> / '+QS.length+'</small></b></div><div class="bk"><span>Accuracy</span><b>'+(b.n?Math.round(b.ok/b.n*100):0)+'<small>%</small></b></div><div class="bk"><span>Points</span><b>'+b.pts+'<small> / '+max+'</small></b></div><div class="bk"><span>Strongest topic</span><b class="sm">'+(b.best||'None yet')+'</b></div><div class="bk chart-bk"><span>Your points curve</span><svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true"><path d="'+path+(s.length>1?'L'+W+' '+H+'L0 '+H+'Z':'')+'" class="area"/><path d="'+path+'" class="ln"/></svg></div></div>'}
function heatHtml(){return topics().map(function(t){var ids=[],c=0;QS.forEach(function(q,i){if(q.t===t){ids.push(i);if(ans[i]&&ans[i].ok)c++}});
  return '<div class="sector"><div class="sector-h"><b>'+t+'</b><span>'+c+'/'+ids.length+'</span></div><div class="tiles">'+ids.map(function(i){var q=QS[i],a=ans[i],dim=(pDiff!=='All'&&q.d!==pDiff)||(pShow==='New'&&a)||(pShow==='Missed'&&!(a&&!a.ok));
   return '<button type="button" class="tq '+(a?(a.ok?'ok':'no'):'new')+(dim?' dim':'')+'" data-open="'+i+'" title="'+esc(q.q)+'"><span>Q'+(i+1)+'</span><i class="d '+q.d+'">'+q.d[0]+'</i>'+(a?'<em>'+(a.ok?ico('check'):ico('x'))+'</em>':'')+'</button>'}).join('')+'</div></div>'}).join('')}
R.practice=function(){return '<section class="sec"><span class="pill" style="align-self:flex-start">'+ico('target')+'Practice</span><h1>The question market.</h1><p class="lede">Every question is a tile, grouped by topic like a market map. Pick one, answer it, and watch the board turn green. Each has one right answer, and you see the working either way.</p><div id="book">'+bookHtml()+'</div>'+
  '<div class="heat-ctl"><div class="seg">'+['All','Easy','Medium','Hard'].map(function(d){return '<button type="button" data-pd="'+d+'"'+(d===pDiff?' class="on"':'')+'>'+d+'</button>'}).join('')+'</div><div class="seg">'+[['All','All'],['New','Unanswered'],['Missed','Missed']].map(function(d){return '<button type="button" data-ps="'+d[0]+'"'+(d[0]===pShow?' class="on"':'')+'>'+d[1]+'</button>'}).join('')+'</div><div class="legend"><span><i class="new"></i>New</span><span><i class="ok"></i>Correct</span><span><i class="no"></i>Missed</span><button class="link" type="button" id="p-rand">'+ico('spark')+'Random question</button></div></div><div class="heat" id="heat">'+heatHtml()+'</div></section>'+
  '<section class="card pad" id="drill"></section><div class="row" style="justify-content:flex-end"><button class="link" type="button" id="q-reset">Reset my answers</button></div>'};
A.practice=function(){mountDrill($('drill'));$('q-reset').addEventListener('click',function(){ans={};store.set('ans',ans);refreshPractice();syncStreak();toast('Answers cleared')})};
function refreshPractice(){if($('heat'))$('heat').innerHTML=heatHtml();if($('book'))$('book').innerHTML=bookHtml()}
function openQ(i,list){modalQ=i;modalList=list||QS.map(function(_,k){return k});if(modalList.indexOf(i)<0)modalList=QS.map(function(_,k){return k});$('qm').hidden=false;document.body.classList.add('modal-open');renderModal();setTimeout(function(){var f=$('qm').querySelector('input:not([disabled]),.opt:not([disabled])');if(f)f.focus()},60)}
function renderModal(){var i=modalQ,q=QS[i],a=ans[i],pos=modalList.indexOf(i);
  $('qm-card').className='qm-card '+(a?(a.ok?'ok':'no'):'');
  $('qm-card').innerHTML='<div class="qm-top"><span class="pill">'+q.t+'</span><span class="pill '+q.d+'">'+q.d+' · '+PTS[q.d]+' pt'+(PTS[q.d]>1?'s':'')+'</span><span class="small">Q'+(i+1)+'</span><span class="spacer"></span><button class="ibtn" type="button" data-qnav="-1" aria-label="Previous question"'+(pos<=0?' disabled':'')+'>'+ico('left')+'</button><button class="ibtn" type="button" data-qnav="1" aria-label="Next question"'+(pos>=modalList.length-1?' disabled':'')+'>'+ico('arrow')+'</button><button class="ibtn" type="button" id="qm-x" aria-label="Close">'+ico('x')+'</button></div><div class="qm-body">'+qBody(i)+'</div>'}
function closeQ(){$('qm').hidden=true;document.body.classList.remove('modal-open');modalQ=null}
onAnswered.push(function(i){if(modalQ===i)renderModal();refreshPractice()});

/* daily */
function placard(i,k){var q=QS[i],a=ans[i];
  var front='<div class="pf"><div class="pf-top"><span class="pill">Q'+(k+1)+'</span><span class="pill">'+q.t+'</span><span class="pill '+q.d+'">'+q.d+'</span></div>'+qBody(i)+'</div>';
  var back=a?'<div class="pb '+(a.ok?'ok':'no')+'"><div class="pb-mark"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34"/>'+(a.ok?'<path d="M24 41l11 11 21-24"/>':'<path d="M27 27l26 26M53 27 27 53"/>')+'</svg></div><span class="pb-k">Q'+(k+1)+' · '+q.t+'</span><h3>'+(a.ok?'Correct':'Missed it')+'</h3><p class="pb-pts">'+(a.ok?'+'+PTS[q.d]+' pts':'0 pts')+'</p><p class="pb-a"><span>Answer</span>'+esc(fmtAns(q))+'</p><p class="pb-s">'+q.s+'</p></div>':'';
  return '<div class="flip'+(a?' on':'')+'" id="pl-'+i+'"><div class="fi">'+front+back+'</div></div>'}
function scoreCard(){var n=todays.filter(function(i){return ans[i]}).length;if(n<3)return '';var c=todays.filter(function(i){return ans[i].ok}).length,pts=todays.reduce(function(s,i){return s+(ans[i].ok?PTS[QS[i].d]:0)},0);
  return '<div class="scorecard" id="scorecard"><div class="sc-l"><span class="pill light">Daily #'+dailyNo()+' · complete</span><h2>'+c+' of 3</h2><div class="sq big">'+todays.map(function(i){return '<i class="'+(ans[i].ok?'ok':'no')+'"></i>'}).join('')+'</div><p>'+pts+' points today · Next set in <b data-cd>'+untilNext()+'</b></p></div><div class="sc-r"><div class="sc-flame">'+ico('flame')+'<b>'+streakNow()+'</b><span>day streak</span></div><button class="btn" type="button" id="d-share">Copy my result</button></div></div>'}
R.daily=function(){var term=GLOSSARY[DAY%GLOSSARY.length];
  return '<section class="sec"><div class="daily-h"><div class="sec" style="gap:12px"><span class="pill" style="align-self:flex-start">'+ico('cal')+'Daily #'+dailyNo()+' · '+new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'})+'</span><h1>Today\'s three.</h1><p class="lede">Same three for everyone. Answer a card and it flips into your placard. Finish all three to keep your streak.</p></div><div class="next-in"><span>Next set in</span><b data-cd>'+untilNext()+'</b></div></div><div class="placards">'+todays.map(placard).join('')+'</div><div id="sc-slot">'+scoreCard()+'</div>'+
  '<div class="card term-day"><span class="pill" style="align-self:flex-start">Term of the day</span><h3>'+term.t+'</h3><p>'+term.d+'</p>'+(term.f?'<code class="fx">'+term.f+'</code>':'')+'<a class="link" href="#library">Open the glossary'+ico('arrow')+'</a></div></section>'};
A.daily=function(){every(1000,function(){$$('[data-cd]').forEach(function(e){e.textContent=untilNext()})});bindShare()};
function bindShare(){var b=$('d-share');if(b)b.addEventListener('click',function(){var txt='CAGR Club Daily #'+dailyNo()+'  '+todays.map(function(i){return ans[i].ok?'🟩':'🟥'}).join('')+'\nStreak: '+streakNow()+'\ncagrclub.com';try{navigator.clipboard.writeText(txt).then(function(){toast('Copied. Paste it anywhere.')},function(){toast(txt)})}catch(e){toast(txt)}})}
onAnswered.push(function(i){var el=$('pl-'+i);if(!el)return;var k=todays.indexOf(i),tmp=document.createElement('div');tmp.innerHTML=placard(i,k);var nw=tmp.firstChild;nw.classList.remove('on');el.replaceWith(nw);void nw.offsetWidth;requestAnimationFrame(function(){requestAnimationFrame(function(){nw.classList.add('on')})});
  if(todays.every(function(x){return ans[x]})){setTimeout(function(){if(!$('sc-slot'))return;$('sc-slot').innerHTML=scoreCard();bindShare();var s=$('scorecard');if(s){s.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});var r=s.getBoundingClientRect();confetti(r.left+r.width/2,r.top+40)}},900)}});

/* flaw or fine */
var fz={i:0,right:0,res:[]};
R.flaw=function(){return '<section class="flaw-page"><div class="sec" style="gap:14px;max-width:640px;align-items:center;text-align:center"><span class="pill">'+ico('flag')+'Game</span><h1>Flaw or fine?</h1><p class="lede">A forecast lands on your desk. Could the business really do this? Drag the card left for flaw or right for fine, or use the buttons or arrow keys.</p></div><div class="fz-score" id="fz-score"></div><div class="deck" id="deck"></div><div class="fz-btns"><button class="fz-b no" type="button" id="fz-no">'+ico('x')+'Flaw</button><button class="fz-b yes" type="button" id="fz-yes">'+ico('check')+'Fine</button></div><div id="fz-res" class="fz-res"></div></section>'};
A.flaw=function(){fz={i:0,right:0,res:[]};$('fz-res').innerHTML='';renderDeck();$('fz-no').onclick=function(){decide(true)};$('fz-yes').onclick=function(){decide(false)}};
function renderDeck(){var d=$('deck');if(!d)return;$('fz-score').innerHTML='<span>Case <b>'+Math.min(fz.i+1,FLAWS.length)+'</b> of '+FLAWS.length+'</span><span class="dots">'+FLAWS.map(function(_,k){return '<i class="'+(fz.res[k]===true?'ok':fz.res[k]===false?'no':k===fz.i?'cur':'')+'"></i>'}).join('')+'</span><span><b>'+fz.right+'</b> right</span>';
  if(fz.i>=FLAWS.length){d.innerHTML='<div class="fcard end"><span class="pill">Done</span><h2>'+fz.right+' of '+FLAWS.length+'</h2><p>'+(fz.right>=10?'Sharp. You would catch most broken models before they reach a client.':fz.right>=7?'Solid. Revisit the ones you missed in the modelling module.':'Worth another round. Lessons 14 to 21 cover how drivers break.')+'</p><button class="btn" type="button" id="fz-again">Play again</button></div>';$('fz-again').addEventListener('click',A.flaw);$('fz-no').disabled=$('fz-yes').disabled=true;if(fz.right>=7){var r=d.getBoundingClientRect();confetti(r.left+r.width/2,r.top+60)}return}
  $('fz-no').disabled=$('fz-yes').disabled=false;
  var h='';for(var k=Math.min(FLAWS.length-1,fz.i+2);k>=fz.i;k--){h+='<div class="fcard'+(k===fz.i?' top':' under u'+(k-fz.i))+'"'+(k===fz.i?' id="fz-top"':'')+'><span class="pill">Case '+(k+1)+'</span><p>'+FLAWS[k][0]+'</p><div class="stamp no">FLAW</div><div class="stamp yes">FINE</div></div>'}
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

/* library */
var gQ='',gCat='All',rType='All';
function libTabs(on){return '<div class="seg lib-tabs">'+[['library','Glossary'],['reading','Reading list'],['memos','Memos']].map(function(t){return '<a href="#'+t[0]+'"'+(t[0]===on?' class="on"':'')+'>'+t[1]+'</a>'}).join('')+'</div>'}
function gFilter(){return GLOSSARY.filter(function(g){return (gCat==='All'||g.c===gCat)&&(!gQ||(g.t+' '+g.d+' '+(g.f||'')).toLowerCase().indexOf(gQ)>-1)}).sort(function(a,b){return a.t.localeCompare(b.t)})}
function gHtml(){var list=gFilter(),by={},letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');list.forEach(function(g){var L=g.t[0].toUpperCase();(by[L]=by[L]||[]).push(g)});
  $('az').innerHTML=letters.map(function(L){return by[L]?'<button type="button" data-az="'+L+'">'+L+'</button>':'<span>'+L+'</span>'}).join('');
  $('g-n').textContent=list.length+' of '+GLOSSARY.length+' terms';
  $('g-l').innerHTML=list.length?letters.filter(function(L){return by[L]}).map(function(L){return '<div class="g-grp" id="az-'+L+'"><span class="g-L">'+L+'</span><div class="g-items">'+by[L].map(function(g){return '<article class="g-i"><div class="g-h"><h3>'+g.t+'</h3><span class="pill">'+g.c+'</span></div><p>'+g.d+'</p>'+(g.f?'<code class="fx">'+g.f+'</code>':'')+(g.l?'<a class="link" href="#lesson-'+g.l+'">Lesson '+g.l+': '+LESSONS[g.l-1].t+ico('arrow')+'</a>':'')+'</article>'}).join('')+'</div></div>'}).join(''):'<p class="small">No terms match. Try a shorter word or another category.</p>'}
R.library=function(){var cats=['All'];GLOSSARY.forEach(function(g){if(cats.indexOf(g.c)<0)cats.push(g.c)});var td=GLOSSARY[DAY%GLOSSARY.length];
  return '<section class="sec"><span class="pill" style="align-self:flex-start">'+ico('book')+'Library</span><h1>The analyst\'s dictionary.</h1><p class="lede">Every term you will meet on the desk, in one plain sentence, with the formula where there is one and a link to the lesson that teaches it.</p>'+libTabs('library')+
  '<div class="gl-top"><div class="card term-day hero-term"><span class="pill" style="align-self:flex-start">Term of the day</span><h3>'+td.t+'</h3><p>'+td.d+'</p>'+(td.f?'<code class="fx">'+td.f+'</code>':'')+'</div><div class="gl-stats">'+cats.slice(1).map(function(c){var n=GLOSSARY.filter(function(g){return g.c===c}).length;return '<button type="button" class="gs" data-gcat="'+c+'"><b>'+n+'</b><span>'+c+'</span></button>'}).join('')+'</div></div>'+
  '<div class="gl-bar"><input class="field" id="g-s" type="search" placeholder="Search '+GLOSSARY.length+' terms" aria-label="Search terms" value="'+esc(gQ)+'"><div class="chips">'+cats.map(function(c){return '<button type="button" class="chip'+(c===gCat?' on':'')+'" data-gc="'+c+'">'+c+'</button>'}).join('')+'</div><div class="az" id="az"></div><span class="small" id="g-n"></span></div><div id="g-l"></div></section>'};
A.library=function(){gHtml();$('g-s').addEventListener('input',function(){gQ=this.value.trim().toLowerCase();gHtml()})};
R.reading=function(){var types=['All'];LINKS.forEach(function(l){if(types.indexOf(l.type)<0)types.push(l.type)});
  return '<section class="sec"><span class="pill" style="align-self:flex-start">'+ico('book')+'Library</span><h1>Reading list.</h1><p class="lede">Articles, research papers, books and data sources worth your time, each with a line on why.</p>'+libTabs('reading')+'<div class="chips">'+types.map(function(t){return '<button type="button" class="chip'+(t===rType?' on':'')+'" data-rt="'+t+'">'+t+'</button>'}).join('')+'</div><div class="reads" id="r-l"></div><p class="small">Found something worth reading? Share it in #resources on the Discord.</p></section>'};
function rHtml(){$('r-l').innerHTML=LINKS.filter(function(l){return rType==='All'||l.type===rType}).map(function(l){var host='';try{host=new URL(l.url).hostname.replace(/^www\./,'')}catch(e){}var tk={'Article':0,'Research paper':1,'Book':2,'Data':3,'Regulator':1}[l.type]||0;return '<a class="read tilt" href="'+esc(l.url)+'" target="_blank" rel="noopener"><div class="read-top"><span class="rtype t'+tk+'">'+esc(l.type)+'</span><span class="small">'+esc(l.level||'')+'</span></div><h3>'+esc(l.title)+'</h3><p>'+esc(l.note)+'</p><div class="read-f"><span>'+esc(l.src)+(host?' · '+host:'')+'</span>'+ico('ext')+'</div></a>'}).join('');tilt($('r-l'))}
A.reading=rHtml;
R.memos=function(){return '<section class="sec"><span class="pill" style="align-self:flex-start">'+ico('book')+'Library</span><h1>Memos.</h1><p class="lede">Short notes, one idea each.</p>'+libTabs('memos')+'<div class="memos">'+MEMOS.map(function(m,k){return '<article class="card memo"><span class="memo-n">0'+(k+1)+'</span><h3>'+m[0]+'</h3><p>'+m[1]+'</p></article>'}).join('')+'</div></section>'};

/* ---------- shell ---------- */
document.querySelector('.logo').innerHTML=logoSvg()+'<span class="wm"><b>CAGR</b>club</span>';
$('nav').innerHTML=NAV.map(function(n){return '<a href="#'+n[0]+'" data-nav="'+n[0]+'">'+n[1]+'</a>'}).join('');
$('tabs').innerHTML=[['home','Club','chat']].concat(NAV.slice(0,4)).map(function(n){return '<a href="#'+n[0]+'" data-nav="'+n[0]+'">'+ico(n[2])+n[1].replace('Flaw or fine','Flaw')+'</a>'}).join('');
$('find').innerHTML=ico('search')+'<span>Search</span><kbd>'+(/Mac|iPhone|iPad/.test(navigator.platform||'')?'⌘K':'Ctrl K')+'</kbd>';
function themeNow(){return document.documentElement.getAttribute('data-theme')||(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
function themeIcon(){$('theme').innerHTML=ico(themeNow()==='dark'?'sun':'moon')}
var th=store.get('theme',null);if(th)document.documentElement.setAttribute('data-theme',th);themeIcon();
$('theme').addEventListener('click',function(){var nx=themeNow()==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',nx);store.set('theme',nx);themeIcon();drawCandles()});
window.addEventListener('resize',function(){clearTimeout(drawCandles.t);drawCandles.t=setTimeout(drawCandles,150)});

function parse(){var h=(location.hash||'').replace('#',''),m;
  if((m=h.match(/^lesson-(\d+)$/)))return ['lesson',m[1]];if((m=h.match(/^roadmap-(\d+)$/)))return ['roadmap',m[1]];
  if(/^road-|^roadmaps$/.test(h))return ['roadmap'];if(h==='questions')return ['practice'];if(h==='tools')return ['flaw'];if(h==='glossary')return ['library'];if(h==='community'||h==='join')return ['home'];
  return [R[h]&&h!=='lesson'?h:'home']}
var TITLES={home:'CAGR Club',roadmap:'Roadmap',practice:'Practice',daily:'Daily',flaw:'Flaw or fine',library:'Glossary',reading:'Reading list',memos:'Memos'};
function go(){var p=parse(),name=p[0],v=$('view');clearTimers();if(modalQ!=null)closeQ();
  v.innerHTML=R[name](p[1]);if(A[name])A[name](p[1]);
  var key=name==='lesson'?'roadmap':(name==='reading'||name==='memos')?'library':name;
  $$('[data-nav]').forEach(function(a){a.classList.toggle('on',a.dataset.nav===key)});
  var jt=$('join-top');if(jt){jt.hidden=name==='home';jt.href=inviteHref();if(DISCORD_INVITE){jt.target='_blank';jt.rel='noopener'}}
  document.title=name==='lesson'?LESSONS[+p[1]-1].t+' · CAGR Club':name==='home'?'CAGR Club':TITLES[name]+' · CAGR Club';
  $('readbar').style.width='0';if(!(name==='roadmap'&&p[1]))window.scrollTo(0,0);v.classList.remove('in');void v.offsetWidth;v.classList.add('in');syncStreak()}
window.addEventListener('hashchange',go);

function spy(){var hs=$$('.lesson article h2'),bs=$$('.rail button'),cur=0,i;
  if(!hs.length){$('readbar').style.width='0';return}
  for(i=0;i<hs.length;i++){if(hs[i].getBoundingClientRect().top<150)cur=i}
  for(i=0;i<bs.length;i++)bs[i].classList.toggle('on',i===cur);
  var d=document.documentElement,max=d.scrollHeight-window.innerHeight;$('readbar').style.width=(max>0?Math.min(100,window.scrollY/max*100):0)+'%'}
var tick=false;window.addEventListener('scroll',function(){if(tick)return;tick=true;requestAnimationFrame(function(){tick=false;spy()})},{passive:true});

document.addEventListener('click',function(e){var t=e.target,b;
  if((b=t.closest('[data-opt]'))){var qi=+b.dataset.qi,k=+b.dataset.opt;answer(qi,k,k===QS[qi].a,b);return}
  if((b=t.closest('[data-check]'))){checkNum(+b.dataset.check,b);return}
  if((b=t.closest('[data-give]'))){answer(+b.dataset.give,'—',false);return}
  if((b=t.closest('[data-open]'))){var vis=$$('.tq:not(.dim)').map(function(x){return +x.dataset.open});openQ(+b.dataset.open,vis.length?vis:null);return}
  if((b=t.closest('[data-qnav]'))){var p=modalList.indexOf(modalQ)+(+b.dataset.qnav);if(modalList[p]!=null){modalQ=modalList[p];renderModal()}return}
  if(t.closest('#qm-x')||t===$('qm')){closeQ();return}
  if((b=t.closest('#p-rand'))){var pool=QS.map(function(_,k){return k}).filter(function(k){return !ans[k]});if(!pool.length)pool=QS.map(function(_,k){return k});openQ(pool[Math.floor(Math.random()*pool.length)]);return}
  if((b=t.closest('[data-pd]'))){pDiff=b.dataset.pd;$$('[data-pd]').forEach(function(x){x.classList.toggle('on',x===b)});refreshPractice();return}
  if((b=t.closest('[data-ps]'))){pShow=b.dataset.ps;$$('[data-ps]').forEach(function(x){x.classList.toggle('on',x===b)});refreshPractice();return}
  if((b=t.closest('[data-gc]'))){gCat=b.dataset.gc;$$('[data-gc]').forEach(function(x){x.classList.toggle('on',x===b)});gHtml();return}
  if((b=t.closest('[data-gcat]'))){gCat=b.dataset.gcat;$$('[data-gc]').forEach(function(x){x.classList.toggle('on',x.dataset.gc===gCat)});gHtml();$('g-s').scrollIntoView({behavior:'smooth',block:'center'});return}
  if((b=t.closest('[data-az]'))){var el=$('az-'+b.dataset.az);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});return}
  if((b=t.closest('[data-rt]'))){rType=b.dataset.rt;$$('[data-rt]').forEach(function(x){x.classList.toggle('on',x===b)});rHtml();return}
  if((b=t.closest('[data-jump]'))){var j=$(b.dataset.jump);if(j)j.scrollIntoView({behavior:'smooth',block:'start'});return}
  if((b=t.closest('[data-done]'))){var n=b.dataset.done;done[n]=!done[n];store.set('done',done);toast(done[n]?'Lesson complete':'Marked as not done');if(done[n]){var r=b.getBoundingClientRect();confetti(r.left+r.width/2,r.top)}var y=window.scrollY;$('view').innerHTML=R.lesson(n);A.lesson(n);window.scrollTo(0,y);return}
  if(t===$('pal'))closePal()});
document.addEventListener('keydown',function(e){var t=e.target;
  if(e.key==='Enter'&&t.dataset&&t.dataset.num!=null){checkNum(+t.dataset.num,t);return}
  if(!$('pal').hidden)return;
  if(modalQ!=null){if(e.key==='Escape')closeQ();else if(t.tagName!=='INPUT'&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){var p=modalList.indexOf(modalQ)+(e.key==='ArrowRight'?1:-1);if(modalList[p]!=null){modalQ=modalList[p];renderModal()}}return}
  if($('deck')&&t.tagName!=='INPUT'){if(e.key==='ArrowLeft')decide(true);else if(e.key==='ArrowRight')decide(false)}});

/* ---------- search ---------- */
var IDX=[],sel=0,hits=[];
[['home','Join the club']].concat(NAV).concat([['reading','Reading list'],['memos','Memos']]).forEach(function(n){IDX.push([n[1],'Page',function(){location.hash=n[0]}])});
LESSONS.forEach(function(l,i){IDX.push([l.t,'Lesson '+(i+1),function(){location.hash='lesson-'+(i+1)}])});
MODULES.forEach(function(m,i){IDX.push([m.t,'Module '+(i+1),function(){location.hash='roadmap-'+(i+1)}])});
GLOSSARY.forEach(function(g){IDX.push([g.t,'Term',function(){gQ=g.t.toLowerCase();gCat='All';if(location.hash==='#library')go();else location.hash='library'}])});
LINKS.forEach(function(l){IDX.push([l.title,'Reading',function(){location.hash='reading'}])});
QS.forEach(function(q,i){IDX.push([q.q,'Question',function(){if(location.hash!=='#practice')location.hash='practice';setTimeout(function(){openQ(i)},80)}])});
function palRender(){var s=$('pal-in').value.trim().toLowerCase();hits=IDX.filter(function(x){return !s||x[0].toLowerCase().indexOf(s)>-1}).slice(0,s?10:8);if(sel>=hits.length)sel=0;
  $('pal-out').innerHTML=hits.length?hits.map(function(h,i){return '<button type="button" class="pal-r'+(i===sel?' sel':'')+'" data-i="'+i+'"><span>'+h[0]+'</span><small>'+h[1]+'</small></button>'}).join(''):'<p class="pal-e">Nothing matches. Try a shorter word.</p>'}
function openPal(){$('pal').hidden=false;$('pal-in').value='';sel=0;palRender();$('pal-in').focus()}
function closePal(){$('pal').hidden=true}
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

go();
})();
