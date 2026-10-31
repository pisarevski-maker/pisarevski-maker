import test from 'node:test';
import assert from 'node:assert/strict';
import {hexColor,photoFilter,photoPlacement,floodFill,validProject} from '../public/assets/studio-core.mjs';

test('fill respects an opaque boundary and does not reach the other side',()=>{
  const data=new Uint8ClampedArray(5*3*4);
  for(let y=0;y<3;y++){const i=(y*5+2)*4;data.set([0,0,0,255],i);}
  floodFill({width:5,height:3,data},0,1,'#ff0000',1);
  assert.deepEqual([...data.slice(0,4)],[255,0,0,255]);assert.equal(data[(1*5+4)*4+3],0);assert.equal(data[(1*5+2)*4+3],255);
});
test('filling the same color is a no-op',()=>{
  const image={width:1,height:1,data:new Uint8ClampedArray([10,20,30,255])};assert.equal(floodFill(image,0,0,'#0a141e'),false);
});
test('exposure maps positive and negative stops to brightness',()=>{
  assert.equal(photoFilter({exposure:1,contrast:100,saturation:0}),'brightness(2) contrast(1) saturate(0)');
  assert.match(photoFilter({exposure:-1,contrast:120,saturation:80}),/brightness\(0.5\)/);
});
test('photo rotation swaps bounding dimensions without cropping in contain mode',()=>{
  const p=photoPlacement(1600,900,1200,800,90,'contain');assert.equal(p.height,450);
  assert.equal(p.width,800);assert.equal(p.angle,Math.PI/2);
});
test('cover mode fills both canvas dimensions',()=>{
  const p=photoPlacement(1600,900,1000,1000,0,'cover');assert.ok(p.width>=1000);assert.equal(p.height,1000);
});
test('color conversion clamps channel values',()=>assert.equal(hexColor(300,-5,128),'#ff0080'));
test('project validation rejects unsafe images and excessive dimensions',()=>{
  const base={version:1,width:1200,height:800,title:'Test',paper:'#ffffff',transparent:false,activeId:'a',layers:[{id:'a',name:'Layer',visible:true,opacity:1,data:'data:image/png;base64,AAAA'}],photo:null};
  assert.equal(validProject(base),true);assert.equal(validProject({...base,width:99999}),false);
  assert.equal(validProject({...base,layers:[{...base.layers[0],data:'https://example.com/photo.png'}]}),false);
  assert.equal(validProject({...base,layers:[{...base.layers[0],data:'data:image/svg+xml;base64,AAAA'}]}),false);
});
