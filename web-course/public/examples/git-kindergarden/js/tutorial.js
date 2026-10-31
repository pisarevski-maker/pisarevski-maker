/* ============================================
   TUTORIAL.JS — 12-Step Guided Learning Journey
   ============================================ */

const TutorialSteps = [

  /* ---- Step 0: Intro ---- */
  {
    title: '🏠 Початковий стан',
    subtitle: 'Що таке локальний та віддалений репозиторій',
    explanation: `
      <p>Уяви звичайну шафу на кухні — в ній лежать листочки з рецептами. Так само на твоєму комп'ютері є папка з файлами твого проекту (CRM) — це листочки з «рецептами», тільки замість страв там написаний код.</p>
      <p>Але насправді таких «шаф» у тебе зараз <strong>три</strong>, і кожна відповідає за своє:</p>
      <ol>
        <li><strong>Файли у VS Code</strong> — те, що ти прямо зараз бачиш на екрані і редагуєш. Це як листочок, який лежить у тебе на столі.</li>
        <li><strong>Локальний Git</strong> — спеціальний фотоальбом <em>на твоєму комп'ютері</em>. Важлива деталь: він зберігає не кожну твою правку, а <strong>лише ті версії, які ти сам наказав зберегти</strong> (зробив коміт). Що потрапило в альбом — те вже не зникне ніколи. Чого ти не зберіг — Git ніколи й не бачив, і відновити не зможе.</li>
        <li><strong>GitHub (origin)</strong> — копія цього фотоальбому <em>в хмарі</em> (типу Google Фото), де твої колеги теж можуть побачити ці ж листочки і навіть доповнити їх.</li>
      </ol>
      <div class="info-box">
        💡 Слово <strong>origin</strong> — це просто «ім'я», яким Git називає твою хмарну копію на GitHub. Жодної магії: уяви, що це просто контакт у телефонній книзі з назвою «моя хмара».
      </div>
    `,
    visual: 'three-layers',
    crmExample: 'Зараз у тебе є CRM з модулями Procurement, Sales та Dashboard. Код однаковий і локально, і на GitHub.',
    techDetail: `
      <code>git remote -v</code> — покаже URL віддаленого репозиторію.<br>
      <code>origin</code> — стандартна назва, яку Git присвоює автоматично при <code>git clone</code>.
    `,
    action() {
      resetState();
      GitState.branches.develop = [
        { id: 'c1', msg: 'init: project setup', author: 'team', ts: 1, files: ['README.md', 'package.json'] }
      ];
      GitState.remote.develop = JSON.parse(JSON.stringify(GitState.branches.develop));
    }
  },

  /* ---- Step 1: Fetch vs Pull ---- */
  {
    title: '📡 Fetch і Pull',
    subtitle: 'Як дізнатися про зміни та оновити локальний код',
    explanation: `
      <p><strong>git fetch</strong> — це не «підглянути». Це <strong>забрати чуже до себе</strong>. Git іде в хмару, завантажує всі нові коміти колег тобі на диск і кладе їх на <em>окрему полицю</em> з назвою <code>origin/develop</code>. Твоя власна гілка і твої файли при цьому не змінюються ні на байт.</p>
      <p>Уяви: кур'єр привіз посилку від колеги і поставив її на окрему полицю в коридорі. Посилка вже фізично в тебе вдома — але ти ще не розпакував її і не змішав із своїми речами. Тепер у тебе поруч лежать <strong>дві версії</strong>: твоя і хмарна. Їх можна спокійно порівняти і аж потім вирішувати, що робити.</p>
      <p><strong>git pull</strong> — це fetch <em>плюс</em> одразу розпакувати і змішати зі своїм. Одна команда замість двох, але рішення «змішувати» приймається за тебе автоматично.</p>
      <div class="info-box">
        💡 Саме тому на графіку внизу <code>origin/develop</code> намальована окремою пунктирною лінією. Ця лінія і є та сама «полиця» — копія хмарної гілки, яка лежить у тебе на диску після fetch.
      </div>
      <div class="warning-box">
        ⚠️ Головна пастка: коли <code>git status</code> або VS Code пишуть «ти відстаєш на 2 коміти» — <strong>це НЕ живі дані з GitHub</strong>. Це порівняння з полицею, яку ти приніс минулого разу. Давно не робив fetch — бачиш застаріле. Тому перед важливим рішенням спершу fetch, і лише потім дивись цифри.
      </div>
    `,
    visual: 'fetch-pull',
    crmExample: 'Агент B додав нове поле в Sales Forecast. Ти хочеш побачити ці зміни.',
    mainCommands: [
      {
        label: 'Забрати чуже до себе, не чіпаючи своє',
        code: 'git fetch origin',
        desc: `Завантажує нові коміти з хмари тобі на диск і кладе їх в окремі гілки origin/*. Твоя гілка і твої файли не змінюються — тому зламати цією командою нічого не можна.`
      },
      {
        label: 'Порівняти своє з принесеним',
        code: 'git log --oneline develop..origin/develop',
        desc: `Показує коміти, які вже лежать на полиці, але ще не в твоїй гілці. Працює тільки після fetch: Git дивиться на те, що вже є в тебе на диску, а не питає GitHub наживо.`
      },
      {
        label: 'Забрати і одразу змішати зі своїм',
        recommended: true,
        code: 'git pull origin develop',
        desc: `fetch + merge в одній команді: приносить нове і одразу вливає у твою гілку develop. Саме цим користуються щодня. Якщо ви з колегою чіпали ті самі рядки — Git зупиниться і попросить вирішити конфлікт.`
      }
    ],
    techDetail: `
      <code>git fetch origin</code> — скачує інформацію, але не змінює файли.<br>
      <code>git pull origin develop</code> — скачує і автоматично зливає зміни.<br>
      <code>git status</code> — завжди перевіряй стан перед pull.
    `,
    action() {
      // Simulate remote has a new commit. Bump the shared counter too —
      // otherwise the next real commit reuses this id and two different
      // commits end up both called c2.
      GitState.commitCounter++;
      const id = 'c' + GitState.commitCounter;
      const newCommit = { id, msg: 'feat: add sales forecast module', author: 'agent-b', ts: GitState.commitCounter, files: ['sales/forecast.py'] };
      GitState.remote.develop.push(newCommit);
      logAction('📡', 'git fetch', 'Знайдено нові зміни на origin/develop');
    }
  },

  /* ---- Step 2: Create Feature Branch ---- */
  {
    title: '🌿 Створення feature-гілки',
    subtitle: 'Одна задача — одна гілка',
    explanation: `
      <p>Уяви: офіційна книга рецептів ресторану (<strong>main</strong> або <strong>develop</strong>) — це перевірена версія, якою реально користуються. Її краще не чіпати напряму, поки ти не впевнений у своїх змінах.</p>
      <p>Тому перед експериментом ти береш окрему "чернетку" — копію цієї книги з окремою назвою, і пробуєш зміни там. Це і є <strong>гілка (branch)</strong>: паралельна версія файлів, яка не впливає на офіційну, поки ти сам не вирішиш перенести зміни туди.</p>
      <p>Назву гілки зазвичай дають так, щоб було зрозуміло, що саме в ній відбувається:</p>
      <code>feature/procurement-arrival-date</code>
      <div class="info-box">
        💡 Назви <strong>main</strong> і <strong>develop</strong> — це просто домовленість команди ("ось ця гілка — офіційна, а ця — для збирання готових фіч перед випуском"), а не щось вбудоване в Git.
      </div>
      <div class="info-box">
        🔍 Уточнення, щоб не дивувало: слова «копія» і «паралельна версія» описують, як це <em>виглядає й поводиться</em>. Фізично Git нічого не копіює — створення гілки не займає ні місця, ні часу, навіть якщо у проєкті 10 000 файлів. Гілка — це просто закладка, яка вказує на певний коміт. Саме тому гілки створюють легко й часто.
      </div>
    `,
    visual: 'branch-create',
    crmExample: 'Ти хочеш додати поле "Дата прибуття" в модуль Procurement. Створюєш окрему гілку, щоб не зламати develop.',
    mainCommands: [
      {
        label: 'Класичний спосіб',
        code: 'git checkout -b feature/procurement-arrival-date develop',
        desc: 'Створює нову гілку від develop і одразу переключається на неї. Саме цю команду ти найчастіше побачиш у чужих інструкціях та старих туторіалах.'
      },
      {
        label: 'Сучасний спосіб',
        recommended: true,
        code: 'git switch -c feature/procurement-arrival-date develop',
        desc: `Робить те саме. З'явилась у Git 2.23 (2019) саме тому, що стара команда checkout була заплутаною — вона одночасно і перемикала гілки, і скасовувала зміни у файлах. Назва "switch" ("перемкнутись") набагато інтуїтивніша.`
      }
    ],
    techDetail: `
      Прапорець <code>-b</code> (checkout) та <code>-c</code> (switch) означають одне й те саме: "create" — створити нову гілку перед перемиканням. Без цього прапорця команда просто перемикає на вже існуючу гілку.<br><br>
      Стара назва <code>checkout</code> походить з бібліотечної термінології ("взяти книгу", library checkout), а не з готельної ("виселитись"). Але цей сенс давно загубився для нових користувачів — тому й зʼявився switch.
    `,
    action() {
      // Pull first to get the latest
      GitState.branches.develop = JSON.parse(JSON.stringify(GitState.remote.develop));
      GitEngine.createBranch('feature/procurement-arrival-date', 'develop');
    }
  },

  /* ---- Step 3: Edit Files ---- */
  {
    title: '✏️ Редагування файлів у VS Code',
    subtitle: 'Зміни, які ще не зберіг Git',
    explanation: `
      <p>Ти відкрив файл і дописав нове поле — як переписав рядок у листочку з рецептом. Але важливо: <strong>Git поки що нічого не знає</strong> про цю зміну! Він не підглядає за тобою автоматично — ти маєш сам сказати йому "подивись, ось що я поміняв".</p>
      <p>Поки ти цього не сказав, VS Code просто підказує кольорами, що саме відрізняється від "останнього фото" (коміту):</p>
      <ul>
        <li><span class="color-mod">🟡 Змінений файл (Modified)</span> — цей файл вже був у Git, і ти його відредагував.</li>
        <li><span class="color-new">🟢 Новий файл (Untracked)</span> — цей файл Git взагалі ще не бачив, ти його тільки-но створив.</li>
        <li><span class="color-del">🔴 Видалений файл (Deleted)</span> — файл був, а тепер ти його прибрав.</li>
      </ul>
      <div class="info-box">
        💡 Ці зміни поки <strong>тільки на твоєму екрані</strong>, в оперативній пам'яті редактора. Якщо зараз вимкнути комп'ютер без збереження — вони щезнуть. Але навіть якщо зберегти файл — Git все одно ще "не сфотографував" цей стан, поки ти не зробиш наступні кроки.
      </div>
    `,
    visual: 'vscode-editor',
    crmExample: 'Додаємо поле arrival_date в procurement/models.py і оновлюємо procurement/views.py.',
    techDetail: `
      <code>git diff</code> — покаже різницю між поточними файлами та останнім комітом.<br>
      <code>git status</code> — покаже, які файли змінені.
    `,
    action() {
      GitEngine.editFile('procurement/models.py', 'Додано поле arrival_date');
      GitEngine.editFile('procurement/views.py', 'Оновлено форму закупівлі');
    }
  },

  /* ---- Step 4: Stage Changes ---- */
  {
    title: '📦 Staging — підготовка до коміту',
    subtitle: 'Обираєш, які зміни зберегти',
    explanation: `
      <p>Уяви касу в магазині. Перед тим як оплатити покупку, ти спочатку складаєш товари в кошик — обираєш, що саме купуєш. Лише потім оформляєш покупку на касі.</p>
      <p>У Git так само: <strong>staging area</strong> — це "кошик" перед "фото-комітом". Команда <code>git add</code> — "покласти файл у кошик". Вона каже Git: "ось цей файл я точно хочу включити в наступне фото".</p>
      <p>Навіщо ця зайва дія? Бо іноді ти змінив одразу 5 файлів для різних задач, а хочеш зберегти їх окремо — у 2-3 різних "фотографіях" (комітах), по темах, а не все в одну купу.</p>
    `,
    visual: 'staging',
    crmExample: 'Ми додаємо обидва файли (models.py і views.py) в staging, бо вони частина одного завдання.',
    mainCommands: [
      {
        label: 'Покласти в кошик конкретні файли',
        recommended: true,
        code: 'git add procurement/models.py procurement/views.py',
        desc: 'Перелічуєш через пробіл саме ті файли, які хочеш включити в наступний коміт. Так найбезпечніше — ти точно знаєш, що туди потрапить.'
      },
      {
        label: 'Покласти в кошик геть усе змінене',
        code: 'git add .',
        desc: 'Крапка означає «усі змінені файли в цій папці й усередині неї». Швидко, але обережно: можна випадково закомітити щось зайве — наприклад, свій тимчасовий файл з паролями.'
      },
      {
        label: 'Передумав — витягнути файл із кошика',
        code: 'git restore --staged procurement/views.py',
        desc: 'Прибирає файл із кошика назад у «просто змінені». Сам файл і твої зміни в ньому при цьому не чіпаються — зникає тільки позначка «готовий до коміту».'
      }
    ],
    techDetail: `
      <code>git add procurement/models.py procurement/views.py</code><br>
      або <code>git add .</code> — додати все (обережно!).<br>
      <code>git reset HEAD file.py</code> — прибрати файл зі staging.
    `,
    action() {
      GitEngine.stage();
    }
  },

  /* ---- Step 5: Commit ---- */
  {
    title: '💾 Коміт — збереження в історію',
    subtitle: 'Знімок стану проєкту',
    explanation: `
      <p>А тепер — найважливіший момент. <strong>Коміт (commit)</strong> — це той самий "знімок альбому", про який ми говорили на самому початку: Git фотографує поточний стан файлів із кошика (staging) і кладе це фото в альбом <em>назавжди</em>, поруч зі старими фото, нічого не стираючи.</p>
      <p>Кожне таке "фото" має:</p>
      <ul>
        <li>Унікальний номер (хеш) — як номер кадру в плівці.</li>
        <li>Підпис (повідомлення) — коротко, що саме змінилось.</li>
        <li>Хто і коли це зробив.</li>
      </ul>
      <div class="warning-box">
        ⚠️ Важливо: це фото поки лежить <strong>тільки в твоєму альбомі, на твоєму комп'ютері</strong>. Ніхто інший (ні колега, ні сервер) його ще не бачить. Щоб показати іншим — потрібен ще один крок, push (далі).
      </div>

      <h4 style="margin:18px 0 8px;font-size:1rem;">✍️ Як підписувати коміти (Conventional Commits)</h4>
      <p>Git байдуже, що ти напишеш у підписі — можна написати «шось поправив». Але команди домовляються писати однаково, і ця домовленість називається <strong>Conventional Commits</strong>. Це не команда і не технологія — просто правило, як починати підпис.</p>
      <p>Перше слово каже, <strong>якого типу</strong> була зміна:</p>
      <ul>
        <li><code>feat:</code> — додав щось нове, чого не було.<br><em>feat: add arrival date field to procurement</em></li>
        <li><code>fix:</code> — виправив поломку, щось працювало неправильно.<br><em>fix: arrival date saved in wrong timezone</em></li>
        <li><code>refactor:</code> — переписав код акуратніше, але для користувача нічого не змінилось.<br><em>refactor: split procurement form into smaller pieces</em></li>
        <li><code>docs:</code> — чіпав тільки тексти й інструкції, код не чіпав.<br><em>docs: describe how to set up CRM locally</em></li>
      </ul>
      <div class="info-box">
        💡 Навіщо це: уяви, що пакуєш коробки при переїзді. Можна підписати «речі», «ще речі», «різне» — і потім півдня шукати чайник. А можна «кухня», «книги», «одяг». Коробки ті самі, але коли треба щось знайти — різниця колосальна.
        Так само тут: через півроку на питання «коли ми зламали дати в закупівлях?» можна відфільтрувати всі <code>fix:</code> і знайти винуватця за хвилину замість години.
      </div>
    `,
    visual: 'commit',
    crmExample: 'Зберігаємо зміни з повідомленням: feat: add procurement arrival date',
    mainCommands: [
      {
        label: 'Зробити коміт (сфотографувати кошик)',
        recommended: true,
        code: 'git commit -m "feat: add procurement arrival date"',
        desc: '-m означає «message» (повідомлення). У лапках ти пишеш, що саме зробив — цей підпис залишиться в історії назавжди, і саме його читатимуть колеги (і ти сам через півроку), щоб зрозуміти, навіщо була ця зміна.'
      },
      {
        label: 'Подивитись, що вже назбиралось в історії',
        code: 'git log --oneline',
        desc: 'Показує список усіх комітів, по одному рядку на кожен: номер + підпис. Це і є твій «фотоальбом», який можна гортати. Вихід з перегляду — клавіша q.'
      }
    ],
    techDetail: `
      Решта префіксів Conventional Commits, які зустрічаються рідше:<br>
      <code>test:</code> — додав або поправив тести.<br>
      <code>chore:</code> — технічна рутина (оновив версію бібліотеки, почистив сміття). На роботу програми не впливає.<br>
      <code>style:</code> — тільки форматування: відступи, лапки, пробіли. Логіка не змінилась.<br>
      <code>perf:</code> — пришвидшив роботу, поведінка та сама.<br><br>
      Якщо зміна стосується конкретного модуля, його пишуть у дужках:<br>
      <code>feat(procurement): add arrival date</code><br><br>
      Повний стандарт: conventionalcommits.org. Але для щоденної роботи вистачає чотирьох основних префіксів вище.
    `,
    action() {
      GitEngine.commit('feat: add procurement arrival date');
    }
  },

  /* ---- Step 6: Push ---- */
  {
    title: '⬆️ Push — відправка на GitHub',
    subtitle: 'Локальні коміти подорожують у хмару',
    explanation: `
      <p><strong>git push</strong> — це "відправити свіжі фото з телефону в хмару" (Google Фото). Тобто твої локальні коміти копіюються на GitHub, і тепер інші люди теж можуть їх побачити.</p>
      <p>Зверни увагу: коли ти вперше робиш push гілки, якої ще нема на GitHub — вона там просто створюється з такою ж назвою, автоматично.</p>
    `,
    visual: 'push-animation',
    crmExample: 'Твій коміт з arrival_date тепер на GitHub у гілці origin/feature/procurement-arrival-date.',
    mainCommands: [
      {
        label: 'Перший push цієї гілки',
        recommended: true,
        code: 'git push -u origin feature/procurement-arrival-date',
        desc: 'Відправляє твої коміти в хмару і заодно створює там гілку з такою ж назвою. Прапорець -u («встановити звʼязок») кажe Git запамʼятати цю пару — щоб наступного разу можна було писати просто git push, без хвоста.'
      },
      {
        label: 'Усі наступні рази',
        code: 'git push',
        desc: 'Після першого разу з -u цього достатньо: Git уже знає, куди саме відправляти цю гілку.'
      }
    ],
    techDetail: `
      <code>git push origin feature/procurement-arrival-date</code><br>
      Перший раз: <code>git push -u origin feature/procurement-arrival-date</code> — встановлює upstream tracking.
    `,
    action() {
      GitEngine.push();
    }
  },

  /* ---- Step 7: Pull Request ---- */
  {
    title: '🔀 Pull Request',
    subtitle: 'Запит на інтеграцію, а не "скачування"',
    explanation: `
      <p>Уяви: перш ніж вписувати свій експериментальний рецепт в офіційну книгу, ти несеш листочок шеф-кухарю і кажеш: "глянь, будь ласка, перш ніж я це оформлю офіційно".</p>
      <p><strong>Pull Request (PR)</strong> — це точно такий "запит на перевірку". Назва трохи заплутана (здається, що мова про "pull" = "скачати"), але насправді йдеться про прохання: "прийміть, будь ласка, мої зміни в офіційну гілку".</p>
      <div class="info-box">
        💡 PR — це момент паузи перед об'єднанням, коли хтось (колега або автоматична програма-тестувальник) може перевірити код <strong>до</strong> того, як він потрапить у спільну гілку і вплине на інших.
      </div>
    `,
    visual: 'pr-screen',
    crmExample: 'Створюємо PR: feature/procurement-arrival-date → develop. Тепер можна переглянути зміни.',
    techDetail: `
      PR створюється на GitHub (або через <code>gh pr create</code>).<br>
      Source: feature/procurement-arrival-date<br>
      Target: develop
    `,
    action() {
      GitEngine.createPR('feature/procurement-arrival-date', 'develop');
    }
  },

  /* ---- Step 8: Review & Tests ---- */
  {
    title: '🔍 Ревʼю і тести',
    subtitle: 'Перевірка перед злиттям',
    explanation: `
      <p>Перш ніж "вписати страву в офіційне меню", відбувається перевірка — як дегустація перед тим, як рецепт пустять у роботу:</p>
      <ol>
        <li><strong>Автоматичні тести (CI)</strong> — це як машина, яка сама перевіряє температуру й смак за заданими правилами, без участі людини. Запускається автоматично, щойно створено PR.</li>
        <li><strong>Code review ("перегляд коду")</strong> — тут вже людина (колега або ти сам) дивиться на зміни очима і каже: "так, це розумно" чи "тут краще б інакше".</li>
        <li><strong>Виправлення</strong> — якщо знайшли проблему, ти просто дописуєш ще один коміт у ту ж саму гілку, і PR оновлюється сам.</li>
      </ol>
      <div class="tip-box">
        🎯 Поради, які реально економлять час:<br>
        • Роби маленькі PR — їх швидше перевіряти<br>
        • Один PR = одна задача, не змішуй 10 різних речей в одному<br>
        • Запускай тести у себе ще до push, щоб не чекати результату на сервері<br>
        • Якщо тест то проходить, то ні (без причини) — його треба полагодити, а не ігнорувати
      </div>
    `,
    visual: 'review-checks',
    crmExample: 'CI запускає тести для procurement модуля. Ревʼювер перевіряє, що arrival_date правильно валідується.',
    techDetail: `
      GitHub Actions / CI pipeline запускається автоматично.<br>
      Статуси: pending → running → passed/failed.<br>
      <code>gh pr checks</code> — подивитися статус з терміналу.
    `,
    action() {
      GitEngine.approvePR();
    }
  },

  /* ---- Step 9: Merge into develop ---- */
  {
    title: '🔗 Merge в develop',
    subtitle: 'Зміни вливаються у спільну гілку',
    explanation: `
      <p>PR затверджено — тепер відбувається саме те <strong>злиття (merge)</strong>, про яке ми вже говорили: зміни з твоєї гілки-чернетки вписуються в офіційну (develop).</p>
      <div class="warning-box">
        ⚠️ Хитрий момент: ти зробив merge на сайті GitHub (у хмарі). Але на твоєму власному комп'ютері локальна копія develop про це ще <strong>нічого не знає</strong> — вона не оновлюється сама собою! Це як коли фото завантажили у хмарний альбом, а в телефоні вони ще не підвантажились, поки ти не відкрив додаток і не оновив.
        Щоб підтягнути ці зміни собі — потрібен ще один <code>git pull origin develop</code>.
      </div>
    `,
    visual: 'merge-animation',
    crmExample: `Поле arrival_date тепер у develop. Але на твоєму комп'ютері develop все ще старий — потрібен git pull.`,
    mainCommands: [
      {
        label: 'Крок 1 — перейти на спільну гілку',
        code: 'git switch develop',
        desc: 'Поки ти стоїш у своїй feature-гілці, оновлювати develop немає сенсу — спочатку треба «зайти» в нього. (Старий варіант тієї ж команди: git checkout develop.)'
      },
      {
        label: 'Крок 2 — забрати злиті зміни собі',
        recommended: true,
        code: 'git pull origin develop',
        desc: 'Підтягує з GitHub той коміт, який щойно зʼявився там після merge. Доки ти цього не зробиш, твій локальний develop лишається старим — Git ніколи не оновлює твої файли без твоєї команди.'
      },
      {
        label: 'Крок 3 — прибрати за собою (необовʼязково)',
        code: 'git branch -d feature/procurement-arrival-date',
        desc: 'Видаляє вже непотрібну feature-гілку в тебе локально — її зміни вже всередині develop, тож нічого не втрачається. Мала літера -d не дасть видалити гілку, яку ще нікуди не влили.'
      }
    ],
    techDetail: `
      Типи merge:<br>
      • <strong>Merge commit</strong> — зберігає всю історію гілки.<br>
      • <strong>Squash merge</strong> — стискає всі коміти гілки в один.<br>
      Після merge feature-гілку зазвичай видаляють.
    `,
    action() {
      GitEngine.merge();
    }
  },

  /* ---- Step 10: Release to main ---- */
  {
    title: '🏷️ Реліз у main',
    subtitle: 'Підготовка до продакшену',
    explanation: `
      <p>Develop — це як "тестова кухня": тут збираються і перевіряються всі нові рецепти разом, перш ніж щось потрапить у роботу насправді.</p>
      <p>Коли в develop накопичилось достатньо перевірених змін — роблять окремий PR: <strong>з develop у main</strong>. <strong>main</strong> — це "офіційно надрукована книга рецептів", яка реально використовується в ресторані (на продакшн-сервері).</p>
      <div class="info-box">
        💡 Важливо: саме по собі злиття в main <strong>ще не означає, що сайт оновився</strong>. Публікація коду на реальному сервері (деплой) — окремий, наступний крок.
      </div>
    `,
    visual: 'release',
    crmExample: 'PR: develop → main. В main потрапить і arrival_date, і forecast від Agent B.',
    techDetail: `
      <code>gh pr create --base main --head develop --title "Release v1.2"</code><br>
      Після merge в main — tag: <code>git tag v1.2.0</code>
    `,
    action() {
      // Create and merge PR from develop to main
      const s = GitState;
      s.prCounter++;
      const pr = {
        id: s.prCounter, source: 'develop', target: 'main',
        status: 'approved', checks: 'passed', reviewStatus: 'approved',
        title: 'Release: develop → main', commits: s.remote.develop.length
      };
      s.pullRequests.push(pr);
      GitEngine.merge(pr.id);
    }
  },

  /* ---- Step 11: Railway & Cloudflare ---- */
  {
    title: '🚀 Railway і Cloudflare',
    subtitle: 'Від merge до живого сайту',
    explanation: `
      <p>Остання частина ланцюжка — перетворення коду на реально працюючий сайт:</p>
      <ol>
        <li><strong>GitHub</strong> повідомляє Railway: "в main з'явились нові зміни!"</li>
        <li><strong>Railway</strong> — це як орендована кухня в хмарі: бере код і "готує страву" — збирає й запускає програму.</li>
        <li><strong>Health check</strong> — Railway сам перевіряє: "а додаток точно працює, чи він зламався після запуску?"</li>
        <li><strong>Cloudflare</strong> — це вивіска з адресою ресторану: коли хтось набирає crm.example.com у браузері, саме Cloudflare направляє людину туди, де насправді "готує" Railway.</li>
      </ol>
      <div class="warning-box">
        ⚠️ Кожен крок може "зламатись" окремо — одне не гарантує інше:<br>
        • Злиття коду пройшло успішно — ще не значить, що він зібрався (build)<br>
        • Збірка пройшла успішно — ще не значить, що додаток реально запустився (deploy)<br>
        • Запуск пройшов успішно — ще не значить, що додаток працює правильно (health check)<br>
        Cloudflare при цьому <strong>не бачить і не торкається твого коду</strong> — він лише показує людям, куди йти.
      </div>
    `,
    visual: 'deploy-pipeline',
    crmExample: 'Railway автоматично деплоїть main. CRM тепер має поле arrival_date на crm.example.com.',
    techDetail: `
      Railway: автоматичний deploy при push/merge в обрану гілку.<br>
      Cloudflare: DNS + CDN + DDoS protection. Не знає про ваш код.
    `,
    action() {
      GitEngine.deploy('main');
    }
  }
];

/* Tutorial navigation */
const Tutorial = {
  currentStep: 0,

  goTo(step) {
    if (step < 0 || step >= TutorialSteps.length) return;
    this.currentStep = step;
    GitState.tutorialStep = step;
    this.render();
  },

  next() { this.goTo(this.currentStep + 1); },
  prev() { this.goTo(this.currentStep - 1); },

  render() {
    const step = TutorialSteps[this.currentStep];
    if (!step) return;

    // Rebuild the whole state from scratch by replaying every step up to
    // this one. Without this, clicking a step dot to jump back or forward
    // applies that step's action on top of leftover state (wrong commit
    // numbers, wrong PR numbers, phantom branches).
    // We snapshot the state just BEFORE this step's own action so the page
    // can show "було → стало" side by side instead of making the user
    // click back and forth between slides.
    resetState();
    for (let i = 0; i < this.currentStep; i++) {
      TutorialSteps[i].action();
    }
    const before = this.currentStep === 0 ? null : cloneState();
    TutorialSteps[this.currentStep].action();
    const after = cloneState();
    const newKeys = Visualizer.diffKeys(before, after);

    const container = document.getElementById('tutorial-content');
    if (!container) return;

    container.innerHTML = `
      <div class="step-header">
        <div class="step-progress">
          ${TutorialSteps.map((s, i) => `
            <div class="step-dot ${i === this.currentStep ? 'active' : i < this.currentStep ? 'done' : ''}"
                 onclick="Tutorial.goTo(${i})" title="${s.title}">
              ${i < this.currentStep ? '✓' : i + 1}
            </div>
          `).join('<div class="step-line"></div>')}
        </div>
        <h2>${step.title}</h2>
        <p class="step-subtitle">${step.subtitle}</p>
      </div>

      <div class="step-body">
        <div class="step-visual" id="step-visual">
          ${this.renderVisual(step.visual)}
        </div>

        ${step.mainCommands ? `
          <div class="cmd-box-group">
            ${step.mainCommands.map(c => `
              <div class="cmd-box ${c.recommended ? 'cmd-recommended' : ''}">
                <div class="cmd-box-label">${c.recommended ? '⭐ ' : ''}${c.label}</div>
                <code class="cmd-box-code">${c.code}</code>
                <div class="cmd-box-desc">${c.desc}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="step-explanation">
          ${step.explanation}
        </div>

        <div class="step-crm">
          <div class="crm-badge">🏗️ Приклад з CRM</div>
          <p>${step.crmExample}</p>
        </div>

        <details class="step-tech">
          <summary>🔧 Технічні деталі</summary>
          <div class="tech-content">${step.techDetail}</div>
        </details>
      </div>

      <div class="step-what-changed">
        <h4>📊 Що змінилося на цьому кроці?</h4>

        ${before ? `
          <div class="ba-grid">
            <div class="ba-col ba-before">
              <div class="ba-label">БУЛО <span>— стан до команд цього кроку</span></div>
              <div id="step-graph-before"></div>
            </div>
            <div class="ba-arrow">→</div>
            <div class="ba-col ba-after">
              <div class="ba-label">СТАЛО <span>— після того, що ти зробив</span></div>
              <div id="step-graph-after"></div>
            </div>
          </div>
          <div class="diff-box">
            <div class="diff-title">🔍 Різниця між лівим і правим:</div>
            ${Visualizer.describeDiff(before, after)}
          </div>
        ` : `
          <p class="ba-start-note">Це найперший крок — порівнювати ще нема з чим. Ось стан, з якого все починається:</p>
          <div id="step-graph-after"></div>
        `}

        ${Visualizer.graphLegend()}
        <div id="step-branch-summary"></div>
        ${Visualizer.renderWorkingDir()}
      </div>

      <div class="step-nav">
        <button class="btn btn-secondary" onclick="Tutorial.prev()" ${this.currentStep === 0 ? 'disabled' : ''}>
          ← Назад
        </button>
        <span class="step-counter">${this.currentStep + 1} / ${TutorialSteps.length}</span>
        <button class="btn btn-primary" onclick="Tutorial.next()" ${this.currentStep >= TutorialSteps.length - 1 ? 'disabled' : ''}>
          Далі →
        </button>
      </div>
    `;

    // Render the "before" and "after" graphs side by side
    if (before) {
      Visualizer.renderBranchGraph('step-graph-before', true, before, { noLegend: true });
    }
    Visualizer.renderBranchGraph('step-graph-after', true, after, { noLegend: true, newKeys });
    document.getElementById('step-branch-summary').innerHTML = Visualizer.describeBranches();

    // Update pipeline
    document.getElementById('pipeline-bar').innerHTML = Visualizer.renderPipeline();
  },

  /* Render step-specific visual illustrations */
  renderVisual(type) {
    switch(type) {
      case 'three-layers':
        return `
          <svg viewBox="0 0 700 200" class="illustration">
            <defs>
              <filter id="shadow"><feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.15"/></filter>
            </defs>
            <!-- VS Code -->
            <rect x="20" y="30" width="180" height="140" rx="12" fill="var(--clr-vscode-bg)" filter="url(#shadow)"/>
            <rect x="20" y="30" width="180" height="32" rx="12" fill="var(--clr-vscode)"/>
            <text x="110" y="52" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">VS Code</text>
            <text x="110" y="90" text-anchor="middle" fill="var(--clr-text)" font-size="11">📄 models.py</text>
            <text x="110" y="110" text-anchor="middle" fill="var(--clr-text)" font-size="11">📄 views.py</text>
            <text x="110" y="130" text-anchor="middle" fill="var(--clr-text)" font-size="11">📄 package.json</text>
            <text x="110" y="158" text-anchor="middle" fill="var(--clr-muted)" font-size="10">💻 Твій комп'ютер</text>

            <!-- Arrow 1 -->
            <path d="M210 100 h50" stroke="var(--clr-arrow)" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
            <text x="235" y="92" text-anchor="middle" fill="var(--clr-muted)" font-size="9">git add/commit</text>

            <!-- Local Git -->
            <rect x="270" y="30" width="180" height="140" rx="12" fill="var(--clr-git-bg)" filter="url(#shadow)"/>
            <rect x="270" y="30" width="180" height="32" rx="12" fill="var(--clr-git)"/>
            <text x="360" y="52" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">Local Git</text>
            <text x="360" y="85" text-anchor="middle" fill="var(--clr-text)" font-size="11">📦 Коміт c1</text>
            <text x="360" y="105" text-anchor="middle" fill="var(--clr-text)" font-size="11">🌿 main</text>
            <text x="360" y="125" text-anchor="middle" fill="var(--clr-text)" font-size="11">🌿 develop</text>
            <text x="360" y="158" text-anchor="middle" fill="var(--clr-muted)" font-size="10">💻 Твій комп'ютер</text>

            <!-- Arrow 2 -->
            <path d="M460 90 h50" stroke="var(--clr-push)" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
            <text x="485" y="82" text-anchor="middle" fill="var(--clr-push)" font-size="9">push</text>
            <path d="M510 110 h-50" stroke="var(--clr-pull)" stroke-width="2" fill="none" marker-end="url(#arrowhead2)"/>
            <text x="485" y="124" text-anchor="middle" fill="var(--clr-pull)" font-size="9">pull</text>

            <!-- GitHub -->
            <rect x="520" y="30" width="160" height="140" rx="12" fill="var(--clr-github-bg)" filter="url(#shadow)"/>
            <rect x="520" y="30" width="160" height="32" rx="12" fill="var(--clr-github)"/>
            <text x="600" y="52" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">GitHub (origin)</text>
            <text x="600" y="85" text-anchor="middle" fill="var(--clr-text)" font-size="11">📦 Коміт c1</text>
            <text x="600" y="105" text-anchor="middle" fill="var(--clr-text)" font-size="11">🌿 main</text>
            <text x="600" y="125" text-anchor="middle" fill="var(--clr-text)" font-size="11">🌿 develop</text>
            <text x="600" y="158" text-anchor="middle" fill="var(--clr-muted)" font-size="10">☁️ Хмара</text>

            <!-- Arrow markers -->
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="var(--clr-arrow)"/>
              </marker>
              <marker id="arrowhead2" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
                <polygon points="8 0, 0 3, 8 6" fill="var(--clr-pull)"/>
              </marker>
            </defs>
          </svg>`;

      case 'fetch-pull':
        return `
          <svg viewBox="0 0 720 230" class="illustration">
            <!-- Твій комп'ютер: дві полиці поруч -->
            <rect x="20" y="20" width="330" height="190" rx="12" fill="var(--clr-git-bg)" filter="url(#shadow)"/>
            <text x="185" y="44" text-anchor="middle" font-weight="700" fill="var(--clr-text)" font-size="13">💻 Твій комп'ютер</text>

            <rect x="38" y="58" width="294" height="62" rx="8" fill="#fff" stroke="var(--clr-develop)" stroke-width="1.5"/>
            <text x="52" y="78" fill="var(--clr-develop)" font-size="11" font-weight="700">твоя гілка · develop</text>
            <circle cx="60" cy="98" r="7" fill="var(--clr-develop)" stroke="#fff" stroke-width="2"/>
            <text x="60" y="117" text-anchor="middle" font-size="9" fill="var(--clr-muted)">c1</text>
            <text x="90" y="102" font-size="10" fill="var(--clr-muted)">← fetch її не чіпає</text>

            <rect x="38" y="130" width="294" height="62" rx="8" fill="#fff" stroke="var(--clr-pull)" stroke-width="1.5" stroke-dasharray="5 3"/>
            <text x="52" y="150" fill="var(--clr-pull)" font-size="11" font-weight="700">полиця · origin/develop</text>
            <circle cx="60" cy="170" r="7" fill="var(--clr-pull)" stroke="#fff" stroke-width="2"/>
            <text x="60" y="189" text-anchor="middle" font-size="9" fill="var(--clr-muted)">c1</text>
            <line x1="67" y1="170" x2="103" y2="170" stroke="var(--clr-pull)" stroke-width="2.5" stroke-dasharray="5 3"/>
            <circle cx="110" cy="170" r="8" fill="var(--clr-pull)" stroke="var(--clr-ok)" stroke-width="2.5"/>
            <text x="110" y="189" text-anchor="middle" font-size="9" fill="var(--clr-ok)" font-weight="700">c2</text>
            <text x="138" y="174" font-size="10" fill="var(--clr-ok)">← приїхав сюди</text>

            <!-- GitHub -->
            <rect x="500" y="60" width="200" height="110" rx="12" fill="var(--clr-github-bg)" filter="url(#shadow)"/>
            <text x="600" y="86" text-anchor="middle" font-weight="700" fill="var(--clr-text)" font-size="13">☁️ GitHub</text>
            <text x="600" y="110" text-anchor="middle" fill="var(--clr-text)" font-size="11">develop: c1 → c2</text>
            <text x="600" y="132" text-anchor="middle" fill="var(--clr-feature1)" font-size="10">c2: feat: sales forecast</text>
            <text x="600" y="154" text-anchor="middle" fill="var(--clr-muted)" font-size="10">колега вже запушив</text>

            <!-- fetch: з хмари на полицю -->
            <path d="M496 150 C430 150 420 162 346 162" stroke="var(--clr-pull)" stroke-width="2.5" stroke-dasharray="6 3" fill="none"/>
            <text x="420" y="145" text-anchor="middle" fill="var(--clr-pull)" font-size="11" font-weight="700">git fetch</text>
            <text x="420" y="180" text-anchor="middle" fill="var(--clr-muted)" font-size="9">кладе на полицю</text>

            <!-- merge: з полиці у твою гілку -->
            <path d="M352 150 C372 150 372 100 352 100" stroke="var(--clr-push)" stroke-width="2.5" fill="none"/>
            <text x="412" y="96" text-anchor="middle" fill="var(--clr-push)" font-size="11" font-weight="700">merge</text>
            <text x="420" y="112" text-anchor="middle" fill="var(--clr-muted)" font-size="9">вливає у твою гілку</text>

            <!-- pull = fetch + merge -->
            <rect x="470" y="188" width="230" height="26" rx="13" fill="#fff" stroke="var(--clr-main)" stroke-width="1.5"/>
            <text x="585" y="205" text-anchor="middle" fill="var(--clr-main)" font-size="11" font-weight="700">git pull = fetch + merge</text>
          </svg>
          <div class="vscode-steps">
            <h5>🖥️ Де це в VS Code</h5>
            ${VSCodeUI.shell(
              'CRM Project — Visual Studio Code',
              VSCodeUI.activityBar('explorer', 0),
              VSCodeUI.explorerPanel('<div class="mock-file">📁 procurement</div><div class="mock-file indent">📄 models.py</div><div class="mock-file indent">📄 views.py</div>'),
              VSCodeUI.statusBar('develop', 0, 1, '1')
            )}
            <ol>
              <li><span class="callout-num">1</span> У самому низу вікна VS Code є синя смужка (Status Bar). Там завжди видно назву твоєї поточної гілки та іконку 🔄 (Sync).</li>
              <li>Цифра зі стрілкою вниз, наприклад <code>↓1</code>, означає: «на моїй полиці <code>origin/develop</code> є 1 коміт, якого немає в моїй гілці». <strong>Це не живий запит до GitHub.</strong> За замовчуванням VS Code сам у хмару не ходить, тому цифра може бути вчорашня — або її може не бути зовсім, хоча в хмарі вже щось є.</li>
              <li>Клік на 🔄 робить <strong>і pull, і push одночасно</strong> — це кнопка «синхронізувати», а не «оновитись». Якщо в тебе є свої незапушені коміти, вона заодно відправить і їх. Коли цього не хочеш — тисни <code>...</code> угорі панелі Source Control і вибери окремо <strong>Pull</strong>.</li>
              <li>Хочеш тільки оновити полицю, нічого не зливаючи: <code>...</code> → <strong>Fetch</strong>. Після цього цифри в смужці стануть правдивими.</li>
            </ol>
          </div>`;

      case 'branch-create':
        return `
          <svg viewBox="0 0 700 160" class="illustration">
            <!-- develop line -->
            <line x1="150" y1="50" x2="430" y2="50" stroke="var(--clr-develop)" stroke-width="3"/>
            <circle cx="180" cy="50" r="8" fill="var(--clr-develop)" stroke="#fff" stroke-width="2"/>
            <text x="180" y="35" text-anchor="middle" font-size="10" fill="var(--clr-text)">c1</text>
            <circle cx="260" cy="50" r="8" fill="var(--clr-develop)" stroke="#fff" stroke-width="2"/>
            <text x="260" y="35" text-anchor="middle" font-size="10" fill="var(--clr-text)">c2</text>
            <text x="140" y="54" text-anchor="end" font-size="12" fill="var(--clr-develop)" font-weight="600">develop</text>

            <!-- feature branch fork -->
            <path d="M260 50 C280 50 290 110 320 110" stroke="var(--clr-feature1)" stroke-width="2.5" fill="none"/>
            <line x1="320" y1="110" x2="500" y2="110" stroke="var(--clr-feature1)" stroke-width="3" stroke-dasharray="0"/>
            <circle cx="320" cy="110" r="8" fill="var(--clr-feature1)" stroke="#fff" stroke-width="2"/>
            <text x="320" y="135" text-anchor="middle" font-size="10" fill="var(--clr-text)">копія c2</text>
            <text x="140" y="114" text-anchor="end" font-size="11" fill="var(--clr-feature1)" font-weight="600">feature/…</text>

            <text x="515" y="114" fill="var(--clr-feature1)" font-size="11">← тут будеш працювати</text>
            <text x="445" y="54" fill="var(--clr-develop)" font-size="11">← develop не чіпаємо</text>
          </svg>
          <div class="vscode-steps">
            <h5>🖥️ Де це в VS Code</h5>
            <div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap;">
              <div>
                ${VSCodeUI.shell(
                  'CRM Project — Visual Studio Code',
                  VSCodeUI.activityBar('explorer', 0),
                  VSCodeUI.explorerPanel('<div class="mock-file">📁 procurement</div><div class="mock-file indent">📄 models.py</div>'),
                  `<div class="vscode-status-bar"><div class="status-bar-left"><span class="status-bar-item ui-pin ui-highlight">${VSCodeUI.icons.branch} develop<span class="callout-num">1</span></span></div><div></div></div>`
                )}
              </div>
              <div class="branch-picker">
                <div class="branch-picker-input">feature/procurement-arrival-date</div>
                <div class="branch-picker-item bp-new">➕ Create new branch...</div>
                <div class="branch-picker-item bp-active">⎇ develop</div>
                <div class="branch-picker-item">⎇ main</div>
              </div>
            </div>
            <ol>
              <li><span class="callout-num">1</span> Клікни на назву гілки в синій смужці внизу зліва (зараз там написано <code>develop</code>).</li>
              <li>Вгорі екрана зʼявиться маленьке віконце пошуку зі списком гілок. Там же буде пункт <strong>"+ Create new branch..."</strong> — клікни на нього.</li>
              <li>Введи назву нової гілки, наприклад <code>feature/procurement-arrival-date</code>, і натисни Enter.</li>
              <li>Назва гілки внизу зміниться на нову — це означає, що ти вже "всередині" своєї гілки, і все, що ти далі робитимеш, залишиться тільки там.</li>
            </ol>
          </div>`;

      case 'vscode-editor':
        return `
          <div class="mock-vscode">
            <div class="mock-title-bar">
              <span class="mock-dots"><i></i><i></i><i></i></span>
              <span>procurement/models.py — VS Code</span>
            </div>
            <div class="mock-editor">
              <div class="mock-sidebar">
                <div class="mock-file">📁 procurement</div>
                <div class="mock-file indent mod-file">📄 models.py <span class="badge-m">M</span></div>
                <div class="mock-file indent mod-file">📄 views.py <span class="badge-m">M</span></div>
                <div class="mock-file">📁 sales</div>
                <div class="mock-file indent">📄 forecast.py</div>
              </div>
              <div class="mock-code">
                <div class="code-line"><span class="ln">14</span> <span class="kw">class</span> <span class="fn">Procurement</span>(Model):</div>
                <div class="code-line"><span class="ln">15</span>     supplier = CharField()</div>
                <div class="code-line"><span class="ln">16</span>     quantity = IntegerField()</div>
                <div class="code-line code-added"><span class="ln">17</span> <span class="add">+   arrival_date = DateField(null=True)</span></div>
                <div class="code-line"><span class="ln">18</span>     status = CharField()</div>
              </div>
            </div>
          </div>
          <div class="vscode-steps">
            <h5>🖥️ Зверни увагу у VS Code</h5>
            <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
              ${VSCodeUI.activityBar('sourceControl-highlight', 2)}
              <div style="font-size:.85rem;max-width:480px;">
                <span class="callout-num">1</span> Щойно ти зберіг зміни у файлах, на іконці <strong>Source Control</strong> (гілка з кружечками, третя зверху на лівій панелі) зʼявилось синє число — <strong>2</strong>. Це означає: "у тебе 2 файли зі змінами, які Git ще не закомітив".
              </div>
            </div>
          </div>`;

      case 'staging':
        return `
          <div class="staging-visual">
            <div class="staging-col">
              <h4>📂 Робоча директорія</h4>
              <div class="staging-file done">✓ models.py</div>
              <div class="staging-file done">✓ views.py</div>
            </div>
            <div class="staging-arrow">
              <svg viewBox="0 0 60 40" width="60" height="40"><path d="M5 20h40m-8-6 8 6-8 6" stroke="var(--clr-push)" stroke-width="2.5" fill="none"/></svg>
              <div class="staging-cmd">git add</div>
            </div>
            <div class="staging-col staging-area">
              <h4>📦 Staging Area</h4>
              <div class="staging-file staged">● models.py</div>
              <div class="staging-file staged">● views.py</div>
            </div>
            <div class="staging-arrow">
              <svg viewBox="0 0 60 40" width="60" height="40"><path d="M5 20h40m-8-6 8 6-8 6" stroke="var(--clr-git)" stroke-width="2.5" fill="none"/></svg>
              <div class="staging-cmd">git commit</div>
            </div>
            <div class="staging-col">
              <h4>💾 Репозиторій</h4>
              <div class="staging-file">коміт c${GitState.commitCounter + 1}</div>
            </div>
          </div>
          <div class="vscode-steps">
            <h5>🖥️ Де це в VS Code</h5>
            ${VSCodeUI.shell(
              'CRM Project — Visual Studio Code',
              VSCodeUI.activityBar('sourceControl', 2),
              VSCodeUI.sourceControlPanel({
                changes: [
                  { name: 'models.py', folder: 'procurement/', status: 'M' },
                  { name: 'views.py', folder: 'procurement/', status: 'M' }
                ],
                highlightStageAll: '1'
              }),
              VSCodeUI.statusBar('feature/procurement-arrival-date', 0, 0)
            )}
            <ol>
              <li><span class="callout-num">1</span> Відкрий панель <strong>Source Control</strong> (іконка-гілка на лівій панелі). У розділі <strong>"Changes"</strong> видно список змінених файлів з буквою <strong>M</strong> (Modified).</li>
              <li>Наведи курсор на заголовок "Changes" — праворуч зʼявиться іконка <strong>"+"</strong>. Натисни на неї, щоб додати в staging одразу ВСІ файли списку.</li>
              <li>Або натисни "+" біля конкретного файлу, якщо хочеш додати тільки його одного.</li>
              <li>Файли переїдуть у новий розділ вище — <strong>"Staged Changes"</strong>. Це і є той самий "кошик", про який йшлося вище.</li>
            </ol>
          </div>`;

      case 'commit':
        return `
          <div class="commit-visual">
            <div class="commit-card-big">
              <div class="commit-hash">📦 c${GitState.commitCounter}</div>
              <div class="commit-msg">feat: add procurement arrival date</div>
              <div class="commit-meta">👤 you • 🕐 щойно</div>
              <div class="commit-files">
                <span class="badge-m">M</span> procurement/models.py<br>
                <span class="badge-m">M</span> procurement/views.py
              </div>
            </div>
            <div class="commit-note">⬆️ Цей коміт поки ТІЛЬКИ на твоєму комп'ютері!</div>
          </div>
          <div class="vscode-steps">
            <h5>🖥️ Де це в VS Code</h5>
            ${VSCodeUI.shell(
              'CRM Project — Visual Studio Code',
              VSCodeUI.activityBar('sourceControl', 2),
              VSCodeUI.sourceControlPanel({
                staged: [
                  { name: 'models.py', folder: 'procurement/', status: 'M' },
                  { name: 'views.py', folder: 'procurement/', status: 'M' }
                ],
                message: 'feat: add procurement arrival date',
                highlightMessage: '1',
                highlightCommit: '2'
              }),
              VSCodeUI.statusBar('feature/procurement-arrival-date', 0, 0)
            )}
            <ol>
              <li><span class="callout-num">1</span> У полі вгорі панелі Source Control (там, де написано "Message...") введи короткий опис зміни, наприклад <code>feat: add procurement arrival date</code>.</li>
              <li><span class="callout-num">2</span> Натисни синю кнопку <strong>"✓ Commit"</strong> під цим полем (або просто Ctrl+Enter).</li>
              <li>Список файлів у "Staged Changes" зникне — вони щойно потрапили у фото-альбом (коміт) на твоєму комп'ютері.</li>
            </ol>
          </div>`;

      case 'push-animation':
        return `
          <svg viewBox="0 0 700 120" class="illustration push-anim">
            <rect x="30" y="20" width="200" height="80" rx="10" fill="var(--clr-git-bg)"/>
            <text x="130" y="50" text-anchor="middle" font-size="13" fill="var(--clr-text)" font-weight="600">💻 Local</text>
            <text x="130" y="72" text-anchor="middle" font-size="11" fill="var(--clr-feature1)">feature/... → c${GitState.commitCounter}</text>

            <rect x="470" y="20" width="200" height="80" rx="10" fill="var(--clr-github-bg)"/>
            <text x="570" y="50" text-anchor="middle" font-size="13" fill="var(--clr-text)" font-weight="600">☁️ GitHub</text>
            <text x="570" y="72" text-anchor="middle" font-size="11" fill="var(--clr-feature1)">origin/feature/... → c${GitState.commitCounter}</text>

            <g class="push-packet">
              <circle cx="350" cy="60" r="14" fill="var(--clr-push)"/>
              <text x="350" y="64" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">c${GitState.commitCounter}</text>
            </g>
            <path d="M240 60 h220" stroke="var(--clr-push)" stroke-width="2" stroke-dasharray="6 3" fill="none"/>
            <text x="350" y="100" text-anchor="middle" font-size="12" fill="var(--clr-push)" font-weight="600">git push →</text>
          </svg>
          <div class="vscode-steps">
            <h5>🖥️ Де це в VS Code</h5>
            ${VSCodeUI.shell(
              'CRM Project — Visual Studio Code',
              VSCodeUI.activityBar('sourceControl', 0),
              VSCodeUI.explorerPanel('<div class="mock-file">📁 procurement</div>'),
              VSCodeUI.statusBar('feature/procurement-arrival-date', 1, 0, '1')
            )}
            <ol>
              <li><span class="callout-num">1</span> <strong>Перший push нової гілки виглядає інакше.</strong> Стрілки <code>↑</code> не буде — замість неї в синій смужці зʼявиться кнопка <strong>«Publish Branch»</strong> з хмаринкою. Це логічно: гілки в хмарі ще немає, тож і порівнювати нема з чим. Тиснеш її — гілка створюється на GitHub разом з твоїми комітами.</li>
              <li>Усі наступні рази — вже звична цифра <code>↑1</code> біля 🔄: «у тебе є 1 коміт, якого немає в хмарі». Клік на 🔄 відправляє його (і заодно забирає чуже, якщо воно є).</li>
            </ol>
          </div>`;

      case 'pr-screen':
        return `
          <div class="mock-github">
            <div class="mock-gh-header">
              <span class="gh-icon">🔀</span>
              <span class="gh-pr-title">PR #${GitState.prCounter}: Merge feature/procurement-arrival-date → develop</span>
              <span class="gh-badge open">Open</span>
            </div>
            <div class="mock-gh-body">
              <div class="gh-meta">
                <span>📌 Base: <code>develop</code></span>
                <span>← Compare: <code>feature/procurement-arrival-date</code></span>
              </div>
              <div class="gh-changes">
                <div class="gh-file"><span class="badge-m">M</span> procurement/models.py <span class="gh-diff">+1 -0</span></div>
                <div class="gh-file"><span class="badge-m">M</span> procurement/views.py <span class="gh-diff">+5 -2</span></div>
              </div>
              <div class="gh-checks">
                <span class="check pending">⏳ CI: Running tests...</span>
              </div>
            </div>
          </div>
          <div class="vscode-steps">
            <h5>🖥️ Як створити PR, не виходячи з VS Code</h5>
            <div class="setup-note">
              🔌 <strong>Одноразове налаштування.</strong> Сам по собі VS Code про Pull Request-и нічого не знає — це вже територія GitHub. Потрібне безкоштовне офіційне розширення:
              натисни іконку <strong>Extensions</strong> (чотири квадратики на лівій панелі) → у пошуку введи <code>GitHub Pull Requests</code> → обери те, де видавець <strong>GitHub</strong> → <strong>Install</strong>.
              Після встановлення на лівій панелі зʼявиться нова іконка, а VS Code попросить увійти в твій акаунт GitHub (один раз відкриється браузер для підтвердження — і все, більше туди ходити не треба).
            </div>
            ${VSCodeUI.shell(
              'CRM Project — Visual Studio Code',
              VSCodeUI.activityBar('github-highlight', 0, { withGitHub: true, pin: '1' }),
              VSCodeUI.prPanel({ mode: 'create', hBase: '2', hCreate: '3' }),
              VSCodeUI.statusBar('feature/procurement-arrival-date', 0, 0)
            )}
            <ol>
              <li><span class="callout-num">1</span> Одразу після push VS Code сам показує віконце внизу праворуч: <strong>"Would you like to create a Pull Request for branch…"</strong> — натисни <strong>"Create Pull Request"</strong>. Якщо воно вже зникло — тисни нову іконку GitHub на лівій панелі (остання в списку) і там кнопку <strong>"Create Pull Request"</strong>.</li>
              <li><span class="callout-num">2</span> Угорі форми перевір два поля: <strong>Base</strong> — куди вливаємо (має бути <code>develop</code>), і <strong>Merge</strong> — що саме вливаємо (твоя гілка). Їх легко переплутати місцями, тому подивись уважно.</li>
              <li><span class="callout-num">3</span> Напиши заголовок, пару речень опису — і натисни <strong>Create</strong>.</li>
              <li>Готово. PR зʼявиться у списку на тій самій панелі, і його одразу бачать колеги. Код при цьому ще нікуди не влився — це поки тільки запит.</li>
            </ol>
            <details class="alt-way">
              <summary>🌐 Якщо розширення немає — те саме в браузері</summary>
              <ol>
                <li>Відкрий <code>github.com/твій-акаунт/назва-проєкту</code>.</li>
                <li>Одразу після push GitHub сам покаже жовту смужку <strong>"…had recent pushes"</strong> і зелену кнопку <strong>"Compare &amp; pull request"</strong>.</li>
                <li>Якщо смужки немає — вкладка <strong>"Pull requests"</strong> → зелена кнопка <strong>"New pull request"</strong>.</li>
                <li>Перевір списки <strong>base</strong> (develop) і <strong>compare</strong> (твоя гілка), напиши заголовок і натисни <strong>"Create pull request"</strong>.</li>
              </ol>
            </details>
          </div>`;

      case 'review-checks':
        return `
          <div class="mock-github">
            <div class="mock-gh-header">
              <span class="gh-icon">✅</span>
              <span class="gh-pr-title">PR #${GitState.prCounter - 1 || 1}: Approved</span>
              <span class="gh-badge approved">Approved</span>
            </div>
            <div class="mock-gh-body">
              <div class="gh-checks-list">
                <div class="check passed">✅ Build — passed</div>
                <div class="check passed">✅ Tests (47 tests) — passed</div>
                <div class="check passed">✅ Lint — passed</div>
                <div class="check passed">✅ Code review — approved by reviewer</div>
              </div>
              <div class="gh-merge-btn">
                <button class="btn btn-merge" disabled>🔗 Merge pull request</button>
              </div>
            </div>
          </div>
          <div class="vscode-steps">
            <h5>🖥️ Як стежити за перевірками у VS Code</h5>
            ${VSCodeUI.shell(
              'CRM Project — Visual Studio Code',
              VSCodeUI.activityBar('github', 0, { withGitHub: true }),
              VSCodeUI.prPanel({ mode: 'view', hChecks: '2' }),
              VSCodeUI.statusBar('feature/procurement-arrival-date', 0, 0)
            )}
            <ol>
              <li><span class="callout-num">1</span> Натисни іконку GitHub на лівій панелі — там у списку <strong>"Pull Requests"</strong> буде твій запит. Клікни на нього, і праворуч відкриється його сторінка прямо всередині VS Code.</li>
              <li><span class="callout-num">2</span> Блок перевірок оновлюється сам. Поки тести йдуть — жовта крапка 🟡. Коли все добре — зелені галочки ✅. Якщо щось впало — червоний хрестик ❌, і поруч посилання, де написано, який саме тест не пройшов.</li>
              <li><span class="callout-num">3</span> Щоб подивитись самі зміни рядок за рядком — у списку PR розкрий пункт <strong>"Files Changed"</strong>. Файли відкриваються у звичайному вікні порівняння: зліва було, справа стало. Коментар колеги видно прямо біля потрібного рядка коду.</li>
              <li>Якщо треба щось виправити — <strong>не створюй новий PR</strong>. Просто поправ код, зроби ще один коміт і push. Цей самий PR оновиться автоматично, і тести перезапустяться самі.</li>
            </ol>
            <details class="alt-way">
              <summary>🌐 Те саме в браузері</summary>
              <ol>
                <li>Відкрий сторінку свого PR на GitHub і прокрути донизу — там блок перевірок: <strong>"Some checks haven't completed yet"</strong> поки тести йдуть, <strong>"All checks have passed"</strong> коли все добре.</li>
                <li>Вкладка <strong>"Files changed"</strong> угорі показує зміни: зелені рядки — додані, червоні — видалені.</li>
              </ol>
            </details>
          </div>`;

      case 'merge-animation':
        return `
          <svg viewBox="0 0 700 160" class="illustration">
            <line x1="80" y1="50" x2="600" y2="50" stroke="var(--clr-develop)" stroke-width="3"/>
            <circle cx="120" cy="50" r="7" fill="var(--clr-develop)" stroke="#fff" stroke-width="2"/>
            <circle cx="220" cy="50" r="7" fill="var(--clr-develop)" stroke="#fff" stroke-width="2"/>

            <path d="M220 50 C240 50 250 110 280 110" stroke="var(--clr-feature1)" stroke-width="2.5" fill="none"/>
            <line x1="280" y1="110" x2="420" y2="110" stroke="var(--clr-feature1)" stroke-width="3"/>
            <circle cx="350" cy="110" r="7" fill="var(--clr-feature1)" stroke="#fff" stroke-width="2"/>
            <text x="350" y="135" text-anchor="middle" font-size="10" fill="var(--clr-text)">c${GitState.commitCounter - 1}</text>

            <path d="M420 110 C440 110 450 50 480 50" stroke="var(--clr-feature1)" stroke-width="2.5" fill="none" stroke-dasharray="4 3"/>
            <polygon points="480,40 500,50 480,60" fill="var(--clr-develop)" stroke="#fff" stroke-width="2"/>
            <text x="500" y="35" text-anchor="middle" font-size="10" fill="var(--clr-text)">merge</text>

            <text x="50" y="54" text-anchor="end" font-size="12" fill="var(--clr-develop)" font-weight="600">develop</text>
            <text x="50" y="114" text-anchor="end" font-size="11" fill="var(--clr-feature1)" font-weight="600">feature/...</text>
          </svg>
          <div class="vscode-steps">
            <h5>🖥️ Крок 1 — натиснути Merge (теж із VS Code)</h5>
            ${VSCodeUI.shell(
              'CRM Project — Visual Studio Code',
              VSCodeUI.activityBar('github', 0, { withGitHub: true }),
              VSCodeUI.prPanel({ mode: 'view', hMerge: '1' }),
              VSCodeUI.statusBar('feature/procurement-arrival-date', 0, 0)
            )}
            <ol>
              <li><span class="callout-num">1</span> На сторінці свого PR (іконка GitHub на лівій панелі → клік на PR) унизу є кнопка <strong>"Merge Pull Request"</strong>. Вона стає активною тільки коли всі перевірки зелені. Натискаєш — VS Code перепитає спосіб злиття, просто підтверджуєш.</li>
              <li>Статус PR зміниться з <strong>Open</strong> на <strong>Merged</strong> — зміни тепер усередині develop. VS Code одразу запропонує видалити вже непотрібну гілку: можна сміливо погоджуватись, її зміни вже в develop.</li>
            </ol>
            <details class="alt-way">
              <summary>🌐 Те саме в браузері</summary>
              <ol>
                <li>На сторінці PR натисни зелену <strong>"Merge pull request"</strong> → <strong>"Confirm merge"</strong>.</li>
                <li>Потім зʼявиться кнопка <strong>"Delete branch"</strong> — її теж можна натиснути.</li>
              </ol>
            </details>
          </div>
          <div class="vscode-steps">
            <h5>🖥️ А тепер — онови VS Code у себе</h5>
            ${VSCodeUI.shell(
              'CRM Project — Visual Studio Code',
              VSCodeUI.activityBar('explorer', 0),
              VSCodeUI.explorerPanel('<div class="mock-file">📁 procurement</div>'),
              VSCodeUI.statusBar('develop', 0, 1, '1')
            )}
            <ol>
              <li>Переключись на гілку <code>develop</code> (клік на назву гілки внизу зліва → обрати develop зі списку).</li>
              <li><span class="callout-num">1</span> Побачиш <code>↓1</code> біля іконки 🔄 — це той самий коміт, який щойно влили на GitHub через merge.</li>
              <li>Клікни на 🔄, щоб підтягнути ці зміни собі (pull).</li>
            </ol>
          </div>`;

      case 'release':
        return `
          <svg viewBox="0 0 700 160" class="illustration">
            <line x1="80" y1="50" x2="600" y2="50" stroke="var(--clr-main)" stroke-width="3"/>
            <circle cx="120" cy="50" r="7" fill="var(--clr-main)" stroke="#fff" stroke-width="2"/>
            <text x="50" y="54" text-anchor="end" font-size="12" fill="var(--clr-main)" font-weight="700">main</text>

            <line x1="80" y1="110" x2="420" y2="110" stroke="var(--clr-develop)" stroke-width="3"/>
            <circle cx="120" cy="110" r="7" fill="var(--clr-develop)" stroke="#fff" stroke-width="2"/>
            <circle cx="220" cy="110" r="7" fill="var(--clr-develop)" stroke="#fff" stroke-width="2"/>
            <circle cx="320" cy="110" r="7" fill="var(--clr-develop)" stroke="#fff" stroke-width="2"/>
            <text x="50" y="114" text-anchor="end" font-size="12" fill="var(--clr-develop)" font-weight="600">develop</text>

            <path d="M420 110 C440 110 450 50 480 50" stroke="var(--clr-develop)" stroke-width="2.5" fill="none"/>
            <polygon points="480,40 500,50 480,60" fill="var(--clr-main)" stroke="#fff" stroke-width="2"/>
            <text x="490" y="35" text-anchor="middle" font-size="10" fill="var(--clr-text)">merge → main</text>
            <text x="530" y="55" font-size="11" fill="var(--clr-main)">🏷 v1.2.0</text>
          </svg>
          <div class="vscode-steps">
            <h5>🖥️ Як зробити реліз із VS Code</h5>
            <ol>
              <li><span class="callout-num">1</span> Та сама іконка GitHub на лівій панелі → <strong>"Create Pull Request"</strong>, але цього разу інші гілки: <strong>Base: main</strong>, <strong>Merge: develop</strong>. Тобто вливаємо вже не свою окрему гілку, а весь накопичений develop.</li>
              <li><span class="callout-num">2</span> У заголовку зазвичай пишуть щось на кшталт <code>Release v1.2.0</code>, в описі — перелік, що нового потрапляє на бойовий сайт.</li>
              <li><span class="callout-num">3</span> Дочекайся зелених галочок і натисни <strong>"Merge Pull Request"</strong>. Ось тепер код справді в main.</li>
              <li><span class="callout-num">4</span> Мітку версії (tag) зручно поставити прямо з терміналу VS Code (меню <strong>Terminal → New Terminal</strong>):<br>
                <code>git switch main</code> → <code>git pull</code> → <code>git tag v1.2.0</code> → <code>git push origin v1.2.0</code>.<br>
                Мітка — це як наліпка на коробці: потім легко знайти, яка саме версія стояла на сайті в конкретний день.</li>
            </ol>
            <p style="margin-top:8px;font-size:.82rem;color:var(--text-dim);">⚠️ Увага: після цього merge сайт ще НЕ оновився. Що відбувається далі — на наступному кроці.</p>
            <details class="alt-way">
              <summary>🌐 Те саме в браузері</summary>
              <ol>
                <li>Вкладка <strong>"Pull requests"</strong> → <strong>"New pull request"</strong>, зліва <strong>base: main</strong>, справа <strong>compare: develop</strong>.</li>
                <li>Створи PR, дочекайся галочок, натисни <strong>"Merge pull request"</strong>.</li>
                <li>Мітку можна зробити й мишкою: розділ <strong>"Releases"</strong> праворуч → <strong>"Draft a new release"</strong> → створити тег <code>v1.2.0</code>.</li>
              </ol>
            </details>
          </div>`;

      case 'deploy-pipeline':
        return `
          <div class="deploy-visual">
            <div class="deploy-step done"><div class="ds-icon">🔗</div><div class="ds-label">Merge → main</div></div>
            <div class="deploy-connector active"></div>
            <div class="deploy-step done"><div class="ds-icon">📡</div><div class="ds-label">Webhook</div></div>
            <div class="deploy-connector active"></div>
            <div class="deploy-step building"><div class="ds-icon">🔨</div><div class="ds-label">Railway Build</div></div>
            <div class="deploy-connector"></div>
            <div class="deploy-step"><div class="ds-icon">🚀</div><div class="ds-label">Deploy</div></div>
            <div class="deploy-connector"></div>
            <div class="deploy-step"><div class="ds-icon">💚</div><div class="ds-label">Health Check</div></div>
            <div class="deploy-connector"></div>
            <div class="deploy-step"><div class="ds-icon">🌐</div><div class="ds-label">Cloudflare Live</div></div>
          </div>`;

      default:
        return '<div class="illustration-placeholder">📊</div>';
    }
  }
};
