/* ============================================
   QUIZ.JS — 10-Question Knowledge Check
   ============================================ */

const Quiz = {

  questions: [
    {
      q: 'Що робить команда <code>git fetch</code>?',
      options: [
        'Завантажує зміни і зливає їх з вашою гілкою',
        'Перевіряє, чи є нові зміни на remote, але НЕ змінює ваші файли',
        'Створює нову гілку',
        'Видаляє локальні зміни'
      ],
      correct: 1,
      explain: '<code>git fetch</code> тільки перевіряє і завантажує інформацію. Ваші файли не змінюються. Це безпечна команда, яку можна запускати будь-коли.'
    },
    {
      q: 'Яка різниця між <code>git fetch</code> і <code>git pull</code>?',
      options: [
        'Немає різниці, це синоніми',
        'fetch — для main, pull — для develop',
        'pull = fetch + merge (завантажує І зливає)',
        'fetch працює тільки онлайн'
      ],
      correct: 2,
      explain: '<code>git pull</code> — це <code>git fetch</code> + <code>git merge</code>. Pull одразу змінює ваші файли, тому перед ним переконайтесь, що все закомічено.'
    },
    {
      q: 'Що таке Pull Request (PR)?',
      options: [
        'Запит на завантаження коду з GitHub на локальний комп\'ютер',
        'Запит на злиття вашої гілки в іншу гілку з ревʼю та тестами',
        'Команда git для оновлення гілки',
        'Автоматичний деплой на Railway'
      ],
      correct: 1,
      explain: 'PR — це запит "подивіться мій код і дозвольте злити". Це НЕ "pulling" (завантаження). Це механізм ревʼю + автоматичних тестів.'
    },
    {
      q: 'Три AI-агенти працюють над CRM. Яка стратегія гілок найкраща?',
      options: [
        'Всі працюють прямо в main',
        'Кожен агент — своя feature-гілка, злиття через develop',
        'Один репозиторій, один агент',
        'Кожен агент — свій репозиторій'
      ],
      correct: 1,
      explain: 'Feature branches + develop — стандарт. Кожен агент працює ізольовано у своїй гілці. Зміни перевіряються через PR і зливаються в develop.'
    },
    {
      q: 'Ваш push відхилено з помилкою "non-fast-forward". Що робити?',
      options: [
        'git push --force',
        'Видалити репозиторій і клонувати заново',
        'git pull (забрати зміни з remote), потім push знову',
        'Створити новий репозиторій'
      ],
      correct: 2,
      explain: 'Спочатку <code>git pull</code>, щоб отримати зміни, які хтось запушив раніше. Потім <code>git push</code>. НІКОЛИ не робіть <code>--force</code> — це перезапише чужу роботу!'
    },
    {
      q: 'Що таке staging area (git add)?',
      options: [
        'Місце, де Git зберігає видалені файли',
        'Проміжна зона: ви обираєте, ЯКІ САМЕ зміни потраплять у коміт',
        'Назва гілки develop',
        'Сервер Railway'
      ],
      correct: 1,
      explain: 'Staging area — як "кошик для покупок". Ви обираєте, що покласти (git add), а потім "купуєте" все разом (git commit). Це дозволяє зробити акуратний коміт, а не зберігати все підряд.'
    },
    {
      q: 'Railway build пройшов успішно, але сайт показує 500. Перше, що робити?',
      options: [
        'Перезапустити комп\'ютер',
        'Rollback до попередньої версії, потім розбиратись',
        'Почекати — можливо, виправиться само',
        'Написати новий код'
      ],
      correct: 1,
      explain: '🏆 Золоте правило: Rollback → потім дебаг. Rollback займає 10 секунд, а кожна хвилина з непрацюючим сайтом — це втрачені клієнти. Спочатку відновіть сервіс, потім шукайте причину.'
    },
    {
      q: 'Що таке "origin" у Git?',
      options: [
        'Окремий сервіс для зберігання коду',
        'Початкова гілка проєкту',
        'Стандартна назва (псевдонім) для віддаленого репозиторію на GitHub',
        'Команда для створення нового репозиторію'
      ],
      correct: 2,
      explain: '<code>origin</code> — це просто назва (alias), яку Git дає вашому GitHub-репозиторію за замовчуванням. Як контакт у телефоні: замість URL ви пишете <code>origin</code>.'
    },
    {
      q: 'Тести падають 3 дні поспіль на речах, які ви не чіпали. Що це?',
      options: [
        'Нормально, просто перезапускайте',
        'Системна проблема: зламана develop, конфлікти між агентами, або застарілі міграції',
        'GitHub Actions зламався',
        'Потрібно перевстановити Git'
      ],
      correct: 1,
      explain: 'Якщо тести масово падають кілька днів — це НЕ flaky tests, а системна проблема. Перевірте: 1) чи цілісна develop, 2) чи актуальні міграції БД, 3) чи не конфліктують зміни різних агентів.'
    },
    {
      q: 'Правильний порядок кроків від редагування до деплою:',
      options: [
        'edit → push → commit → deploy',
        'edit → add → commit → push → PR → review → merge → deploy',
        'commit → add → push → PR → merge',
        'edit → deploy → PR → merge'
      ],
      correct: 1,
      explain: 'Повний pipeline: Редагувати → Stage (add) → Commit → Push → Pull Request → Review + Tests → Merge → Auto-deploy на Railway → Cloudflare routing.'
    }
  ],

  currentQuestion: 0,
  answers: {},
  showResults: false,

  init() {
    this.currentQuestion = 0;
    this.answers = {};
    this.showResults = false;
    this.render();
  },

  render() {
    const container = document.getElementById('quiz-content');
    if (!container) return;

    if (this.showResults) {
      this.renderResults(container);
      return;
    }

    const q = this.questions[this.currentQuestion];
    const answered = this.answers[this.currentQuestion] !== undefined;
    const selected = this.answers[this.currentQuestion];

    container.innerHTML = `
      <div class="quiz-layout">
        <div class="quiz-header">
          <h2>📝 Перевір себе</h2>
          <div class="quiz-progress">
            ${this.questions.map((_, i) => {
              const a = this.answers[i];
              let cls = '';
              if (i === this.currentQuestion) cls = 'active';
              else if (a !== undefined) cls = a === this.questions[i].correct ? 'correct' : 'wrong';
              return `<div class="qp-dot ${cls}" onclick="Quiz.goTo(${i})">${i + 1}</div>`;
            }).join('')}
          </div>
        </div>

        <div class="quiz-question">
          <div class="qq-number">Питання ${this.currentQuestion + 1} / ${this.questions.length}</div>
          <div class="qq-text">${q.q}</div>

          <div class="qq-options">
            ${q.options.map((opt, i) => {
              let cls = 'qq-option';
              if (answered) {
                if (i === q.correct) cls += ' correct';
                else if (i === selected && i !== q.correct) cls += ' wrong';
              } else if (i === selected) {
                cls += ' selected';
              }
              return `<div class="${cls}" onclick="Quiz.answer(${i})">${opt}</div>`;
            }).join('')}
          </div>

          ${answered ? `<div class="qq-explain ${selected === q.correct ? 'explain-correct' : 'explain-wrong'}">
            <strong>${selected === q.correct ? '✅ Правильно!' : '❌ Неправильно'}</strong>
            <p>${q.explain}</p>
          </div>` : ''}
        </div>

        <div class="quiz-nav">
          ${this.currentQuestion > 0 ? `<button class="btn btn-secondary" onclick="Quiz.goTo(${this.currentQuestion - 1})">←</button>` : '<div></div>'}
          ${this.currentQuestion < this.questions.length - 1
            ? `<button class="btn btn-primary" onclick="Quiz.goTo(${this.currentQuestion + 1})">→</button>`
            : `<button class="btn btn-success" onclick="Quiz.finish()">Результат</button>`
          }
        </div>
      </div>`;
  },

  answer(index) {
    if (this.answers[this.currentQuestion] !== undefined) return;
    this.answers[this.currentQuestion] = index;
    this.render();
  },

  goTo(index) {
    this.currentQuestion = index;
    this.render();
  },

  finish() {
    this.showResults = true;
    this.render();
  },

  renderResults(container) {
    const total = this.questions.length;
    let correct = 0;
    for (let i = 0; i < total; i++) {
      if (this.answers[i] === this.questions[i].correct) correct++;
    }
    const pct = Math.round(correct / total * 100);

    let grade, emoji, msg;
    if (pct >= 90) { grade = 'A+'; emoji = '🏆'; msg = 'Чудово! Ви готові працювати з Git як профі!'; }
    else if (pct >= 70) { grade = 'B'; emoji = '👍'; msg = 'Добре! Основи зрозумілі. Повторіть складні теми.'; }
    else if (pct >= 50) { grade = 'C'; emoji = '📚'; msg = 'Непогано, але варто пройти туторіал ще раз.'; }
    else { grade = 'D'; emoji = '💪'; msg = 'Не здавайтесь! Пройдіть туторіал і спробуйте знову.'; }

    container.innerHTML = `
      <div class="quiz-results">
        <div class="qr-emoji">${emoji}</div>
        <div class="qr-grade">${grade}</div>
        <div class="qr-score">${correct} / ${total} (${pct}%)</div>
        <div class="qr-msg">${msg}</div>

        <div class="qr-breakdown">
          ${this.questions.map((q, i) => {
            const isCorrect = this.answers[i] === q.correct;
            const answered = this.answers[i] !== undefined;
            return `<div class="qr-row ${isCorrect ? 'qr-ok' : answered ? 'qr-fail' : 'qr-skip'}">
              <span class="qr-icon">${isCorrect ? '✅' : answered ? '❌' : '⬜'}</span>
              <span class="qr-q">${i+1}. ${q.q.replace(/<[^>]+>/g, '')}</span>
            </div>`;
          }).join('')}
        </div>

        <div class="qr-actions">
          <button class="btn btn-primary" onclick="Quiz.init()">🔄 Спробувати знову</button>
          <button class="btn btn-secondary" onclick="App.switchMode('tutorial')">📖 До туторіалу</button>
        </div>
      </div>`;
  }
};
