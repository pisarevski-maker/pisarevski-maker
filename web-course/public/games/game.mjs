import {WIDTH,HEIGHT,MODES,QUEST_STEPS,createGame,updateGame} from './simulation.mjs';

const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d');
const order=Object.keys(MODES),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const descriptions={
  flight:{icon:'↗',pose:'welcome',title:'Вирушай назустріч зорям',text:'Проведи кораблик крізь астероїди. Збери 12 іскор — із них почнеться твій новий світ.',detail:'Збери світло, збережи курс',explain:'Блакитні іскри — твої. Астероїди краще облітати. Щит допоможе пережити одну зустріч.',guide:'Я допоможу тримати курс. А куди летіти — вирішуєш ти.',controls:'↔ ↕ Стрілки / WASD · або веди пальцем по полю',goal:'Іскри',legend:['Іскра','Щит','Астероїд']},
  blaster:{icon:'⌁',pose:'point',title:'Звільни шлях для ідей',text:'Розпилюй космічні кристали світлом. Збери 24 влучання та відкрий прохід до нової галактики.',detail:'Точність важливіша за поспіх',explain:'Корабель стріляє сам. Керуй ним і збирай сповільнення часу. Space або кругла кнопка запускає потужний імпульс.',guide:'Ми ні з ким не воюємо. Просто розчищаємо дорогу новим можливостям!',controls:'↔ ↕ Рух · Space — імпульс · на телефоні веди пальцем',goal:'Кристали',legend:['Імпульс','Сповільнення','Кристал']},
  bounce:{icon:'◇',pose:'present',title:'Упіймай ритм світла',text:'Відбивай енергетичну кульку й запали всі 27 кристалів. Кожен відскок відкриває щось нове.',detail:'Зміни кут — зміни результат',explain:'Краї платформи змінюють напрям кульки. Після кожних дев’яти кристалів платформа стає ширшою.',guide:'Іноді потрібен лише інший кут зору. Спробуй відбити кульку краєчком платформи.',controls:'← → Стрілки / A D · або рухай платформу пальцем',goal:'Кристали',legend:['Енергія','Ширша платформа','Кристал']},
  quest:{icon:'✧',pose:'think',title:'Розгадай код нового світу',text:'Чотири символи. Одна послідовність. Слухай підказки Айнаї та поєднай сузір’я без поспіху.',detail:'Спочатку уява, потім відкриття',explain:'Натискай на символи в правильному порядку. Або рухайся до них стрілками й натискай Enter. Тут немає таймера чи штрафів.',guide:QUEST_STEPS[0].hint,controls:'Натискай на символи · або стрілки + Enter поруч із ними',goal:'Символи',legend:['Світло','Життя','Уява']}
};
let mode='flight',game=null,preview=null,paused=false,last=0,uiTime=0,noticeId=0,modeAction='start',sound=false,audio=null,lastSound=0;
let saved={};try{saved=JSON.parse(localStorage.getItem('ainaya-constellation-v1')||'{}')||{};}catch{}
const input={left:false,right:false,up:false,down:false,pointer:null,action:false,tap:null};
const sky=new Image();sky.src='assets/sky.png';
const robot=new Image();robot.src='assets/ainaya-welcome.webp';
const stars=Array.from({length:120},(_,i)=>({x:(i*173.37)%1000,y:(i*89.13)%600,r:i%11===0?1.8:.5+(i%4)*.25,s:.5+(i%8)*.18}));

function readProgress(){
  const completed=order.filter(key=>saved[key]?.won);
  document.querySelectorAll('.mission').forEach(button=>{button.querySelector('.mission-check').textContent=saved[button.dataset.mode]?.won?'✦':'';});
  document.querySelectorAll('#constellation circle').forEach((circle,i)=>circle.classList.toggle('lit',Boolean(saved[order[i]]?.won)));
  $('constellation').setAttribute('aria-label',`Пройдено ${completed.length} з 4 місій`);
  $('progressLabel').textContent=completed.length===4?'Твоє сузір’я сяє!':completed.length?`Уже ${completed.length} з 4 зірок запалено`:'Твоє сузір’я ще попереду';
  $('record').textContent=saved[mode]?.won?`✦ Місію пройдено · найкращий результат: ${saved[mode].best} ${mode==='quest'?'символи':'очок'}`:'Твоя перша пригода починається тут.';
}
function resetInput(){for(const key of ['left','right','up','down','action'])input[key]=false;input.pointer=null;input.tap=null;}
function selectMode(next){
  mode=next;game=null;paused=false;modeAction='start';resetInput();preview=createGame(mode,()=>.5);
  if(mode==='flight')preview.objects=Array.from({length:8},(_,i)=>({x:340+i*90,y:100+(i*131)%420,r:i%3===0?30:12,type:i%3===0?'rock':'spark',angle:i}));
  if(mode==='blaster')preview.objects=Array.from({length:9},(_,i)=>({x:150+i*86,y:110+(i*97)%260,r:25,type:'crystal',hp:i%3===0?2:1,angle:i}));
  const d=descriptions[mode];
  document.body.classList.remove('playing');$('overlay').hidden=false;$('retryBtn').hidden=true;$('pauseBtn').disabled=true;$('abilityBtn').hidden=true;$('questActions').hidden=true;$('gameBanner').classList.remove('show');
  $('missionTag').textContent=`0${order.indexOf(mode)+1} / ${MODES[mode].title.toLocaleUpperCase('uk')}`;
  $('goalLabel').textContent=d.goal;$('controlsText').textContent=d.controls;$('overlayIcon').textContent=d.icon;
  $('overlayKicker').textContent='ЗВ’ЯЗОК З АЙНАЄЮ ВСТАНОВЛЕНО';$('overlayTitle').textContent=d.title;$('overlayText').textContent=d.text;
  $('detailTitle').textContent=d.detail;$('detailText').textContent=d.explain;$('guideText').textContent=d.guide;$('ainaya').src=`assets/ainaya-${d.pose}.webp`;
  $('startBtn').replaceChildren(document.createTextNode('Почати місію '),Object.assign(document.createElement('span'),{textContent:'↗'}));
  const legends=$('legend').querySelectorAll('span');d.legend.forEach((text,i)=>{legends[i].lastChild.textContent=' '+text;});
  document.querySelectorAll('.mission').forEach(button=>{const active=button.dataset.mode===mode;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  readProgress();updateHud(preview);
}
function startGame(){
  if(modeAction==='resume'){resume();return;}
  if(modeAction==='next'){selectMode(order[(order.indexOf(mode)+1)%4]);return;}
  game=createGame(mode);paused=false;noticeId=0;resetInput();$('overlay').hidden=true;$('pauseBtn').disabled=false;$('abilityBtn').hidden=mode!=='blaster';
  $('questActions').replaceChildren();$('questActions').hidden=mode!=='quest';
  if(mode==='quest')for(const n of game.nodes){
    const button=document.createElement('button');button.type='button';button.className='quest-node-button';button.setAttribute('aria-label',QUEST_STEPS[n.key].name);button.style.left=`${n.x/10}%`;button.style.top=`${n.y/6}%`;
    button.addEventListener('click',()=>{if(!paused&&game.status==='playing'){input.tap={x:n.x,y:n.y};input.pointer={x:n.x,y:n.y};}});$('questActions').append(button);
  }
  document.body.classList.add('playing');canvas.focus({preventScroll:true});
  canvas.setAttribute('aria-label',`${MODES[mode].title}. ${descriptions[mode].controls}. P — пауза.`);
  $('guideText').textContent=mode==='quest'?QUEST_STEPS[0].hint:descriptions[mode].guide;
  tone(520,.12,'sine',.025);updateHud(game);
}
function pause(){
  if(!game||game.status!=='playing'||paused)return;
  paused=true;modeAction='resume';resetInput();$('overlay').hidden=false;$('retryBtn').hidden=true;$('abilityBtn').hidden=true;$('questActions').hidden=true;
  $('overlayKicker').textContent='МОЖНА ПЕРЕВЕСТИ ПОДИХ';$('overlayIcon').textContent='Ⅱ';$('overlayTitle').textContent='Зорі зачекають';$('overlayText').textContent='Час зупинився. Твоя пригода продовжиться саме звідси.';$('startBtn').textContent='Продовжити →';$('startBtn').focus({preventScroll:true});
}
function resume(){paused=false;$('overlay').hidden=true;$('abilityBtn').hidden=mode!=='blaster';$('questActions').hidden=mode!=='quest';canvas.focus({preventScroll:true});}
function finish(){
  resetInput();$('pauseBtn').disabled=true;$('abilityBtn').hidden=true;$('questActions').hidden=true;$('overlay').hidden=false;
  const won=game.status==='won';
  if(won){
    const previous=saved[mode]||{};saved[mode]={won:true,best:Math.max(Number(previous.best)||0,game.score)};
    try{localStorage.setItem('ainaya-constellation-v1',JSON.stringify(saved));}catch{}
    readProgress();modeAction='next';$('retryBtn').hidden=false;
    const all=order.every(key=>saved[key]?.won);
    $('overlayKicker').textContent=all?'УСІ ЧОТИРИ ЗІРКИ З ТОБОЮ':'НОВА ЗОРЯ У ТВОЄМУ СУЗІР’Ї';$('overlayIcon').textContent='✦';
    $('overlayTitle').textContent=all?'Цей світ почався з тебе':'Тобі вдалося!';
    $('overlayText').textContent=all?'Ти пройшов чотири різні шляхи. Уява, наполегливість і трохи допомоги Айнаї — ось твоя суперсила.':`Місія «${MODES[mode].title}» завершена. ${mode==='quest'?'Ти розгадав код нового світу.':`Збережено спроб: ${game.lives} із 3.`} Продовжимо нашу історію?`;
    $('startBtn').textContent=all?'До зоряного польоту ↗':'Наступна місія →';
    if(all)modeAction='home';
    $('guideText').textContent='Це твій результат. Я підказувала — а діяв і знаходив рішення ти.';
    tone(660,.25,'sine',.05);setTimeout(()=>tone(880,.3,'sine',.04),140);
  }else{
    modeAction='start';$('retryBtn').hidden=true;$('overlayKicker').textContent='КОЖНА СПРОБА — ВЖЕ ДОСВІД';$('overlayIcon').textContent='↻';$('overlayTitle').textContent='Тепер ти знаєш більше';
    $('overlayText').textContent=`Твій результат: ${game.score} із ${MODES[mode].goal}. ${game.time>=MODES[mode].seconds?'Цього разу закінчився час.':'Кораблику потрібен новий старт.'} Спробуємо знову?`;
    $('startBtn').textContent='Спробувати ще ↗';$('guideText').textContent='Дослідження починаються зі спроб. Давай знайдемо твій ритм разом.';
  }
  $('startBtn').focus({preventScroll:true});
}
function tone(frequency,duration,type='sine',volume=.03){
  if(!sound||!audio)return;
  const osc=audio.createOscillator(),gain=audio.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(frequency*.75,audio.currentTime+duration);gain.gain.setValueAtTime(volume,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration);
}
function handleEvents(s){
  if(s.noticeId!==noticeId){noticeId=s.noticeId;$('guideText').textContent=s.notice;$('gameBanner').textContent=s.notice;$('gameBanner').classList.add('show');clearTimeout(handleEvents.timer);handleEvents.timer=setTimeout(()=>$('gameBanner').classList.remove('show'),3500);}
  if(performance.now()-lastSound<70)return;
  const e=s.events.find(e=>e.type!=='shot');if(e){lastSound=performance.now();tone(e.type==='hit'?150:e.type==='bounce'?420:760,.1,'sine',.025);}
}
function updateHud(s){
  $('score').textContent=`${s.score} / ${MODES[mode].goal}`;
  $('hearts').textContent=mode==='quest'?'✧ ✧ ✧':'♥ '.repeat(s.lives)+'♡ '.repeat(3-s.lives);
  $('hearts').setAttribute('aria-label',mode==='quest'?'Без штрафів':`${s.lives} спроби`);
  $('timer').textContent=MODES[mode].seconds?`${Math.max(0,Math.ceil(MODES[mode].seconds-s.time))} с`:'Без поспіху';
  if(mode==='blaster'){$('abilityBtn').disabled=s.cooldown>0;$('abilityBtn').innerHTML=s.cooldown>0?`Зарядка<small>${Math.ceil(s.cooldown)} с</small>`:'Імпульс<small>SPACE</small>';}
}

function glow(color,blur=15){ctx.shadowColor=color;ctx.shadowBlur=blur;}
function line(x1,y1,x2,y2,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function circle(x,y,r,color,fill=true){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=color;ctx.fill();}else{ctx.strokeStyle=color;ctx.stroke();}}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
function crystal(x,y,r,color,angle=0,hp=1){ctx.save();ctx.translate(x,y);ctx.rotate(angle);glow(color,16);ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.7,-r*.3);ctx.lineTo(r*.65,r*.6);ctx.lineTo(0,r);ctx.lineTo(-r*.7,r*.35);ctx.lineTo(-r*.6,-r*.4);ctx.closePath();ctx.fillStyle=color+'27';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.stroke();ctx.shadowBlur=0;line(0,-r,0,r,color+'99');line(-r*.6,-r*.4,r*.65,r*.6,color+'88');if(hp>1){circle(0,0,5,'#fff0d0',false);}ctx.restore();}
function spark(x,y,r,color='#99f3ff',angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);glow(color,20);ctx.beginPath();ctx.moveTo(0,-r);ctx.quadraticCurveTo(r*.2,-r*.2,r,0);ctx.quadraticCurveTo(r*.2,r*.2,0,r);ctx.quadraticCurveTo(-r*.2,r*.2,-r,0);ctx.quadraticCurveTo(-r*.2,-r*.2,0,-r);ctx.fillStyle=color;ctx.fill();circle(0,0,r*.2,'#fff');ctx.restore();}
function rock(o){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.angle);ctx.beginPath();for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=o.r*(i%2?.82:1);if(i===0)ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fillStyle='#28314b';ctx.fill();ctx.strokeStyle='#9a8fb3';ctx.lineWidth=2;ctx.stroke();circle(-8,-5,7,'#111d34');circle(8,10,4,'#151d34');line(-12,-18,4,-22,'#d1b9d14f');ctx.restore();}
function drawShip(p,t,vertical=false){
  ctx.save();ctx.translate(p.x,p.y);if(vertical)ctx.rotate(-Math.PI/2);
  const flicker=1+Math.sin(t*37)*.22;
  glow('#57d9ff',25);ctx.beginPath();ctx.moveTo(-19,-9);ctx.lineTo(-52*flicker,0);ctx.lineTo(-19,9);ctx.fillStyle='#64dcff77';ctx.fill();
  ctx.beginPath();ctx.moveTo(-20,-5);ctx.lineTo(-38*flicker,0);ctx.lineTo(-20,5);ctx.fillStyle='#dcfcff';ctx.fill();
  ctx.beginPath();ctx.moveTo(31,0);ctx.lineTo(-22,-21);ctx.lineTo(-14,-4);ctx.lineTo(-23,20);ctx.closePath();
  const metal=ctx.createLinearGradient(0,-20,0,20);metal.addColorStop(0,'#e3faff');metal.addColorStop(.5,'#77b6dc');metal.addColorStop(1,'#204f78');ctx.fillStyle=metal;ctx.fill();ctx.lineWidth=1.4;ctx.strokeStyle='#beefff';ctx.stroke();
  ctx.beginPath();ctx.ellipse(2,0,10,5,0,0,Math.PI*2);ctx.fillStyle='#05233a';ctx.fill();ctx.strokeStyle='#72eaff';ctx.stroke();line(-13,-8,-2,-6,'#28d9ff',2);ctx.restore();
}
function drawBackground(t,active){
  ctx.fillStyle='#06152e';ctx.fillRect(0,0,WIDTH,HEIGHT);
  if(sky.complete&&sky.naturalWidth){ctx.globalAlpha=.31;ctx.drawImage(sky,0,0,WIDTH,HEIGHT);ctx.globalAlpha=1;}
  const nebula=ctx.createRadialGradient(730,400,20,730,400,600);nebula.addColorStop(0,'#22529d32');nebula.addColorStop(.5,'#0b687c12');nebula.addColorStop(1,'#030d2300');ctx.fillStyle=nebula;ctx.fillRect(0,0,WIDTH,HEIGHT);
  for(const s of stars){const x=(s.x-(active&&mode==='flight'?t*15*s.s:0))%1000;circle(x<0?x+1000:x,s.y,s.r,`rgba(174,222,255,${.45+Math.sin(t*s.s+s.x)*.2})`);}
  ctx.strokeStyle='#69c8ed0a';ctx.lineWidth=1;for(let x=0;x<1000;x+=50){line(x,0,x,600,'#69c8ed08');}for(let y=0;y<600;y+=50)line(0,y,1000,y,'#69c8ed08');
  ctx.save();ctx.translate(825,470);ctx.rotate(-.35);ctx.scale(1,.3);circle(0,0,195,'#6cbeff0b',false);circle(0,0,215,'#6cbeff0d',false);ctx.restore();
  const planet=ctx.createRadialGradient(846,548,10,860,600,145);planet.addColorStop(0,'#438ca67a');planet.addColorStop(.65,'#143b6466');planet.addColorStop(1,'#07172988');circle(860,600,145,planet);
}
function drawQuest(s,t){
  const center={x:500,y:288};
  ctx.save();glow('#72ddff',10);circle(center.x,center.y,100,'#78dfff33',false);circle(center.x,center.y,78,'#8edfff1a',false);ctx.restore();
  for(const n of s.nodes){const q=QUEST_STEPS[n.key];line(n.x,n.y,center.x,center.y,n.lit?q.color+'88':'#72b5e326',n.lit?2:1);}
  for(const n of s.nodes){const q=QUEST_STEPS[n.key];ctx.save();glow(q.color,n.lit?25:9);circle(n.x,n.y,45,n.lit?q.color+'35':'#0d2846');circle(n.x,n.y,45,q.color+(n.lit?'ff':'90'),false);circle(n.x,n.y,54,q.color+'1f',false);ctx.fillStyle=n.lit?'#fff':q.color;ctx.font='38px system-ui';ctx.textAlign='center';ctx.fillText(q.symbol,n.x,n.y+13);ctx.shadowBlur=0;ctx.fillStyle='#bdd6e8';ctx.font='15px system-ui';ctx.fillText(q.name,n.x,n.y+81);if(n.lit){ctx.fillStyle='#b9ffe5';ctx.font='15px system-ui';ctx.fillText('✓',n.x+40,n.y-35);}ctx.restore();}
  if(robot.complete&&robot.naturalWidth){const h=140,w=140*robot.naturalWidth/robot.naturalHeight;ctx.save();glow('#64ddff',20);ctx.drawImage(robot,500-w/2,220+Math.sin(t*2)*4,w,h);ctx.restore();}
  ctx.save();glow('#a4efff');circle(s.player.x,s.player.y,14,'#e9faff');circle(s.player.x,s.player.y,25,'#8beaff44',false);line(s.player.x-7,s.player.y,s.player.x+7,s.player.y,'#1577a5',2);line(s.player.x,s.player.y-7,s.player.x,s.player.y+7,'#1577a5',2);ctx.restore();
  if(s.score>0){for(let i=0;i<s.score;i++){const a=-Math.PI/2+i*Math.PI/2;spark(center.x+Math.cos(a)*90,center.y+Math.sin(a)*90,11,QUEST_STEPS[i].color,t*.3);}}
}
function draw(s,t,active){
  ctx.clearRect(0,0,WIDTH,HEIGHT);drawBackground(t,active);
  if(mode==='flight'||mode==='blaster'){
    for(const o of s.objects){if(o.type==='rock')rock(o);else if(o.type==='spark')spark(o.x,o.y,o.r,'#a6f5ff',t);else if(o.type==='shield'||o.type==='slow'){ctx.save();glow('#c3a4ff');circle(o.x,o.y,o.r+5,'#c1a7ff88',false);ctx.fillStyle='#dbcdff';ctx.font='19px system-ui';ctx.textAlign='center';ctx.fillText(o.type==='shield'?'⬡':'◷',o.x,o.y+7);ctx.restore();}else crystal(o.x,o.y,o.r,'#bcb0ff',o.angle,o.hp);}
    for(const b of s.bullets){ctx.save();glow('#b6f9ff');roundRect(b.x-2,b.y-15,4,21,2,'#c8fcff');ctx.restore();}
    if(s.invulnerable<=0||Math.floor(t*13)%2===0||!active)drawShip(s.player,t,mode==='blaster');
    if(s.shield>0){ctx.save();glow('#b69aff');circle(s.player.x,s.player.y,40,'#c5acff88',false);circle(s.player.x,s.player.y,44,'#c5acff22',false);ctx.restore();}
    if(s.slow>0){ctx.fillStyle='#744ddb10';ctx.fillRect(0,0,WIDTH,HEIGHT);}
  }else if(mode==='bounce'){
    for(const brick of s.bricks)if(brick.alive){const colors=['#a5b6ff','#8ee9ff','#ffe0a1'],color=colors[brick.row];ctx.save();glow(color,10);roundRect(brick.x,brick.y,brick.w,brick.h,7,color+'22',color+'ab');line(brick.x+8,brick.y+4,brick.x+brick.w-8,brick.y+4,color+'55');ctx.restore();}
    ctx.save();glow('#95eaff',22);roundRect(s.paddle.x-s.paddle.w/2,s.paddle.y,s.paddle.w,13,7,'#a5edff','#e8fbff');ctx.restore();
    ctx.save();glow('#ffe4a8',22);circle(s.ball.x,s.ball.y,s.ball.r,'#fff0c9');circle(s.ball.x,s.ball.y,s.ball.r+5,'#ffe4a822',false);ctx.restore();
    line(20,584,980,584,'#c5f4ff15');
  }else drawQuest(s,t);
  for(const p of s.particles){ctx.save();ctx.globalAlpha=Math.min(1,p.life*2);glow(p.color,8);circle(p.x,p.y,2.2,p.color);ctx.restore();}
  if(s.combo>=3&&mode!=='quest'){ctx.save();ctx.fillStyle='#b1eaff99';ctx.font='600 13px system-ui';ctx.textAlign='left';ctx.fillText(`ПОСПІЛЬ ×${s.combo}`,22,35);ctx.restore();}
}
function frame(now){
  const dt=Math.min((now-last)/1000||0,.04);last=now;
  const running=game&&game.status==='playing'&&!paused;
  if(running){
    updateGame(game,dt,input);input.action=false;input.tap=null;handleEvents(game);
    uiTime+=dt;if(uiTime>.1){updateHud(game);uiTime=0;}
    if(game.status!=='playing'){updateHud(game);finish();}
  }
  const t=reduced&&!running?0:now/1000;
  draw(game||preview,t,running);requestAnimationFrame(frame);
}

document.querySelectorAll('.mission').forEach(button=>button.addEventListener('click',()=>selectMode(button.dataset.mode)));
$('startBtn').addEventListener('click',()=>{if(modeAction==='home'){selectMode('flight');return;}startGame();});
$('retryBtn').addEventListener('click',()=>{modeAction='start';startGame();});
$('pauseBtn').addEventListener('click',()=>paused?resume():pause());
$('abilityBtn').addEventListener('pointerdown',event=>{event.preventDefault();input.action=true;});
$('soundBtn').addEventListener('click',()=>{sound=!sound;if(sound){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){audio=audio||new Audio();audio.resume();}else sound=false;}$('soundBtn').setAttribute('aria-pressed',String(sound));$('soundBtn').innerHTML=`♪ <span>Звук ${sound?'увімкнено':'вимкнено'}</span>`;tone(620,.1);});
const keyMap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
window.addEventListener('keydown',event=>{
  if(event.target.closest('button,a,input,textarea')&&['Space','Enter'].includes(event.code))return;
  if(!game||game.status!=='playing')return;
  if(keyMap[event.code]){event.preventDefault();input[keyMap[event.code]]=true;input.pointer=null;}
  if(['Space','Enter'].includes(event.code)){event.preventDefault();if(!event.repeat)input.action=true;}
  if(['KeyP','Escape'].includes(event.code)&&!event.repeat){event.preventDefault();paused?resume():pause();}
});
window.addEventListener('keyup',event=>{if(keyMap[event.code])input[keyMap[event.code]]=false;});
function position(event){const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left)/r.width*WIDTH,y:(event.clientY-r.top)/r.height*HEIGHT};}
canvas.addEventListener('pointerdown',event=>{if(!game||paused||game.status!=='playing')return;event.preventDefault();canvas.setPointerCapture(event.pointerId);input.pointer=position(event);input.tap=position(event);});
canvas.addEventListener('pointermove',event=>{if(!game||paused||game.status!=='playing')return;if(event.pointerType==='mouse'||event.buttons)input.pointer=position(event);});
canvas.addEventListener('pointerup',event=>{if(event.pointerType!=='mouse')input.pointer=null;});
canvas.addEventListener('pointercancel',()=>{input.pointer=null;});
window.addEventListener('blur',()=>{resetInput();pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
const requested=new URLSearchParams(location.search).get('mission');selectMode(order.includes(requested)?requested:'flight');requestAnimationFrame(frame);
