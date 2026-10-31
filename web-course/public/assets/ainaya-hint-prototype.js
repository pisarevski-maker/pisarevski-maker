(() => {
  'use strict';
  const guide = document.querySelector('.course-guide');
  const image = document.getElementById('courseNarrator');
  const text = document.getElementById('courseGuideText');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ainaya-hint-launcher';
  button.setAttribute('aria-controls', text.id);
  button.append(image);
  guide.append(button);
  guide.classList.add('ainaya-on-demand');
  let currentStep;
  let open = false;
  function setOpen(value) {
    open = value;
    guide.classList.toggle('is-hint-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Сховати підказку Айнаї' : 'Показати підказку Айнаї');
    button.title = open ? 'Натисни, щоб сховати підказку' : 'Натисни на Айнаю — вона підкаже';
    text.setAttribute('aria-hidden', String(!open));
  }
  function sync() {
    const nextStep = document.body.dataset.courseStep;
    if (nextStep !== currentStep) {
      currentStep = nextStep;
      setOpen(false);
    }
    button.style.setProperty('--ainaya-picture', 'url("' + image.src + '")');
  }
  button.addEventListener('click', () => setOpen(!open));
  document.addEventListener('pointerdown', event => { if (open && !guide.contains(event.target)) setOpen(false); });
  document.addEventListener('keydown', event => {
    if (open && event.key === 'Escape') { setOpen(false); button.focus(); event.preventDefault(); }
  });
  new MutationObserver(sync).observe(document.body, {attributes:true, attributeFilter:['data-course-step']});
  new MutationObserver(sync).observe(image, {attributes:true, attributeFilter:['src']});
  setOpen(false);
  sync();
})();
