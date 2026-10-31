/* ============================================
   SANDBOX.JS — Free Interactive Sandbox
   ============================================ */

const Sandbox = {

  init() {
    resetState();
    GitState.branches.develop = [
      { id: 'c1', msg: 'init: project setup', author: 'team', ts: 1, files: ['README.md'] }
    ];
    GitState.remote.develop = JSON.parse(JSON.stringify(GitState.branches.develop));
    this.render();
  },

  /* Execute action with validation */
  doAction(action, params) {
    const check = GitEngine.canDo(action);
    if (!check.ok) {
      this.showFeedback('error', check.reason);
      return;
    }

    let result;
    switch (action) {
      case 'fetch':
        result = GitEngine.fetch();
        break;
      case 'pull':
        result = GitEngine.pull();
        break;
      case 'create-branch': {
        const name = params?.name || prompt('Назва нової гілки (наприклад: feature/my-task):');
        if (!name) return;
        result = GitEngine.createBranch(name);
        break;
      }
      case 'edit': {
        const file = params?.file || 'module.py';
        result = GitEngine.editFile(file, params?.desc || 'Зміни у файлі');
        break;
      }
      case 'stage':
        result = GitEngine.stage();
        break;
      case 'commit': {
        const msg = params?.msg || prompt('Повідомлення коміту:') || 'feat: update';
        result = GitEngine.commit(msg);
        break;
      }
      case 'push':
        result = GitEngine.push();
        break;
      case 'create-pr': {
        const target = params?.target || 'develop';
        result = GitEngine.createPR(GitState.currentBranch, target);
        break;
      }
      case 'approve-pr':
        result = GitEngine.approvePR();
        break;
      case 'merge':
        result = GitEngine.merge();
        break;
      case 'deploy':
        result = GitEngine.deploy('main');
        break;
      case 'rollback':
        result = GitEngine.rollback();
        break;
      default:
        result = { success: false, msg: 'Невідома дія' };
    }

    this.showFeedback(result.success ? 'success' : 'error', result.msg);
    this.render();
  },

  showFeedback(type, msg) {
    const el = document.getElementById('sandbox-feedback');
    if (!el) return;
    el.className = `feedback feedback-${type}`;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  },

  render() {
    const container = document.getElementById('sandbox-content');
    if (!container) return;

    // Check which actions are available
    const actions = [
      { id: 'fetch', icon: '📡', label: 'Fetch', desc: 'Перевірити оновлення' },
      { id: 'pull', icon: '⬇️', label: 'Pull', desc: 'Завантажити зміни' },
      { id: 'create-branch', icon: '🌿', label: 'Нова гілка', desc: 'Створити гілку' },
      { id: 'edit', icon: '✏️', label: 'Редагувати', desc: 'Змінити файл' },
      { id: 'stage', icon: '📦', label: 'Stage', desc: 'git add' },
      { id: 'commit', icon: '💾', label: 'Commit', desc: 'Зберегти в історію' },
      { id: 'push', icon: '⬆️', label: 'Push', desc: 'Відправити на GitHub' },
      { id: 'create-pr', icon: '🔀', label: 'Створити PR', desc: 'Pull Request' },
      { id: 'approve-pr', icon: '✅', label: 'Approve PR', desc: 'Затвердити PR' },
      { id: 'merge', icon: '🔗', label: 'Merge', desc: 'Злити PR' },
      { id: 'deploy', icon: '🚀', label: 'Deploy', desc: 'Деплой на Railway' },
      { id: 'rollback', icon: '⏪', label: 'Rollback', desc: 'Відкат' },
    ];

    container.innerHTML = `
      <div class="sandbox-layout">
        <div class="sandbox-panel sandbox-actions">
          <h3>🎮 Дії</h3>
          <div class="action-grid">
            ${actions.map(a => {
              const check = GitEngine.canDo(a.id);
              return `<button class="action-btn ${check.ok ? '' : 'disabled'}"
                        onclick="Sandbox.doAction('${a.id}')"
                        ${check.ok ? '' : `title="${check.reason}"`}>
                <span class="action-icon">${a.icon}</span>
                <span class="action-label">${a.label}</span>
                <span class="action-desc">${a.desc}</span>
              </button>`;
            }).join('')}
          </div>
          <div id="sandbox-feedback" class="feedback" style="display:none"></div>

          <div class="sandbox-branch-selector">
            <label>Поточна гілка:</label>
            <select onchange="Sandbox.switchBranch(this.value)">
              ${Object.keys(GitState.branches).map(b =>
                `<option value="${b}" ${b === GitState.currentBranch ? 'selected' : ''}>${b}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div class="sandbox-panel sandbox-view">
          <h3>📊 Стан репозиторію</h3>
          <div class="sandbox-section">
            <h4>Гілки (local + remote)</h4>
            <div id="sandbox-graph"></div>
          </div>
          <div class="sandbox-section">
            <h4>Робоча директорія</h4>
            ${Visualizer.renderWorkingDir()}
          </div>
          <div class="sandbox-section">
            <h4>Pull Requests</h4>
            ${Visualizer.renderPRs()}
          </div>
          <div class="sandbox-section">
            <h4>Деплой</h4>
            ${Visualizer.renderDeployment()}
          </div>
        </div>

        <div class="sandbox-panel sandbox-log">
          <h3>📜 Історія дій</h3>
          ${Visualizer.renderLog()}
        </div>
      </div>
    `;

    Visualizer.renderBranchGraph('sandbox-graph', true);
    document.getElementById('pipeline-bar').innerHTML = Visualizer.renderPipeline();
  },

  switchBranch(branch) {
    const result = GitEngine.checkout(branch);
    if (!result.success) {
      this.showFeedback('error', result.msg);
    }
    this.render();
  }
};
