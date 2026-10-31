(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const state={version:1,boards:[],activeBoardId:''};
  const objectUrls=new Map();
  const memoryPhotos=new Map();
  const saveTimers=new Map();
  const imageTypes=new Set(['image/jpeg','image/png','image/webp','image/gif','image/avif']);
  const presets={
    cosmos:{background:'#071c37',accent:'#6be8ff',surface:'#123353'},
    midnight:{background:'#111827',accent:'#a8c4ff',surface:'#1e293b'},
    paper:{background:'#eee9df',accent:'#246a82',surface:'#ffffff'}
  };
  let database=null,writeTail=Promise.resolve(),renderEpoch=0,adding=false;
  const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
  const cleanText=(value,max)=>String(value||'').slice(0,max);
  const hex=(value,fallback)=>/^#[\da-f]{6}$/i.test(value||'')?value:fallback;
  const active=()=>state.boards.find(board=>board.id===state.activeBoardId)||state.boards[0];
  function notify(message){$('boardStatus').textContent=message;}
  function applyPattern(board){
    if(board.preset==='cosmos')board.pattern='stars';
    else if(board.preset==='midnight'||board.preset==='paper')board.pattern='none';
    board.backgroundImage=board.pattern==='stars'?'radial-gradient(ellipse at 15% 20%,#1764a855,transparent 55%),radial-gradient(ellipse at 85% 80%,#385eb94d,transparent 55%),radial-gradient(circle,#b9efff 0 1px,transparent 1.5px)':'none';
    board.backgroundSize=board.pattern==='stars'?'auto,auto,110px 95px':'auto';
    return board;
  }
  function newBoard(number){return applyPattern({id:uid(),title:number===1?'Моя творча колекція':'Моя дошка '+number,caption:'',preset:'cosmos',...presets.cosmos,layout:'grid',gap:24,cardSize:280,photos:[],trash:[]});}
  function normalizeBoard(board,index){
    return applyPattern({id:cleanText(board.id,100)||uid(),title:cleanText(board.title,100)||'Моя дошка '+(index+1),caption:cleanText(board.caption,600),preset:['cosmos','midnight','paper','custom'].includes(board.preset)?board.preset:'cosmos',pattern:board.pattern==='stars'?'stars':'none',freeInitialized:!!board.freeInitialized,background:hex(board.background,presets.cosmos.background),accent:hex(board.accent,presets.cosmos.accent),surface:hex(board.surface,presets.cosmos.surface),layout:board.layout==='free'?'free':'grid',gap:clamp(board.gap,16,48),cardSize:clamp(board.cardSize,180,400),photos:Array.isArray(board.photos)?board.photos:[],trash:Array.isArray(board.trash)?board.trash:[]});
  }
  function publicBoard(board){
    const {trash,...result}=board;
    return structuredClone(result);
  }
  function openDatabase(){
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open('ainarium-gallery-v1',1);
      request.onupgradeneeded=()=>{const db=request.result;db.createObjectStore('boards',{keyPath:'id'});db.createObjectStore('photos',{keyPath:'id'});db.createObjectStore('settings',{keyPath:'key'});};
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
      request.onblocked=()=>reject(new Error('Storage is busy'));
    });
  }
  function readStore(store,key){return new Promise((resolve,reject)=>{const request=database.transaction(store,'readonly').objectStore(store)[key===undefined?'getAll':'get'](key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
  function writeOperations(operations){
    if(!database)return Promise.resolve();
    const snapshot=structuredClone(operations);
    const task=writeTail.catch(()=>{}).then(()=>new Promise((resolve,reject)=>{
      const transaction=database.transaction([...new Set(snapshot.map(item=>item.store))],'readwrite');
      snapshot.forEach(item=>transaction.objectStore(item.store).put(item.value));
      transaction.oncomplete=resolve;
      transaction.onerror=()=>reject(transaction.error);
      transaction.onabort=()=>reject(transaction.error||new Error('Write aborted'));
    }));
    writeTail=task;
    return task;
  }
  function saveBoard(board){return writeOperations([{store:'boards',value:board}]);}
  function scheduleSave(board){
    clearTimeout(saveTimers.get(board.id));
    saveTimers.set(board.id,setTimeout(()=>{saveTimers.delete(board.id);saveBoard(board).catch(()=>notify('Не вдалося зберегти зміни у браузері. Збережи набір для власного сайту, щоб не втратити їх.'));},250));
    window.dispatchEvent(new CustomEvent('ainarium:board-change'));
  }
  async function getPhotoBlob(id){
    if(memoryPhotos.has(id))return memoryPhotos.get(id);
    if(!database)throw new Error('Image unavailable');
    const record=await readStore('photos',id);
    if(!record||!record.blob)throw new Error('Image unavailable');
    memoryPhotos.set(id,record.blob);
    return record.blob;
  }
  async function imageUrl(id){if(objectUrls.has(id))return objectUrls.get(id);const blob=await getPhotoBlob(id);const url=URL.createObjectURL(blob);objectUrls.set(id,url);return url;}
  function isLight(color){const values=[1,3,5].map(start=>Number.parseInt(color.slice(start,start+2),16));return values[0]*.299+values[1]*.587+values[2]*.114>155;}
  function paintBoard(){
    const board=active(),zone=$('dropZone');
    zone.style.setProperty('--board-bg',board.background);zone.style.setProperty('--board-accent',board.accent);zone.style.setProperty('--board-surface',board.surface);
    zone.style.setProperty('--board-gap',board.gap+'px');zone.style.setProperty('--card-size',board.cardSize+'px');
    zone.style.setProperty('--board-ink',isLight(board.surface)?'#142d43':'#f0f7ff');
    zone.style.setProperty('--board-empty-ink',isLight(board.background)?'#16324c':'#eff8ff');zone.style.setProperty('--board-empty-muted',isLight(board.background)?'#3f566a':'#bdd4e8');
    zone.style.backgroundColor=board.background;zone.style.backgroundImage=board.backgroundImage;zone.style.backgroundSize=board.backgroundSize;
    $('layoutGrid').setAttribute('aria-pressed',String(board.layout==='grid'));$('layoutGrid').classList.toggle('active',board.layout==='grid');
    $('layoutFree').setAttribute('aria-pressed',String(board.layout==='free'));$('layoutFree').classList.toggle('active',board.layout==='free');
    document.querySelectorAll('[data-board-preset]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.boardPreset===board.preset)));
    ['background','accent','surface'].forEach(field=>$('board'+field[0].toUpperCase()+field.slice(1)).value=board[field]);
    $('boardGap').value=board.gap;$('boardGapValue').textContent=board.gap+' px';$('cardSize').value=board.cardSize;$('cardSizeValue').textContent=board.cardSize+' px';
  }
  function renderBoards(){
    $('boardList').replaceChildren();
    state.boards.forEach(board=>{const button=document.createElement('button');button.type='button';button.textContent=board.title||'Без назви';button.className=board.id===state.activeBoardId?'active':'';if(board.id===state.activeBoardId)button.setAttribute('aria-current','page');button.addEventListener('click',()=>{state.activeBoardId=board.id;writeOperations([{store:'settings',value:{key:'activeBoardId',value:board.id}}]).catch(()=>{});render();});$('boardList').appendChild(button);});
  }
  function positionCards(){
    const board=active(),canvas=$('boardCanvas');
    if(board.layout!=='free'){canvas.style.minHeight='';return;}
    let bottom=500;
    board.photos.forEach(photo=>{const card=[...canvas.children].find(element=>element.dataset.photoId===photo.id);if(!card)return;const width=Math.min(clamp(photo.width||board.cardSize,180,500),Math.max(180,canvas.clientWidth));const x=clamp(photo.x,0,Math.max(0,canvas.clientWidth-width));card.style.setProperty('--x',x+'px');card.style.setProperty('--y',Math.max(0,photo.y||0)+'px');card.style.setProperty('--card-width',width+'px');card.style.setProperty('--rotation',clamp(photo.rotation,-15,15)+'deg');bottom=Math.max(bottom,(photo.y||0)+card.offsetHeight+70);});
    canvas.style.minHeight=bottom+'px';
  }
  function actionButton(label,className,handler){const button=document.createElement('button');button.type='button';button.className=className;button.textContent=label;button.addEventListener('click',event=>{event.stopPropagation();handler();});return button;}
  function render(){
    const board=active();if(!board)return;
    const epoch=++renderEpoch;renderBoards();paintBoard();
    $('boardTitle').value=board.title;$('boardCaption').value=board.caption;$('itemCount').textContent='Робіт: '+board.photos.length;$('restorePhotoBtn').hidden=!board.trash.length;
    const canvas=$('boardCanvas');canvas.classList.toggle('layout-grid',board.layout==='grid');canvas.classList.toggle('layout-free',board.layout==='free');canvas.replaceChildren();$('emptyState').hidden=board.photos.length>0;
    board.photos.forEach((photo,index)=>{
      const card=document.createElement('figure');card.className='photo-card';card.dataset.photoId=photo.id;card.tabIndex=0;card.setAttribute('aria-label',photo.title||'Зображення');
      const img=document.createElement('img');img.alt=photo.alt||photo.title||'';img.draggable=false;img.style.objectFit=photo.fit==='contain'?'contain':'cover';
      imageUrl(photo.id).then(url=>{if(epoch===renderEpoch&&img.isConnected)img.src=url;}).catch(()=>{if(img.isConnected){img.alt='Не вдалося відкрити збережене зображення';notify('Один із файлів недоступний. Його можна додати знову.');}});
      const caption=document.createElement('figcaption');const title=document.createElement('h3');title.className='photo-title';title.textContent=photo.title||'Без назви';caption.appendChild(title);
      if(photo.caption){const text=document.createElement('p');text.className='photo-caption';text.textContent=photo.caption;caption.appendChild(text);}
      const actions=document.createElement('div');actions.className='photo-actions';
      actions.append(actionButton('Малювати','photo-paint',()=>window.dispatchEvent(new CustomEvent('ainarium:paint-photo',{detail:{photoId:photo.id}}))),actionButton('Редагувати','photo-edit',()=>editPhoto(photo.id)),actionButton('Prompt для AI','photo-prompt',()=>window.dispatchEvent(new CustomEvent('ainarium:photo-prompt',{detail:{photoId:photo.id}}))));
      const earlier=actionButton('←','photo-move-up',()=>movePhoto(photo.id,-1));earlier.setAttribute('aria-label','Перемістити «'+photo.title+'» раніше');earlier.disabled=index===0;
      const later=actionButton('→','photo-move-down',()=>movePhoto(photo.id,1));later.setAttribute('aria-label','Перемістити «'+photo.title+'» пізніше');later.disabled=index===board.photos.length-1;
      actions.append(earlier,later);caption.appendChild(actions);card.append(img,caption);card.addEventListener('dblclick',()=>editPhoto(photo.id));card.addEventListener('keydown',event=>{if(event.target===card&&event.key==='Enter'){event.preventDefault();editPhoto(photo.id);}});installDrag(card,photo);canvas.appendChild(card);
    });
    requestAnimationFrame(positionCards);window.dispatchEvent(new CustomEvent('ainarium:board-change'));
  }
  function movePhoto(id,direction){const board=active(),index=board.photos.findIndex(photo=>photo.id===id),next=index+direction;if(next<0||next>=board.photos.length)return;[board.photos[index],board.photos[next]]=[board.photos[next],board.photos[index]];scheduleSave(board);render();}
  function installDrag(card,photo){
    let drag=null;
    card.addEventListener('pointerdown',event=>{
      if(active().layout!=='free'||event.target.closest('button')||event.button!==0)return;
      drag={x:event.clientX,y:event.clientY,left:Number.parseFloat(card.style.getPropertyValue('--x'))||0,top:Number.parseFloat(card.style.getPropertyValue('--y'))||0,moved:false};
      card.setPointerCapture(event.pointerId);card.classList.add('dragging');
    });
    card.addEventListener('pointermove',event=>{
      if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;
      photo.x=clamp(drag.left+dx,0,Math.max(0,$('boardCanvas').clientWidth-card.offsetWidth));photo.y=Math.max(0,drag.top+dy);positionCards();
    });
    const end=()=>{if(!drag)return;const moved=drag.moved;drag=null;card.classList.remove('dragging');if(moved){scheduleSave(active());notify('Розташування збережено.');}};
    card.addEventListener('pointerup',end);card.addEventListener('pointercancel',end);
  }
  function inspectImage(blob){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(blob),image=new Image();image.onload=()=>{URL.revokeObjectURL(url);resolve({width:image.naturalWidth,height:image.naturalHeight});};image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Unsupported image'));};image.src=url;});}
  async function addFiles(fileList){
    await ready;if(adding)return 0;const files=[...fileList];if(!files.length)return 0;adding=true;$('addPhotosBtn').disabled=true;
    const board=active(),before=structuredClone(board.photos),newRecords=[],rejected=[];
    try{
      for(const file of files){
        if(!imageTypes.has(file.type)||file.size>20*1024*1024){rejected.push(file.name||'Файл');continue;}
        try{await inspectImage(file);}catch(_){rejected.push(file.name||'Файл');continue;}
        const id=uid(),name=String(file.name||'Зображення').split(/[\\/]/).pop();
        const nextY=board.layout==='free'?Math.max(0,...board.photos.map(item=>{const card=[...$('boardCanvas').children].find(element=>element.dataset.photoId===item.id);return (item.y||0)+(card?.offsetHeight||500)+board.gap;})):0;
        const photo={id,title:name.replace(/\.[^.]+$/,'').slice(0,160)||'Моя робота',caption:'',alt:'',fit:'cover',x:0,y:nextY,rotation:0,width:board.cardSize,mime:file.type,sourceName:name};
        board.photos.push(photo);newRecords.push({id,blob:file,mime:file.type,sourceName:name});
      }
      if(newRecords.length){await writeOperations([{store:'boards',value:board},...newRecords.map(value=>({store:'photos',value}))]);newRecords.forEach(record=>memoryPhotos.set(record.id,record.blob));render();}
      const added=newRecords.length;
      notify((added?'Зображень додано: '+added+'. ':'')+(rejected.length?'Не додано: '+rejected.join(', ')+'. Підтримуються JPG, PNG, WebP, GIF та AVIF до 20 МБ.':added?(database?'Фото збережені у цьому браузері.':'Цього разу фото доступні лише до закриття сторінки. Збережи набір.'): 'Обери зображення для дошки.'));
      return added;
    }catch(_){board.photos=before;render();notify('Браузер не зміг зберегти фото. Можливо, бракує місця. Спробуй менші файли.');return 0;}
    finally{adding=false;$('addPhotosBtn').disabled=false;$('photoInput').value='';}
  }
  function editPhoto(id){
    const photo=active().photos.find(item=>item.id===id);if(!photo)return;
    $('editPhotoId').value=id;$('editTitle').value=photo.title;$('editCaption').value=photo.caption;$('editAlt').value=photo.alt;$('editFit').value=photo.fit;$('editRotation').value=photo.rotation||0;$('editWidth').value=photo.width||active().cardSize;$('editWidthValue').textContent=$('editWidth').value+' px';$('photoEditor').showModal();
  }
  $('photoEditForm').addEventListener('submit',event=>{
    event.preventDefault();const board=active(),photo=board.photos.find(item=>item.id===$('editPhotoId').value);if(!photo)return;
    Object.assign(photo,{title:cleanText($('editTitle').value.trim(),160)||'Без назви',caption:cleanText($('editCaption').value.trim(),2000),alt:cleanText($('editAlt').value.trim(),500),fit:$('editFit').value==='contain'?'contain':'cover',rotation:clamp($('editRotation').value,-15,15),width:clamp($('editWidth').value,180,500)});
    scheduleSave(board);$('photoEditor').close();render();notify('Деталі роботи оновлено.');
  });
  $('deletePhotoBtn').addEventListener('click',()=>{const board=active(),index=board.photos.findIndex(photo=>photo.id===$('editPhotoId').value);if(index<0)return;const photo=board.photos.splice(index,1)[0];board.trash.push({photo,index});scheduleSave(board);$('photoEditor').close();render();notify('Фото прибрано з дошки. Його можна повернути кнопкою нижче.');});
  $('restorePhotoBtn').addEventListener('click',()=>{const board=active(),item=board.trash.pop();if(!item)return;board.photos.splice(Math.min(item.index,board.photos.length),0,item.photo);scheduleSave(board);render();notify('Фото повернуто на дошку.');});
  $('closePhotoEditor').addEventListener('click',()=>$('photoEditor').close());
  $('editWidth').addEventListener('input',()=>$('editWidthValue').textContent=$('editWidth').value+' px');
  $('addPhotosBtn').addEventListener('click',()=>$('photoInput').click());
  $('photoInput').addEventListener('change',event=>addFiles(event.target.files));
  $('photoPromptBtn').addEventListener('click',()=>window.dispatchEvent(new CustomEvent('ainarium:photo-prompt',{detail:{kind:'add'}})));
  $('newBoardBtn').addEventListener('click',async()=>{await ready;const board=newBoard(state.boards.length+1);await saveBoard(board).catch(()=>notify('Дошка поки зберігається лише в пам’яті сторінки.'));state.boards.push(board);state.activeBoardId=board.id;writeOperations([{store:'settings',value:{key:'activeBoardId',value:board.id}}]).catch(()=>{});render();$('boardTitle').focus();$('boardTitle').select();});
  ['boardTitle','boardCaption'].forEach(id=>$(id).addEventListener('input',()=>{const board=active();board[id==='boardTitle'?'title':'caption']=$(id).value;renderBoards();scheduleSave(board);}));
  ['boardBackground','boardAccent','boardSurface'].forEach((id,index)=>$(id).addEventListener('input',()=>{const board=active();board[['background','accent','surface'][index]]=$(id).value;board.preset='custom';applyPattern(board);paintBoard();scheduleSave(board);}));
  ['boardGap','cardSize'].forEach(id=>$(id).addEventListener('input',()=>{const board=active();board[id==='boardGap'?'gap':'cardSize']=Number($(id).value);if(id==='cardSize')board.photos.forEach(photo=>photo.width=board.cardSize);paintBoard();positionCards();scheduleSave(board);}));
  ['layoutGrid','layoutFree'].forEach(id=>$(id).addEventListener('click',()=>{const board=active();if(id==='layoutFree'&&board.layout==='grid'&&!board.freeInitialized){const canvas=$('boardCanvas'),origin=canvas.getBoundingClientRect();board.photos.forEach(photo=>{const card=[...canvas.children].find(element=>element.dataset.photoId===photo.id);if(card){const rect=card.getBoundingClientRect();photo.x=rect.left-origin.left;photo.y=rect.top-origin.top;}});board.freeInitialized=true;}board.layout=id==='layoutGrid'?'grid':'free';scheduleSave(board);render();}));
  document.querySelectorAll('[data-board-preset]').forEach(button=>button.addEventListener('click',()=>{const board=active();Object.assign(board,presets[button.dataset.boardPreset],{preset:button.dataset.boardPreset});applyPattern(board);paintBoard();scheduleSave(board);}));
  const zone=$('dropZone');
  ['dragenter','dragover'].forEach(type=>zone.addEventListener(type,event=>{if([...event.dataTransfer.types].includes('Files')){event.preventDefault();zone.classList.add('dragover');}}));
  zone.addEventListener('dragleave',event=>{if(!zone.contains(event.relatedTarget))zone.classList.remove('dragover');});
  zone.addEventListener('drop',event=>{event.preventDefault();zone.classList.remove('dragover');addFiles(event.dataTransfer.files);});
  document.addEventListener('paste',event=>{if(event.target.closest('input,textarea,[contenteditable=true]'))return;const files=[...(event.clipboardData?.files||[])].filter(file=>file.type.startsWith('image/'));if(files.length){event.preventDefault();addFiles(files);}});
  window.addEventListener('resize',positionCards);
  let resolveReady;
  const ready=new Promise(resolve=>{resolveReady=resolve;});
  window.AinariumBoard={ready,getState:()=>({version:1,activeBoardId:state.activeBoardId,boards:state.boards.map(publicBoard)}),getActiveBoard:()=>publicBoard(active()),getPhotoBlob,addFiles,notify};
  (async()=>{
    try{database=await openDatabase();const boards=await readStore('boards');state.boards=boards.map(normalizeBoard);const setting=await readStore('settings','activeBoardId');state.activeBoardId=setting?.value||'';}
    catch(_){database=null;notify('Сховище браузера недоступне. Працювати можна, але перед закриттям збережи набір.');}
    if(!state.boards.length){const board=newBoard(1);state.boards.push(board);await saveBoard(board).catch(()=>{});}
    if(!state.boards.some(board=>board.id===state.activeBoardId))state.activeBoardId=state.boards[0].id;
    render();resolveReady();
  })();
})();
