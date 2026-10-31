/* ============================================
   GIT-ENGINE.JS — Git Operation Rules
   ============================================ */

const GitEngine = {

  /* Generate next commit id */
  nextCommitId() {
    GitState.commitCounter++;
    return 'c' + GitState.commitCounter;
  },

  /* Get current branch commits */
  currentCommits() {
    return GitState.branches[GitState.currentBranch] || [];
  },

  /* Check if action is possible, return { ok, reason } */
  canDo(action) {
    const s = GitState;
    const wd = s.workingDir;

    switch (action) {
      case 'fetch':
        return { ok: true };

      case 'pull':
        if (wd.modified.length || wd.staged.length) {
          return { ok: false, reason: 'Є незбережені зміни. Спочатку зробіть commit або stash.' };
        }
        return { ok: true };

      case 'create-branch':
        return { ok: true };

      case 'edit':
        return { ok: true };

      case 'stage':
        if (!wd.modified.length && !wd.untracked.length) {
          return { ok: false, reason: 'Немає змінених файлів для додавання.' };
        }
        return { ok: true };

      case 'commit':
        if (!wd.staged.length) {
          return { ok: false, reason: 'Немає файлів у staging area. Спочатку git add.' };
        }
        return { ok: true };

      case 'push':
        {
          const local = s.branches[s.currentBranch];
          const remote = s.remote[s.currentBranch];
          if (!local) return { ok: false, reason: 'Гілка не існує.' };
          if (remote && remote.length >= local.length &&
              remote[remote.length-1].id === local[local.length-1].id) {
            return { ok: false, reason: 'Все вже запушено. Немає нових комітів.' };
          }
          // Check if remote is ahead (would need force push)
          if (remote && remote.length > local.length) {
            return { ok: false, reason: 'Віддалена гілка попереду. Спочатку git pull.' };
          }
          return { ok: true };
        }

      case 'create-pr':
        {
          if (s.currentBranch === 'main' || s.currentBranch === 'develop') {
            return { ok: false, reason: 'PR створюють з feature-гілки, не з main чи develop.' };
          }
          const remoteB = s.remote[s.currentBranch];
          if (!remoteB || remoteB.length === 0) {
            return { ok: false, reason: 'Спочатку запуште гілку на GitHub (git push).' };
          }
          const existing = s.pullRequests.find(pr => pr.source === s.currentBranch && pr.status === 'open');
          if (existing) {
            return { ok: false, reason: 'PR для цієї гілки вже існує.' };
          }
          return { ok: true };
        }

      case 'approve-pr':
        {
          const openPR = s.pullRequests.find(pr => pr.status === 'open');
          if (!openPR) return { ok: false, reason: 'Немає відкритих PR для затвердження.' };
          return { ok: true, pr: openPR };
        }

      case 'merge':
        {
          const approved = s.pullRequests.find(pr => pr.status === 'approved');
          if (!approved) return { ok: false, reason: 'Немає затверджених PR для злиття.' };
          return { ok: true, pr: approved };
        }

      case 'deploy':
        {
          const mainCommits = s.remote.main;
          if (!mainCommits || mainCommits.length === 0) return { ok: false, reason: 'Немає коду в main.' };
          const latest = mainCommits[mainCommits.length - 1].id;
          if (s.deployment.railway.version === latest && s.deployment.railway.healthy) {
            return { ok: false, reason: 'Ця версія вже задеплоєна і працює.' };
          }
          return { ok: true };
        }

      case 'rollback':
        if (s.deployment.railway.status === 'idle') {
          return { ok: false, reason: 'Немає активного деплою для відкату.' };
        }
        return { ok: true };

      default:
        return { ok: false, reason: 'Невідома дія.' };
    }
  },

  /* Execute actions */

  fetch() {
    saveSnapshot();
    // Copy remote branch tips to local tracking
    for (const [name, commits] of Object.entries(GitState.remote)) {
      // Just mark that we know about remote state
    }
    logAction('📡', 'git fetch', 'Перевірено віддалений репозиторій');
    return { success: true, msg: 'Fetch виконано. Інформація про віддалені гілки оновлена.' };
  },

  pull() {
    const check = this.canDo('pull');
    if (!check.ok) return { success: false, msg: check.reason };

    saveSnapshot();
    const branch = GitState.currentBranch;
    const remote = GitState.remote[branch];
    if (!remote) {
      return { success: true, msg: 'Немає віддаленої гілки для pull.' };
    }

    GitState.branches[branch] = JSON.parse(JSON.stringify(remote));
    logAction('⬇️', `git pull origin ${branch}`, `Локальна гілка ${branch} оновлена`);
    return { success: true, msg: `Гілка ${branch} оновлена з remote.` };
  },

  createBranch(name, from) {
    saveSnapshot();
    from = from || GitState.currentBranch;
    if (GitState.branches[name]) {
      return { success: false, msg: `Гілка ${name} вже існує.` };
    }
    const source = GitState.branches[from];
    if (!source) {
      return { success: false, msg: `Гілка ${from} не існує.` };
    }
    GitState.branches[name] = JSON.parse(JSON.stringify(source));
    GitState.currentBranch = name;
    logAction('🌿', `git checkout -b ${name}`, `Нова гілка від ${from}`);
    return { success: true, msg: `Створено гілку ${name} від ${from}.` };
  },

  editFile(filename, description) {
    saveSnapshot();
    filename = filename || 'procurement.py';
    description = description || 'Додано поле arrival_date';
    if (!GitState.workingDir.modified.includes(filename)) {
      GitState.workingDir.modified.push(filename);
    }
    logAction('✏️', `Змінено ${filename}`, description);
    return { success: true, msg: `Файл ${filename} змінено.` };
  },

  stage(files) {
    const check = this.canDo('stage');
    if (!check.ok) return { success: false, msg: check.reason };

    saveSnapshot();
    const wd = GitState.workingDir;
    const toStage = files || [...wd.modified, ...wd.untracked];
    wd.staged = [...new Set([...wd.staged, ...toStage])];
    wd.modified = wd.modified.filter(f => !toStage.includes(f));
    wd.untracked = wd.untracked.filter(f => !toStage.includes(f));
    logAction('📦', `git add ${toStage.join(' ')}`, `${toStage.length} файл(ів) додано до staging`);
    return { success: true, msg: `Додано до staging: ${toStage.join(', ')}` };
  },

  commit(message) {
    const check = this.canDo('commit');
    if (!check.ok) return { success: false, msg: check.reason };

    saveSnapshot();
    message = message || 'feat: update';
    const id = this.nextCommitId();
    const commit = {
      id,
      msg: message,
      author: 'you',
      ts: GitState.commitCounter,
      files: [...GitState.workingDir.staged]
    };
    GitState.branches[GitState.currentBranch].push(commit);
    GitState.workingDir.staged = [];
    logAction('💾', `git commit -m "${message}"`, `Коміт ${id} на ${GitState.currentBranch}`);
    return { success: true, msg: `Коміт ${id} створено.`, commitId: id };
  },

  push() {
    const check = this.canDo('push');
    if (!check.ok) return { success: false, msg: check.reason };

    saveSnapshot();
    const branch = GitState.currentBranch;
    GitState.remote[branch] = JSON.parse(JSON.stringify(GitState.branches[branch]));
    logAction('⬆️', `git push origin ${branch}`, `Запушено на origin/${branch}`);
    return { success: true, msg: `Запушено на origin/${branch}.` };
  },

  createPR(source, target) {
    source = source || GitState.currentBranch;
    target = target || 'develop';

    const check = this.canDo('create-pr');
    if (!check.ok) return { success: false, msg: check.reason };

    saveSnapshot();
    GitState.prCounter++;
    const pr = {
      id: GitState.prCounter,
      source,
      target,
      status: 'open',
      checks: 'pending',
      reviewStatus: 'pending',
      title: `Merge ${source} → ${target}`,
      commits: GitState.remote[source]?.length || 0
    };
    GitState.pullRequests.push(pr);
    logAction('🔀', `PR #${pr.id}: ${source} → ${target}`, 'Pull Request створено');
    return { success: true, msg: `PR #${pr.id} створено.`, pr };
  },

  approvePR(prId) {
    const pr = prId
      ? GitState.pullRequests.find(p => p.id === prId)
      : GitState.pullRequests.find(p => p.status === 'open');

    if (!pr) return { success: false, msg: 'PR не знайдено.' };

    saveSnapshot();
    pr.checks = 'passed';
    pr.reviewStatus = 'approved';
    pr.status = 'approved';
    logAction('✅', `PR #${pr.id} затверджено`, 'Тести пройшли, ревʼю затверджено');
    return { success: true, msg: `PR #${pr.id} затверджено.`, pr };
  },

  merge(prId) {
    const pr = prId
      ? GitState.pullRequests.find(p => p.id === prId)
      : GitState.pullRequests.find(p => p.status === 'approved');

    if (!pr) return { success: false, msg: 'Немає затвердженого PR.' };

    saveSnapshot();
    // Merge source into target on remote
    const sourceCommits = GitState.remote[pr.source] || [];
    const targetCommits = GitState.remote[pr.target] || [];

    // Add commits from source that aren't in target
    const targetIds = new Set(targetCommits.map(c => c.id));
    const newCommits = sourceCommits.filter(c => !targetIds.has(c.id));

    // Add merge commit
    const mergeId = this.nextCommitId();
    const mergeCommit = {
      id: mergeId,
      msg: `merge: ${pr.source} → ${pr.target}`,
      author: 'github',
      ts: GitState.commitCounter,
      files: [],
      isMerge: true
    };

    GitState.remote[pr.target] = [...targetCommits, ...newCommits, mergeCommit];
    pr.status = 'merged';

    // Optionally delete remote feature branch
    if (pr.source.startsWith('feature/')) {
      // Keep it for visualization but mark as merged
    }

    logAction('🔗', `Merged PR #${pr.id}`, `${pr.source} → ${pr.target}`);
    return { success: true, msg: `PR #${pr.id} злито в ${pr.target}.`, mergeId };
  },

  deploy(branch) {
    branch = branch || 'main';
    const remote = GitState.remote[branch];
    if (!remote || remote.length === 0) {
      return { success: false, msg: 'Немає коду для деплою.' };
    }

    saveSnapshot();
    const version = remote[remote.length - 1].id;
    GitState.deployment.railway = {
      status: 'deploying',
      version,
      branch,
      healthy: false,
      buildLog: ['📦 Installing dependencies...', '🔨 Building...', '🚀 Deploying...']
    };
    logAction('🚀', `Deploy ${version}`, `Railway deploying from ${branch}`);

    // Simulate async deploy
    setTimeout(() => {
      GitState.deployment.railway.status = 'running';
      GitState.deployment.railway.healthy = true;
      GitState.deployment.railway.buildLog.push('✅ Health check passed');
      logAction('✅', `Deploy complete`, `Version ${version} is live`);
      if (typeof renderAll === 'function') renderAll();
    }, 1500);

    return { success: true, msg: `Деплой версії ${version} розпочато...` };
  },

  rollback() {
    saveSnapshot();
    GitState.deployment.railway.status = 'rolling-back';
    logAction('⏪', 'Rollback', 'Відкат до попередньої версії');

    setTimeout(() => {
      GitState.deployment.railway.status = 'running';
      GitState.deployment.railway.healthy = true;
      GitState.deployment.railway.buildLog = ['⏪ Rolled back', '✅ Previous version restored'];
      logAction('✅', 'Rollback complete', 'Попередня версія відновлена');
      if (typeof renderAll === 'function') renderAll();
    }, 1000);

    return { success: true, msg: 'Відкат розпочато...' };
  },

  /* Checkout existing branch */
  checkout(branch) {
    if (!GitState.branches[branch]) {
      return { success: false, msg: `Гілка ${branch} не існує.` };
    }
    if (GitState.workingDir.modified.length || GitState.workingDir.staged.length) {
      return { success: false, msg: 'Є незбережені зміни. Спочатку commit або stash.' };
    }
    saveSnapshot();
    GitState.currentBranch = branch;
    logAction('🔄', `git checkout ${branch}`, `Переключено на ${branch}`);
    return { success: true, msg: `Переключено на гілку ${branch}.` };
  }
};
