import {createMatch,updateMatch} from './hockey-core.mjs';
const $=id=>document.getElementById(id),canvas=$('hockeyCanvas'),ctx=canvas.getContext('2d');
let match=createMatch(),last=0,paused=false,trail=[],goalTimer;
const input={};const embedded=new URLSearchParams(location.search).get('embedded')==='1'&&parent!==window;
function resetInput(){for(const key of Object.keys(input))delete input[key];}
function fit(){const w=$('rinkSpace').clientWidth-14,h=$('rinkSpace').clientHeight-14,scale=Math.min(w/700,h/900);$('rinkFrame').style.width=Math.floor(700*scale)+'px';$('rinkFrame').style.height=Math.floor(900*scale)+'px';}
function start(){$('handMallet').hidden=true;match=createMatch($('hockeyDifficulty').value);match.status='playing';paused=false;trail=[];resetInput();$('hockeyOverlay').hidden=true;$('hockeyPause').disabled=false;$('hockeyDifficulty').hidden=false;$('hockeyDifficulty').previousElementSibling.hidden=false;scoreUI();canvas.focus({preventScroll:true});$('hockeyHint').textContent='Лови шайбу й атакуй! Ти керуєш великою блакитною биткою. Спробуй удар від бортика.';}
function scoreUI(){$('humanScore').textContent=match.human;$('aiScore').textContent=match.ai;}
function pause(){if(match.status!=='playing'||paused)return;paused=true;resetInput();$('hockeyOverlay').hidden=false;$('hockeyKicker').textContent='ЧАС ПЕРЕВЕСТИ ПОДИХ';$('hockeyTitle').textContent='Шайба зачекає';$('hockeyText').textContent='Твоя партія збереглася. Продовжуй, коли будеш готовий.';$('catchMallet').textContent='Продовжити гру →';$('hockeyDifficulty').hidden=true;$('hockeyDifficulty').previousElementSibling.hidden=true;}
function resume(){paused=false;$('hockeyOverlay').hidden=true;canvas.focus({preventScroll:true});}
function finish(){$('handMallet').hidden=false;const won=match.winner==='human';$('hockeyOverlay').hidden=false;$('hockeyPause').disabled=true;$('hockeyKicker').textContent=won?'ТВОЯ ПЕРША ПЕРЕМОГА':'ЩЕ ОДНА СПРОБА — ЩЕ ОДНЕ ВІДКРИТТЯ';$('hockeyTitle').textContent=won?'Тобі вдалося!':'Айная виграла партію';$('hockeyText').textContent=won?'А тепер уяви, як могла б виглядати твоя власна гра. Змінити правила? Додати новий світ? Все починається із задуму.':'Ти вже знаєш її прийоми. Спробуй змінити кут удару й зіграти ще раз.';$('catchMallet').textContent='Нова партія ↗';$('hockeyDifficulty').hidden=false;$('hockeyDifficulty').previousElementSibling.hidden=false;$('hockeyHint').textContent=won?'Ти мене переграв! А що створимо разом наступного разу?':'Гарна партія! Тепер ти знаєш більше. Давай ще раз?';}
function glow(color,n=18){ctx.shadowColor=color;ctx.shadowBlur=n;}
function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
function line(x1,y1,x2,y2,color,width=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();}
function mallet(m,color,t){ctx.save();glow(color,25);circle(m.x,m.y+5,m.r+3,'#020d2566');const g=ctx.createRadialGradient(m.x-12,m.y-15,2,m.x,m.y,m.r);g.addColorStop(0,'#e9ffff');g.addColorStop(.35,color);g.addColorStop(.8,'#154a6b');g.addColorStop(1,'#09253f');circle(m.x,m.y,m.r,g,color);circle(m.x,m.y,m.r*.73,null,color+'aa');circle(m.x,m.y,m.r*.37,'#153955','#c6ffff');ctx.shadowBlur=0;circle(m.x-5,m.y-7,m.r*.19,'#bafaff33');ctx.restore();}
function draw(t){
  const bg=ctx.createLinearGradient(0,0,700,900);bg.addColorStop(0,'#182743');bg.addColorStop(.48,'#0b2643');bg.addColorStop(1,'#103e50');ctx.fillStyle=bg;ctx.fillRect(0,0,700,900);
  ctx.save();ctx.lineWidth=3;glow('#69e8ff',18);ctx.beginPath();ctx.roundRect(35,35,630,830,27);ctx.strokeStyle='#91eaff';ctx.stroke();ctx.restore();
  for(let x=70;x<650;x+=35)for(let y=70;y<850;y+=35)circle(x,y,.8,'#9ad4ef25');
  line(36,450,664,450,'#a3d9ff44',2);circle(350,450,108,null,'#a4e2ff33');circle(350,450,42,null,'#a4e2ff44');
  ctx.save();glow('#d4a7ff',25);ctx.fillStyle='#07152c';ctx.fillRect(235,28,230,16);line(235,35,465,35,'#d5a7ff',6);ctx.restore();
  ctx.save();glow('#72edff',25);ctx.fillStyle='#071a2c';ctx.fillRect(235,856,230,17);line(235,865,465,865,'#72edff',6);ctx.restore();
  ctx.fillStyle='#99cfff22';ctx.font='600 15px system-ui';ctx.textAlign='center';ctx.fillText('AINARIUM',350,418);ctx.font='11px system-ui';ctx.fillText('УЯВА СТАЄ РУХОМ',350,488);
  for(let i=0;i<trail.length;i++){const p=trail[i];circle(p.x,p.y,match.puck.r*i/trail.length,'rgba(162,241,255,'+(i/trail.length*.18)+')');}
  mallet(match.opponent,'#c2a2ff',t);mallet(match.player,'#89edff',t);
  const p=match.puck;ctx.save();glow('#dbfbff',24);circle(p.x,p.y,p.r,'#d9faff','#fff');circle(p.x,p.y,p.r+7,null,'#9af1ff66');ctx.shadowBlur=0;
  for(let i=0;i<5;i++){const a=t*2+i*Math.PI*2/5;const x=p.x+Math.cos(a)*10,y=p.y+Math.sin(a)*10;line(p.x,p.y,x,y,'#2589b4',.8);circle(x,y,1.6,'#126e9c');}ctx.restore();
  if(match.serve>0&&match.status==='playing'){ctx.fillStyle='#b0efffa8';ctx.font='500 16px system-ui';ctx.fillText('ГОТУЙСЯ…',350,560);}
}
function frame(now){const dt=Math.min((now-last)/1000||.016,.035);last=now;if(match.status==='playing'&&!paused){updateMatch(match,dt,input);trail.push({x:match.puck.x,y:match.puck.y});if(trail.length>13)trail.shift();if(match.goal){scoreUI();$('hockeyGoal').textContent=match.goal==='human'?'ТВІЙ ГОЛ! ✦':'ГОЛ АЙНАЇ';$('hockeyGoal').classList.add('show');clearTimeout(goalTimer);goalTimer=setTimeout(()=>$('hockeyGoal').classList.remove('show'),1000);if(match.status==='finished')finish();}}draw(now/1000);requestAnimationFrame(frame);}
$('hockeyRestart').onclick=()=>{clearTimeout(goalTimer);$('hockeyGoal').classList.remove('show');start();};
$('handMallet').onclick=start;$('catchMallet').onclick=()=>paused?resume():start();$('hockeyPause').onclick=()=>paused?resume():pause();
$('hockeyBack').onclick=()=>{if(embedded)parent.postMessage({type:'ainarium:hockey:close'},location.origin);else location.href='app.html#step-1';};
const keys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
addEventListener('keydown',e=>{if(e.target.matches('select,input'))return;if(keys[e.code]&&match.status==='playing'&&!paused){e.preventDefault();input[keys[e.code]]=true;delete input.pointer;}if(['KeyP','Escape'].includes(e.code)&&!e.repeat){e.preventDefault();paused?resume():pause();}});
addEventListener('keyup',e=>{if(keys[e.code])input[keys[e.code]]=false;});
function pointer(e){const r=canvas.getBoundingClientRect();input.pointer={x:(e.clientX-r.left)/r.width*700,y:(e.clientY-r.top)/r.height*900-(e.pointerType==='touch'?45:0)};}
canvas.addEventListener('pointerdown',e=>{if(match.status!=='playing'||paused)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);pointer(e);});canvas.addEventListener('pointermove',e=>{if(match.status==='playing'&&!paused&&(e.pointerType==='mouse'||e.buttons))pointer(e);});canvas.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')delete input.pointer;});canvas.addEventListener('pointercancel',()=>delete input.pointer);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});addEventListener('blur',pause);new ResizeObserver(fit).observe($('rinkSpace'));fit();requestAnimationFrame(frame);
