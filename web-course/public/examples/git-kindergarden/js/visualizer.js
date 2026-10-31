/* ============================================
   VISUALIZER.JS — SVG Branch & Pipeline Diagrams
   ============================================ */

const Visualizer = {

  /* Ukrainian plural: 1 коміт / 2 коміти / 5 комітів */
  plural(n, one, few, many) {
    const n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
    return many;
  },

  /* Plain-Ukrainian labels for Railway/Cloudflare states */
  railwayLabel(status) {
    return {
      'idle': 'нічого не робить',
      'deploying': 'збирає…',
      'running': 'працює',
      'rolling-back': 'відкочується'
    }[status] || status;
  },
  railwayHint(status) {
    return {
      'idle': 'Railway зараз нічого не збирає — сайт працює на тій версії, яку залили минулого разу.',
      'deploying': 'Railway прямо зараз бере новий код і запускає його. Сайт ще показує стару версію.',
      'running': 'Нова версія вже запущена і обслуговує користувачів.',
      'rolling-back': 'Щось пішло не так — Railway повертає попередню робочу версію.'
    }[status] || '';
  },

  /* Render the environment pipeline (top bar) */
  renderPipeline() {
    const d = GitState.deployment;
    const wd = GitState.workingDir;
    const hasChanges = wd.modified.length + wd.untracked.length + wd.staged.length > 0;
    const branch = GitState.currentBranch;
    const nCommits = this.countLocalCommits();
    const nBranches = Object.keys(GitState.branches).length;
    const nPRs = this.countPRs();

    const railwayClass = d.railway.healthy ? 'env-ok' :
                         d.railway.status === 'deploying' ? 'env-building' : 'env-down';

    return `
    <div class="pipeline">
      <div class="env-card env-vscode ${hasChanges ? 'env-changed' : ''}"
           title="VS Code — редактор, у якому ти пишеш код. ${hasChanges ? 'Зараз у тебе є незбережені в Git зміни у файлах.' : 'Зараз ти нічого не редагуєш — усі зміни вже збережені в комітах.'} Внизу написана гілка, в якій ти працюєш: ${branch}">
        <div class="env-icon">
          <svg viewBox="0 0 32 32" width="28" height="28"><path d="M2 5l10-4 18 14-18 14L2 25V5z" fill="var(--clr-vscode)"/><path d="M12 1l18 14v-4L12 1z" fill="var(--clr-vscode-hi)" opacity=".5"/></svg>
        </div>
        <div class="env-label">VS Code</div>
        <div class="env-detail">${hasChanges ? '● є зміни' : '✓ без змін'}</div>
        <div class="env-branch">${branch}</div>
      </div>
      <div class="env-arrow">
        <svg viewBox="0 0 40 20" width="40" height="20"><path d="M0 10h30m-6-5 6 5-6 5" stroke="var(--clr-arrow)" stroke-width="2" fill="none"/></svg>
      </div>
      <div class="env-card env-git"
           title="Локальний Git — «фотоальбом» на твоєму комп'ютері. Зараз у ньому ${nCommits} ${this.plural(nCommits, 'збережений знімок (коміт)', 'збережені знімки (коміти)', 'збережених знімків (комітів)')} у ${nBranches} ${this.plural(nBranches, 'гілці', 'гілках', 'гілках')}. Ніхто, крім тебе, цього ще не бачить.">
        <div class="env-icon">
          <svg viewBox="0 0 32 32" width="28" height="28"><circle cx="16" cy="16" r="14" fill="var(--clr-git)"/><path d="M10 16h12M16 10v12" stroke="#fff" stroke-width="2.5"/></svg>
        </div>
        <div class="env-label">Local Git</div>
        <div class="env-detail">${nCommits} ${this.plural(nCommits, 'коміт', 'коміти', 'комітів')}</div>
        <div class="env-branch">${nBranches} ${this.plural(nBranches, 'гілка', 'гілки', 'гілок')}</div>
      </div>
      <div class="env-arrow">
        <svg viewBox="0 0 40 20" width="40" height="20">
          <path d="M0 7h30m-6-5 6 5-6 5" stroke="var(--clr-push)" stroke-width="2" fill="none"/>
          <path d="M40 13H10m6 5-6-5 6-5" stroke="var(--clr-pull)" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <div class="env-card env-github"
           title="GitHub — хмарна копія твого альбому, спільна для всієї команди. Відкритих запитів на злиття (Pull Request): ${nPRs}. «origin» — це просто ім'я, яким Git називає цю хмарну копію.">
        <div class="env-icon">
          <svg viewBox="0 0 32 32" width="28" height="28"><circle cx="16" cy="16" r="14" fill="var(--clr-github)"/><path d="M16 6C10.5 6 6 10.5 6 16c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7C10.3 24 9.7 22 9.7 22c-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.8.8.1-.6.3-1.1.6-1.3-2.3-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.8 1a9.7 9.7 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 26 16c0-5.5-4.5-10-10-10z" fill="#fff"/></svg>
        </div>
        <div class="env-label">GitHub</div>
        <div class="env-detail">${nPRs} ${this.plural(nPRs, 'запит', 'запити', 'запитів')} (PR)</div>
        <div class="env-branch">origin</div>
      </div>
      <div class="env-arrow">
        <svg viewBox="0 0 40 20" width="40" height="20"><path d="M0 10h30m-6-5 6 5-6 5" stroke="var(--clr-deploy)" stroke-width="2" fill="none" ${d.railway.status === 'deploying' ? 'class="arrow-pulse"' : ''}/></svg>
      </div>
      <div class="env-card env-railway ${railwayClass}"
           title="Railway — орендований сервер у хмарі, який бере код з гілки main і запускає його як справжній працюючий сайт. ${this.railwayHint(d.railway.status)} Зараз на сервері крутиться версія коду ${d.railway.version}.">
        <div class="env-icon">
          <svg viewBox="0 0 32 32" width="28" height="28"><rect x="4" y="4" width="24" height="24" rx="4" fill="var(--clr-railway)"/><path d="M10 12h12M10 16h12M10 20h12" stroke="#fff" stroke-width="2"/></svg>
        </div>
        <div class="env-label">Railway</div>
        <div class="env-detail">${this.railwayLabel(d.railway.status)}</div>
        <div class="env-branch">версія ${d.railway.version}</div>
      </div>
      <div class="env-arrow">
        <svg viewBox="0 0 40 20" width="40" height="20"><path d="M0 10h30m-6-5 6 5-6 5" stroke="var(--clr-cf)" stroke-width="2" fill="none"/></svg>
      </div>
      <div class="env-card env-cf"
           title="Cloudflare — «вивіска з адресою»: коли людина набирає ${d.cloudflare.domain} у браузері, Cloudflare направляє її на сервер Railway. Самого коду він не бачить і не зберігає.">
        <div class="env-icon">
          <svg viewBox="0 0 32 32" width="28" height="28"><circle cx="16" cy="16" r="14" fill="var(--clr-cf)"/><path d="M8 18c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#fff" stroke-width="2.5" fill="none"/><circle cx="16" cy="18" r="2" fill="#fff"/></svg>
        </div>
        <div class="env-label">Cloudflare</div>
        <div class="env-detail">направляє людей</div>
        <div class="env-branch">${d.cloudflare.domain}</div>
      </div>
    </div>
    <div class="pipeline-caption">
      👆 Це шлях твого коду: <strong>твій редактор → твій комп'ютер → хмара GitHub → сервер → адреса сайту</strong>.
      Цифри тут живі — вони змінюються на кожному кроці туторіалу. Наведи мишкою на будь-яку картку, щоб побачити пояснення.
    </div>`;
  },

  countLocalCommits() {
    let n = 0;
    for (const b of Object.values(GitState.branches)) n += b.length;
    return n;
  },

  countPRs() {
    return GitState.pullRequests.filter(p => p.status === 'open' || p.status === 'approved').length;
  },

  /* Render branch graph as SVG.
     `st` lets the caller draw any state (e.g. the "before" snapshot of a
     tutorial step), not only the live one. `opts.newKeys` is a Set of
     "branch@commitId" keys to mark as newly appeared, and opts.noLegend
     suppresses the legend for side-by-side use. */
  renderBranchGraph(containerId, showRemote, st, opts) {
    const container = document.getElementById(containerId);
    if (!container) return;
    st = st || GitState;
    opts = opts || {};
    const newKeys = opts.newKeys || new Set();

    const allBranches = showRemote
      ? { ...st.branches, ...Object.fromEntries(Object.entries(st.remote).map(([k,v]) => [`origin/${k}`, v])) }
      : st.branches;

    const branchNames = Object.keys(allBranches);
    const colors = {
      main: 'var(--clr-main)',
      develop: 'var(--clr-develop)',
      'origin/main': 'var(--clr-main)',
      'origin/develop': 'var(--clr-develop)'
    };
    const featureColors = ['var(--clr-feature1)', 'var(--clr-feature2)', 'var(--clr-feature3)'];
    let fci = 0;
    branchNames.forEach(b => {
      if (!colors[b]) {
        colors[b] = featureColors[fci % featureColors.length];
        fci++;
      }
    });

    const rowH = 50;
    const colW = 60;
    // Reserve room for the longest branch label, otherwise names like
    // origin/feature/procurement-arrival-date get clipped off the left edge
    // (especially in the narrow before/after columns).
    const longest = branchNames.reduce((m, n) => Math.max(m, n.length), 0);
    const padL = Math.max(150, Math.round(longest * 7.4) + 30);
    const padT = 30;

    // Find max commits across all branches
    let maxCommits = 0;
    for (const commits of Object.values(allBranches)) {
      if (commits.length > maxCommits) maxCommits = commits.length;
    }

    const svgW = padL + (maxCommits + 1) * colW;
    const svgH = padT + branchNames.length * rowH + 20;

    let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="${svgH}" class="branch-svg">`;

    // Draw branch lines and commits
    branchNames.forEach((bName, bi) => {
      const y = padT + bi * rowH + rowH / 2;
      const commits = allBranches[bName];
      const color = colors[bName] || 'var(--clr-feature1)';
      const isRemote = bName.startsWith('origin/');
      const dashStyle = isRemote ? 'stroke-dasharray="6 3"' : '';
      const isCurrent = bName === st.currentBranch;
      const isNewBranch = newKeys.has('branch:' + bName);

      // Branch label
      svg += `<text x="${padL - 10}" y="${y + 4}" text-anchor="end" class="branch-label ${isCurrent ? 'current-branch' : ''}" fill="${color}">${bName}</text>`;
      if (isNewBranch) {
        svg += `<text x="${padL - 10}" y="${y + 17}" text-anchor="end" font-size="9" fill="var(--clr-ok)" font-weight="700">НОВА</text>`;
      }

      // Line
      if (commits.length > 0) {
        const x1 = padL;
        const x2 = padL + (commits.length - 1) * colW;
        svg += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="3" ${dashStyle} stroke-linecap="round"/>`;
      }

      // Commit nodes
      commits.forEach((c, ci) => {
        const cx = padL + ci * colW;
        const r = c.isMerge ? 10 : 7;
        const shape = c.isMerge
          ? `<polygon points="${cx},${y-r} ${cx+r},${y} ${cx},${y+r} ${cx-r},${y}" fill="${color}" stroke="#fff" stroke-width="2"/>`
          : `<circle cx="${cx}" cy="${y}" r="${r}" fill="${color}" stroke="#fff" stroke-width="2"/>`;

        const isNewCommit = newKeys.has(bName + '@' + c.id);
        svg += `<g class="commit-node ${isNewCommit ? 'commit-new' : ''}" data-id="${c.id}" data-msg="${c.msg}">`;
        if (isNewCommit) {
          svg += `<circle cx="${cx}" cy="${y}" r="${r + 5}" fill="none" stroke="var(--clr-ok)" stroke-width="2.5"/>`;
        }
        svg += shape;
        svg += `<text x="${cx}" y="${y - 14}" text-anchor="middle" class="commit-id ${isNewCommit ? 'commit-id-new' : ''}">${c.id}</text>`;
        svg += `</g>`;
      });
    });

    // Draw fork lines (where branch splits from parent)
    branchNames.forEach((bName, bi) => {
      if (bName === 'main' && !bName.startsWith('origin/')) return;
      const commits = allBranches[bName];
      if (commits.length === 0) return;
      const firstCommit = commits[0];

      // Find parent branch that has this commit
      branchNames.forEach((parentName, pi) => {
        if (parentName === bName) return;
        const parentCommits = allBranches[parentName];
        const parentIdx = parentCommits.findIndex(c => c.id === firstCommit.id);
        if (parentIdx >= 0 && pi !== bi) {
          const px = padL + parentIdx * colW;
          const py = padT + pi * rowH + rowH / 2;
          const cy = padT + bi * rowH + rowH / 2;
          const color = colors[bName] || 'var(--clr-feature1)';
          svg += `<path d="M${px} ${py} C${px+20} ${py} ${px+20} ${cy} ${padL} ${cy}" stroke="${color}" stroke-width="2" fill="none" opacity="0.5"/>`;
        }
      });
    });

    svg += '</svg>';

    // Legend — the graph's own visual language, otherwise unexplained
    if (!opts.noLegend) svg += this.graphLegend();

    container.innerHTML = svg;

    // Add tooltips
    container.querySelectorAll('.commit-node').forEach(node => {
      node.addEventListener('mouseenter', (e) => {
        const id = node.dataset.id;
        const msg = node.dataset.msg;
        showTooltip(e, `${id}: ${msg}`);
      });
      node.addEventListener('mouseleave', hideTooltip);
    });
  },

  /* Legend explaining the graph's visual language */
  graphLegend() {
    return `
      <div class="graph-legend">
        <span class="gl-item"><svg width="26" height="8"><line x1="1" y1="4" x2="25" y2="4" stroke="var(--text-dim)" stroke-width="3" stroke-linecap="round"/></svg>
          суцільна лінія = гілка <strong>у тебе на комп'ютері</strong></span>
        <span class="gl-item"><svg width="26" height="8"><line x1="1" y1="4" x2="25" y2="4" stroke="var(--text-dim)" stroke-width="3" stroke-dasharray="6 3" stroke-linecap="round"/></svg>
          пунктир = та сама гілка <strong>у хмарі GitHub</strong> (origin/…)</span>
        <span class="gl-item"><svg width="14" height="14"><circle cx="7" cy="7" r="5" fill="var(--text-dim)"/></svg>
          кружечок = один коміт, <code>c1</code>, <code>c2</code> — його номер</span>
        <span class="gl-item"><svg width="18" height="18"><circle cx="9" cy="9" r="4" fill="var(--text-dim)"/><circle cx="9" cy="9" r="7.5" fill="none" stroke="var(--clr-ok)" stroke-width="2"/></svg>
          зелене кільце = <strong>щойно зʼявилось на цьому кроці</strong></span>
      </div>`;
  },

  /* Which commits/branches are new in `after` compared to `before`.
     Returns a Set of keys the graph renderer understands. */
  diffKeys(before, after) {
    const keys = new Set();
    if (!before) return keys;
    const sides = [['', 'branches'], ['origin/', 'remote']];
    sides.forEach(([prefix, field]) => {
      Object.entries(after[field] || {}).forEach(([name, commits]) => {
        const label = prefix + name;
        const old = (before[field] || {})[name];
        if (!old) keys.add('branch:' + label);
        const oldIds = new Set((old || []).map(c => c.id));
        commits.forEach(c => { if (!oldIds.has(c.id)) keys.add(label + '@' + c.id); });
      });
    });
    return keys;
  },

  /* Plain-language list of what this step actually changed */
  describeDiff(before, after) {
    if (!before) return '';
    const lines = [];
    const tip = cs => (cs && cs.length) ? cs[cs.length - 1].id : null;

    [['', 'branches', 'у тебе на комп\'ютері'], ['origin/', 'remote', 'у хмарі GitHub']].forEach(([prefix, field, where]) => {
      Object.entries(after[field] || {}).forEach(([name, commits]) => {
        const label = prefix + name;
        const old = (before[field] || {})[name];
        if (!old) {
          lines.push(`<li>➕ Зʼявилась нова гілка <strong>${label}</strong> (${where}) — поки що копія того, від чого ти її відгалузив.</li>`);
          return;
        }
        const oldIds = new Set(old.map(c => c.id));
        const added = commits.filter(c => !oldIds.has(c.id));
        if (added.length === 1) {
          lines.push(`<li>📦 У гілці <strong>${label}</strong> (${where}) додався коміт <code>${added[0].id}</code> — «${added[0].msg}».</li>`);
        } else if (added.length > 1) {
          const shown = added.slice(0, 4);
          const list = shown.map(c => `<code>${c.id}</code> («${c.msg}»)`).join(', ');
          const tail = added.length > shown.length ? ` та ще ${added.length - shown.length}` : '';
          lines.push(`<li>📦 У гілці <strong>${label}</strong> (${where}) додалось одразу ${added.length} ${this.plural(added.length, 'коміт', 'коміти', 'комітів')}: ${list}${tail}. `
            + `Так і працює злиття: гілка-отримувач забирає всі коміти з гілки-джерела, плюс один окремий коміт самого злиття.</li>`);
        } else if (tip(old) !== tip(commits)) {
          lines.push(`<li>🔄 Гілка <strong>${label}</strong> тепер вказує на інший коміт: <code>${tip(commits)}</code>.</li>`);
        }
      });
      Object.keys(before[field] || {}).forEach(name => {
        if (!(after[field] || {})[name]) {
          lines.push(`<li>🗑 Гілку <strong>${prefix}${name}</strong> видалено — вона більше не потрібна.</li>`);
        }
      });
    });

    // Working directory
    const wdBefore = before.workingDir, wdAfter = after.workingDir;
    const cnt = wd => wd.modified.length + wd.untracked.length + wd.staged.length;
    if (cnt(wdBefore) === 0 && cnt(wdAfter) > 0) {
      lines.push(`<li>✏️ У редакторі зʼявились незбережені в Git зміни: ${wdAfter.modified.concat(wdAfter.untracked).map(f => `<code>${f}</code>`).join(', ')}.</li>`);
    }
    if (wdBefore.modified.length > 0 && wdAfter.staged.length > wdBefore.staged.length) {
      lines.push(`<li>📦 Файли переїхали в «кошик» (staging) — тепер вони готові до коміту, але ще не закомічені.</li>`);
    }
    if (cnt(wdBefore) > 0 && cnt(wdAfter) === 0) {
      lines.push(`<li>🧹 Робоча директорія очистилась — усе, що лежало в кошику, потрапило в коміт.</li>`);
    }

    // Branch switch
    if (before.currentBranch !== after.currentBranch) {
      lines.push(`<li>🔀 Ти перемкнувся з гілки <strong>${before.currentBranch}</strong> на <strong>${after.currentBranch}</strong>.</li>`);
    }

    // Pull requests
    const prBefore = before.pullRequests || [], prAfter = after.pullRequests || [];
    if (prAfter.length > prBefore.length) {
      const fresh = prAfter[prAfter.length - 1];
      const note = fresh.status === 'merged'
        ? 'І його одразу ж влили — тому зміни вже всередині цільової гілки.'
        : 'Код ще нікуди не влився — це поки тільки запит на перевірку.';
      lines.push(`<li>🔀 Створено Pull Request <strong>#${fresh.id}</strong>: ${fresh.source} → ${fresh.target}. ${note}</li>`);
    }
    prAfter.forEach(pr => {
      const old = prBefore.find(p => p.id === pr.id);
      if (old && old.status !== pr.status) {
        const label = { approved: 'затверджено ✅', merged: 'влито (merged) 🟣', closed: 'закрито' }[pr.status] || pr.status;
        lines.push(`<li>🔎 PR <strong>#${pr.id}</strong>: статус змінився на <strong>${label}</strong>.</li>`);
      }
    });

    // Deployment
    const rB = before.deployment.railway, rA = after.deployment.railway;
    if (rB.status !== rA.status || rB.version !== rA.version) {
      lines.push(`<li>🚀 Railway: <strong>${this.railwayLabel(rB.status)}</strong> → <strong>${this.railwayLabel(rA.status)}</strong>, версія на сервері: <code>${rB.version}</code> → <code>${rA.version}</code>.</li>`);
    }

    if (!lines.length) {
      return '<div class="diff-none">На цьому кроці стан гілок не змінився — цей крок про те, що відбувається поза твоїм комп\'ютером.</div>';
    }
    return `<ul class="diff-list">${lines.join('')}</ul>`;
  },

  /* Plain-language summary of the current branch state — the conclusion
     a beginner struggles to read off the raw graph: which branches are
     identical, which have diverged, and whether push/pull is needed. */
  describeBranches() {
    const local = GitState.branches;
    const remote = GitState.remote;
    const tipOf = commits => (commits && commits.length) ? commits[commits.length - 1].id : null;

    // Group every visible branch (local + origin/*) by its tip commit id
    const all = { ...local, ...Object.fromEntries(Object.entries(remote).map(([k, v]) => [`origin/${k}`, v])) };
    const groups = {};
    Object.entries(all).forEach(([name, commits]) => {
      const key = tipOf(commits) || '(порожньо)';
      (groups[key] = groups[key] || []).push(name);
    });

    const lines = [];

    Object.entries(groups).forEach(([tip, names]) => {
      if (names.length > 1) {
        lines.push(`<div class="bs-line bs-same">🟢 <strong>${names.join(', ')}</strong> — усі вказують на один і той самий коміт <code>${tip}</code>. Це означає: вони абсолютно ідентичні, жодної різниці в коді між ними немає.</div>`);
      }
    });

    // Pure arithmetic fact: how many commits each group has, regardless of
    // whether the branches are related at all. True even between branches
    // that have nothing to do with each other (e.g. develop vs main) —
    // just stated as a number, not as "needs syncing".
    const groupList = Object.entries(groups).map(([tip, names]) => ({
      tip, names, count: (all[names[0]] || []).length
    }));
    const distinctCounts = new Set(groupList.map(g => g.count));
    if (groupList.length > 1 && distinctCounts.size > 1) {
      groupList.sort((a, b) => b.count - a.count);
      const countItems = groupList.map(g =>
        `<li><strong>${g.names.join(', ')}</strong> — ${g.count} ${g.count === 1 ? 'коміт' : 'коміти'} в історії (до <code>${g.tip}</code>)</li>`
      ).join('');
      lines.push(`
        <div class="bs-line bs-count">
          🔢 <strong>Чисто за кількістю комітів</strong> (просто факт, незалежно від того, споріднені гілки чи ні):
          <ul>${countItems}</ul>
          Перші в цьому списку технічно "випереджають" наступні — у них довша історія. Це правда навіть для гілок, які одна з одною взагалі не повʼязані (наприклад, develop і main): це просто арифметика, скільки комітів у кожній. Але це не сигнал "треба щось синхронізувати" — для цього порівнюють тільки гілку з ЇЇ ВЛАСНОЮ хмарною копією (нижче).
        </div>`);
    }

    // Compare each local branch with its own origin/<name> counterpart
    Object.keys(local).forEach(b => {
      if (!remote[b]) {
        lines.push(`<div class="bs-line bs-local-only">🟡 <strong>${b}</strong> існує поки тільки в тебе локально — на GitHub (origin) цієї гілки ще немає, бо її ще не запушили.</div>`);
        return;
      }
      const lt = tipOf(local[b]);
      const rt = tipOf(remote[b]);
      if (lt !== rt) {
        const diff = local[b].length - remote[b].length;
        if (diff > 0) {
          lines.push(`<div class="bs-line bs-ahead">🔵 <strong>${b}</strong> випереджає <strong>origin/${b}</strong> на ${diff} коміт(и) — у тебе є локальні зміни, яких ще немає на GitHub (потрібен <code>push</code>).</div>`);
        } else if (diff < 0) {
          lines.push(`<div class="bs-line bs-behind">🟠 <strong>origin/${b}</strong> випереджає <strong>${b}</strong> на ${-diff} коміт(и) — на GitHub зʼявились зміни, яких у тебе ще немає локально (потрібен <code>pull</code>).</div>`);
        } else {
          lines.push(`<div class="bs-line bs-ahead">🔵 <strong>${b}</strong> і <strong>origin/${b}</strong> мають однакову кількість комітів, але це різні коміти — історія розійшлась (можливий конфлікт при злитті).</div>`);
        }
      }
    });

    if (!lines.length) {
      lines.push(`<div class="bs-line bs-same">🟢 Усі гілки зараз однакові.</div>`);
    }

    return `<div class="branch-summary">${lines.join('')}</div>`;
  },

  /* Render working directory status */
  renderWorkingDir() {
    const wd = GitState.workingDir;
    const busy = wd.modified.length || wd.untracked.length || wd.staged.length || wd.conflicts.length;
    let html = '<div class="wd-status">';
    html += '<div class="wd-title">📁 Файли, з якими ти зараз працюєш у редакторі</div>';

    if (wd.modified.length) {
      html += '<div class="wd-section wd-modified"><span class="wd-badge mod">M</span>'
        + '<span><strong>Змінені (Modified)</strong> — ти їх відредагував і зберіг у редакторі, але Git їх ще НЕ сфотографував. Поки що не потрапляють у жоден коміт: '
        + wd.modified.map(f => `<span class="wd-file">${f}</span>`).join(', ')
        + '</span></div>';
    }
    if (wd.untracked.length) {
      html += '<div class="wd-section wd-untracked"><span class="wd-badge new">U</span>'
        + '<span><strong>Нові (Untracked)</strong> — ці файли Git взагалі бачить уперше, ти їх щойно створив: '
        + wd.untracked.map(f => `<span class="wd-file">${f}</span>`).join(', ')
        + '</span></div>';
    }
    if (wd.staged.length) {
      html += '<div class="wd-section wd-staged"><span class="wd-badge staged">S</span>'
        + '<span><strong>У кошику (Staged)</strong> — ти вже сказав Git «цi бери в наступне фото», але сам коміт ще не зроблено: '
        + wd.staged.map(f => `<span class="wd-file">${f}</span>`).join(', ')
        + '</span></div>';
    }
    if (wd.conflicts.length) {
      html += '<div class="wd-section wd-conflict"><span class="wd-badge conflict">!</span>'
        + '<span><strong>Конфлікт</strong> — ти і хтось інший змінили те саме місце, Git не знає, чий варіант лишити. Треба відкрити файл і вибрати вручну: '
        + wd.conflicts.map(f => `<span class="wd-file">${f}</span>`).join(', ')
        + '</span></div>';
    }
    if (!busy) {
      html += '<div class="wd-clean">✓ <strong>Зараз ти нічого не редагуєш</strong> — усе, що ти робив, уже збережено в комітах. '
        + 'Це і називають «робоча директорія чиста»: немає жодного недозбереженого файлу, нічого не загубиться. '
        + 'У VS Code це видно так: на іконці Source Control немає синьої цифри.</div>';
    }

    html += '</div>';
    return html;
  },

  /* Render action log */
  renderLog() {
    if (!GitState.log.length) return '<div class="log-empty">Історія порожня</div>';
    return GitState.log.slice(0, 15).map(e =>
      `<div class="log-entry"><span class="log-icon">${e.icon}</span><span class="log-text">${e.text}</span><span class="log-time">${e.time}</span></div>`
    ).join('');
  },

  /* Render deployment status */
  renderDeployment() {
    const r = GitState.deployment.railway;
    const cf = GitState.deployment.cloudflare;
    const statusIcon = r.healthy ? '🟢' : r.status === 'deploying' ? '🟡' : '🔴';

    return `
      <div class="deploy-info">
        <div class="deploy-row">${statusIcon} Railway: <strong>${r.status}</strong></div>
        <div class="deploy-row">Версія: <code>${r.version}</code> (${r.branch})</div>
        <div class="deploy-row">🌐 ${cf.domain} → ${cf.status}</div>
        ${r.buildLog.length ? '<div class="build-log">' + r.buildLog.map(l => `<div>${l}</div>`).join('') + '</div>' : ''}
      </div>`;
  },

  /* Render PR list */
  renderPRs() {
    if (!GitState.pullRequests.length) return '<div class="pr-empty">Немає Pull Requests</div>';
    return GitState.pullRequests.map(pr => {
      const statusIcon = { open: '🟡', approved: '🟢', merged: '🟣', closed: '🔴' }[pr.status] || '⚪';
      return `<div class="pr-card pr-${pr.status}">
        <span class="pr-status">${statusIcon}</span>
        <span class="pr-title">#${pr.id} ${pr.title}</span>
        <span class="pr-badge">${pr.status}</span>
      </div>`;
    }).join('');
  }
};

/* ============================================
   VS Code IDE mockup helpers — realistic 1:1 UI
   ============================================ */
const VSCodeUI = {
  icons: {
    explorer: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="6"/><line x1="15" y1="15" x2="20" y2="20"/></svg>',
    sourceControl: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="12" r="2.4"/><path d="M6 8.4V15.6M6 10c0 3 3 2 6 2h3.5"/></svg>',
    debug: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 4l14 8-14 8z"/></svg>',
    extensions: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg>',
    branch: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="2"><circle cx="6" cy="6" r="1.8"/><circle cx="6" cy="18" r="1.8"/><circle cx="18" cy="12" r="1.8"/><path d="M6 8V16M6 10c0 2 2 2 5 2h3"/></svg>',
    sync: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="2.2"><path d="M4 12a8 8 0 0 1 14-5.2M20 12a8 8 0 0 1-14 5.2"/><path d="M18 3v4h-4M6 21v-4h4"/></svg>',
    githubPR: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="5" r="2.2"/><circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="19" r="2.2"/><path d="M6 7.2v9.6"/><path d="M18 16.8V10a3 3 0 0 0-3-3h-3.4l2-2m-2 2 2 2"/></svg>'
  },

  /* Activity Bar — leftmost strip of icons.
     `active`: 'explorer'|'search'|'sourceControl'|'debug'|'extensions'|'github',
     add '-highlight' to any of them to draw the orange callout ring.
     opts.withGitHub adds the icon that the GitHub Pull Requests extension installs.
     opts.pin sets the callout number shown on the highlighted icon. */
  activityBar(active, scBadge, opts) {
    opts = opts || {};
    const items = [
      ['explorer', this.icons.explorer],
      ['search', this.icons.search],
      ['sourceControl', this.icons.sourceControl],
      ['debug', this.icons.debug],
      ['extensions', this.icons.extensions]
    ];
    if (opts.withGitHub) items.push(['github', this.icons.githubPR]);

    const base = String(active || '').replace('-highlight', '');
    const highlighted = String(active || '').endsWith('-highlight');

    return `<div class="activity-bar">${items.map(([key, svg]) => {
      const isActive = key === base;
      const isHot = isActive && highlighted;
      return `
      <div class="activity-icon ui-pin ${isActive ? 'active' : ''} ${isHot ? 'ui-highlight' : ''}">
        ${svg}
        ${key === 'sourceControl' && scBadge ? `<span class="activity-badge">${scBadge}</span>` : ''}
        ${isHot && opts.pin ? `<span class="callout-num">${opts.pin}</span>` : ''}
      </div>`;
    }).join('')}
    </div>`;
  },

  /* "GitHub Pull Requests" extension panel — create form or PR view */
  prPanel(opts) {
    opts = opts || {};
    const pin = (n) => n ? `<span class="callout-num">${n}</span>` : '';
    const hot = (n) => n ? 'ui-highlight' : '';

    if (opts.mode === 'create') {
      return `
        <div class="sc-panel" style="width:320px;">
          <div class="sc-panel-header">GitHub Pull Requests</div>
          <div class="pr-form">
            <div class="pr-field">
              <div class="pr-field-label">Base — куди вливаємо</div>
              <div class="pr-field-value ui-pin ${hot(opts.hBase)}">⎇ develop${pin(opts.hBase)}</div>
            </div>
            <div class="pr-field">
              <div class="pr-field-label">Merge — що саме вливаємо</div>
              <div class="pr-field-value">⎇ feature/procurement-arrival-date</div>
            </div>
            <div class="pr-field">
              <div class="pr-field-label">Title</div>
              <div class="pr-field-value ui-pin ${hot(opts.hTitle)}">Add arrival date to procurement${pin(opts.hTitle)}</div>
            </div>
            <button class="sc-commit-btn ui-pin ${hot(opts.hCreate)}">Create${pin(opts.hCreate)}</button>
          </div>
        </div>`;
    }

    // mode: 'view' — an open PR with its checks and the merge button
    const checks = opts.checks || [
      { icon: '✅', text: 'build — passed', cls: 'ok' },
      { icon: '✅', text: 'tests (47) — passed', cls: 'ok' },
      { icon: '✅', text: 'lint — passed', cls: 'ok' }
    ];
    return `
      <div class="sc-panel" style="width:320px;">
        <div class="sc-panel-header">Pull Request #1</div>
        <div class="pr-form">
          <div class="pr-view-title">Add arrival date to procurement</div>
          <div class="pr-view-meta">⎇ feature/procurement-arrival-date → develop</div>
          <div class="pr-checks ui-pin ${hot(opts.hChecks)}">
            ${checks.map(c => `<div class="pr-check ${c.cls}">${c.icon} ${c.text}</div>`).join('')}
            ${pin(opts.hChecks)}
          </div>
          <button class="sc-commit-btn pr-merge-btn ui-pin ${hot(opts.hMerge)}">Merge Pull Request${pin(opts.hMerge)}</button>
        </div>
      </div>`;
  },

  /* Status Bar — bottom strip with branch name + sync arrows */
  statusBar(branch, ahead, behind, highlight) {
    const syncLabel = (ahead || behind)
      ? `${behind ? '↓' + behind + ' ' : ''}${ahead ? '↑' + ahead : ''}`.trim()
      : '';
    return `
      <div class="vscode-status-bar">
        <div class="status-bar-left">
          <span class="status-bar-item">${this.icons.branch} ${branch}</span>
          <span class="status-bar-item ui-pin ${highlight ? 'ui-highlight' : ''}">${this.icons.sync} ${syncLabel}
            ${highlight ? '<span class="callout-num">' + highlight + '</span>' : ''}
          </span>
        </div>
        <div></div>
      </div>`;
  },

  /* One row in the Source Control "Changes" / "Staged Changes" list */
  fileRow(name, folder, status, opts) {
    opts = opts || {};
    const icon = opts.staged ? '−' : '+';
    return `
      <div class="sc-file-row ui-pin ${opts.highlight ? 'ui-highlight' : ''}">
        <span class="sc-fname">${opts.staged ? '●' : ''} ${name}${folder ? `<span class="sc-fpath">${folder}</span>` : ''}</span>
        <span style="display:flex;align-items:center;gap:6px;">
          <span class="sc-stage-icon">${icon}</span>
          <span class="sc-status-letter ${status}">${status}</span>
        </span>
        ${opts.highlight ? '<span class="callout-num">' + opts.highlight + '</span>' : ''}
      </div>`;
  },

  /* Full Source Control panel: message box + Staged Changes + Changes */
  sourceControlPanel(opts) {
    opts = opts || {};
    const staged = opts.staged || [];
    const changes = opts.changes || [];
    return `
      <div class="sc-panel">
        <div class="sc-panel-header">Source Control</div>
        <div class="sc-message-box ui-pin ${opts.highlightMessage ? 'ui-highlight' : ''} ${opts.message ? '' : 'placeholder'}">
          ${opts.message || 'Message (Ctrl+Enter to commit)'}
          ${opts.highlightMessage ? '<span class="callout-num">' + opts.highlightMessage + '</span>' : ''}
        </div>
        <button class="sc-commit-btn ui-pin ${opts.highlightCommit ? 'ui-highlight' : ''}">✓ Commit
          ${opts.highlightCommit ? '<span class="callout-num">' + opts.highlightCommit + '</span>' : ''}
        </button>
        ${staged.length ? `
          <div class="sc-section-header"><span>Staged Changes<span class="sc-count">${staged.length}</span></span><span class="sc-action-icon">−</span></div>
          ${staged.map(f => this.fileRow(f.name, f.folder, f.status, { staged: true, highlight: f.highlight })).join('')}
        ` : ''}
        ${changes.length ? `
          <div class="sc-section-header"><span>Changes<span class="sc-count">${changes.length}</span></span><span class="sc-action-icon ui-pin ${opts.highlightStageAll ? 'ui-highlight' : ''}">+${opts.highlightStageAll ? '<span class="callout-num">' + opts.highlightStageAll + '</span>' : ''}</span></div>
          ${changes.map(f => this.fileRow(f.name, f.folder, f.status, { highlight: f.highlight })).join('')}
        ` : ''}
      </div>`;
  },

  /* Explorer file tree (plain sidebar, used when Source Control isn't the focus) */
  explorerPanel(filesHTML) {
    return `<div class="mock-sidebar" style="width:280px;">${filesHTML}</div>`;
  },

  /* Assemble the full IDE window */
  shell(titleText, activityHTML, sidebarHTML, statusBarHTML, mainHTML) {
    return `
      <div class="vscode-ide">
        <div class="mock-title-bar">
          <span class="mock-dots"><i></i><i></i><i></i></span>
          <span>${titleText}</span>
        </div>
        <div class="vscode-ide-body">
          ${activityHTML}
          ${sidebarHTML}
          ${mainHTML || ''}
        </div>
        ${statusBarHTML}
      </div>`;
  }
};

/* Tooltip helpers */
let tooltipEl = null;
function showTooltip(e, text) {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip';
    document.body.appendChild(tooltipEl);
  }
  tooltipEl.textContent = text;
  tooltipEl.style.left = e.pageX + 10 + 'px';
  tooltipEl.style.top = e.pageY - 30 + 'px';
  tooltipEl.classList.add('visible');
}
function hideTooltip() {
  if (tooltipEl) tooltipEl.classList.remove('visible');
}
