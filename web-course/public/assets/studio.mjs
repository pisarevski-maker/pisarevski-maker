import {TOOLS,hexColor,photoFilter,photoPlacement,validProject,floodFill,brushSegment,drawShape} from './studio-core.mjs';

const $=id=>document.getElementById(id),canvas=$('paintCanvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
const settings={color:'#356ba1',size:8,opacity:.8,fill:false};
let tool='pencil',doc=null,history=[],historyIndex=-1,stroke=null,busy=false,saveTimer=null,dbPromise=null;
let studioMode='artist';
const modeSettings={simple:{tool:'ink',color:'#356ba1',size:36,opacity:1,fill:false},artist:{tool:'pencil',...settings}};
const simpleColors=new Set(['#263447','#356ba1','#b65d70','#edb0a8','#dbac76','#f2e3b8','#4e6c60','#ffffff']);
const colors=['#263447','#356ba1','#7399bd','#a3c8d6','#d3e6e8','#6d707e','#a585b5','#d6b7ce','#b65d70','#edb0a8','#aa6b43','#dbac76','#e8d39c','#f2e3b8','#f5f0df','#4e6c60','#81a59a','#b5c3a4','#dae2c9','#ffffff'];
const galleryMode=parent!==window&&new URLSearchParams(location.search).get('gallery')==='1';
function makeCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function newLayer(name){return {id:crypto.randomUUID(),name,visible:true,opacity:1,canvas:makeCanvas(doc.width,doc.height)};}
function active(){return doc.layers.find(l=>l.id===doc.activeId);}
function message(text){$('saveStatus').textContent=text;}
function hint(text){$('studioHint').textContent=text;}
function imageFrom(data){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Image decode failed'));image.src=data;});}
function readData(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});}
function database(){
  if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const request=indexedDB.open('AinariumStudioV1',1);request.onupgradeneeded=()=>request.result.createObjectStore('projects');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});return dbPromise;
}
async function autoSave(snapshot){
  try{const db=await database();await new Promise((resolve,reject)=>{const transaction=db.transaction('projects','readwrite');transaction.objectStore('projects').put(snapshot,'last');transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);});message('Збережено у цьому браузері');}
  catch{message('Автозбереження недоступне — завантаж проєкт');}
}
function snapshot(){
  return {version:1,width:doc.width,height:doc.height,title:doc.title,paper:doc.paper,transparent:doc.transparent,hasContent:doc.hasContent,activeId:doc.activeId,layers:doc.layers.map(({canvas,...l})=>({...l,data:canvas.toDataURL('image/png')})),photo:doc.photo?{data:doc.photo.data,exposure:doc.photo.exposure,contrast:doc.photo.contrast,saturation:doc.photo.saturation,opacity:doc.photo.opacity,rotation:doc.photo.rotation,fit:doc.photo.fit}:null};
}
function checkpoint(){
  const state=snapshot();history=history.slice(0,historyIndex+1);history.push(state);if(history.length>18)history.shift();historyIndex=history.length-1;updateHistoryButtons();clearTimeout(saveTimer);message('Зберігаю…');saveTimer=setTimeout(()=>autoSave(state),600);
}
function updateHistoryButtons(){$('undoBtn').disabled=historyIndex<=0||busy;$('redoBtn').disabled=historyIndex>=history.length-1||busy;}
async function restore(state){
  busy=true;document.body.classList.add('is-restoring');updateHistoryButtons();
  try{
    const layers=await Promise.all(state.layers.map(async l=>{const c=makeCanvas(state.width,state.height);c.getContext('2d').drawImage(await imageFrom(l.data),0,0);const {data,...rest}=l;return {...rest,canvas:c};}));
    const photo=state.photo?{...state.photo,image:await imageFrom(state.photo.data)}:null;
    doc={...state,layers,photo};canvas.width=doc.width;canvas.height=doc.height;refreshUI();render();fitCanvas();
  }finally{busy=false;document.body.classList.remove('is-restoring');updateHistoryButtons();}
}
async function undo(direction){
  if(busy||stroke)return;const target=historyIndex+direction;if(target<0||target>=history.length)return;
  clearTimeout(saveTimer);await restore(history[target]);historyIndex=target;updateHistoryButtons();autoSave(history[target]);
}
function render(){
  ctx.clearRect(0,0,doc.width,doc.height);
  if(!doc.transparent){ctx.fillStyle=doc.paper;ctx.fillRect(0,0,doc.width,doc.height);}
  if(doc.photo){
    const p=doc.photo,placement=photoPlacement(p.image.naturalWidth,p.image.naturalHeight,doc.width,doc.height,p.rotation,p.fit);
    ctx.save();ctx.translate(doc.width/2,doc.height/2);ctx.rotate(placement.angle);ctx.filter=photoFilter(p);ctx.globalAlpha=p.opacity;ctx.drawImage(p.image,-placement.width/2,-placement.height/2,placement.width,placement.height);ctx.restore();
  }
  for(const l of doc.layers)if(l.visible){ctx.save();ctx.globalAlpha=l.opacity;ctx.drawImage(l.canvas,0,0);ctx.restore();}
  $('canvasPlaceholder').hidden=Boolean(doc.hasContent||doc.photo||doc.transparent);
}
function fitCanvas(){
  if(!doc)return;const r=$('canvasViewport');const padding=parseFloat(getComputedStyle(r).paddingLeft)*2;const width=r.clientWidth-padding,height=r.clientHeight-padding;const scale=Math.min(width/doc.width,height/doc.height);
  $('canvasFrame').style.width=Math.max(1,Math.floor(doc.width*scale))+'px';$('canvasFrame').style.height=Math.max(1,Math.floor(doc.height*scale))+'px';
}
function updateInfo(){$('canvasInfo').textContent=`${doc.width} × ${doc.height} · ${studioMode==='simple'&&tool==='ink'?'Пензель':TOOLS[tool].label}`;}
function updateSimpleWidths(){document.querySelectorAll('[data-simple-width]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.simpleWidth)===settings.size)));}
function setStudioMode(next){
  if(stroke)return;
  modeSettings[studioMode]={tool,...settings};studioMode=next;document.body.classList.toggle('studio-simple',next==='simple');
  const profile=modeSettings[next];selectTool(profile.tool);Object.assign(settings,{color:profile.color,size:profile.size,opacity:profile.opacity,fill:profile.fill});
  $('brushSize').value=settings.size;$('sizeValue').textContent=settings.size;$('brushOpacity').value=Math.round(settings.opacity*100);$('opacityValue').textContent=Math.round(settings.opacity*100)+'%';$('fillShape').checked=settings.fill;
  $('simpleModeBtn').setAttribute('aria-pressed',String(next==='simple'));$('artistModeBtn').setAttribute('aria-pressed',String(next==='artist'));
  document.querySelector('[data-tool="ink"]').lastChild.textContent=next==='simple'?'Пензель':'Туш';
  $('studioModeNote').textContent=next==='simple'?'Почни з простого. Перейти до всіх інструментів можна будь-коли — малюнок збережеться.':'Усі інструменти відкриті: пензлі, шари, фотографії та тонкі налаштування. Можеш повернутися до простого режиму будь-коли.';
  hint(next==='simple'?'Обери колір, візьми пензель і малюй. Широкий мазок — для сміливих ідей, гумка — щоб легко щось змінити. Решту відкриємо, коли захочеш.':TOOLS[tool].hint);
  refreshPalette();updateSimpleWidths();updateInfo();
}
function selectTool(name){
  tool=name;if(studioMode==='simple'){settings.opacity=name==='watercolor'?.65:1;}else if(TOOLS[name].size>1){settings.size=TOOLS[name].size;$('brushSize').value=settings.size;$('sizeValue').textContent=settings.size;}
  document.querySelectorAll('.tool-button').forEach(b=>{const selected=b.dataset.tool===name;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
  const simpleHints={ink:'Пензель малює яскраво й впевнено. Обери колір і зроби свій перший мазок.',watercolor:'Акварель залишає м’які прозорі мазки. Пройдися ще раз, щоб колір став насиченішим.',eraser:'Гумка допоможе змінити намальоване. Фотографія під малюнком залишиться цілою.'};
  hint(studioMode==='simple'?simpleHints[name]:TOOLS[name].hint);updateInfo();canvas.style.cursor=name==='picker'?'copy':name==='fill'?'cell':'crosshair';
}
function refreshPalette(){
  $('colorPicker').value=settings.color;document.querySelectorAll('.color-swatch').forEach(b=>b.classList.toggle('selected',b.dataset.color===settings.color));
}
function renderLayers(){
  $('layersList').replaceChildren();
  [...doc.layers].reverse().forEach(l=>{
    const row=document.createElement('div');row.className='layer-row'+(l.id===doc.activeId?' selected':'');
    const eye=document.createElement('button');eye.type='button';eye.textContent=l.visible?'◉':'○';eye.setAttribute('aria-label',(l.visible?'Сховати ':'Показати ')+l.name);eye.setAttribute('aria-pressed',String(l.visible));
    eye.onclick=event=>{event.stopPropagation();l.visible=!l.visible;renderLayers();render();checkpoint();};
    const mark=document.createElement('span');mark.className='layer-thumbnail';mark.textContent='▱';mark.setAttribute('aria-hidden','true');
    const name=document.createElement('input');name.value=l.name;name.maxLength=60;name.setAttribute('aria-label','Назва шару '+l.name);name.addEventListener('change',()=>{l.name=name.value.trim()||'Шар';checkpoint();});
    row.onclick=()=>{doc.activeId=l.id;renderLayers();};name.onclick=event=>{event.stopPropagation();doc.activeId=l.id;document.querySelectorAll('.layer-row').forEach(r=>r.classList.remove('selected'));row.classList.add('selected');updateLayerControls();};
    row.append(eye,mark,name);$('layersList').append(row);
  });updateLayerControls();
}
function updateLayerControls(){
  const index=doc.layers.findIndex(l=>l.id===doc.activeId),l=active();$('layerOpacity').value=l.opacity*100;$('layerOpacityValue').textContent=Math.round(l.opacity*100)+'%';
  $('moveLayerUp').disabled=index===doc.layers.length-1;$('moveLayerDown').disabled=index===0;$('deleteLayerBtn').disabled=doc.layers.length===1;$('addLayerBtn').disabled=doc.layers.length>=6;
}
function updatePhotoUI(){
  $('photoControls').hidden=!doc.photo;$('photoEmptyNote').hidden=Boolean(doc.photo);$('replacePhotoBtn').textContent=doc.photo?'Замінити':'Завантажити';
  if(doc.photo){const p=doc.photo;for(const [id,key,label] of [['photoExposure','exposure','exposureValue'],['photoContrast','contrast','contrastValue'],['photoSaturation','saturation','saturationValue'],['photoOpacity','opacity','photoOpacityValue']]){
    const value=key==='opacity'?p[key]*100:p[key];$(id).value=value;$(label).textContent=key==='exposure'?(value>0?'+':'')+Number(value).toFixed(2):Math.round(value)+'%';
  }$('photoFit').value=p.fit;}
}
function refreshUI(){
  $('documentName').textContent=doc.title;$('paperColor').value=doc.paper;$('transparentPaper').checked=doc.transparent;renderLayers();updatePhotoUI();updateInfo();
}
function createDocument(width=1200,height=800,title='Мій новий світ'){
  doc={width,height,title,paper:'#f4efe5',transparent:false,layers:[],activeId:'',photo:null,hasContent:false};const l=newLayer('Малюнок 1');doc.layers.push(l);doc.activeId=l.id;canvas.width=width;canvas.height=height;refreshUI();render();fitCanvas();
}
function point(event){const r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(doc.width-1,(event.clientX-r.left)/r.width*doc.width)),y:Math.max(0,Math.min(doc.height-1,(event.clientY-r.top)/r.height*doc.height)),pressure:event.pointerType==='pen'?Math.max(.15,event.pressure):1};}
function startStroke(event){
  if(busy||stroke||event.button>0)return;event.preventDefault();canvas.focus({preventScroll:true});const p=point(event);
  if(tool==='picker'){
    const [r,g,b,a]=ctx.getImageData(Math.floor(p.x),Math.floor(p.y),1,1).data;if(a){settings.color=hexColor(r,g,b);refreshPalette();hint('Колір узято. Обери пензель і продовжуй малювати.');}return;
  }
  const l=active();if(!l.visible||l.opacity===0){hint(studioMode==='simple'?'Цей шар прихований. Відкрий «Справжній художник», щоб показати його, або створи нове полотно.':'Цей шар прихований. Покажи його або обери інший шар.');return;}
  const lc=l.canvas.getContext('2d',{willReadFrequently:true});
  if(tool==='fill'){
    const image=lc.getImageData(0,0,doc.width,doc.height);if(floodFill(image,p.x,p.y,settings.color,settings.opacity)){lc.putImageData(image,0,0);doc.hasContent=true;render();checkpoint();}return;
  }
  canvas.setPointerCapture(event.pointerId);
  stroke={id:event.pointerId,start:p,last:p,layer:l,context:lc,tool,settings:{...settings}};
  if(['line','rect','ellipse'].includes(tool)){stroke.backup=makeCanvas(doc.width,doc.height);stroke.backup.getContext('2d').drawImage(l.canvas,0,0);}
  else brushSegment(lc,p,p,settings,tool);
  doc.hasContent=true;render();
}
function moveStroke(event){
  if(!stroke||stroke.id!==event.pointerId)return;event.preventDefault();const coalesced=event.getCoalescedEvents?.();const events=stroke.backup||!coalesced?.length?[event]:coalesced;
  for(const e of events){const p=point(e);
    if(stroke.backup){stroke.context.clearRect(0,0,doc.width,doc.height);stroke.context.drawImage(stroke.backup,0,0);drawShape(stroke.context,stroke.start,p,stroke.settings,stroke.tool);}
    else brushSegment(stroke.context,stroke.last,p,stroke.settings,stroke.tool);stroke.last=p;
  }render();
}
function endStroke(event){if(!stroke||stroke.id!==event.pointerId)return;stroke=null;render();checkpoint();}
async function loadPhoto(file){
  if(!file)return;if(!['image/png','image/jpeg','image/webp','image/avif','image/gif'].includes(file.type)||file.size>20*1024*1024){message('Обери зображення до 20 МБ.');return;}
  busy=true;document.body.classList.add('is-restoring');message('Відкриваю фотографію…');
  try{
    const original=await imageFrom(await readData(file));const scale=Math.min(1,2000/Math.max(original.naturalWidth,original.naturalHeight));const c=makeCanvas(Math.round(original.naturalWidth*scale),Math.round(original.naturalHeight*scale));c.getContext('2d').drawImage(original,0,0,c.width,c.height);const data=c.toDataURL('image/webp',.94);
    doc.photo={data,image:await imageFrom(data),exposure:0,contrast:100,saturation:100,opacity:1,rotation:0,fit:'contain'};doc.hasContent=true;updatePhotoUI();render();checkpoint();hint('Фото під малюнком. Налаштуй світло праворуч, а малюй на прозорому шарі поверх. Оригінал фото не змінюється.');
  }catch{message('Не вдалося відкрити це фото. Спробуй інше зображення.');}
  finally{busy=false;document.body.classList.remove('is-restoring');$('photoInput').value='';updateHistoryButtons();}
}
function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function safeName(){return doc.title.replace(/[<>:"/\\|?*\x00-\x1F]/g,'-').slice(0,80)||'AINARIUM-малюнок';}
function sample(){
  if(busy||stroke)return;
  if(doc.layers.length>=6){hint('Зразок додається на новий шар. Прибери зайвий шар або створи нове полотно.');return;}
  const l=newLayer('М’який вечір — зразок');doc.layers.push(l);doc.activeId=l.id;const c=l.canvas.getContext('2d'),w=doc.width,h=doc.height;
  const sky=c.createLinearGradient(0,h*.1,0,h*.9);sky.addColorStop(0,'#c9dbe2');sky.addColorStop(.52,'#f3d3ba');sky.addColorStop(1,'#e1c5ba');c.fillStyle=sky;c.fillRect(w*.08,h*.1,w*.84,h*.8);
  c.fillStyle='#f4e5bd';c.beginPath();c.arc(w*.68,h*.32,w*.075,0,Math.PI*2);c.fill();
  for(const [y,color,offset] of [[.63,'#a4b7bb',.1],[.72,'#759aa5',.2],[.83,'#426d80',-.1]]){c.fillStyle=color;c.beginPath();c.moveTo(w*.08,h*.9);c.lineTo(w*.08,h*y);c.bezierCurveTo(w*.3,h*(y-.3+offset),w*.58,h*(y+.14),w*.92,h*(y-.12));c.lineTo(w*.92,h*.9);c.closePath();c.fill();}
  for(let i=0;i<8;i++){brushSegment(c,{x:w*(.13+i*.1),y:h*.94},{x:w*(.17+i*.1),y:h*.945},{color:['#426d80','#759aa5','#f3d3ba','#f4e5bd'][i%4],size:w*.03,opacity:.8},'watercolor');}
  doc.hasContent=true;renderLayers();render();checkpoint();hint('Це лише початок. Додай свій колір, домалюй деталь або скасуй зразок і почни з чистого полотна.');
}

for(const [name,t] of Object.entries(TOOLS)){const button=document.createElement('button');button.type='button';button.className='tool-button';button.dataset.tool=name;button.setAttribute('aria-pressed','false');const symbol=document.createElement('span');symbol.textContent=t.symbol;symbol.setAttribute('aria-hidden','true');button.append(symbol,document.createTextNode(t.label));button.onclick=()=>selectTool(name);$('toolList').append(button);}
for(const color of colors){const b=document.createElement('button');b.type='button';b.className='color-swatch';b.style.background=color;b.dataset.color=color;if(simpleColors.has(color))b.dataset.simpleColor='';b.setAttribute('aria-label','Колір '+color);b.onclick=()=>{settings.color=color;refreshPalette();};$('palette').append(b);}
$('simpleModeBtn').onclick=()=>setStudioMode('simple');$('artistModeBtn').onclick=()=>setStudioMode('artist');
document.querySelectorAll('[data-simple-width]').forEach(button=>button.onclick=()=>{settings.size=Number(button.dataset.simpleWidth);$('brushSize').value=settings.size;$('sizeValue').textContent=settings.size;updateSimpleWidths();});
$('colorPicker').oninput=event=>{settings.color=event.target.value;refreshPalette();};
$('brushSize').oninput=event=>{settings.size=Number(event.target.value);$('sizeValue').textContent=settings.size;};
$('brushOpacity').oninput=event=>{settings.opacity=Number(event.target.value)/100;$('opacityValue').textContent=event.target.value+'%';};
$('fillShape').onchange=event=>settings.fill=event.target.checked;
for(const id of ['paperColor','transparentPaper'])$(id).addEventListener('input',()=>{doc.paper=$('paperColor').value;doc.transparent=$('transparentPaper').checked;render();});
for(const id of ['paperColor','transparentPaper'])$(id).addEventListener('change',checkpoint);
canvas.addEventListener('pointerdown',startStroke);canvas.addEventListener('pointermove',moveStroke);canvas.addEventListener('pointerup',endStroke);canvas.addEventListener('pointercancel',endStroke);
canvas.addEventListener('lostpointercapture',event=>{if(stroke&&stroke.id===event.pointerId){stroke=null;checkpoint();}});
$('undoBtn').onclick=()=>undo(-1);$('redoBtn').onclick=()=>undo(1);
$('addLayerBtn').onclick=()=>{if(busy||doc.layers.length>=6)return;const l=newLayer('Малюнок '+(doc.layers.length+1));doc.layers.splice(doc.layers.indexOf(active())+1,0,l);doc.activeId=l.id;renderLayers();checkpoint();};
$('deleteLayerBtn').onclick=()=>{if(busy||doc.layers.length===1)return;const index=doc.layers.indexOf(active());doc.layers.splice(index,1);doc.activeId=doc.layers[Math.min(index,doc.layers.length-1)].id;renderLayers();render();checkpoint();};
for(const [id,direction] of [['moveLayerUp',1],['moveLayerDown',-1]])$(id).onclick=()=>{const index=doc.layers.indexOf(active()),target=index+direction;if(target<0||target>=doc.layers.length)return;[doc.layers[index],doc.layers[target]]=[doc.layers[target],doc.layers[index]];renderLayers();render();checkpoint();};
$('layerOpacity').oninput=event=>{active().opacity=Number(event.target.value)/100;$('layerOpacityValue').textContent=event.target.value+'%';render();};$('layerOpacity').onchange=checkpoint;
for(const id of ['loadPhotoBtn','replacePhotoBtn'])$(id).onclick=()=>$('photoInput').click();
$('photoInput').onchange=event=>loadPhoto(event.target.files[0]);
for(const [id,key] of [['photoExposure','exposure'],['photoContrast','contrast'],['photoSaturation','saturation'],['photoOpacity','opacity']]){
  $(id).oninput=event=>{if(!doc.photo)return;doc.photo[key]=Number(event.target.value)/(key==='opacity'?100:1);updatePhotoUI();render();};$(id).onchange=()=>{if(doc.photo)checkpoint();};
}
$('photoFit').onchange=event=>{if(!doc.photo)return;doc.photo.fit=event.target.value;render();checkpoint();};
$('rotatePhotoBtn').onclick=()=>{if(!doc.photo)return;doc.photo.rotation=(doc.photo.rotation+90)%360;render();checkpoint();};
$('resetPhotoBtn').onclick=()=>{if(!doc.photo)return;Object.assign(doc.photo,{exposure:0,contrast:100,saturation:100,opacity:1,rotation:0,fit:'contain'});updatePhotoUI();render();checkpoint();};
$('removePhotoBtn').onclick=()=>{doc.photo=null;updatePhotoUI();render();checkpoint();};
$('sampleBtn').onclick=sample;
$('exportBtn').onclick=()=>{if(busy||stroke)return;render();canvas.toBlob(blob=>{if(blob){download(blob,safeName()+'.png');message('PNG готовий. Його можна додати у власну галерею.');}},'image/png');};
$('saveProjectBtn').onclick=()=>{if(busy||stroke)return;download(new Blob([JSON.stringify(snapshot())],{type:'application/json'}),safeName()+'.ainarium.json');message('Проєкт із шарами завантажено');};
$('openProjectBtn').onclick=()=>$('projectInput').click();
$('projectInput').onchange=async event=>{
  const file=event.target.files[0];if(!file)return;
  if(file.size>45*1024*1024){message('Проєкт завеликий. Межа — 45 МБ.');event.target.value='';return;}
  try{const data=JSON.parse(await file.text());if(!validProject(data))throw new Error('Invalid project');await restore(data);checkpoint();hint('Твоя робота знову тут — разом із шарами та фотографією.');}
  catch{message('Не вдалося відкрити проєкт. Обери файл .ainarium.json із цієї майстерні.');}event.target.value='';
};
const newDialog=$('newCanvasDialog');$('newBtn').onclick=()=>{if(studioMode==='simple')$('newFormat').value='1200x800';newDialog.showModal();};newDialog.querySelector('.dialog-close').onclick=()=>newDialog.close();
$('createCanvasBtn').onclick=()=>{const [w,h]=$('newFormat').value.split('x').map(Number);createDocument(w,h,$('newTitle').value.trim().slice(0,80)||'Мій новий світ');checkpoint();newDialog.close();};
window.addEventListener('keydown',event=>{if(event.target.matches('input,textarea,select'))return;if((event.ctrlKey||event.metaKey)&&event.code==='KeyZ'){event.preventDefault();undo(event.shiftKey?1:-1);}else if((event.ctrlKey||event.metaKey)&&event.code==='KeyY'){event.preventDefault();undo(1);}});
new ResizeObserver(fitCanvas).observe($('canvasViewport'));
createDocument();setStudioMode('simple');refreshPalette();busy=true;document.body.classList.add('is-restoring');
try{
  const db=await database();const previous=await new Promise((resolve,reject)=>{const r=db.transaction('projects','readonly').objectStore('projects').get('last');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  if(previous&&validProject(previous)){await restore(previous);hint('Твоя попередня робота збереглася в цьому браузері. Можеш продовжити.');message('Попередню роботу відновлено');}
}catch{message('Малювати можна. Для надійної копії завантаж проєкт.');}
history=[snapshot()];historyIndex=0;busy=false;document.body.classList.remove('is-restoring');updateHistoryButtons();
if(galleryMode){
  $('sendToGalleryBtn').hidden=false;
  const back=document.querySelector('.studio-header .return-link');back.textContent='← До галереї';back.onclick=async event=>{event.preventDefault();clearTimeout(saveTimer);await autoSave(snapshot());parent.postMessage({type:'ainarium:studio:close'},location.origin);};
  document.querySelector('.studio-bottom-actions a').onclick=back.onclick;
  $('sendToGalleryBtn').onclick=async()=>{if(busy||stroke)return;$('sendToGalleryBtn').disabled=true;render();clearTimeout(saveTimer);await autoSave(snapshot());canvas.toBlob(blob=>{if(blob){message('Додаю малюнок на дошку…');parent.postMessage({type:'ainarium:studio:save',blob,title:doc.title},location.origin);}else $('sendToGalleryBtn').disabled=false;},'image/png');};
  window.addEventListener('message',async event=>{
    if(event.origin!==location.origin||event.source!==parent)return;
    if(event.data?.type==='ainarium:studio:error'){$('sendToGalleryBtn').disabled=false;message('Не вдалося додати на дошку. Збережи PNG або спробуй ще раз.');}
    if(event.data?.type==='ainarium:studio:photo'&&event.data.blob instanceof Blob){createDocument(1200,800,String(event.data.title||'Моя робота').slice(0,80));await loadPhoto(new File([event.data.blob],'gallery-photo',{type:event.data.blob.type}));}
  });
  parent.postMessage({type:'ainarium:studio:ready'},location.origin);
}
