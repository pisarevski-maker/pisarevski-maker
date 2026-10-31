(() => {
  'use strict';
  const scene=document.querySelector('.cover-scene .inner');if(!scene)return;
  const invitation=document.createElement('div');invitation.className='story-game-invitation';
  invitation.innerHTML='<p>Давай створимо гру!<span>Дивись, яку я вже створила без тебе.</span></p><button type="button" class="flying-game" aria-label="Перехопити гру — аерохокей проти Айнаї"><span class="flying-game-icon" aria-hidden="true">⊙</span><strong>Лови гру!</strong><small>Ти проти Айнаї ↗</small></button>';
  scene.append(invitation);const trigger=invitation.querySelector('button');
  const dialog=document.createElement('dialog');dialog.className='story-game-dialog';dialog.setAttribute('aria-label','Нейрошайба — аерохокей із Айнаєю');document.body.append(dialog);
  function close(){dialog.close();dialog.replaceChildren();trigger.focus({preventScroll:true});}
  trigger.onclick=()=>{const frame=document.createElement('iframe');frame.title='Аерохокей — ти проти Айнаї';frame.src='airhockey.html?embedded=1';dialog.replaceChildren(frame);dialog.showModal();};
  dialog.addEventListener('cancel',()=>dialog.replaceChildren());
  addEventListener('message',event=>{const frame=dialog.querySelector('iframe');if(event.origin===location.origin&&frame&&event.source===frame.contentWindow&&event.data?.type==='ainarium:hockey:close')close();});
})();
