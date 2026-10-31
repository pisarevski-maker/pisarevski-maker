/* ============================================
   FAILURES.JS — 6 Failure Scenario Labs
   ============================================ */

const FailureLab = {

  scenarios: [
    {
      id: 'same-file',
      icon: '⚔️',
      title: 'Два агенти змінили один файл',
      desc: 'Agent-1 і Agent-2 одночасно змінили procurement.py. Хто пушне першим — той виграє.',
      difficulty: '🟡 Середня',
      steps: [
        {
          title: 'Ситуація',
          html: `<div class="failure-scene">
            <p>Два AI-агенти працювали паралельно:</p>
            <ul>
              <li><strong>Agent-1</strong> (feature/add-dates) — додав поле <code>arrival_date</code></li>
              <li><strong>Agent-2</strong> (feature/add-status) — додав поле <code>order_status</code></li>
            </ul>
            <p>Обидва змінили один файл: <code>procurement.py</code></p>
            <p>Agent-1 запушив першим. Agent-2 намагається пушити...</p>
            <div class="terminal-block">
              <div class="terminal-header">Terminal — Agent-2</div>
              <code>$ git push origin feature/add-status</code>
              <div class="terminal-error">! [rejected] feature/add-status -> feature/add-status (non-fast-forward)
error: failed to push some refs
hint: Updates were rejected because the tip of your current branch is behind</div>
            </div>
          </div>`,
          action() {
            // Set up the scenario in state
            resetState();
            GitState.branches.develop = [
              { id: 'c1', msg: 'init', author: 'team', ts: 1, files: ['README.md'] }
            ];
            GitState.branches['feature/add-status'] = [
              { id: 'c1', msg: 'init', author: 'team', ts: 1, files: ['README.md'] },
              { id: 'c2', msg: 'feat: add order_status', author: 'agent-2', ts: 2, files: ['procurement.py'] }
            ];
            GitState.remote.develop = JSON.parse(JSON.stringify(GitState.branches.develop));
            GitState.currentBranch = 'feature/add-status';
          }
        },
        {
          title: 'Рішення',
          html: `<div class="failure-solution">
            <h4>Крок 1: Забрати зміни з remote</h4>
            <div class="cmd-block"><code>git pull origin develop --rebase</code></div>
            <p>Це поставить ваші коміти ПІСЛЯ комітів Agent-1.</p>

            <h4>Крок 2: Вирішити конфлікти (якщо є)</h4>
            <p>Оскільки обидва змінили різні частини файлу — конфлікт може не виникнути!<br>
            Але якщо змінили ту саму функцію — побачите:</p>
            <div class="terminal-block">
              <div class="terminal-header">procurement.py</div>
              <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
    arrival_date = models.DateField()
=======
    order_status = models.CharField()
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/add-status</code>
            </div>
            <p>Правильне рішення: <strong>залишити обидва поля!</strong></p>

            <h4>Крок 3: Запушити знову</h4>
            <div class="cmd-block"><code>git add procurement.py
git commit -m "fix: resolve merge conflict"
git push origin feature/add-status</code></div>

            <div class="tip-box">
              <strong>💡 Порада для економії часу:</strong> Домовтесь з агентами працювати в різних файлах.
              Кожен агент — свій модуль. Тоді конфліктів не буде взагалі!
            </div>
          </div>`
        }
      ]
    },
    {
      id: 'push-rejected',
      icon: '🚫',
      title: 'Push відхилено (remote ahead)',
      desc: 'Хтось запушив зміни поки ви працювали. Remote гілка попереду вашої.',
      difficulty: '🟢 Легка',
      steps: [
        {
          title: 'Ситуація',
          html: `<div class="failure-scene">
            <p>Ви працювали годину, зробили 3 коміти і намагаєтесь push:</p>
            <div class="terminal-block">
              <div class="terminal-header">Terminal</div>
              <code>$ git push origin develop</code>
              <div class="terminal-error">To github.com:team/crm-project.git
! [rejected] develop -> develop (fetch first)
error: failed to push some refs</div>
            </div>
            <p>Це означає: поки ви працювали, хтось інший (або інший агент) вже запушив свої зміни.</p>
          </div>`
        },
        {
          title: 'Рішення',
          html: `<div class="failure-solution">
            <div class="cmd-block"><code>git pull origin develop</code></div>
            <p>Git спробує автоматично об'єднати зміни. Якщо конфліктів немає:</p>
            <div class="cmd-block"><code>git push origin develop</code></div>

            <div class="warning-box">
              <strong>⚠️ Ніколи не робіть <code>git push --force</code>!</strong><br>
              Це перезапише чужу роботу. Навіть якщо AI-агент пропонує — відмовляйте.
            </div>
          </div>`
        }
      ]
    },
    {
      id: 'merge-conflict',
      icon: '💥',
      title: 'Конфлікт злиття у PR',
      desc: 'GitHub показує "This branch has conflicts that must be resolved" на вашому PR.',
      difficulty: '🟡 Середня',
      steps: [
        {
          title: 'Ситуація',
          html: `<div class="failure-scene">
            <div class="github-mock">
              <div class="gh-header">
                <span class="gh-pr-icon">🔀</span>
                <span>PR #42: Add procurement arrival date</span>
              </div>
              <div class="gh-conflict-banner">
                ⚠️ This branch has conflicts that must be resolved
              </div>
              <p>Develop гілка отримала нові зміни після того, як ви створили PR.
              Ці зміни конфліктують з вашими.</p>
            </div>
          </div>`
        },
        {
          title: 'Рішення',
          html: `<div class="failure-solution">
            <h4>Крок 1: Оновити вашу гілку</h4>
            <div class="cmd-block"><code>git checkout feature/procurement-arrival-date
git pull origin develop</code></div>

            <h4>Крок 2: Вирішити конфлікти</h4>
            <p>VS Code покаже конфлікти з кнопками Accept Current / Accept Incoming / Accept Both.</p>
            <p>Зазвичай для CRM: <strong>Accept Both</strong> — залишити і свої, і чужі зміни.</p>

            <h4>Крок 3: Завершити</h4>
            <div class="cmd-block"><code>git add .
git commit -m "fix: resolve merge conflicts with develop"
git push origin feature/procurement-arrival-date</code></div>
            <p>PR автоматично оновиться!</p>

            <div class="tip-box">
              <strong>💡 Профілактика:</strong> Регулярно робіть <code>git pull origin develop</code>
              у свою feature-гілку — тоді конфлікти будуть маленькими.
            </div>
          </div>`
        }
      ]
    },
    {
      id: 'flaky-tests',
      icon: '🎰',
      title: 'Flaky тести — то працюють, то ні',
      desc: 'CI показує червоний хрестик, але тести падають на чомусь, що ви не чіпали.',
      difficulty: '🔴 Складна',
      steps: [
        {
          title: 'Ситуація',
          html: `<div class="failure-scene">
            <div class="ci-mock">
              <div class="ci-header">GitHub Actions — CI Check</div>
              <div class="ci-item ci-fail">✗ test_procurement_module — FAILED</div>
              <div class="ci-item ci-pass">✓ test_inventory_module — PASSED</div>
              <div class="ci-item ci-fail">✗ test_integration — FAILED (timeout)</div>
              <div class="ci-item ci-pass">✓ test_auth — PASSED</div>
            </div>
            <p><strong>Ви змінили тільки модуль замовлень, а падають тести закупівель і інтеграційні!</strong></p>
            <p>Це <strong>flaky tests</strong> — нестабільні тести. Вони падають через:</p>
            <ul>
              <li>Залежність від часу або випадкових даних</li>
              <li>Спільну базу даних між тестами</li>
              <li>Timeout на повільному CI-сервері</li>
              <li>Race conditions (гонки потоків)</li>
            </ul>
          </div>`
        },
        {
          title: 'Рішення',
          html: `<div class="failure-solution">
            <h4>Тактика 1: Перезапустити CI</h4>
            <p>У GitHub Actions натисніть <strong>"Re-run failed jobs"</strong>.<br>
            Якщо flaky тест — він часто проходить з другої спроби.</p>

            <h4>Тактика 2: Знайти справжню причину</h4>
            <div class="cmd-block"><code># Подивитись логи CI
# В GitHub → Actions → клікнути на провалений тест
# Шукати повідомлення про помилку</code></div>

            <h4>Тактика 3: Ізолювати тест</h4>
            <div class="cmd-block"><code># Запустити тільки провалений тест локально
python -m pytest tests/test_procurement.py -v
# Запустити кілька разів
python -m pytest tests/test_procurement.py --count=5</code></div>

            <div class="tip-box">
              <strong>💡 Головна порада для вашої ситуації:</strong><br>
              Якщо масово падають тести 2-3 дні поспіль — це НЕ flaky tests.
              Це системна проблема. Перевірте:<br>
              1. Чи не зламана develop гілка (хтось замерджив баг)<br>
              2. Чи актуальні міграції бази даних<br>
              3. Чи не конфліктують зміни різних агентів між собою
            </div>
          </div>`
        }
      ]
    },
    {
      id: 'build-fail',
      icon: '🔨',
      title: 'Railway build провалився',
      desc: 'Код замерджено в main, але Railway не може зібрати проєкт.',
      difficulty: '🟡 Середня',
      steps: [
        {
          title: 'Ситуація',
          html: `<div class="failure-scene">
            <div class="railway-mock">
              <div class="rw-header">Railway — Build Log</div>
              <div class="rw-line rw-ok">✓ Cloning repository...</div>
              <div class="rw-line rw-ok">✓ Installing dependencies...</div>
              <div class="rw-line rw-fail">✗ Build failed:</div>
              <div class="rw-error">ModuleNotFoundError: No module named 'procurement_dates'
ERROR: Build process returned exit code 1</div>
            </div>
            <p><strong>Замерджили, а на Railway не збирається!</strong></p>
            <p>Причини:</p>
            <ul>
              <li>Забули додати нову залежність у <code>requirements.txt</code></li>
              <li>Файл перейменували, але не оновили імпорт</li>
              <li>Конфігурація середовища відрізняється від локальної</li>
            </ul>
          </div>`
        },
        {
          title: 'Рішення',
          html: `<div class="failure-solution">
            <h4>Крок 1: Прочитати лог Railway</h4>
            <p>Помилка чітко каже, чого не вистачає: <code>procurement_dates</code></p>

            <h4>Крок 2: Виправити і створити hotfix</h4>
            <div class="cmd-block"><code>git checkout -b hotfix/fix-import
# Виправити імпорт або додати залежність
pip freeze > requirements.txt
git add .
git commit -m "hotfix: fix missing module import"
git push origin hotfix/fix-import</code></div>

            <h4>Крок 3: Швидкий PR прямо в main</h4>
            <p>Hotfix йде одразу в main (не через develop), бо продакшн зламаний.</p>

            <div class="warning-box">
              <strong>⚠️ Важливо:</strong> Після hotfix обов'язково злийте main назад у develop,
              інакше develop буде "позаду" main і наступні PR будуть з конфліктами.
            </div>
          </div>`
        }
      ]
    },
    {
      id: 'health-fail',
      icon: '💀',
      title: 'Деплой пройшов, але сайт не працює',
      desc: 'Railway каже "deployed", але ваш CRM показує помилку 500.',
      difficulty: '🔴 Складна',
      steps: [
        {
          title: 'Ситуація',
          html: `<div class="failure-scene">
            <div class="status-board">
              <div class="status-row status-ok">✅ GitHub merge — OK</div>
              <div class="status-row status-ok">✅ Railway build — OK</div>
              <div class="status-row status-ok">✅ Railway deploy — OK</div>
              <div class="status-row status-fail">❌ Health check — FAILED</div>
              <div class="status-row status-fail">❌ crm.example.com — 500 Internal Server Error</div>
            </div>
            <p><strong>Все зелене, а сайт не працює!</strong></p>
            <p>Код зібрався, задеплоївся, але падає при запуску. Причини:</p>
            <ul>
              <li>Не виконані міграції бази даних</li>
              <li>Змінні середовища (ENV) не налаштовані</li>
              <li>Нова фіча потребує Redis/S3/API key</li>
              <li>Помилка у коді, яку тести не покрили</li>
            </ul>
          </div>`
        },
        {
          title: 'Рішення',
          html: `<div class="failure-solution">
            <h4>Крок 1: Негайний rollback!</h4>
            <p>В Railway: <strong>Deployments → попередній деплой → Rollback</strong></p>
            <p>Це миттєво поверне попередню робочу версію.</p>

            <h4>Крок 2: Перевірити логи</h4>
            <div class="cmd-block"><code># В Railway dashboard → Logs
# Шукати traceback / error message
# Наприклад:
django.db.utils.OperationalError: no such column: procurement_arrival_date</code></div>

            <h4>Крок 3: Виправити і передеплоїти</h4>
            <p>Зазвичай потрібно виконати міграції або додати ENV змінну.</p>

            <div class="tip-box">
              <strong>💡 Золоте правило:</strong> Спочатку rollback, потім розбиратись.<br>
              Кожна хвилина з непрацюючим сайтом — це втрачені клієнти.
              Rollback займає 10 секунд, дебаг може зайняти годину.
            </div>
          </div>`
        }
      ]
    }
  ],

  currentScenario: null,
  currentStep: 0,

  init() {
    this.currentScenario = null;
    this.currentStep = 0;
    this.renderMenu();
  },

  renderMenu() {
    const container = document.getElementById('failures-content');
    if (!container) return;

    container.innerHTML = `
      <div class="failures-menu">
        <h2>🔥 Лабораторія помилок</h2>
        <p class="failures-intro">Кожен сценарій — реальна ситуація, з якою ви зіткнетесь при розробці CRM з AI-агентами.
        Навчіться вирішувати їх за хвилини, а не за години.</p>
        <div class="scenario-grid">
          ${this.scenarios.map((s, i) => `
            <div class="scenario-card" onclick="FailureLab.startScenario(${i})">
              <div class="scenario-icon">${s.icon}</div>
              <div class="scenario-title">${s.title}</div>
              <div class="scenario-desc">${s.desc}</div>
              <div class="scenario-diff">${s.difficulty}</div>
            </div>
          `).join('')}
        </div>
      </div>`;
  },

  startScenario(index) {
    this.currentScenario = index;
    this.currentStep = 0;
    const scenario = this.scenarios[index];
    if (scenario.steps[0].action) scenario.steps[0].action();
    this.renderScenario();
  },

  renderScenario() {
    const container = document.getElementById('failures-content');
    if (!container) return;

    const scenario = this.scenarios[this.currentScenario];
    const step = scenario.steps[this.currentStep];
    const totalSteps = scenario.steps.length;

    container.innerHTML = `
      <div class="failure-detail">
        <button class="back-btn" onclick="FailureLab.init()">← Назад до списку</button>
        <h2>${scenario.icon} ${scenario.title}</h2>

        <div class="failure-progress">
          ${scenario.steps.map((s, i) => `
            <div class="fp-dot ${i === this.currentStep ? 'active' : i < this.currentStep ? 'done' : ''}">
              ${i + 1}
            </div>
            ${i < totalSteps - 1 ? '<div class="fp-line"></div>' : ''}
          `).join('')}
        </div>

        <h3>${step.title}</h3>
        ${step.html}

        <div class="failure-nav">
          ${this.currentStep > 0 ? `<button class="btn btn-secondary" onclick="FailureLab.prevStep()">← Попередній</button>` : '<div></div>'}
          ${this.currentStep < totalSteps - 1
            ? `<button class="btn btn-primary" onclick="FailureLab.nextStep()">Далі →</button>`
            : `<button class="btn btn-success" onclick="FailureLab.init()">✓ Завершити</button>`
          }
        </div>
      </div>`;
  },

  nextStep() {
    const scenario = this.scenarios[this.currentScenario];
    if (this.currentStep < scenario.steps.length - 1) {
      this.currentStep++;
      if (scenario.steps[this.currentStep].action) {
        scenario.steps[this.currentStep].action();
      }
      this.renderScenario();
    }
  },

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderScenario();
    }
  }
};
