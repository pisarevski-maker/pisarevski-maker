(() => {
  'use strict';
  const media = window.matchMedia('(max-width: 800px), (max-aspect-ratio: 1/1), (pointer: coarse) and (max-width: 1024px)');
  const computerTitle = 'Prompts — на комп’ютері';
  const computerText = 'Тут можна спокійно переглянути приклади. Щоб працювати з prompts у Codex або Claude та створювати власний сайт, відкрий AINARIUM на комп’ютері.';
  const steps = [
    null,
    {label:'Твій маршрут',title:'Маленька подорож великими ідеями',lead:'Гортай приклади, придивляйся до деталей і знаходь те, що хочеться створити самому.',cards:[['Дивись','Кожен екран показує, як може виглядати твоя ідея.','orbit'],['Знаходь своє','Космос, мистецтво, навчання чи ігри — почни з того, що цікаве саме тобі.','palette'],['Повертайся','Будь-яку сторінку можна переглянути знову через кроки зверху.','card']]},
    {label:'Ідея оживає',title:'Від задуму до власного світу',lead:'Сайт починається з простої думки. Потім з’являються сторінки, історії та деталі.',cards:[['Ідея','Про що буде твій світ? Це може бути галерея, маленька гра або сторінка про захоплення.','card'],['План','Розділи допомагають упорядкувати історію: знайомство, головні роботи, цікаві факти.','orbit'],['Живий результат','Кольори, рух і зрозумілі кнопки перетворюють задум на сайт.','palette']],computer:true},
    {label:'Стилі та теми',title:'У кожної ідеї — свій характер',lead:'Поглянь, як настрій змінює вигляд того самого простору.',cards:[['Космічний','Глибоке небо, світлові акценти й відчуття відкриття.','orbit'],['Галерея','Спокійна композиція, великі зображення та місце для кожної роботи.','palette'],['Навчальний','Чіткі кроки, приклади й пояснення, до яких легко повернутися.','card']]},
    {label:'Твій напрям',title:'Знайди те, що хочеться показати',lead:'Тут немає правильної теми для всіх. Найцікавіший проєкт починається з твого захоплення.',cards:[['Мої роботи','Фотографії, малюнки та цифрові композиції можуть стати власною колекцією.','palette'],['Мої відкриття','Навчальний сайт допомагає пояснити складне простими прикладами.','orbit'],['Моя історія','Збери улюблені теми в одному красивому місці.','card']]},
    {label:'Деталі сайту',title:'Деталі, з яких складається настрій',lead:'Придивись до світла, кольору й руху. Навіть одна деталь може змінити весь простір.',cards:[['Неонова картка','М’яке світіння виділяє головне й запрошує роздивитися ближче.','card'],['Світлова сфера','Легкий рух додає відчуття живого простору.','orbit'],['Космічне небо','Глибокий синій фон поєднує сторінки в одну історію.','palette']],computer:true},
    {label:'AI-помічники',title:'Твоя ідея. Помічник поруч.',lead:'Ти описуєш задум, а AI допомагає перетворити його на видимий результат.',cards:[['Codex','Допомагає створювати та доповнювати сайт за зрозумілим завданням.','card'],['Claude Code','Допомагає створювати та доповнювати сайт за зрозумілим завданням.','orbit']],computer:true},
    {label:'Створення на комп’ютері',title:'Побачив ідею? Збережи її в пам’яті.',lead:'На телефоні — галерея й натхнення. На комп’ютері можна перейти від перегляду до створення.',cards:[['Опиши своїми словами','Наприклад: «Хочу таку галерею, але зі своїми малюнками та світлим фоном».','palette']],computer:true,showroom:true},
    {label:'Перший результат',title:'Світ, який хочеться показати',lead:'Власний сайт може початися з кількох робіт, короткої історії та однієї красивої деталі.',cards:[['Своя колекція','Розклади роботи так, щоб кожна мала свій простір.','palette'],['Свій настрій','Колір і світло підкреслять те, що важливе саме тобі.','orbit']],computer:true},
    {label:'Наступна ідея',title:'Одна нова деталь — новий настрій',lead:'Дивись, як невеликі доповнення розвивають цілу історію.',cards:[['Головний екран','Великий заголовок і коротке знайомство задають настрій.','palette'],['Картка','Одна робота, факт або персонаж можуть стати центром сторінки.','card'],['Живий об’єкт','Світіння або легкий рух додають характеру.','orbit']],computer:true,showroom:true},
    {label:'Галерея ідей',title:'Що можна створити',lead:'Три напрями. Власний зміст. Простір для твоєї ідеї.',projects:true},
    {label:'Від авторів',custom:true,lead:'Людина задумує, AI допомагає втілити.'}
  ];
  function node(tag, className, text) {
    const element=document.createElement(tag);if(className)element.className=className;if(text)element.textContent=text;return element;
  }
  function notice() {
    const box=node('aside','mobile-computer-note');box.setAttribute('role','note');box.append(node('span','mobile-computer-icon','💻'),node('h3','',computerTitle),node('p','',computerText));return box;
  }
  function card(title, text, kind) {
    const box=node('article','mobile-idea-card');const preview=node('div','mobile-idea-preview mobile-preview-'+kind);preview.setAttribute('aria-hidden','true');preview.append(node('i',''),node('i',''),node('i',''));box.append(preview,node('h3','',title),node('p','',text));return box;
  }
  function link(text, href) {const element=node('a','mobile-gallery-link',text+' ↗');element.href=href;return element;}
  function dismissMobileWorkflows() {
    document.querySelectorAll('#photoEditor[open],#boardTransferDialog[open]').forEach(dialog=>dialog.close());
    document.querySelectorAll('.modal-ov.show,.game-modal-ov.show').forEach(modal=>{modal.classList.remove('show');modal.setAttribute('aria-hidden','true');});
  }
  function initCourse() {
    const slides=[...document.querySelectorAll('.slide.optimized-slide')];
    const dotLabels=[...document.querySelectorAll('#dots .dot')].map(dot=>dot.textContent);
    slides.forEach((slide,index)=>{
      const data=steps[index];if(!data||data.custom)return;
      const panel=node('div','mobile-gallery-scene');panel.append(node('p','mobile-gallery-eyebrow','AINARIUM · ГАЛЕРЕЯ ІДЕЙ'),node('h2','',data.title),node('p','mobile-gallery-lead',data.lead));
      if(data.cards){const grid=node('div','mobile-idea-grid');data.cards.forEach(values=>grid.append(card(...values)));panel.append(grid);}
      if(data.computer)panel.append(notice());
      if(data.showroom){const button=node('button','mobile-gallery-link','Переглянути галерею ідей →');button.type='button';button.addEventListener('click',()=>window.go(10));panel.append(button);}
      if(data.projects){const grid=node('div','mobile-idea-grid');const projects=[['Власна галерея','Малюнки, фотографії та цифрові композиції, зібрані в одну колекцію.','palette','gallery.html','Переглянути галерею'],['Навчальні матеріали','Приклад того, як пояснювати цікаві теми через власний навчальний сайт.','orbit','https://e-tech-ainarium.pages.dev/','Відкрити E-Tech'],['Git Kindergarden','Навчальний борд із програмування: кроки, практика й маленькі відкриття.','card','examples/git-kindergarden/index.html','Відкрити приклад']];projects.forEach(values=>{const box=card(values[0],values[1],values[2]);const a=link(values[4],values[3]);if(values[3].startsWith('https:')){a.target='_blank';a.rel='noopener';}box.append(a);grid.append(box);});panel.append(grid);}
      slide.append(panel);
    });
    let lastCourseStep = null;
    const originalShell=window.updateCourseShell;
    const originalPromptModal=window.openPromptModal;
    window.openPromptModal=function(...args){if(media.matches){showMobileNotice();return;}return originalPromptModal.apply(this,args);};
    window.updateCourseShell=function(){
      originalShell();
      const index=slides.findIndex(slide=>slide.classList.contains('active'));
      const stepChanged=index!==lastCourseStep;
      lastCourseStep=index;
      if(media.matches&&stepChanged)window.scrollTo(0,0);
      [...document.querySelectorAll('#dots .dot')].forEach((dot,i)=>{if(media.matches){const number=node('span','',String(i+1).padStart(2,'0'));dot.replaceChildren(number,document.createTextNode(steps[i]?.label||'Початок історії'));}else if(dot.textContent!==dotLabels[i]){const number=node('span','',String(i+1).padStart(2,'0'));dot.replaceChildren(number,document.createTextNode(dotLabels[i].replace(/^\d+\s*/,'')));}});
      if(media.matches){const guide=document.getElementById('courseGuideText');if(index>0)guide.textContent=steps[index]?.lead||'Гортай галерею і знаходь власні ідеї.';const next=document.getElementById('nextBtn');if(index===6){next.disabled=false;next.classList.remove('next-locked');next.textContent='Далі →';}if(index===9)next.textContent='Галерея ідей →';}
    };
    document.getElementById('nextBtn').addEventListener('click',event=>{if(!media.matches)return;const index=slides.findIndex(slide=>slide.classList.contains('active'));if(index===6){event.preventDefault();event.stopImmediatePropagation();window.go(7);}},true);
    document.addEventListener('click',event=>{if(!media.matches||!event.target.closest('.copy-btn,.send-prompt,[data-copy-prompt],[onclick*="copyText"],[onclick*="copyIntroExample"]'))return;event.preventDefault();event.stopImmediatePropagation();showMobileNotice();},true);
    return ()=>window.updateCourseShell();
  }
  function showMobileNotice() {
    let box=document.getElementById('mobileComputerStatus');if(!box){box=node('div','mobile-computer-toast',computerTitle+' · Відкрий AINARIUM на комп’ютері, щоб продовжити створення.');box.id='mobileComputerStatus';box.setAttribute('role','status');document.body.append(box);}box.hidden=false;clearTimeout(showMobileNotice.timer);showMobileNotice.timer=setTimeout(()=>{box.hidden=true;},4500);
  }
  function initGallery() {
    const panel=node('main','mobile-board-showcase');panel.append(node('p','mobile-gallery-eyebrow','AINARIUM · ПРОСТІР НАТХНЕННЯ'),node('h2','','Галерея власних світів'),node('p','mobile-gallery-lead','Фотографії, малюнки й цифрові історії можуть стати красивою колекцією. Роздивись приклади оформлення.'));
    const grid=node('div','mobile-idea-grid');[['assets/course-sky.png','Космічна колекція','Глибокий фон поєднує роботи в одну історію.'],['assets/ainaya-present.webp','Історія персонажа','Місце для улюбленого героя та його пригод.'],['assets/intro-poster.jpg','Світ відкриттів','Поєднуй ілюстрації та цікаві факти.']].forEach(([src,title,text])=>{const figure=node('figure','mobile-art-card');const img=node('img','');img.src=src;img.alt=title;img.loading='lazy';const caption=node('figcaption','');caption.append(node('h3','',title),node('p','',text));figure.append(img,caption);grid.append(figure);});panel.append(grid,notice());
    const saved=node('section','mobile-saved-gallery');saved.hidden=true;panel.append(saved);document.querySelector('.gallery-header').after(panel);
    let urls=[],renderEpoch=0;
    async function renderSaved(){const epoch=++renderEpoch;const api=window.AinariumBoard;if(!api)return;await api.ready;if(epoch!==renderEpoch||!media.matches)return;urls.forEach(URL.revokeObjectURL);urls=[];saved.replaceChildren();const boards=api.getState().boards.filter(board=>board.photos.length);saved.hidden=!boards.length;if(!boards.length)return;saved.append(node('h2','','Роботи з цього браузера'));for(const board of boards){saved.append(node('h3','mobile-saved-title',board.title));const cards=node('div','mobile-idea-grid');for(const photo of board.photos){try{const blob=await api.getPhotoBlob(photo.id);if(epoch!==renderEpoch||!media.matches)return;const url=URL.createObjectURL(blob);urls.push(url);const figure=node('figure','mobile-art-card');const image=node('img','');image.src=url;image.alt=photo.alt||photo.title;image.style.objectFit=photo.fit==='contain'?'contain':'cover';const caption=node('figcaption','');caption.append(node('h3','',photo.title||'Моя робота'));if(photo.caption)caption.append(node('p','',photo.caption));figure.append(image,caption);cards.append(figure);}catch(_){}}saved.append(cards);}}
    document.addEventListener('click',event=>{if(!media.matches||!event.target.closest('#openTransferBtn,.gallery-workspace,.gallery-dialog,.board-transfer-dialog'))return;event.preventDefault();event.stopImmediatePropagation();showMobileNotice();},true);
    ['paste','drop','dragover'].forEach(type=>document.addEventListener(type,event=>{if(!media.matches)return;const files=event.clipboardData?.files||event.dataTransfer?.files;if(type==='dragover'||files?.length){event.preventDefault();event.stopImmediatePropagation();}},true));
    return ()=>{if(media.matches)renderSaved();else renderEpoch++;};
  }
  const refresh=document.body.classList.contains('unified-course')?initCourse():document.body.classList.contains('gallery-app')?initGallery():()=>{};
  function sync(event){document.body.classList.toggle('mobile-browse',media.matches);if(media.matches)dismissMobileWorkflows();if(event&&document.body.classList.contains('unified-course')){const index=[...document.querySelectorAll('.slide.optimized-slide')].findIndex(slide=>slide.classList.contains('active'));window.go(Math.max(0,index));}else refresh();}
  media.addEventListener('change',sync);sync();
})();
