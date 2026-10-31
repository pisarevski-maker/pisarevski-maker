/* ============================================
   STATE.JS — Git Simulator State Management
   ============================================ */

const GitState = {
  // Current branch
  currentBranch: 'main',

  // Branches: { name: [commits] }
  branches: {
    main: [
      { id: 'c1', msg: 'init: project setup', author: 'team', ts: 1, files: ['README.md', 'package.json'] }
    ]
  },

  // Remote branches (origin/)
  remote: {
    main: [
      { id: 'c1', msg: 'init: project setup', author: 'team', ts: 1, files: ['README.md', 'package.json'] }
    ]
  },

  // Working directory state
  workingDir: {
    modified: [],
    untracked: [],
    staged: [],
    conflicts: []
  },

  // PR list
  pullRequests: [],
  prCounter: 0,

  // Deployment
  deployment: {
    railway: { status: 'idle', version: 'c1', branch: 'main', healthy: true, buildLog: [] },
    cloudflare: { status: 'routing', domain: 'crm.example.com' }
  },

  // Action log
  log: [],

  // Commit counter
  commitCounter: 1,

  // Tutorial
  tutorialStep: 0,
  tutorialMode: 'tutorial', // 'tutorial' | 'sandbox' | 'failures' | 'quiz'

  // Quiz
  quizAnswers: {},

  // Failure lab
  activeFailure: null,
  failureStep: 0
};

/* Deep clone helper */
function cloneState() {
  return JSON.parse(JSON.stringify(GitState));
}

/* State snapshots for undo */
const stateHistory = [];

function saveSnapshot() {
  stateHistory.push(cloneState());
  if (stateHistory.length > 50) stateHistory.shift();
}

/* Reset to initial */
function resetState() {
  Object.assign(GitState, {
    currentBranch: 'main',
    branches: {
      main: [{ id: 'c1', msg: 'init: project setup', author: 'team', ts: 1, files: ['README.md', 'package.json'] }]
    },
    remote: {
      main: [{ id: 'c1', msg: 'init: project setup', author: 'team', ts: 1, files: ['README.md', 'package.json'] }]
    },
    workingDir: { modified: [], untracked: [], staged: [], conflicts: [] },
    pullRequests: [],
    prCounter: 0,
    deployment: {
      railway: { status: 'idle', version: 'c1', branch: 'main', healthy: true, buildLog: [] },
      cloudflare: { status: 'routing', domain: 'crm.example.com' }
    },
    log: [],
    commitCounter: 1,
    tutorialStep: 0,
    activeFailure: null,
    failureStep: 0,
    quizAnswers: {}
  });
}

/* Add to action log */
function logAction(icon, text, detail) {
  GitState.log.unshift({ icon, text, detail, time: new Date().toLocaleTimeString('uk-UA') });
  if (GitState.log.length > 100) GitState.log.pop();
}
