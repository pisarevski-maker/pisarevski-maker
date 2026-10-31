export const RINK={width:700,height:900,left:35,right:665,top:35,bottom:865,goalLeft:235,goalRight:465};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function createMatch(difficulty='friendly'){
  return {difficulty,status:'ready',human:0,ai:0,target:5,time:0,serve:1.2,puck:{x:350,y:450,vx:100,vy:290,r:15},player:{x:350,y:745,r:45,vx:0,vy:0},opponent:{x:350,y:155,r:42,vx:0,vy:0},goal:null};
}
function move(m,x,y,speed,dt,minY,maxY){
  x=clamp(x,35+m.r,665-m.r);y=clamp(y,minY,maxY);const dx=x-m.x,dy=y-m.y,distance=Math.hypot(dx,dy),ratio=distance?Math.min(1,speed*dt/distance):0;
  const nx=m.x+dx*ratio,ny=m.y+dy*ratio;m.vx=(nx-m.x)/dt;m.vy=(ny-m.y)/dt;m.x=nx;m.y=ny;
}
function hit(p,m){
  const dx=p.x-m.x,dy=p.y-m.y,d=Math.hypot(dx,dy),radius=p.r+m.r;if(d>=radius||d===0)return false;
  const nx=dx/d,ny=dy/d;p.x=m.x+nx*(radius+.3);p.y=m.y+ny*(radius+.3);
  const approach=(p.vx-m.vx)*nx+(p.vy-m.vy)*ny;
  if(approach<0){p.vx-=2*approach*nx;p.vy-=2*approach*ny;p.vx+=m.vx*.28;p.vy+=m.vy*.28;}
  const speed=Math.hypot(p.vx,p.vy)||1,desired=clamp(speed,280,850);p.vx=p.vx/speed*desired;p.vy=p.vy/speed*desired;return true;
}
function score(s,side){
  s[side]++;s.goal=side;s.serve=1.5;
  s.puck={x:350,y:450,vx:(s[side]%2?1:-1)*100,vy:side==='human'?290:-290,r:15};
  Object.assign(s.player,{x:350,y:745,vx:0,vy:0});Object.assign(s.opponent,{x:350,y:155,vx:0,vy:0});
  if(s[side]>=s.target){s.status='finished';s.winner=side;}
}
export function updateMatch(s,dt,input={}){
  if(s.status!=='playing')return;dt=clamp(dt,.001,.035);s.time+=dt;s.goal=null;s.hit=false;
  const desired=input.pointer||{x:s.player.x+((input.right?1:0)-(input.left?1:0))*540*dt,y:s.player.y+((input.down?1:0)-(input.up?1:0))*540*dt};
  move(s.player,desired.x,desired.y,700,dt,480,865-s.player.r);
  const p=s.puck,hard=s.difficulty==='challenge';
  const chase=p.y<455?clamp(p.x+(hard?p.vx*.1:Math.sin(s.time*1.9)*35),100,600):350;
  const y=p.y<360?clamp(p.y-65,100,360):155;
  move(s.opponent,chase,y,hard?350:235,dt,35+s.opponent.r,420);
  if(s.serve>0){s.serve=Math.max(0,s.serve-dt);return;}
  for(let i=0;i<3;i++){
    p.x+=p.vx*dt/3;p.y+=p.vy*dt/3;
    if(p.x-p.r<35){p.x=35+p.r;p.vx=Math.abs(p.vx);s.hit=true;}
    if(p.x+p.r>665){p.x=665-p.r;p.vx=-Math.abs(p.vx);s.hit=true;}
    if(p.y-p.r<35){if(p.x>235+p.r*.3&&p.x<465-p.r*.3){score(s,'human');return;}p.y=35+p.r;p.vy=Math.abs(p.vy);s.hit=true;}
    if(p.y+p.r>865){if(p.x>235+p.r*.3&&p.x<465-p.r*.3){score(s,'ai');return;}p.y=865-p.r;p.vy=-Math.abs(p.vy);s.hit=true;}
    s.hit=hit(p,s.player)||s.hit;s.hit=hit(p,s.opponent)||s.hit;
    p.x=clamp(p.x,35+p.r,665-p.r);
  }
  if(Math.abs(p.vy)<35)p.vy+=(p.y<450?1:-1)*65*dt;
}
