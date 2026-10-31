import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,updateGame,MODES} from '../public/games/simulation.mjs';

test('flight collects sparks and completes its mission',()=>{
  const s=createGame('flight');s.spawn=100;
  for(let i=0;i<12;i++){s.objects.push({type:'spark',x:s.player.x,y:s.player.y,r:15,speed:0,angle:0,spin:0});updateGame(s,.016);}
  assert.equal(s.score,12);assert.equal(s.status,'won');
});
test('shield absorbs a collision, then an unshielded collision costs one life',()=>{
  const s=createGame('flight');s.spawn=100;s.invulnerable=0;s.shield=10;
  const rock=()=>({type:'rock',x:s.player.x,y:s.player.y,r:25,speed:0,angle:0,spin:0});
  s.objects.push(rock());updateGame(s,.016);assert.equal(s.lives,3);assert.equal(s.shield,0);
  s.invulnerable=0;s.objects.push(rock());updateGame(s,.016);assert.equal(s.lives,2);
});
test('movement stays in bounds even when a pointer leaves the field',()=>{
  const s=createGame('flight');s.spawn=100;
  for(let i=0;i<40;i++)updateGame(s,.04,{pointer:{x:5000,y:-200}});
  assert.ok(s.player.x<=966);assert.ok(s.player.y>=48);
});
test('a final blaster hit completes the crystal mission',()=>{
  const s=createGame('blaster');s.spawn=100;s.shot=100;s.score=23;
  s.objects=[{type:'crystal',x:500,y:110,r:25,hp:1,speed:0,angle:0,spin:0}];s.bullets=[{x:500,y:130}];
  updateGame(s,.016);assert.equal(s.score,24);assert.equal(s.status,'won');
});
test('pulse affects nearby crystals only and cannot repeat during cooldown',()=>{
  const s=createGame('blaster');s.spawn=100;s.shot=100;
  s.objects=[{type:'crystal',x:500,y:400,r:20,hp:2,speed:0,angle:0,spin:0},{type:'crystal',x:50,y:50,r:20,hp:1,speed:0,angle:0,spin:0}];
  updateGame(s,.016,{action:true});assert.equal(s.score,1);assert.equal(s.objects.length,1);assert.ok(s.cooldown>0);
  updateGame(s,.016,{action:true});assert.equal(s.score,1);
});
test('paddle reflects a descending ball upward',()=>{
  const s=createGame('bounce');s.ball={x:520,y:540,vx:0,vy:400,r:9};
  updateGame(s,.02);assert.ok(s.ball.vy<0);assert.ok(s.ball.vx>0);
});
test('last brick completes the bounce mission',()=>{
  const s=createGame('bounce');s.score=26;s.bricks.forEach(b=>b.alive=false);
  s.bricks[0].alive=true;const b=s.bricks[0];s.ball={x:b.x+44,y:b.y+b.h+12,vx:0,vy:-360,r:9};
  updateGame(s,.02);assert.equal(s.status,'won');assert.equal(s.score,27);
});
test('missing the paddle resets the ball and uses one life',()=>{
  const s=createGame('bounce');s.ball.y=635;s.ball.vy=300;
  updateGame(s,.016);assert.equal(s.lives,2);assert.equal(s.ball.y,470);assert.ok(s.ball.vy<0);
});
test('quest gives a hint for wrong choices, then accepts all four in order',()=>{
  const s=createGame('quest');updateGame(s,.016,{tap:s.nodes.find(n=>n.key===3)});
  assert.equal(s.score,0);assert.equal(s.lives,3);
  for(let key=0;key<4;key++){s.cooldown=0;updateGame(s,.016,{tap:s.nodes.find(n=>n.key===key)});}
  assert.equal(s.status,'won');assert.ok(s.nodes.every(n=>n.lit));
});
test('time expires only for timed missions; finished missions stop changing',()=>{
  const s=createGame('flight');s.spawn=100;s.time=MODES.flight.seconds-.01;updateGame(s,.02);assert.equal(s.status,'lost');
  const previous=s.time;updateGame(s,.04);assert.equal(s.time,previous);
  const q=createGame('quest');q.time=500;updateGame(q,.04);assert.equal(q.status,'playing');
});
