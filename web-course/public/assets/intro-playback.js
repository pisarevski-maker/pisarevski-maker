(() => {
  'use strict';
  const video = document.getElementById('introVideo');
  const cover = document.getElementById('introCover');
  const shade = document.getElementById('introShade');
  const replay = document.getElementById('introReplay');
  const status = document.getElementById('introPlaybackStatus');
  const wrap = video.parentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const darkenSeconds = 1.2;
  let preferredVolume = 1;
  let anchorVolume = 1;
  let anchorTime = 0;
  let appliedVolume = 1;
  let frame = 0;
  let returnFrame = 0;
  let returnTimer = 0;
  let phase = 'idle';

  function setVolume(value) {
    appliedVolume = value;
    video.volume = value;
  }
  function updatePresentation() {
    if (phase !== 'playing') return;
    captureVolumeChoice();
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    const remaining = Math.max(0.01, duration - anchorTime);
    const progress = Math.min(1, Math.max(0, (video.currentTime - anchorTime) / remaining));
    setVolume(anchorVolume * Math.pow(Math.cos(progress * Math.PI / 2), 2));
    const darkness = Math.min(1, Math.max(0, 1 - (duration - video.currentTime) / darkenSeconds));
    shade.style.opacity = reducedMotion.matches ? '0' : String(darkness * darkness * (3 - 2 * darkness));
  }
  function stopFade() {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  function animatePresentation() {
    updatePresentation();
    if (!video.paused && !video.ended && phase === 'playing') frame = requestAnimationFrame(animatePresentation);
    else frame = 0;
  }
  function finishReturn() {
    returnTimer = 0;
    wrap.classList.remove('is-returning');
    phase = 'idle';
    video.currentTime = 0;
    replay.disabled = false;
    status.textContent = 'Відео завершено. Заставка повернулася. Можна переглянути вступ ще раз.';
  }
  setVolume(1);
  function captureVolumeChoice() {
    if (Math.abs(video.volume - appliedVolume) > 0.0001) {
      preferredVolume = video.volume;
      anchorVolume = video.volume;
      anchorTime = video.currentTime;
      appliedVolume = video.volume;
    }
  }
  video.addEventListener('volumechange', captureVolumeChoice);
  video.addEventListener('play', () => {
    clearTimeout(returnTimer);
    cancelAnimationFrame(returnFrame);
    returnTimer = returnFrame = 0;
    wrap.classList.remove('is-returning');
    phase = 'playing';
    stopFade();
    updatePresentation();
    frame = requestAnimationFrame(animatePresentation);
  });
  video.addEventListener('playing', () => {
    cover.classList.remove('is-visible');
    cover.setAttribute('aria-hidden', 'true');
    replay.disabled = true;
    video.controls = true;
    status.textContent = '';
  });
  video.addEventListener('timeupdate', updatePresentation);
  video.addEventListener('seeked', updatePresentation);
  video.addEventListener('pause', stopFade);
  video.addEventListener('ended', () => {
    stopFade();
    phase = 'returning';
    setVolume(0);
    video.controls = false;
    if (document.fullscreenElement === video) {
      document.exitFullscreen().catch(() => { video.controls = true; });
    }
    cover.setAttribute('aria-hidden', 'false');
    replay.disabled = true;
    wrap.classList.add('is-returning');
    cover.classList.add('is-visible');
    status.textContent = 'Повертаємося до заставки…';
    shade.style.opacity = reducedMotion.matches ? '0' : '1';
    if (reducedMotion.matches) finishReturn();
    else {
      returnFrame = requestAnimationFrame(() => { shade.style.opacity = '0'; returnFrame = 0; });
      returnTimer = setTimeout(finishReturn, 850);
    }
  });
  replay.addEventListener('click', async () => {
    anchorTime = 0;
    anchorVolume = preferredVolume;
    setVolume(anchorVolume);
    video.currentTime = 0;
    try {
      await video.play();
      video.focus();
    } catch (_) {
      status.textContent = 'Натисни кнопку ще раз, щоб запустити відео.';
    }
  });
})();
