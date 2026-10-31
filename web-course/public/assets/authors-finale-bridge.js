(() => {
  'use strict';
  const frame = document.getElementById('authorsFrame');
  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.origin !== location.origin) return;
    if (event.data?.type === 'ainarium:authors:back') {
      window.go(11);
      document.getElementById('nextBtn').focus({preventScroll:true});
    }
  });
})();
