(() => {
  'use strict';
  const caption = document.getElementById('storyCaption');
  const scene = document.getElementById('storyScene');
  const defaults = ['Людина задумує.', 'AI допомагає втілити.'];
  let restoreTimer;
  let highlightTimer;

  function setLine(selector, text) {
    const line = caption.querySelector(selector);
    line.querySelector('.caption-core').textContent = text;
    line.querySelector('.caption-halo').textContent = text;
  }
  function playEntrance() {
    caption.getAnimations({subtree:true}).filter(animation => animation.animationName === 'caption-reveal').forEach(animation => {
      animation.currentTime = 0;
      animation.play();
    });
  }
  function restoreCaption() {
    clearTimeout(restoreTimer);
    caption.classList.remove('is-human', 'is-ai');
    setLine('.human', defaults[0]);
    setLine('.ai', defaults[1]);
    playEntrance();
  }
  function tellStory(human) {
    clearTimeout(restoreTimer);
    clearTimeout(highlightTimer);
    caption.classList.toggle('is-human', human);
    caption.classList.toggle('is-ai', !human);
    setLine('.human', human ? 'Ідея починається з тебе.' : 'Твій задум — головний.');
    setLine('.ai', human ? 'Ти надаєш їй сенс.' : 'Я допоможу втілити.');
    scene.classList.add('is-inspired');
    playEntrance();
    highlightTimer = setTimeout(() => scene.classList.remove('is-inspired'), 5000);
    restoreTimer = setTimeout(restoreCaption, 6500);
  }
  document.getElementById('boyStory').addEventListener('click', () => tellStory(true));
  document.getElementById('ainayaStory').addEventListener('click', () => tellStory(false));
  document.getElementById('replayCaption').addEventListener('click', restoreCaption);
  playEntrance();
})();
