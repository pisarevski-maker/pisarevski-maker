import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatch,updateMatch} from '../public/assets/hockey-core.mjs';
function playing(){const s=createMatch();s.status='playing';s.serve=0;return s;}
test('mallet stays on the human side and inside the table',()=>{const s=playing();for(let i=0;i<100;i++)updateMatch(s,.03,{pointer:{x:-1000,y:-1000}});assert.ok(s.player.x>=80);assert.ok(s.player.y>=480);});
test('puck bounces off the side wall',()=>{const s=playing();s.puck={x:52,y:450,vx:-400,vy:0,r:15};updateMatch(s,.03);assert.ok(s.puck.vx>0);assert.equal(s.human+s.ai,0);});
test('a shot into the upper goal scores for the human and resets serve',()=>{const s=playing();s.puck={x:350,y:49,vx:0,vy:-400,r:15};updateMatch(s,.02);assert.equal(s.human,1);assert.equal(s.puck.y,450);assert.ok(s.serve>0);});
test('a shot outside the goal bounces without scoring',()=>{const s=playing();s.puck={x:150,y:49,vx:0,vy:-400,r:15};updateMatch(s,.02);assert.equal(s.human,0);assert.ok(s.puck.vy>0);});
test('five goals finish the match and freeze subsequent updates',()=>{const s=playing();s.ai=4;s.puck={x:350,y:852,vx:0,vy:400,r:15};updateMatch(s,.02);assert.equal(s.ai,5);assert.equal(s.winner,'ai');assert.equal(s.status,'finished');const t=s.time;updateMatch(s,.03);assert.equal(s.time,t);});
test('AI movement is bounded by reaction speed',()=>{const s=playing();s.puck.x=600;s.puck.y=250;const x=s.opponent.x;updateMatch(s,.03);assert.ok(Math.abs(s.opponent.x-x)<=235*.03+.001);});
