(() => {
  'use strict';
  const dialog=document.createElement('dialog');dialog.className='gallery-studio-dialog';dialog.setAttribute('aria-label','Майстерня малювання у галереї');document.body.append(dialog);
  const button=document.createElement('button');button.type='button';button.className='gallery-button gallery-button-primary';button.id='galleryPaintBtn';button.textContent='✎ Малювати';document.querySelector('.gallery-header-actions').prepend(button);
  let photoId=null,opening=null;
  function open(id=null){photoId=id;opening=document.activeElement;const frame=document.createElement('iframe');frame.src='studio.html?gallery=1';frame.title='Малювання — створи роботу для своєї галереї';dialog.replaceChildren(frame);dialog.showModal();}
  function close(){dialog.close();dialog.replaceChildren();opening?.focus({preventScroll:true});}
  button.onclick=()=>open();window.addEventListener('ainarium:paint-photo',event=>open(event.detail.photoId));dialog.addEventListener('cancel',()=>dialog.replaceChildren());
  window.addEventListener('message',async event=>{
    const frame=dialog.querySelector('iframe');if(!frame||event.origin!==location.origin||event.source!==frame.contentWindow)return;
    if(event.data?.type==='ainarium:studio:close'){close();return;}
    if(event.data?.type==='ainarium:studio:ready'&&photoId){
      try{const api=window.AinariumBoard;await api.ready;const p=api.getActiveBoard().photos.find(p=>p.id===photoId);frame.contentWindow.postMessage({type:'ainarium:studio:photo',blob:await api.getPhotoBlob(photoId),title:p?.title||'Моя робота'},location.origin);}catch{window.AinariumBoard.notify('Не вдалося відкрити цю фотографію для малювання.');}return;
    }
    if(event.data?.type==='ainarium:studio:save'){
      const blob=event.data.blob;if(!(blob instanceof Blob)||blob.type!=='image/png'||blob.size>20*1024*1024)return;
      const name=String(event.data.title||'Мій малюнок').replace(/[<>:"/\\|?*\x00-\x1F]/g,'-').slice(0,100)+'.png';
      try{const count=await window.AinariumBoard.addFiles([new File([blob],name,{type:'image/png'})]);if(count===1){close();window.AinariumBoard.notify('Твій малюнок додано на поточну дошку. Оригінали збережені.');}else frame.contentWindow.postMessage({type:'ainarium:studio:error'},location.origin);}
      catch{frame.contentWindow.postMessage({type:'ainarium:studio:error'},location.origin);}
    }
  });
})();
