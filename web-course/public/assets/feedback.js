(() => {
  'use strict';
  const form = document.getElementById('feedbackForm');
  const status = document.getElementById('feedbackStatus');
  const button = form.querySelector('[type="submit"]');
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    sending = true;
    button.disabled = true;
    button.textContent = 'Надсилаємо…';
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Передаємо ваше повідомлення авторам…';
    const fields = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(fields)
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        status.textContent = response.status === 429
          ? 'Забагато спроб. Зачекайте хвилину й спробуйте ще раз. Текст збережено у формі.'
          : 'Не вдалося надіслати повідомлення. Текст збережено у формі — спробуйте ще раз.';
        return;
      }
      status.textContent = 'Дякуємо! Повідомлення передано поштовому сервісу для авторів.';
      form.reset();
    } catch {
      status.textContent = 'Немає зв’язку з поштовим сервісом. Текст збережено у формі — спробуйте ще раз.';
    } finally {
      sending = false;
      button.disabled = false;
      button.textContent = 'Відправити ↗';
      form.removeAttribute('aria-busy');
    }
  });
})();
