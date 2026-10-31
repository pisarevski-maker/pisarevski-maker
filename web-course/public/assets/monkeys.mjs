import {FIELD,HEALTH_COLORS,createDuel,alive,launchVelocity,dragAim,selectMonkey,throwStone,updateDuel} from './monkeys-core.mjs';

const $=id=>document.getElementById(id),canvas=$('duelCanvas'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let duel=createDuel(),count=1,angle=45,power=70,paused=false,drag=null,last=0,lastNotice='',lastPhase='',particles=[],knocked=new Map(),popTimer,uiTime=0;
const starfield=Array.from({length:65},(_,i)=>({x:(i*173.7)%1000,y:(i*61.9)%310,r:i%7===0?1.6:.7}));
function selected(){return duel.monkeys.find(m=>m.id===duel.selected);}
function resetControls(){drag=null;lastNotice='';lastPhase='';}
function setup(n=count){
  count=n;duel=createDuel(count);paused=false;particles=[];knocked.clear();resetControls();document.body.classList.remove('is-playing');
  $('duelOverlay').hidden=false;$('duelSetup').hidden=false;$('duelStart').textContent='Почати двобій ↗';$('duelPause').disabled=true;
  $('duelKicker').textContent='КОСМІЧНІ ДЖУНГЛІ АЙНАЇ';$('duelTitle').textContent='Хто кого перекине?';$('duelDescription').textContent='Кумедні мавпочки, круглі камінці й велика пригода. Три влучання — і мавпочка весело вилітає з гри!';
  document.querySelectorAll('[data-team]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.team)===count)));teamButtons();updateUI();
}
function start(){
  if(paused){resume();return;}
  duel=createDuel(count);duel.status='playing';paused=false;particles=[];knocked.clear();resetControls();document.body.classList.add('is-playing');$('duelOverlay').hidden=true;$('duelPause').disabled=false;$('duelPop').classList.remove('show');teamButtons();updateUI();canvas.focus({preventScroll:true});
}
function pause(){
  if(duel.status!=='playing'||paused)return;paused=true;drag=null;$('duelOverlay').hidden=false;$('duelSetup').hidden=true;$('duelKicker').textContent='МОЖНА ВІДПОЧИТИ';$('duelTitle').textContent='Джунглі зачекають';$('duelDescription').textContent='Камінці зупинилися в повітрі. Продовжимо саме з цього місця.';$('duelStart').textContent='Продовжити →';updateUI();
}
function resume(){paused=false;$('duelOverlay').hidden=true;updateUI();canvas.focus({preventScroll:true});}
function finish(){
  drag=null;$('duelOverlay').hidden=false;$('duelSetup').hidden=true;$('duelPause').disabled=true;const won=duel.winner==='human';
  $('duelKicker').textContent=won?'ТИ ЗНАЙШОВ СВОЮ ДУГУ':'КОЖЕН КИДОК — НОВИЙ ДОСВІД';$('duelTitle').textContent=won?'Твоя команда перемогла!':'Цього разу — команда Айнаї';
  $('duelDescription').textContent=won?'Сила, кут і трохи терпіння — і тобі вдалося! А яку гру ти хотів би створити наступною?':'Спробуй змінити силу, підняти дугу або почати з однієї мавпочки. Наступна спроба буде іншою.';$('duelStart').textContent='Зіграти ще раз ↗';updateUI();
}
function teamButtons(){
  $('duelTeamButtons').replaceChildren();for(const m of duel.monkeys.filter(m=>m.side==='human')){
    const b=document.createElement('button');b.className='monkey-choice';b.type='button';b.dataset.monkey=m.id;b.textContent=m.name;b.setAttribute('aria-label','Кидає '+m.name);b.onclick=()=>{if(selectMonkey(duel,m.id)){updateUI();canvas.focus({preventScroll:true});}};$('duelTeamButtons').append(b);
  }
}
function updateUI(){
  const ready=duel.status==='playing'&&duel.phase==='player'&&!paused;
  $('duelHumanCount').textContent=`${alive(duel,'human').length} / ${count}`;$('duelAiCount').textContent=`${alive(duel,'ai').length} / ${count}`;
  $('duelRound').textContent='Коло '+duel.round;
  const phase=duel.status==='ready'?'ГОТУЙСЯ ДО ПРИГОДИ':duel.status==='finished'?'ПАРТІЮ ЗАВЕРШЕНО':paused?'ПАУЗА':duel.phase==='player'?'ТВІЙ КИДОК':duel.phase==='player-flight'?'КАМІНЕЦЬ У ПОЛЬОТІ':duel.phase==='ai-wait'?'АЙНАЯ ПРИЦІЛЮЄТЬСЯ':'КИДОК КОМАНДИ АЙНАЇ';
  if(phase!==lastPhase){$('duelPhase').textContent=phase;lastPhase=phase;}
  if(duel.notice!==lastNotice){$('duelHint').textContent=duel.notice;lastNotice=duel.notice;}
  $('duelThrow').disabled=!ready;$('duelAngle').disabled=!ready;$('duelPower').disabled=!ready;
  for(const b of $('duelTeamButtons').children){const m=duel.monkeys.find(m=>m.id===b.dataset.monkey);b.disabled=!ready||m.hp===0||duel.fired.includes(m.id);b.setAttribute('aria-pressed',String(m.id===duel.selected));b.title=`${m.name}: ${m.hp} з 3 сердечок`;}
  $('angleReadout').textContent=Math.round(angle)+'°';$('powerReadout').textContent=Math.round(power)+'%';$('duelAngle').value=Math.round(angle);$('duelPower').value=Math.round(power);
}
function throwCurrent(){if(throwStone(duel,angle,power)){drag=null;updateUI();}}
function eventEffects(now){for(const e of duel.events){
  if(e.type==='hit'){const m=duel.monkeys.find(m=>m.name===e.name&&m.side===e.side);$('duelPop').textContent=`Влучання! ${e.name}: ${m.hp} з 3 сердечок`;$('duelPop').classList.add('show');clearTimeout(popTimer);popTimer=setTimeout(()=>$('duelPop').classList.remove('show'),1300);}
  if(e.type==='out'){const m=duel.monkeys.find(m=>m.name===e.name&&m.side===e.side);knocked.set(m.id,now);$('duelPop').textContent=e.name+' вилітає! ✦';$('duelPop').classList.add('show');clearTimeout(popTimer);popTimer=setTimeout(()=>$('duelPop').classList.remove('show'),1600);}
  for(let i=0;i<(e.type==='out'?22:e.type==='hit'?13:7);i++){const a=Math.random()*Math.PI*2,v=35+Math.random()*130;particles.push({x:e.x,y:e.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-25,life:.5+Math.random()*.5,color:e.type==='land'?'#d1c596':['#eaffbc','#a5efff','#ffe8a0'][i%3],star:e.type!=='land'});}
}}
function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
function ellipse(x,y,rx,ry,color,rotation=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function line(x1,y1,x2,y2,color,width=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();}
function leaf(x,y,w,h,rotation,color){ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.beginPath();ctx.moveTo(-w/2,0);ctx.bezierCurveTo(-w*.2,-h,w*.4,-h,w/2,0);ctx.bezierCurveTo(w*.1,h*.35,-w*.3,h*.5,-w/2,0);ctx.fillStyle=color;ctx.fill();ctx.restore();}
function background(t){
  const bg=ctx.createLinearGradient(0,0,0,600);bg.addColorStop(0,'#0a2646');bg.addColorStop(.55,'#164d59');bg.addColorStop(1,'#082f39');ctx.fillStyle=bg;ctx.fillRect(0,0,1000,600);
  const moon=ctx.createRadialGradient(555,125,8,555,125,110);moon.addColorStop(0,'#f6edbd16');moon.addColorStop(1,'#d5e8a800');ctx.fillStyle=moon;ctx.fillRect(440,10,230,230);circle(555,125,48,'#d9e4b1');circle(570,115,46,'#0f3549');
  for(const s of starfield)circle(s.x,s.y,s.r,`rgba(190,230,215,${.25+Math.sin(t*.7+s.x)*.15})`);
  ctx.fillStyle='#16434c';ctx.beginPath();ctx.moveTo(0,460);ctx.bezierCurveTo(200,220,350,310,490,350);ctx.bezierCurveTo(680,250,880,230,1000,390);ctx.lineTo(1000,600);ctx.lineTo(0,600);ctx.fill();
  for(let i=0;i<11;i++){const x=i*107-15,h=130+(i*29)%110;ctx.fillStyle='#103d45';ctx.fillRect(x,480-h,16,h);ellipse(x+5,475-h,67,65,'#164c4f');ellipse(x-22,490-h,42,46,'#15494c');}
  for(const [x,side] of [[0,1],[1000,-1]]){ctx.save();ctx.translate(x,0);ctx.scale(side,1);ctx.strokeStyle='#28615d';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(24,-20);ctx.bezierCurveTo(115,85,34,170,80,245);ctx.stroke();for(let i=0;i<7;i++)leaf(15+i*12,50+i*26,86,35,-.7+i*.13,['#2b6d62','#377d67','#21594f'][i%3]);ctx.restore();}
  const ground=ctx.createLinearGradient(0,545,0,600);ground.addColorStop(0,'#367760');ground.addColorStop(.12,'#215144');ground.addColorStop(1,'#102e33');ctx.fillStyle=ground;ctx.fillRect(0,550,1000,50);line(0,550,1000,550,'#71af7d55',3);
  for(let i=0;i<38;i++){const x=(i*73.7)%1000,y=546+(i%3)*3;line(x,y,x-5,y-8,'#66a47a88',2);line(x,y,x+5,y-12,'#529a7288',2);}
  for(let i=0;i<12;i++){const x=(i*139.3+Math.sin(t*.3+i)*12)%1000,y=210+(i*73)%300;ctx.save();ctx.shadowColor='#c8e8a5';ctx.shadowBlur=10;circle(x,y,1.7,'#dcecb788');ctx.restore();}
}
function platform(m){
  const x=m.x-41,y=m.y+32,w=82,h=552-y;const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#30564c');g.addColorStop(.45,'#486b53');g.addColorStop(1,'#21463f');ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(x,y,w,Math.max(7,h),[7,7,0,0]);ctx.fill();
  for(let i=0;i<4;i++)line(x+13+i*18,y+10,x+8+i*19,550,'#a0b27c18',2);
  ellipse(m.x,y,44,9,'#76a67b');ellipse(m.x,y-2,37,6,'#9ab98b');line(x+8,y+1,x+w-8,y+1,'#cecca63d');
  leaf(m.x-35,y+13,32,14,-.7,'#4d926b');leaf(m.x+36,y+18,37,14,.65,'#559568');
}
function monkey(m,t,outAge=null){
  const team=m.side==='human'?'#91e4ef':'#d1aaf3',health=HEALTH_COLORS[Math.max(0,m.hp-1)];
  ctx.save();ctx.translate(m.x,m.y);
  if(outAge!==null){const a=Math.min(1.8,outAge);ctx.translate((m.side==='human'?-1:1)*a*125,-Math.sin(Math.min(a,1)*Math.PI/2)*125+a*a*37);ctx.rotate((m.side==='human'?-1:1)*Math.sin(a*2)*.45);ctx.globalAlpha=Math.max(0,1-(a-1.2)/.5);}
  else ctx.translate(0,Math.sin(t*2+m.x)*1.3);
  if(m.id===duel.selected&&duel.status==='playing'&&duel.phase==='player'&&!paused&&m.hp>0){ctx.save();ctx.shadowColor='#bceac2';ctx.shadowBlur=17;ellipse(0,35,35,7,'#a8e5b544');ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(0,35,40,10,0,0,Math.PI*2);ctx.strokeStyle='#bef4c5';ctx.stroke();ctx.restore();}
  ctx.strokeStyle='#79513e';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-10,20);ctx.bezierCurveTo(-45,37,-54,5,-38,1);ctx.bezierCurveTo(-23,-3,-26,14,-35,13);ctx.stroke();
  ellipse(-13,29,13,7,'#6b493c',-.2);ellipse(14,29,13,7,'#6b493c',.2);
  ellipse(-20,6,10,19,'#865b43',-.5);ellipse(21,5,10,19,'#865b43',.5);circle(-24,16,7,'#d9b38b');circle(25,15,7,'#d9b38b');
  ellipse(0,10,21,24,'#866047');ellipse(0,11,17,20,health);ellipse(0,13,10,12,'#ebd8a4aa');
  circle(-24,-18,11,'#7d533f');circle(24,-18,11,'#7d533f');circle(-24,-18,6,'#cfa17f');circle(24,-18,6,'#cfa17f');
  const fur=ctx.createRadialGradient(-9,-29,3,0,-20,30);fur.addColorStop(0,'#a67c50');fur.addColorStop(1,'#72503e');circle(0,-20,28,fur);ellipse(-10,-20,14,19,'#e2c396');ellipse(10,-20,14,19,'#e2c396');ellipse(0,-8,21,14,'#e7cda3');
  ctx.fillStyle='#654431';ctx.beginPath();ctx.moveTo(-10,-42);ctx.quadraticCurveTo(-15,-57,-2,-48);ctx.quadraticCurveTo(6,-60,10,-42);ctx.fill();
  ctx.strokeStyle=team;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-21,27,Math.PI*1.12,Math.PI*1.91);ctx.stroke();leaf(25,-30,13,7,-.5,team);
  const look=m.side==='human'?2:-2;ellipse(-10,-22,7,9,'#fbf8e8');ellipse(10,-22,7,9,'#fbf8e8');circle(-10+look,-21,3.5,'#233744');circle(10+look,-21,3.5,'#233744');circle(-10+look-1,-23,1.1,'#fff');circle(10+look-1,-23,1.1,'#fff');ellipse(0,-10,5,3,'#806346');
  ctx.strokeStyle='#765444';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(0,-8,10,.18,Math.PI-.18);ctx.stroke();ellipse(-17,-9,4,2,'#d99d7f66');ellipse(17,-9,4,2,'#d99d7f66');
  if(outAge!==null){ctx.strokeStyle='#e8ecc2aa';ctx.lineWidth=1;line(-21,-69,-14,-39,'#dfe6c0');line(21,-69,14,-39,'#dfe6c0');ctx.fillStyle=team;ctx.beginPath();ctx.arc(0,-69,26,Math.PI,0);ctx.closePath();ctx.fill();line(-26,-69,26,-69,'#f4f6da');}
  ctx.restore();
  if(outAge===null){ctx.save();ctx.textAlign='center';ctx.font='600 12px system-ui';ctx.fillStyle=team;ctx.fillText(m.name,m.x,m.y+56);for(let i=0;i<3;i++)circle(m.x-11+i*11,m.y+68,3.1,i<m.hp?health:'#33544e');ctx.restore();}
}
function stone(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.age*7);ctx.shadowColor=p.side==='human'?'#c7f1d3':'#dac2ff';ctx.shadowBlur=13;ctx.beginPath();ctx.moveTo(-7,-4);ctx.lineTo(0,-8);ctx.lineTo(7,-4);ctx.lineTo(8,3);ctx.lineTo(0,7);ctx.lineTo(-7,4);ctx.closePath();ctx.fillStyle=p.side==='human'?'#dfd9b9':'#ccbce2';ctx.fill();ctx.shadowBlur=0;line(-4,-3,3,-4,'#ffffff99',2);ctx.restore();}
function trajectory(){
  const m=selected();if(!m||m.hp<=0||duel.status!=='playing'||duel.phase!=='player'||paused)return;
  const v=launchVelocity(angle,power);for(let i=1;i<=18;i++){const t=i*.045,x=m.x+22+v.vx*t,y=m.y-18+v.vy*t+FIELD.gravity*t*t/2;if(y<0||x>990)break;circle(x,y,2-i*.05,`rgba(211,246,197,${.67-i*.025})`);}
  if(drag){const aim=dragAim(drag.dx,drag.dy),x=m.x-drag.dx*.5,y=m.y-drag.dy*.5;line(m.x,m.y-10,x,y-10,aim?'#c8f3bd':'#e7b9a0',2);circle(x,y-10,7,null,aim?'#d6ffc7':'#e8bfa2');}
  ctx.save();ctx.textAlign='center';ctx.font='600 11px system-ui';ctx.fillStyle='#c8eec6';ctx.fillText(`${Math.round(angle)}° · ${Math.round(power)}%`,m.x,m.y-64);ctx.restore();
}
function draw(now){
  const t=reduced?0:now/1000;background(t);for(const m of duel.monkeys)platform(m);
  for(const m of duel.monkeys){if(m.hp>0)monkey(m,t);else if(knocked.has(m.id)){const age=(now-knocked.get(m.id))/1000;if(age<1.8)monkey(m,t,age);}}
  trajectory();for(const p of duel.projectiles)stone(p);
  for(const p of particles){ctx.save();ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;if(p.star){ctx.font='14px system-ui';ctx.fillText('✦',p.x,p.y);}else circle(p.x,p.y,2,p.color);ctx.restore();}
  ctx.save();ctx.textAlign='center';ctx.font='600 11px system-ui';ctx.fillStyle='#bbd8c15a';ctx.fillText('AINARIUM · КОСМІЧНІ ДЖУНГЛІ',500,585);ctx.restore();
}
function frame(now){
  const dt=Math.min((now-last)/1000||.016,.04);last=now;
  if(duel.status==='playing'&&!paused){updateDuel(duel,dt);eventEffects(now);uiTime+=dt;if(uiTime>.09){updateUI();uiTime=0;}if(duel.status==='finished')finish();}
  if(!paused){for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=150*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);}
  draw(now);requestAnimationFrame(frame);
}
function point(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*1000,y:(e.clientY-r.top)/r.height*600};}
canvas.addEventListener('pointerdown',e=>{
  if(duel.status!=='playing'||duel.phase!=='player'||paused||e.button>0)return;const p=point(e);
  const m=alive(duel,'human').filter(m=>!duel.fired.includes(m.id)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  if(!m||Math.hypot(m.x-p.x,m.y-9-p.y)>85)return;e.preventDefault();selectMonkey(duel,m.id);canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});drag={id:e.pointerId,start:p,dx:0,dy:0};updateUI();
});
canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();const p=point(e);drag.dx=drag.start.x-p.x;drag.dy=drag.start.y-p.y;const a=dragAim(drag.dx,drag.dy);if(a){angle=a.angle;power=a.power;updateUI();}});
canvas.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const a=dragAim(drag.dx,drag.dy);drag=null;if(a){angle=a.angle;power=a.power;throwCurrent();}else updateUI();});
canvas.addEventListener('pointercancel',()=>{drag=null;});canvas.addEventListener('lostpointercapture',()=>{drag=null;});
for(const id of ['duelAngle','duelPower'])$(id).addEventListener('input',()=>{angle=Number($('duelAngle').value);power=Number($('duelPower').value);updateUI();});
document.querySelectorAll('[data-team]').forEach(b=>b.onclick=()=>setup(Number(b.dataset.team)));
$('duelStart').onclick=start;$('duelThrow').onclick=throwCurrent;$('duelNew').onclick=()=>setup();$('duelPause').onclick=()=>paused?resume():pause();
addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea,button,a'))return;if((e.code==='Enter'||e.code==='Space')&&!e.repeat){e.preventDefault();throwCurrent();}if(['KeyP','Escape'].includes(e.code)&&!e.repeat){e.preventDefault();paused?resume():pause();}if(['Digit1','Digit2','Digit3'].includes(e.code)){selectMonkey(duel,'human-'+(Number(e.code.slice(-1))-1));updateUI();}});
addEventListener('blur',()=>{drag=null;pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
setup();requestAnimationFrame(frame);
