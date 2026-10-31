(() => {
  'use strict';
  const steps=[
    {label:'Початок історії',pose:'welcome',text:'Грати цікаво. А ще можна створити свій світ, свою гру або власну галерею. Спробуймо.'},
    {label:'Твій маршрут',pose:'point',text:'Я допоможу не загубитися: спочатку ідея, потім твій вибір, далі перший результат.'},
    {label:'Ідея оживає',pose:'think',text:'Сформулюй думку — і подивись, як із неї виростають план, структура й живі елементи.'},
    {label:'Стиль і теми',pose:'present',text:'Обирай те, що подобається саме тобі. Ці побажання стануть частиною твого завдання для AI.'},
    {label:'Мій профіль',pose:'welcome',text:'Це твоя відправна точка. Ти можеш повернутися й змінити вибір — сайт розвиватиметься разом із тобою.'},
    {label:'Бібліотека',pose:'point',text:'Бери із собою корисні елементи. Папка допоможе зібрати їх для свого сайту, але рухатися далі можна й без неї.'},
    {label:'AI-помічник',pose:'think',text:'Обери помічника для наступного кроку. Ти задаєш напрям, а він допомагає втілити задум.'},
    {label:'Перший prompt',pose:'present',text:'У завданні вже є твої теми й стиль. Скопіюй його, передай помічнику та почни з однієї дії.'},
    {label:'Перша перемога',pose:'welcome',text:'Перший крок зроблено. Тепер спробуй змінити одну деталь — і ти побачиш, як керуєш результатом.'},
    {label:'Наступний крок',pose:'point',text:'Спробуй додати одну деталь до свого сайту. А в шоурумі чекають ідеї для наступних проєктів.'},
    {label:'Шоурум ідей',pose:'present',text:'Галерея, навчальні матеріали або Git Kindergarden. Обери напрям — наступна історія буде твоєю.'},
    {label:'Від авторів',pose:'present',text:'Людина задумує, AI допомагає втілити. Дякуємо, що твориш разом із нами.'}
  ];
  const slides=[...document.querySelectorAll('.slide.optimized-slide')];
  const choiceCards=[...document.querySelectorAll('.style-card,.optimized-choice-slide .card.tap')];
  choiceCards.forEach(card=>{card.setAttribute('role','button');card.tabIndex=0;card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();card.click();}});});
  const dots=document.getElementById('dots');
  document.getElementById('courseStepList').appendChild(dots);
  [...dots.children].forEach((button,index)=>{
    const number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');
    button.replaceChildren(number,document.createTextNode(steps[index].label));
  });
  window.updateCourseShell=function(){
    const index=slides.findIndex(slide=>slide.classList.contains('active'));
    const step=steps[index]||steps[0];
    document.body.dataset.courseStep=String(index);
    document.getElementById('courseGuideText').textContent=step.text;
    ['courseNarrator','courseHeaderNarrator'].forEach(id=>{const image=document.getElementById(id);const src='assets/ainaya-'+step.pose+'.webp';if(image.getAttribute('src')!==src)image.src=src;image.dataset.pose=step.pose;});
    [...dots.children].forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    if(index===9)document.getElementById('nextBtn').textContent='Шоурум ідей →';
    if(index===10)document.getElementById('nextBtn').textContent='Від авторів →';
    history.replaceState(null,'',index===11?'#authors':index===10?'#showroom':'#step-'+(index+1));
  };
  const hash=location.hash;
  if(hash==='#showroom')go(10);
  else if(hash==='#authors')go(11);
  else if(/^#step-\d+$/.test(hash))go(Math.min(slides.length-1,Math.max(0,Number(hash.slice(6))-1)));
  window.updateCourseShell();
})();
