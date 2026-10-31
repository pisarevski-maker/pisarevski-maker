/* ============================================
   APP.JS — Main Application Controller
   ============================================ */

const App = {

  currentMode: 'tutorial',

  init() {
    // Set up navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchMode(btn.dataset.mode);
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (this.currentMode === 'tutorial') {
        if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); Tutorial.next(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); Tutorial.prev(); }
      }
    });

    // Start with tutorial
    this.switchMode('tutorial');

    // Toggle panels
    document.querySelectorAll('.panel-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (target) target.classList.toggle('collapsed');
      });
    });
  },

  switchMode(mode) {
    this.currentMode = mode;
    GitState.tutorialMode = mode;

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Show/hide content sections
    document.querySelectorAll('.mode-content').forEach(el => {
      el.classList.toggle('hidden', el.id !== `${mode}-content`);
    });

    // Initialize the mode
    switch (mode) {
      case 'tutorial':
        Tutorial.render();
        break;
      case 'sandbox':
        Sandbox.init();
        break;
      case 'failures':
        FailureLab.init();
        break;
      case 'quiz':
        Quiz.init();
        break;
    }

    renderAll();
  }
};

function renderAll() {
  // Update pipeline bar
  const pipelineBar = document.getElementById('pipeline-bar');
  if (pipelineBar) pipelineBar.innerHTML = Visualizer.renderPipeline();
}

/* Glossary toggle */
function toggleGlossary() {
  const panel = document.getElementById('glossary-panel');
  if (panel) panel.classList.toggle('open');
}

function toggleCheatsheet() {
  const panel = document.getElementById('cheatsheet-panel');
  if (panel) panel.classList.toggle('open');
}

/* Init on DOM ready */
document.addEventListener('DOMContentLoaded', () => App.init());
