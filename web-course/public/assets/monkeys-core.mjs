export const FIELD={width:1000,height:600,gravity:600,ground:552};
export const HEALTH_COLORS=['#ed91b1','#f4d17e','#88d8ad'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createDuel(count=1,random=Math.random){
  if(![1,2,3].includes(count))throw new Error('Choose one to three monkeys');
  const left=count===1?[[145,440]]:count===2?[[105,462],[245,378]]:[[85,466],[205,364],[315,445]];
  const names=[['Коко','Мімі','Лулу'],['Тіко','Рікі','Бобо']];
  const monkeys=[...left.map(([x,y],i)=>({id:'human-'+i,side:'human',x,y,hp:3,r:25,name:names[0][i]})),...left.map(([x,y],i)=>({id:'ai-'+i,side:'ai',x:1000-x,y,hp:3,r:25,name:names[1][i]}))];
  return {count,random,status:'ready',phase:'player',round:1,time:0,monkeys,selected:'human-0',fired:[],projectiles:[],events:[],wait:0,notice:'Потягни свою мавпочку назад і трохи вниз — та відпусти!'};
}
export function alive(s,side){return s.monkeys.filter(m=>m.side===side&&m.hp>0);}
export function launchVelocity(angle,power,direction=1){const speed=200+clamp(power,10,100)*6.4,radians=clamp(angle,10,80)*Math.PI/180;return {vx:Math.cos(radians)*speed*direction,vy:-Math.sin(radians)*speed};}
export function dragAim(dx,dy){
  const distance=Math.hypot(dx,dy);if(distance<12||dx<=0)return null;
  return {angle:clamp(Math.atan2(-dy,dx)*180/Math.PI,10,80),power:clamp(distance/145*100,10,100)};
}
export function selectMonkey(s,id){const m=s.monkeys.find(m=>m.id===id);if(s.status!=='playing'||s.phase!=='player'||!m||m.side!=='human'||m.hp<=0||s.fired.includes(id))return false;s.selected=id;return true;}
export function throwStone(s,angle,power){
  const m=s.monkeys.find(m=>m.id===s.selected);
  if(s.status!=='playing'||s.phase!=='player'||!m||m.hp<=0||s.fired.includes(m.id))return false;
  const velocity=launchVelocity(angle,power);
  s.projectiles.push({x:m.x+22,y:m.y-18,...velocity,side:'human',age:0});s.fired.push(m.id);s.phase='player-flight';s.notice='Дивись, куди летить камінець. Наступного разу можна змінити силу або кут.';return true;
}
function launchAI(s){
  const targets=alive(s,'human');if(!targets.length)return;
  for(const m of alive(s,'ai')){
    const target=targets[Math.min(targets.length-1,Math.floor(s.random()*targets.length))];
    const x=m.x-22,y=m.y-18,tx=target.x+(s.random()-.5)*180,ty=target.y-7+(s.random()-.5)*24;
    const angle=(48+s.random()*18)*Math.PI/180,dx=Math.max(80,x-tx),dy=ty-y;
    const speed=clamp(Math.sqrt(FIELD.gravity*dx*dx/(2*Math.cos(angle)**2*Math.max(30,dy+dx*Math.tan(angle)))),270,840);
    s.projectiles.push({x,y,vx:-Math.cos(angle)*speed,vy:-Math.sin(angle)*speed,side:'ai',age:0});
  }
  s.phase='ai';s.notice=s.count===1?'Тепер кидок Айнаї. Спостерігай за дугою!':'Команда Айнаї кидає разом. Лови очима всі траєкторії!';
}
function finishIfNeeded(s){
  if(!alive(s,'ai').length||!alive(s,'human').length){s.status='finished';s.winner=alive(s,'human').length?'human':'ai';s.projectiles=[];s.notice=s.winner==='human'?'Твоя команда перемогла! Ти знайшов свою силу й кут.':'Цього разу перемогла команда Айнаї. Тепер ти краще знаєш траєкторії!';return true;}return false;
}
function hitMonkey(s,m,p){
  m.hp--;s.events.push({type:m.hp===0?'out':'hit',x:m.x,y:m.y,side:m.side,name:m.name});
  if(m.hp===0)m.outAt=s.time;
  s.notice=m.hp===0?m.name+' весело вилітає з гри!':`Влучання! У ${m.name} залишилося ${m.hp} ${m.hp===1?'сердечко':'сердечка'}.`;
  p.dead=true;
}
export function updateDuel(s,dt){
  if(s.status!=='playing')return;dt=clamp(dt,0,.04);s.time+=dt;s.events=[];
  if(s.phase==='ai-wait'){s.wait-=dt;if(s.wait<=0)launchAI(s);}
  for(const p of s.projectiles){
    p.age+=dt;
    const steps=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vy)*dt/10));
    for(let i=0;i<steps&&!p.dead;i++){
      p.vy+=FIELD.gravity*dt/steps;p.x+=p.vx*dt/steps;p.y+=p.vy*dt/steps;
      const hit=s.monkeys.find(m=>m.hp>0&&m.side!==p.side&&Math.hypot(m.x-p.x,m.y-7-p.y)<m.r+8);
      if(hit){hitMonkey(s,hit,p);break;}
      const platform=s.monkeys.find(m=>p.x>m.x-41&&p.x<m.x+41&&p.y>m.y+31&&p.y<FIELD.ground);
      if(platform||p.y>FIELD.ground||p.x<-40||p.x>1040||p.age>7){p.dead=true;if(p.x>=0&&p.x<=1000)s.events.push({type:'land',x:p.x,y:Math.min(p.y,FIELD.ground)});}
    }
  }
  s.projectiles=s.projectiles.filter(p=>!p.dead);
  if(finishIfNeeded(s))return;
  if(!s.projectiles.length&&s.phase==='player-flight'){
    const next=alive(s,'human').find(m=>!s.fired.includes(m.id));
    if(next){s.selected=next.id;s.phase='player';s.notice=`Тепер кидає ${next.name}. Затисни мавпочку або скористайся повзунками.`;}
    else{s.phase='ai-wait';s.wait=.85;s.notice='Команда Айнаї готує свій кидок…';}
  }else if(!s.projectiles.length&&s.phase==='ai'){
    s.round++;s.fired=[];s.selected=alive(s,'human')[0].id;s.phase='player';s.notice='Твій хід! Спробуй іншу силу або вищу дугу.';
  }
}
