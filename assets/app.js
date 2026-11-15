(function(){
'use strict';
/* Paste the Discord invite link here once the server exists, e.g. 'https://discord.gg/abc123'. */
var DISCORD_INVITE='';

var $=function(id){return document.getElementById(id)};
var store={get:function(k,d){try{var v=localStorage.getItem('cc.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:function(k,v){try{localStorage.setItem('cc.'+k,JSON.stringify(v))}catch(e){}}};
var inr=function(n){return Math.round(n).toLocaleString('en-IN')};
function money(n){return n>=1e7?'₹'+(n/1e7).toFixed(2)+' cr':n>=1e5?'₹'+(n/1e5).toFixed(2)+' lakh':'₹'+inr(n)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

var I={home:'<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".5"/>',cal:'<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>',tool:'<path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.5"/><circle cx="8" cy="17" r="2.5"/>',book:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>',chat:'<path d="M4 5h16v11H9l-5 4z"/>',search:'<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',flame:'<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',check:'<path d="m5 12 5 5 9-10"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',spark:'<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>',flag:'<path d="M5 21V4h11l-2 4 2 4H5"/>',grid:'<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',bolt:'<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>'};
function ico(n){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+I[n]+'</svg>'}

var done=store.get('done',{}),ans=store.get('ans',{}),uid=0,toolTab='flaw',fT='All',fD='All',fS='',gF='',timer=null;
var DAY=Math.floor(Date.now()/864e5),BASE=Math.floor(Date.UTC(2026,10,14)/864e5);
var todays=[(DAY*7)%QS.length,(DAY*7+13)%QS.length,(DAY*7+29)%QS.length];
if(todays[1]===todays[0])todays[1]=(todays[1]+1)%QS.length;if(todays[2]===todays[0]||todays[2]===todays[1])todays[2]=(todays[2]+2)%QS.length;
var TOOLS=[['flaw','Flaw or fine?','Could this forecast happen in the real world? Six cases.','flag','var(--pink-soft)','var(--pink)'],['priced','Priced in','Turn a valuation into the tonnes a company must sell.','target','var(--violet-soft)','var(--violet)'],['cagr','Compounding','Watch a growth rate bend the curve.','spark','var(--mint-soft)','var(--mint)'],['dcf','DCF sensitivity','Move two inputs by a point and watch the value swing.','grid','var(--sun-soft)','#B07400'],['drill','60-second drill','Percentages, growth and multiples against the clock.','bolt','var(--raised)','var(--ink)']];
var NAV=[['roadmap','Roadmap','map'],['practice','Practice','target'],['daily','Daily','cal'],['tools','Tools','tool'],['library','Library','book']];

/* ---------- helpers ---------- */
function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){t.hidden=true},2000)}
function slider(id,label,min,max,step,val){return '<label class="sl" for="'+id+'"><span class="sl-top"><span>'+label+'</span><output id="'+id+'o"></output></span><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'"></label>'}
function bindSliders(el,fn){Array.prototype.forEach.call(el.querySelectorAll('input[type=range]'),function(r){var f=function(){r.style.setProperty('--p',((r.value-r.min)/(r.max-r.min)*100)+'%')};f();r.addEventListener('input',function(){f();fn()})});fn()}
function lessonCount(){return LESSONS.filter(function(_,i){return done[i+1]}).length}
function modDone(m){return m.l.filter(function(n){return done[n]}).length}
function nextLesson(){for(var i=1;i<=LESSONS.length;i++)if(!done[i])return i;return 1}
function modOf(n){for(var i=0;i<MODULES.length;i++)if(MODULES[i].l.indexOf(n)>-1)return i;return 0}
function streakNow(){var s=store.get('streak',{last:-1,n:0});return (s.last===DAY||s.last===DAY-1)?s.n:0}
function syncStreak(){var all=todays.every(function(i){return ans[i]});
  if(all){var s=store.get('streak',{last:-1,n:0});if(s.last!==DAY){store.set('streak',{last:DAY,n:s.last===DAY-1?s.n+1:1})}}
  $('streak').innerHTML=ico('flame')+streakNow()}

/* ---------- questions ---------- */
function parseNum(v){v=String(v).replace(/[,₹%\s×x]/g,'').replace('−','-');return v===''?NaN:parseFloat(v)}
function tolOf(q){return q.tol!=null?q.tol:Math.max(Math.abs(q.a)*0.01,0.05)}
function fmtAns(q){if(q.type==='mcq')return q.o[q.a];var n=q.a.toLocaleString('en-IN',{maximumFractionDigits:2});if(q.unit==='₹ cr')return (q.a<0?'−₹'+n.replace('-',''):'₹'+n)+' crore';if(q.unit==='%'||q.unit==='×')return n+q.unit;return n+(q.unit?' '+q.unit:'')}
function qCard(i,showNum){var q=QS[i],a=ans[i],st=a?(a.ok?' ok':' no'):'',h='<div class="q'+st+'" data-q="'+i+'"><div class="q-top">'+(showNum?'<span class="pill">Q'+showNum+'</span>':'')+'<span class="pill">'+q.t+'</span><span class="pill '+q.d+'">'+q.d+'</span>'+(a?'<span class="pill '+(a.ok?'ok':'no')+'">'+(a.ok?'Correct':'Missed')+'</span>':'')+'</div><p class="q-q">'+q.q+'</p>';
  if(q.type==='mcq'){h+='<div class="opts">'+q.o.map(function(o,k){var c='';if(a){if(k===q.a)c=' right';else if(a.v===k)c=' wrong'}return '<button type="button" class="opt'+c+'" data-opt="'+k+'"'+(a?' disabled':'')+'>'+o+'</button>'}).join('')+'</div>'}
  else{h+='<div class="numrow"><input class="field" type="text" inputmode="decimal" placeholder="Your answer" aria-label="Your answer" data-num="'+i+'"'+(a?' value="'+esc(a.v)+'" disabled':'')+'>'+(q.unit?'<span class="unit">'+q.unit+'</span>':'')+(a?'':'<button type="button" class="btn sm" data-check="'+i+'">Check</button><button type="button" class="link" data-give="'+i+'">Show answer</button>')+'</div>'}
  if(a)h+='<div class="fb '+(a.ok?'ok':'no')+'"><b>'+(a.ok?'Correct.':'Answer: '+fmtAns(q))+'</b><span>'+q.s+'</span></div>';
  return h+'</div>'}
function answer(i,v,ok){ans[i]={ok:ok,v:v};store.set('ans',ans);var el=document.querySelector('.q[data-q="'+i+'"]');if(el){var n=el.querySelector('.pill')&&el.querySelector('.pill').textContent;var tmp=document.createElement('div');tmp.innerHTML=qCard(i,/^Q\d$/.test(n)?n.slice(1):0);el.replaceWith(tmp.firstChild)}
  syncStreak();dailyStatus();if($('q-c'))qCount()}
function checkNum(i){var q=QS[i],inp=document.querySelector('[data-num="'+i+'"]'),v=parseNum(inp.value);if(isNaN(v)){toast('Type a number first');inp.focus();return}answer(i,inp.value,Math.abs(v-q.a)<=tolOf(q)+1e-9)}

/* ---------- widgets ---------- */
function curveSvg(id,rate,years,W,H){var l=6,t=10,b=26,max=Math.pow(1+rate,years),a=[],s=[],i;
  var X=function(k){return l+k/years*(W-2*l)},Y=function(v){return H-b-((v-1)/(max-1||1))*(H-b-t)};
  for(i=0;i<=years;i++){a.push(X(i).toFixed(1)+' '+Y(Math.pow(1+rate,i)).toFixed(1));s.push(X(i).toFixed(1)+' '+Y(1+rate*i).toFixed(1))}
  var gl='';for(i=1;i<=3;i++){var yy=t+(H-b-t)*i/4;gl+='<line x1="'+l+'" x2="'+(W-l)+'" y1="'+yy+'" y2="'+yy+'" stroke="var(--line)" stroke-dasharray="3 5"/>'}
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Growth over '+years+' years at '+Math.round(rate*100)+' percent"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--violet)" stop-opacity=".35"/><stop offset="1" stop-color="var(--violet)" stop-opacity="0"/></linearGradient></defs>'+gl+'<path d="M'+a.join('L')+'L'+X(years)+' '+(H-b)+'L'+l+' '+(H-b)+'Z" fill="url(#'+id+')"/><path d="M'+s.join('L')+'" fill="none" stroke="var(--faint)" stroke-width="1.6" stroke-dasharray="5 5"/><path d="M'+a.join('L')+'" fill="none" stroke="var(--violet)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="'+X(years)+'" cy="'+Y(max)+'" r="6" fill="var(--sun)" stroke="var(--hard)" stroke-width="2"/><text x="'+l+'" y="'+(H-6)+'">Today</text><text x="'+(W-l)+'" y="'+(H-6)+'" text-anchor="end">Year '+years+'</text></svg>'}
function mountTicker(el){var rate=.15,yrs=20,id='t'+(++uid);
  el.innerHTML='<div class="tick-h"><span class="sym">CAGR</span><div><b>₹1 lakh, compounding</b><small>Live demo · pick a rate and a horizon</small></div><span class="chg" id="'+id+'c"></span></div><div class="price" id="'+id+'p"></div><div class="row" style="gap:8px"><div class="seg" id="'+id+'r">'+[8,12,15,20,25].map(function(r){return '<button type="button" data-r="'+r+'"'+(r===15?' class="on"':'')+'>'+r+'%</button>'}).join('')+'</div><div class="seg" id="'+id+'y">'+[5,10,20,30].map(function(y){return '<button type="button" data-y="'+y+'"'+(y===20?' class="on"':'')+'>'+y+'Y</button>'}).join('')+'</div></div><div class="chart" id="'+id+'g"></div><div class="tick-f"><div><span>Grows to</span><b id="'+id+'v"></b></div><div><span>Multiple</span><b id="'+id+'m"></b></div><div><span>Without compounding</span><b id="'+id+'s"></b></div></div>';
  function draw(){var m=Math.pow(1+rate,yrs);$(id+'c').textContent='+'+Math.round(rate*100)+'% a year';$(id+'p').innerHTML=money(1e5*m)+'<small>after '+yrs+' years</small>';$(id+'g').innerHTML=curveSvg(id+'f',rate,yrs,460,200);$(id+'v').textContent=money(1e5*m);$(id+'m').textContent=m.toFixed(m<10?2:1)+'×';$(id+'s').textContent=money(1e5*(1+rate*yrs))}
  el.addEventListener('click',function(e){var b=e.target.closest('[data-r],[data-y]');if(!b)return;if(b.dataset.r)rate=b.dataset.r/100;else yrs=+b.dataset.y;Array.prototype.forEach.call(b.parentNode.children,function(x){x.classList.toggle('on',x===b)});draw()});draw()}
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
function mountFlaw(el){var fi=0,right=0;
  el.innerHTML='<div class="out"><span class="small" id="f-n"></span><p class="case" id="f-t"></p><div class="row"><button class="btn sm" id="f-y" type="button">Flaw</button><button class="btn sm alt" id="f-x" type="button">Fine</button></div><div id="f-r"></div></div>';
  function show(){$('f-t').textContent=FLAWS[fi][0];$('f-r').innerHTML='';$('f-y').disabled=$('f-x').disabled=false;$('f-n').textContent='Case '+(fi+1)+' of '+FLAWS.length+' · '+right+' right so far'}
  function go(y){var f=FLAWS[fi],ok=y===f[1],last=fi===FLAWS.length-1;if(ok)right++;$('f-y').disabled=$('f-x').disabled=true;
    $('f-r').innerHTML='<div class="out"><span class="verd '+(ok?'good':'bad')+'">'+(ok?'Correct':'Not quite')+'</span><span>It is '+(f[1]?'a flaw':'fine')+'. '+f[2]+'</span><button class="btn sm alt" id="f-nx" type="button">'+(last?'Start again ('+right+' of '+FLAWS.length+' right)':'Next case')+'</button></div>';
    $('f-nx').addEventListener('click',function(){if(last){fi=0;right=0}else fi++;show()})}
  $('f-y').addEventListener('click',function(){go(true)});$('f-x').addEventListener('click',function(){go(false)});show()}
function mountDrill(el){var av=0,score=0,asked=0,left=0;
  el.innerHTML='<div class="out"><div class="big" id="m-q">Ready when you are.</div><div class="row"><input class="field" id="m-a" type="text" inputmode="decimal" aria-label="Your answer" placeholder="Your answer" disabled style="width:170px"><button class="btn sm" id="m-go" type="button">Start</button><span class="small" id="m-s">Answers within 2% count. Press Enter to submit.</span></div></div>';
  var rnd=function(a){return a[Math.floor(Math.random()*a.length)]};
  function next(){var k=Math.floor(Math.random()*3);
    if(k===0){var p=rnd([5,12,15,18,25,35,40]),n=rnd([240,360,480,640,800,1200]);av=p*n/100;$('m-q').textContent='What is '+p+'% of '+n+'?'}
    else if(k===1){var a=rnd([200,400,500,800]),g=rnd([10,15,20,25,30,40,60]);av=g;$('m-q').textContent='Sales go from '+a+' to '+(a*(100+g)/100)+'. Growth in %?'}
    else{var e=rnd([8,12,15,20,25,40]),pe=rnd([12,15,18,22,30]);av=pe;$('m-q').textContent='Price '+(e*pe)+', EPS '+e+'. P/E?'}
    asked++;$('m-a').value='';$('m-a').focus()}
  function end(){clearInterval(timer);timer=null;$('m-a').disabled=true;$('m-go').textContent='Go again';$('m-q').textContent=score+' right in 60 seconds';$('m-s').textContent=(asked-1)+' answered'}
  $('m-go').addEventListener('click',function(){score=0;asked=0;left=60;$('m-a').disabled=false;$('m-go').textContent='Restart';clearInterval(timer);
    timer=setInterval(function(){left--;if(!$('m-s')){clearInterval(timer);return}$('m-s').textContent=left+'s left · '+score+' right';if(left<=0)end()},1000);$('m-s').textContent='60s left · 0 right';next()});
  $('m-a').addEventListener('keydown',function(e){if(e.key!=='Enter'||!timer||this.value==='')return;var v=parseNum(this.value);if(Math.abs(v-av)<=Math.abs(av)*.02)score++;$('m-s').textContent=left+'s left · '+score+' right';next()})}
var MOUNT={flaw:mountFlaw,priced:mountPriced,cagr:mountCagr,dcf:mountDcf,drill:mountDrill,pnl:mountPnl};

/* ---------- shared blocks ---------- */
function pathBlock(){return '<div class="path">'+MODULES.map(function(m,i){var d=modDone(m);return '<a class="mod'+(d===m.l.length?' done':'')+'" href="#roadmap-'+(i+1)+'"><span class="n">'+(d===m.l.length?ico('check'):i+1)+'</span><b>'+m.t+'</b><small>'+m.l.length+' lessons'+(d?' · '+d+' done':'')+'</small></a>'}).join('')+'</div>'}
function discordBlock(full){var has=!!DISCORD_INVITE;
  var chans=[['START HERE',[['welcome',''],['introduce-yourself','']]],['LEARN',[['daily-set','8:30 IST',1],['ask-a-question','']]],['MARKETS',[['earnings-season',''],['india-markets','']]],['CAREERS',[['pitch-pit','feedback'],['interview-prep','']]]];
  return '<section class="club"><div class="sec" style="gap:18px"><h2>'+(full?'The club, on Discord':'Learn alongside people chasing the same seat')+'</h2><p class="lede">A Discord for people learning equity research. The daily question lands every morning at 8:30 IST, pitches get honest feedback in the pitch pit, and earnings season has its own channel.</p><div class="row">'+(has?'<a class="btn" href="'+DISCORD_INVITE+'" target="_blank" rel="noopener">Join the Discord</a>':'<button class="btn" type="button" disabled>Opening soon</button>')+'</div>'+(has?'':'<p class="small" style="color:#9F96C6">The server opens shortly. Come back here for the invite link.</p>')+'</div>'+
  '<div class="dc" aria-hidden="true"><div class="dc-h"><i>'+'<svg viewBox="0 0 32 32" width="18" height="18"><path d="M7 23c6-.5 11-4 17-14" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></svg>'+'</i>CAGR Club</div>'+chans.map(function(g){return '<div class="dc-l">'+g[0]+'</div>'+g[1].map(function(c){return '<div class="dc-c'+(c[2]?' on':'')+'"><b>#</b>'+c[0]+(c[1]?'<small>'+c[1]+'</small>':'')+'</div>'}).join('')}).join('')+'</div></section>'}

/* ---------- views ---------- */
var R={},A={};
R.home=function(){var q=QS[todays[0]],no=dailyNo(),has=!!DISCORD_INVITE;
  var cta=function(big){return has?'<a class="btn'+(big?' xl':'')+'" href="'+DISCORD_INVITE+'" target="_blank" rel="noopener">'+ico('chat')+'Join the Discord</a>':'<span class="btn'+(big?' xl':'')+' soon" aria-disabled="true">'+ico('chat')+'Invite opens soon</span>'};
  var opts=q.type==='mcq'?'<div class="dm-opts">'+q.o.map(function(o,k){return '<span><b>'+'ABCD'[k]+'</b>'+o+'</span>'}).join('')+'</div>':'';
  var week=[];for(var k=0;k<7;k++){var d=DAY+k,qi=(d*7)%QS.length,dt=new Date(d*864e5),sun=dt.getUTCDay()===0;week.push([k===0?'Today':dt.toLocaleDateString('en-GB',{weekday:'short',timeZone:'UTC'}),QS[qi].t+' · '+QS[qi].d,sun?LESSONS[(Math.floor((d-BASE)/7)%LESSONS.length)].t:'',sun])}
  return '<section class="lp-hero"><div class="lp-copy"><span class="eyebrow-pill"><i></i>Free community · Learning equity research</span><h1>The club for people who want to <span class="hl">become analysts</span>.</h1><p class="lede">CAGR Club is a Discord for students and early-career people learning equity research in India. A question every morning, a lesson every Sunday, a place to pitch stocks and get real feedback, and people working towards the same seat.</p><div class="row">'+cta(true)+'<a class="btn alt xl" href="#roadmap">See the curriculum</a></div><p class="small fine">No tips. No calls. No paid groups. Education only.</p></div>'+
  '<div class="dm" aria-hidden="true"><div class="dm-bar"><span class="dm-dots"><i></i><i></i><i></i></span><b># daily-set</b><small>CAGR Club</small></div><div class="dm-body">'+
   '<div class="dm-msg m1"><span class="dm-av">'+ico('spark')+'</span><div><p class="dm-who">CAGR Club <em>BOT</em> <small>Today at 8:30</small></p><div class="dm-embed"><p class="dm-t">Daily #'+no+' · '+q.t+' · '+q.d+'</p><p>'+q.q+'</p>'+opts+'<p class="dm-f">Reply with your answer before you open the spoiler.</p></div><p class="dm-spoil"><b>Answer:</b> <span class="sp" tabindex="0" role="button" aria-label="Reveal answer">'+esc(fmtAns(q))+'</span></p></div></div>'+
   '<div class="dm-msg m2"><span class="dm-av pink">'+ico('book')+'</span><div><p class="dm-who">CAGR Club <em>BOT</em> <small>Sunday at 10:00</small></p><div class="dm-embed pink"><p class="dm-t">Lesson of the week</p><p><b>'+LESSONS[(Math.floor((DAY-BASE)/7)%LESSONS.length)].t+'</b></p><p class="dm-f">Full lesson in the thread · '+LESSONS.length+' lessons, one each week</p></div></div></div>'+
   '<div class="dm-input">Message #daily-set</div></div></div></section>'+
  '<section class="sec"><div class="sec-h"><div><h2>What happens inside</h2><p>Four rituals, each in its own channel, so there is always something to do and nothing gets lost in a single chat.</p></div></div><div class="rituals">'+
   [['8:30 IST, daily','Daily question','#daily-set','One question with an exact answer. Reply first, then open the spoiler to see the working.','violet'],['Sundays, 10:00 IST','Lesson of the week','#lesson-notes','A full lesson from the roadmap, with a thread for questions underneath.','pink'],['Any time','The pitch pit','#pitch-pit','Post a stock pitch in a set template and get structured feedback on thesis, numbers and risks.','mint'],['Results weeks','Earnings season','#earnings-season','One thread per company: what was expected, what was reported, what changed.','sun']].map(function(r){return '<article class="rit '+r[4]+'"><span class="rit-when">'+r[0]+'</span><h3>'+r[1]+'</h3><code>'+r[2]+'</code><p>'+r[3]+'</p></article>'}).join('')+'</div></section>'+
  '<section class="sec"><div class="sec-h"><div><h2>The next seven days</h2><p>The real topics coming up in #daily-set, plus Sunday\'s lesson. Posts go out automatically, so the server never goes quiet.</p></div></div><div class="week">'+week.map(function(d){return '<div class="wk'+(d[3]?' sun':'')+'"><b>'+d[0]+'</b><span>8:30 · '+d[1]+'</span>'+(d[2]?'<span>10:00 · Lesson: '+d[2]+'</span>':'')+'</div>'}).join('')+'</div></section>'+
  '<section class="sec"><div class="sec-h"><div><h2>Who it is for</h2><p>Members pick a role when they join, so you can find people at the same stage.</p></div></div><div class="who">'+[['Student','You are curious about markets and want to learn how analysts actually work, from the first balance sheet.','#lesson-1','Start at lesson 1'],['Candidate','You have research or finance interviews coming up and need practice, pitch feedback and people to mock with.','#practice','Practise questions'],['Analyst','You already work in research, credit or banking and want to help others, or sharpen your own edge.','#roadmap','See the roadmap']].map(function(w){return '<article class="card pad who-c"><h3>'+w[0]+'</h3><p>'+w[1]+'</p><a class="link" href="'+w[2]+'">'+w[3]+ico('arrow')+'</a></article>'}).join('')+'</div></section>'+
  '<section class="sec"><div class="sec-h"><div><h2>Built on a full curriculum</h2><p>The club runs on the same material as this site: '+LESSONS.length+' lessons in '+MODULES.length+' modules, '+QS.length+' practice questions with exact answers, and tools you can play with.</p></div><a class="btn sm alt" href="#roadmap">Open the roadmap</a></div>'+pathBlock()+'</section>'+
  '<section class="rules"><h2>House rules, short version</h2><div class="rules-g">'+[['No tips, no calls','No buy or sell recommendations, trading targets, or paid groups.'],['Show your working','A number comes with its source or its calculation.'],['Be useful to beginners','Everyone started by not knowing what EBITDA meant.']].map(function(r,k){return '<div><span>'+(k+1)+'</span><h3>'+r[0]+'</h3><p>'+r[1]+'</p></div>'}).join('')+'</div></section>'+
  '<section class="final"><h2>Pull up a chair.</h2><p class="lede">Free, and open to anyone learning equity research.</p><div class="row" style="justify-content:center">'+cta(true)+'</div></section>'+
  '<section class="sec"><h2>Questions people ask first</h2><div class="faq">'+[['Is it free?','Yes. The Discord, the lessons, the questions and the tools are all free.'],['Do I need a finance background?','No. Plenty of members start with the first lesson on reading a profit and loss statement.'],['Will anyone tell me what to buy?','No. Recommending trades is against the rules. The club is about learning how to analyse businesses.'],['Is this run by a company?','It is an independent learning community, not a broker, adviser or course seller.']].map(function(f){return '<details><summary>'+f[0]+'</summary><p>'+f[1]+'</p></details>'}).join('')+'</div></section>'};
A.home=function(){var sp=document.querySelector('.sp');if(sp){var r=function(){sp.classList.add('open')};sp.addEventListener('click',r);sp.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')r()})}};
function homeSq(){if($('home-sq'))$('home-sq').innerHTML=todays.map(function(i){return '<i class="'+(ans[i]?(ans[i].ok?'ok':'no'):'')+'"></i>'}).join('')}
function topicCounts(){var c={},o=[];QS.forEach(function(q){if(!c[q.t]){c[q.t]=0;o.push(q.t)}c[q.t]++});return o.map(function(t){return [t,c[t]]})}
function tileHtml(t){return '<button class="tile" type="button" data-tool="'+t[0]+'"><span class="glyph" style="background:'+t[4]+';color:'+t[5]+'">'+ico(t[3])+'</span><h3>'+t[1]+'</h3><p>'+t[2]+'</p></button>'}

R.roadmap=function(open){var n=lessonCount(),tot=LESSONS.length,pc=n/tot,C=2*Math.PI*70;
  return '<section class="rm-head"><div class="sec" style="gap:16px"><span class="pill" style="align-self:flex-start">Roadmap</span><h1>Equity Research Analyst</h1><p class="lede">From reading the three statements to writing an initiation note and pitching a stock. '+tot+' lessons in '+MODULES.length+' modules, about four hours of reading, done in order.</p><div class="row"><a class="btn" href="#lesson-'+nextLesson()+'">'+(n?'Continue lesson '+nextLesson():'Start lesson 1')+ico('arrow')+'</a></div></div><div class="ring"><svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="70" fill="none" stroke="var(--raised)" stroke-width="14"/><circle cx="80" cy="80" r="70" fill="none" stroke="var(--violet)" stroke-width="14" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-pc))+'"/></svg><div><b>'+Math.round(pc*100)+'%</b><span>'+n+' of '+tot+' done</span></div></div></section>'+
  '<section class="card pad" style="padding-block:6px">'+MODULES.map(function(m,i){var d=modDone(m),all=d===m.l.length;
    return '<div class="module" id="mod-'+(i+1)+'"><span class="m-n'+(all?' done':'')+'">'+(i+1)+'</span><div class="m-b"><h2 style="font-size:21px">'+m.t+'</h2><p>'+m.d+' <span class="small">'+d+' of '+m.l.length+' done</span></p><div class="ls">'+m.l.map(function(k){var L=LESSONS[k-1];return '<a class="l'+(done[k]?' done':'')+'" href="#lesson-'+k+'"><span class="k">'+(done[k]?ico('check'):k)+'</span><span><b>'+L.t+'</b><small>'+L.min+' min'+(L.w?' · includes a tool':'')+'</small></span></a>'}).join('')+'</div></div></div>'}).join('')+'</section>'};
A.roadmap=function(open){if(open){var el=$('mod-'+open);if(el)setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'start'})},60)}};

R.lesson=function(k){var n=+k,L=LESSONS[n-1];if(!L)return R.roadmap();var mi=modOf(n),rail='',body='';
  L.secs.forEach(function(s,i){body+='<h2 id="s'+i+'">'+s[0]+'</h2><p>'+s[1]+'</p>';rail+='<button type="button" data-jump="s'+i+'">'+s[0]+'</button>'});
  if(L.w){body+='<h2 id="sw">Try it</h2><div class="card pad" id="lw"></div>';rail+='<button type="button" data-jump="sw">Try it</button>'}
  rail+='<button type="button" data-jump="se">Worked example</button><button type="button" data-jump="sc">Check yourself</button>';
  return '<div class="lesson"><article><div class="crumbs"><a href="#roadmap">Roadmap</a><span>/</span><a href="#roadmap-'+(mi+1)+'">Module '+(mi+1)+': '+MODULES[mi].t+'</a></div><p class="small">Lesson '+n+' of '+LESSONS.length+' · about '+L.min+' minutes</p><h1 style="font-size:clamp(30px,4.4vw,46px)">'+L.t+'</h1><p class="lede">'+L.sum+'</p><div class="key">'+L.key+'</div>'+body+
  '<h2 id="se">Worked example</h2><div class="worked">'+L.ex+'</div><h2 id="sc">Check yourself</h2><div class="reveal"><p>'+L.cq+'</p><div id="ca"><button class="btn sm alt" type="button" id="ca-b">Reveal the answer</button></div></div>'+
  '<div class="done-row"><span>'+(done[n]?'You finished this lesson.':'Finished reading?')+'</span><button class="btn sm'+(done[n]?' alt':'')+'" type="button" data-done="'+n+'">'+(done[n]?'Mark as not done':'Mark complete')+'</button></div>'+
  '<nav class="pn">'+(n>1?'<a href="#lesson-'+(n-1)+'"><small>Previous</small>'+LESSONS[n-2].t+'</a>':'<span></span>')+(n<LESSONS.length?'<a href="#lesson-'+(n+1)+'"><small>Next</small>'+LESSONS[n].t+'</a>':'<a href="#practice"><small>Next</small>Test yourself in practice</a>')+'</nav></article><aside class="rail"><p>On this page</p>'+rail+'</aside></div>'};
A.lesson=function(k){var L=LESSONS[+k-1];if(!L)return;if(L.w)MOUNT[L.w]($('lw'));$('ca-b').addEventListener('click',function(){$('ca').innerHTML='<p style="font-weight:500">'+L.ca+'</p>'});spy()};

function qCount(){var n=0,c=0;Object.keys(ans).forEach(function(k){n++;if(ans[k].ok)c++});$('q-c').textContent=qIdx().length+' shown · '+n+' answered · '+c+' correct'}
function qIdx(){var r=[];QS.forEach(function(q,i){if((fT==='All'||q.t===fT)&&(fD==='All'||q.d===fD)&&(!fS||(q.q+' '+q.t).toLowerCase().indexOf(fS)>-1))r.push(i)});return r}
function qList(){var idx=qIdx();qCount();$('q-l').innerHTML=idx.length?idx.map(function(i){return qCard(i)}).join(''):'<p class="small">No questions match. Clear the search or choose another topic.</p>'}
R.practice=function(){var topics=['All'].concat(topicCounts().map(function(t){return t[0]}));
  return '<section class="sec" style="max-width:880px;width:100%"><span class="pill" style="align-self:flex-start">Practice</span><h1>Question bank</h1><p class="lede">Every question has one right answer. Type a number or pick an option, then see the working. Your progress stays in this browser.</p><div class="filters"><input class="field" id="q-s" type="search" placeholder="Search questions" aria-label="Search questions" value="'+esc(fS)+'"><div class="chips">'+topics.map(function(t){return '<button type="button" class="chip'+(t===fT?' on':'')+'" data-topic="'+t+'">'+t+'</button>'}).join('')+'</div><div class="chips">'+['All','Easy','Medium','Hard'].map(function(d){return '<button type="button" class="chip'+(d===fD?' on':'')+'" data-diff="'+d+'">'+d+'</button>'}).join('')+'</div></div><div class="row" style="justify-content:space-between"><p class="small" id="q-c"></p><button class="link" type="button" id="q-reset">Reset my answers</button></div><div class="qlist" id="q-l"></div></section>'};
A.practice=function(){qList();$('q-s').addEventListener('input',function(){fS=this.value.trim().toLowerCase();qList()});$('q-reset').addEventListener('click',function(){ans={};store.set('ans',ans);qList();syncStreak();toast('Answers cleared')})};

function dailyNo(){return Math.max(1,DAY-BASE+1)}
R.daily=function(){var term=GLOSS[DAY%GLOSS.length];
  return '<section class="sec" style="max-width:880px;width:100%"><div class="daily-h"><div class="sec" style="gap:12px"><span class="pill" style="align-self:flex-start">Daily · No. '+dailyNo()+' · '+new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'})+'</span><h1>Today\'s three</h1><p class="lede">Same three for everyone. New set at midnight UTC. Answer all three to keep your streak.</p></div><div class="sq" id="d-sq"></div></div><div class="qlist">'+todays.map(function(i,k){return qCard(i,k+1)}).join('')+'</div><div id="d-s"></div><div class="card term"><span class="pill" style="align-self:flex-start">Term of the day</span><h3>'+term[0]+'</h3><p>'+term[1]+'</p></div></section>'};
function dailyStatus(){homeSq();if(!$('d-sq'))return;$('d-sq').innerHTML=todays.map(function(i){return '<i class="'+(ans[i]?(ans[i].ok?'ok':'no'):'')+'"></i>'}).join('');
  var n=todays.filter(function(i){return ans[i]}).length,c=todays.filter(function(i){return ans[i]&&ans[i].ok}).length;
  $('d-s').innerHTML=n===3?'<div class="share"><div><h2 style="font-size:22px;color:inherit">'+c+' of 3 today</h2><p>Streak: '+streakNow()+' day'+(streakNow()===1?'':'s')+'. New set at midnight UTC.</p></div><button class="btn sm" type="button" id="d-share">Copy my result</button></div>':'<p class="small">'+n+' of 3 answered.</p>';
  if($('d-share'))$('d-share').addEventListener('click',function(){var txt='CAGR Club Daily #'+dailyNo()+'  '+todays.map(function(i){return ans[i].ok?'🟩':'🟥'}).join('')+'\ncagrclub.com';
    try{navigator.clipboard.writeText(txt).then(function(){toast('Copied. Paste it anywhere.')},function(){toast(txt)})}catch(e){toast(txt)}})}
A.daily=dailyStatus;

R.tools=function(){return '<section class="sec" style="width:100%"><span class="pill" style="align-self:flex-start">Tools</span><h1>Break things on purpose</h1><p class="lede">Small experiments. Change an assumption and watch what it does to the answer. Companies and figures are invented.</p><div class="seg" role="tablist" id="t-seg">'+TOOLS.map(function(t){return '<button type="button" role="tab" data-tab="'+t[0]+'"'+(t[0]===toolTab?' class="on"':'')+'>'+t[1]+'</button>'}).join('')+'</div><div class="card pad"><div id="t-h" style="margin-bottom:18px"></div><div id="t-b"></div></div></section>'};
A.tools=function(){var t=TOOLS.filter(function(x){return x[0]===toolTab})[0];clearInterval(timer);timer=null;$('t-h').innerHTML='<h2 style="font-size:24px">'+t[1]+'</h2><p class="small" style="margin-top:6px">'+t[2]+'</p>';MOUNT[toolTab]($('t-b'));
  Array.prototype.forEach.call($('t-seg').children,function(b){b.classList.toggle('on',b.dataset.tab===toolTab)})};

function gList(){$('g-l').innerHTML=GLOSS.filter(function(g){return !gF||(g[0]+g[1]).toLowerCase().indexOf(gF)>-1}).map(function(g){return '<div class="card term"><h3>'+g[0]+'</h3><p>'+g[1]+'</p></div>'}).join('')||'<p class="small">No terms match.</p>'}
R.library=function(){return '<section class="sec"><span class="pill" style="align-self:flex-start">Library</span><h1>Glossary</h1><p class="lede">The desk\'s vocabulary, one plain sentence each.</p><input class="field" id="g-s" type="search" placeholder="Search terms" aria-label="Search terms" value="'+esc(gF)+'"><div class="terms" id="g-l"></div></section><section class="sec"><h2>Memos</h2><p class="lede">Short notes, one idea each.</p>'+MEMOS.map(function(m){return '<article class="card memo"><h3 style="font-size:20px">'+m[0]+'</h3><p>'+m[1]+'</p></article>'}).join('')+'</section>'};
A.library=function(){gList();$('g-s').addEventListener('input',function(){gF=this.value.trim().toLowerCase();gList()})};

R.community_old=function(){return discordBlock(true)+'<section class="grid3">'+[['Daily question at 8:30 IST','The same question as the site\'s daily set, posted every morning with the answer hidden behind a spoiler.'],['The pitch pit','Post a stock pitch in the agreed format and get structured feedback on thesis, numbers and risks.'],['Earnings season','During results weeks, one thread per company: what was expected, what came out, what changed.']].map(function(c){return '<div class="card pad" style="display:flex;flex-direction:column;gap:8px"><h3>'+c[0]+'</h3><p class="small">'+c[1]+'</p></div>'}).join('')+'</section><section class="sec"><h2>House rules</h2><div class="faq">'+[['No tips, no calls','No buy or sell recommendations, price targets for trading, or paid groups. Discuss businesses and methods, not what to trade tomorrow.'],['Show your working','A number without its source or calculation gets a question, not an argument.'],['Be useful to beginners','Everyone here started by not knowing what EBITDA meant.']].map(function(f){return '<details><summary>'+f[0]+'</summary><p>'+f[1]+'</p></details>'}).join('')+'</div></section>'};

/* ---------- shell ---------- */
$('nav').innerHTML=NAV.map(function(n){return '<a href="#'+n[0]+'" data-nav="'+n[0]+'">'+n[1]+'</a>'}).join('');
$('tabs').innerHTML=[['home','Club','chat']].concat(NAV.slice(0,4)).map(function(n){return '<a href="#'+n[0]+'" data-nav="'+n[0]+'">'+ico(n[2])+n[1]+'</a>'}).join('');
$('find').innerHTML=ico('search')+'<span>Search</span><kbd>'+(/Mac|iPhone|iPad/.test(navigator.platform||'')?'⌘K':'Ctrl K')+'</kbd>';
function themeIcon(){var d=document.documentElement.getAttribute('data-theme')||(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');$('theme').innerHTML=ico(d==='dark'?'sun':'moon')}
var th=store.get('theme',null);if(th)document.documentElement.setAttribute('data-theme',th);themeIcon();
$('theme').addEventListener('click',function(){var cur=document.documentElement.getAttribute('data-theme')||(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'),nx=cur==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',nx);store.set('theme',nx);themeIcon()});

function parse(){var h=(location.hash||'').replace('#',''),m;
  if((m=h.match(/^lesson-(\d+)$/)))return ['lesson',m[1]];if((m=h.match(/^roadmap-(\d+)$/)))return ['roadmap',m[1]];
  if(/^road-|^roadmaps$/.test(h))return ['roadmap'];if(h==='questions')return ['practice'];if(h==='community'||h==='join')return ['home'];if(h==='glossary'||h==='memos')return ['library'];
  return [R[h]&&h!=='lesson'?h:'home']}
function go(){var p=parse(),name=p[0],v=$('view');clearInterval(timer);timer=null;
  v.innerHTML=R[name](p[1]);if(A[name])A[name](p[1]);
  var key=name==='lesson'?'roadmap':name;var jt=$('join-top');if(jt){jt.hidden=name==='home';if(DISCORD_INVITE){jt.href=DISCORD_INVITE;jt.target='_blank';jt.rel='noopener'}}
  Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'),function(a){a.classList.toggle('on',a.dataset.nav===key)});
  document.title=name==='lesson'?LESSONS[+p[1]-1].t+' · CAGR Club':name==='home'?'CAGR Club':(NAV.filter(function(n){return n[0]===name})[0]||[0,'CAGR Club'])[1]+' · CAGR Club';
  $('readbar').style.width='0';if(!(name==='roadmap'&&p[1]))window.scrollTo(0,0);v.classList.remove('in');void v.offsetWidth;v.classList.add('in');syncStreak()}
window.addEventListener('hashchange',go);

function spy(){var hs=document.querySelectorAll('.lesson article h2'),bs=document.querySelectorAll('.rail button'),cur=0,i;
  if(!hs.length){$('readbar').style.width='0';return}
  for(i=0;i<hs.length;i++){if(hs[i].getBoundingClientRect().top<150)cur=i}
  for(i=0;i<bs.length;i++)bs[i].classList.toggle('on',i===cur);
  var d=document.documentElement,max=d.scrollHeight-window.innerHeight;$('readbar').style.width=(max>0?Math.min(100,window.scrollY/max*100):0)+'%'}
var tick=false;window.addEventListener('scroll',function(){if(tick)return;tick=true;requestAnimationFrame(function(){tick=false;spy()})},{passive:true});

document.addEventListener('click',function(e){var t=e.target,b;
  if((b=t.closest('[data-opt]'))){var qi=+b.closest('.q').dataset.q,k=+b.dataset.opt;answer(qi,k,k===QS[qi].a);return}
  if((b=t.closest('[data-check]'))){checkNum(+b.dataset.check);return}
  if((b=t.closest('[data-give]'))){answer(+b.dataset.give,'—',false);return}
  if((b=t.closest('[data-topic]'))){fT=b.dataset.topic;Array.prototype.forEach.call(b.parentNode.children,function(x){x.classList.toggle('on',x===b)});qList();return}
  if((b=t.closest('[data-diff]'))){fD=b.dataset.diff;Array.prototype.forEach.call(b.parentNode.children,function(x){x.classList.toggle('on',x===b)});qList();return}
  if((b=t.closest('[data-settopic]'))){fT=b.dataset.settopic;fD='All';fS='';return}
  if((b=t.closest('[data-tab]'))){toolTab=b.dataset.tab;A.tools();return}
  if((b=t.closest('[data-tool]'))){toolTab=b.dataset.tool;if(location.hash==='#tools')go();else location.hash='tools';return}
  if((b=t.closest('[data-jump]'))){var el=$(b.dataset.jump);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});return}
  if((b=t.closest('[data-done]'))){var n=b.dataset.done;done[n]=!done[n];store.set('done',done);toast(done[n]?'Lesson complete':'Marked as not done');var y=window.scrollY;$('view').innerHTML=R.lesson(n);A.lesson(n);window.scrollTo(0,y);return}
  if(t===$('pal'))closePal()});
document.addEventListener('keydown',function(e){var t=e.target;if(e.key==='Enter'&&t.dataset&&t.dataset.num!=null){checkNum(+t.dataset.num)}});

/* ---------- search ---------- */
var IDX=[],sel=0,hits=[];
NAV.forEach(function(n){IDX.push([n[1],'Page',function(){location.hash=n[0]}])});
LESSONS.forEach(function(l,i){IDX.push([l.t,'Lesson '+(i+1),function(){location.hash='lesson-'+(i+1)}])});
MODULES.forEach(function(m,i){IDX.push([m.t,'Module '+(i+1),function(){location.hash='roadmap-'+(i+1)}])});
TOOLS.forEach(function(t){IDX.push([t[1],'Tool',function(){toolTab=t[0];if(location.hash==='#tools')go();else location.hash='tools'}])});
GLOSS.forEach(function(g){IDX.push([g[0],'Term',function(){gF=g[0].toLowerCase();if(location.hash==='#library')go();else location.hash='library'}])});
QS.forEach(function(q){IDX.push([q.q,'Question',function(){fT='All';fD='All';fS=q.q.slice(0,30).toLowerCase();if(location.hash==='#practice')go();else location.hash='practice'}])});
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
