export const WIDTH=1000, HEIGHT=600;
export const MODES={
  flight:{title:'Зоряний політ',goal:12,seconds:65},
  blaster:{title:'Світловий імпульс',goal:24,seconds:75},
  bounce:{title:'Енергія відскоку',goal:27,seconds:120},
  quest:{title:'Код сузір’я',goal:4,seconds:0}
};
export const QUEST_STEPS=[
  {name:'Іскра',hint:'Спершу знайди те, що дарує світло й тепло.',symbol:'☀',color:'#ffdc88'},
  {name:'Потік',hint:'Світло вже є. Тепер знайди те, без чого не росте життя.',symbol:'≈',color:'#87dcff'},
  {name:'Паросток',hint:'Тепло й вода разом пробуджують… Що саме?',symbol:'♧',color:'#92f5b9'},
  {name:'Ідея',hint:'Світ ожив. Хто дає йому новий задум? Знайди символ уяви.',symbol:'✧',color:'#d4b2ff'}
];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function createGame(mode,random=Math.random){
  if(!MODES[mode])throw new Error('Unknown mission');
  const state={mode,random,status:'playing',time:0,score:0,lives:3,combo:0,maxCombo:0,shield:0,slow:0,invulnerable:1.4,cooldown:0,spawn:0,shot:0,notice:'',noticeId:0,events:[],particles:[],objects:[],bullets:[],player:{x:mode==='flight'?180:500,y:mode==='flight'?300:510,r:20},aim:null};
  if(mode==='bounce'){
    state.paddle={x:500,y:554,w:155};
    state.ball={x:500,y:470,vx:180,vy:-360,r:9};
    state.bricks=Array.from({length:27},(_,i)=>({x:72+(i%9)*98,y:86+Math.floor(i/9)*47,w:88,h:30,alive:true,row:Math.floor(i/9)}));
  }
  if(mode==='quest'){
    state.player={x:500,y:470,r:20};
    state.nodes=[{x:195,y:170,key:2},{x:790,y:155,key:0},{x:260,y:410,key:1},{x:790,y:415,key:3}].map(n=>({...n,lit:false}));
    state.notice=QUEST_STEPS[0].hint;state.noticeId=1;
  }
  return state;
}
function event(s,type,x,y,color='#8aeaff'){
  s.events.push({type,x,y,color});
  for(let i=0;i<(type==='hit'?20:10);i++){
    const a=s.random()*Math.PI*2,v=30+s.random()*150;
    s.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.45+s.random()*.5,color});
  }
}
function notify(s,text){s.notice=text;s.noticeId++;}
function gain(s,x,y){s.score++;s.combo++;s.maxCombo=Math.max(s.maxCombo,s.combo);event(s,'collect',x,y);if(s.combo===5)notify(s,'П’ять поспіль! Ти тримаєш ритм ✦');}
function win(s){s.status='won';notify(s,'Ще одна зоря твого сузір’я запалала!');event(s,'win',500,230,'#fff0b0');}
function damage(s,x,y){
  if(s.invulnerable>0)return;
  if(s.shield>0){s.shield=0;s.invulnerable=1.2;event(s,'shield',x,y,'#d7b3ff');notify(s,'Щит прийняв удар. Продовжуємо!');return;}
  s.lives--;s.combo=0;s.invulnerable=1.7;event(s,'hit',x,y,'#ffb2c3');
  if(s.lives<=0)s.status='lost';else notify(s,'Нічого страшного. Я поруч — спробуй ще!');
}
function movePlayer(s,dt,input){
  const p=s.player;
  if(input.pointer){p.x+=(clamp(input.pointer.x,34,966)-p.x)*Math.min(1,dt*13);p.y+=(clamp(input.pointer.y,48,558)-p.y)*Math.min(1,dt*13);}
  else{
    let dx=(input.right?1:0)-(input.left?1:0),dy=(input.down?1:0)-(input.up?1:0);const length=Math.hypot(dx,dy)||1;
    p.x=clamp(p.x+dx/length*360*dt,34,966);p.y=clamp(p.y+dy/length*360*dt,48,558);
  }
}
function spawnFlight(s){
  const y=58+s.random()*478;
  const rock=s.random()<.52;
  const type=rock?'rock':s.random()<.13?'shield':'spark';
  s.objects.push({type,x:1040,y,r:rock?23+s.random()*19:15,speed:155+s.time*2.1+s.random()*75,angle:s.random()*6.28,spin:s.random()-.5});
}
function updateFlight(s,dt){
  s.spawn-=dt;
  if(s.spawn<=0){spawnFlight(s);s.spawn=.34+s.random()*.22;}
  const speed=s.slow>0?.5:1;
  for(const o of s.objects){o.x-=o.speed*dt*speed;o.angle+=o.spin*dt;
    if(!o.dead&&distance(o,s.player)<o.r+s.player.r-3){
      o.dead=true;
      if(o.type==='rock')damage(s,o.x,o.y);
      else if(o.type==='shield'){s.shield=10;event(s,'shield',o.x,o.y,'#c2a3ff');notify(s,'Світловий щит на 10 секунд');}
      else gain(s,o.x,o.y);
    }
  }
  s.objects=s.objects.filter(o=>!o.dead&&o.x>-70);
}
function spawnCrystal(s){
  const bonus=s.score>0&&s.random()<.09;
  s.objects.push({type:bonus?'slow':'crystal',x:45+s.random()*910,y:-40,r:bonus?16:22+s.random()*10,speed:75+s.time*1.7+s.random()*55,angle:s.random()*6.28,spin:.4+s.random(),hp:!bonus&&s.score>10&&s.random()<.3?2:1});
}
function updateBlaster(s,dt,input){
  s.spawn-=dt;s.shot-=dt;
  if(s.spawn<=0){spawnCrystal(s);s.spawn=Math.max(.28,.68-s.time*.004);}
  if(s.shot<=0){s.bullets.push({x:s.player.x,y:s.player.y-25});s.shot=.2;s.events.push({type:'shot'});}
  if(input.action&&s.cooldown<=0){
    s.cooldown=7;event(s,'pulse',s.player.x,s.player.y,'#cfb3ff');
    for(const o of s.objects){if(distance(o,s.player)<285){o.dead=true;if(o.type==='crystal')gain(s,o.x,o.y);}}
    notify(s,'Світловий імпульс! Простір навколо вільний.');
  }
  for(const b of s.bullets){b.y-=650*dt;
    for(const o of s.objects){if(!o.dead&&!b.dead&&distance(b,o)<o.r+6){b.dead=true;o.hp--;event(s,'spark',o.x,o.y,'#d7bdff');if(o.hp<=0){o.dead=true;if(o.type==='slow'){s.slow=5;notify(s,'Час сповільнився на 5 секунд');}else gain(s,o.x,o.y);}}}
  }
  for(const o of s.objects){o.y+=o.speed*dt*(s.slow>0?.45:1);o.angle+=o.spin*dt;
    if(!o.dead&&distance(o,s.player)<o.r+s.player.r){o.dead=true;if(o.type==='slow'){s.slow=5;notify(s,'Час сповільнився!');}else damage(s,o.x,o.y);}
    if(!o.dead&&o.y>640){o.dead=true;if(o.type==='crystal'){s.combo=0;notify(s,'Кристал пройшов повз. Наступний — твій.');}}
  }
  s.objects=s.objects.filter(o=>!o.dead);s.bullets=s.bullets.filter(b=>!b.dead&&b.y>-20);
}
function updateBounce(s,dt,input){
  const p=s.paddle,b=s.ball;
  const target=input.pointer?input.pointer.x:p.x+((input.right?1:0)-(input.left?1:0))*540*dt;
  p.x=clamp(target,p.w/2+10,990-p.w/2);
  const previousY=b.y;
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx);}else if(b.x>1000-b.r){b.x=1000-b.r;b.vx=-Math.abs(b.vx);}
  if(b.y<40){b.y=40;b.vy=Math.abs(b.vy);}
  if(b.vy>0&&previousY+b.r<=p.y&&b.y+b.r>=p.y&&b.x>p.x-p.w/2-b.r&&b.x<p.x+p.w/2+b.r){
    b.y=p.y-b.r;
    const offset=clamp((b.x-p.x)/(p.w/2),-.95,.95),speed=Math.min(610,Math.hypot(b.vx,b.vy)+8);
    b.vx=offset*speed*.85;b.vy=-Math.sqrt(speed*speed-b.vx*b.vx);event(s,'bounce',b.x,b.y,'#ffd88f');
  }
  for(const brick of s.bricks){
    if(brick.alive&&b.x+b.r>brick.x&&b.x-b.r<brick.x+brick.w&&b.y+b.r>brick.y&&b.y-b.r<brick.y+brick.h){
      brick.alive=false;
      if(previousY+b.r<=brick.y||previousY-b.r>=brick.y+brick.h)b.vy*=-1;else b.vx*=-1;
      gain(s,brick.x+brick.w/2,brick.y+brick.h/2);
      if(s.score===9||s.score===18){p.w=Math.min(205,p.w+25);notify(s,'Бонус: платформа стала ширшою!');}
      break;
    }
  }
  if(b.y>630){
    s.invulnerable=0;damage(s,p.x,p.y);
    b.x=p.x;b.y=470;b.vx=(s.random()<.5?-1:1)*170;b.vy=-360;
  }
}
function updateQuest(s,input){
  let selected=null;
  if(input.tap)selected=s.nodes.find(n=>Math.hypot(n.x-input.tap.x,n.y-input.tap.y)<60);
  else if(input.action)selected=s.nodes.find(n=>distance(n,s.player)<94);
  if(!selected||selected.lit||s.cooldown>0)return;
  s.cooldown=.5;
  if(selected.key===s.score){
    selected.lit=true;gain(s,selected.x,selected.y);
    notify(s,s.score<4?QUEST_STEPS[s.score].hint:'Ти поєднав світло, життя й уяву!');
  }else{event(s,'question',selected.x,selected.y,'#ffc9a2');notify(s,'Придивись: '+QUEST_STEPS[s.score].hint);}
}
export function updateGame(s,dt,input={}){
  if(s.status!=='playing')return;
  dt=clamp(dt,0,.04);s.time+=dt;s.events=[];
  for(const key of ['invulnerable','shield','slow','cooldown'])s[key]=Math.max(0,s[key]-dt);
  for(const p of s.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97;p.life-=dt;}
  s.particles=s.particles.filter(p=>p.life>0);
  if(s.mode!=='bounce')movePlayer(s,dt,input);
  if(s.mode==='flight')updateFlight(s,dt);
  else if(s.mode==='blaster')updateBlaster(s,dt,input);
  else if(s.mode==='bounce')updateBounce(s,dt,input);
  else updateQuest(s,input);
  if(s.status==='playing'&&s.score>=MODES[s.mode].goal)win(s);
  if(s.status==='playing'&&MODES[s.mode].seconds&&s.time>=MODES[s.mode].seconds){s.status='lost';notify(s,'Час завершився. Тепер ти вже знаєш маршрут!');}
}
