import { ppdtCategory } from './data/ppdtData.js';
import { tatCategory } from './data/tatPrompts.js';
import { watCategory } from './data/watWords.js';
import { srtCategory } from './data/srtSituations.js';
import { sdCategory } from './data/sdData.js';
import { buildPracticeRoute, parsePracticeRoute, DEFAULT_PRACTICE_CATEGORY } from './utils/practiceRouting.js';
import { loadJSON, saveJSON } from './utils/storage.js';
import { formatDuration } from './pages/shared.js';
import { mountPPDTPractice } from './pages/PPDTPractice.js';
import { mountTATPractice } from './pages/TATPractice.js';
import { mountWATPractice } from './pages/WATPractice.js';
import { mountSRTPractice } from './pages/SRTPractice.js';
import { mountSDPractice } from './pages/SDPractice.js';

const PRACTICE_HOME_KEY = 'ssb-practice-home';
const PRACTICE_ANALYTICS_KEY = 'ssb-practice-analytics';

const practiceCatalog = {
  ppdt: ppdtCategory,
  tat: tatCategory,
  wat: watCategory,
  srt: srtCategory,
  sd: sdCategory,
};

const shell = {
  quickBar: document.querySelector('.contact-quick-bar'),
  topbar: document.querySelector('.topbar'),
  main: document.querySelector('main'),
  footer: document.querySelector('.footer'),
  practiceRoot: document.getElementById('practiceAppRoot'),
  categoryList: document.getElementById('practiceCategoryList'),
  homeEmpty: document.getElementById('practiceHomeEmpty'),
  homeView: document.getElementById('practiceHomeView'),
  tag: document.getElementById('practiceTestTag'),
  title: document.getElementById('practiceTestTitle'),
  description: document.getElementById('practiceTestDescription'),
  search: document.getElementById('practiceSearch'),
  difficulty: document.getElementById('practiceDifficultyFilter'),
  setCount: document.getElementById('practiceSetCount'),
  completedCount: document.getElementById('practiceCompletedCount'),
  routeLabel: document.getElementById('practiceRouteLabel'),
  selectedSet: document.getElementById('practiceSelectedSet'),
  setGrid: document.getElementById('practiceSetGrid'),
  emptyState: document.getElementById('practiceEmptyState'),
};

const defaultHomeState = {
  categoryId: null,
  search: '',
  difficulty: 'all',
};

const defaultAnalytics = {
  sessions: {},
  totalPracticeSeconds: 0,
  attemptedQuestions: 0,
};

let homeState = { ...defaultHomeState, ...loadJSON(PRACTICE_HOME_KEY, defaultHomeState) };
let analyticsState = { ...defaultAnalytics, ...loadJSON(PRACTICE_ANALYTICS_KEY, defaultAnalytics) };
let activeSession = null;

function getCategory(categoryId) {
  return practiceCatalog[categoryId] || practiceCatalog[DEFAULT_PRACTICE_CATEGORY];
}

function getSet(category, setId) {
  return category.sets.find((set) => set.id === setId) || category.sets[0];
}

function getRouteFromLocation() {
  const parsed = parsePracticeRoute(window.location.pathname);

  if (parsed.kind === 'session') {
    const category = getCategory(parsed.categoryId);
    const practiceSet = getSet(category, parsed.setId);
    return {
      kind: 'session',
      categoryId: category.id,
      setId: practiceSet.id,
      route: buildPracticeRoute(category.id, practiceSet.id),
    };
  }

  return { kind: 'home', route: '/' };
}

function saveHomeState() {
  saveJSON(PRACTICE_HOME_KEY, homeState);
}

function saveAnalyticsState() {
  saveJSON(PRACTICE_ANALYTICS_KEY, analyticsState);
}

function getAnalyticsSummary() {
  const completedTests = Object.keys(analyticsState.sessions).length;
  return `${completedTests} completed | ${analyticsState.attemptedQuestions} attempted | ${formatDuration(analyticsState.totalPracticeSeconds)}`;
}

function getVisibleSets(category) {
  const searchTerm = homeState.search.trim().toLowerCase();

  return category.sets.filter((set) => {
    const haystack = `${set.title} ${set.description} ${set.duration} ${set.difficulty} ${set.countLabel}`.toLowerCase();
    const matchesSearch = !searchTerm || haystack.includes(searchTerm);
    const matchesDifficulty = homeState.difficulty === 'all' || set.difficulty === homeState.difficulty;
    return matchesSearch && matchesDifficulty;
  });
}

function renderCategoryButton(category) {
  const isActive = category.id === homeState.categoryId;
  return `
    <button type="button" class="practice-tab${isActive ? ' active' : ''}" data-category="${category.id}" aria-selected="${String(isActive)}">
      <span>${category.short}</span>
      <span class="practice-tab-count">${category.sets.length} sets</span>
    </button>
  `;
}

function renderSetCard(category, set, isActive) {
  const route = buildPracticeRoute(category.id, set.id);
  const completed = Boolean(analyticsState.sessions[route]);

  return `
    <article class="practice-set-card${isActive ? ' is-active' : ''}" data-route="${route}">
      <div class="practice-set-card__thumb" style="--thumb-start: ${set.thumbnail.from}; --thumb-end: ${set.thumbnail.to};">
        <span>${set.thumbnail.label}</span>
        <span class="practice-badge${completed ? ' practice-badge--success' : ''}">${completed ? 'Completed' : set.difficulty}</span>
      </div>
      <div class="practice-set-card__body">
        <div class="practice-set-card__header">
          <h4>${set.title}</h4>
        </div>
        <p class="practice-set-card__description">${set.description}</p>
        <div class="practice-set-card__meta">
          <span>${set.duration}</span>
          <span>${set.countLabel}</span>
        </div>
        <div class="practice-set-card__footer">
          <span class="practice-set-card__route">${route}</span>
          <button type="button" class="btn btn-primary" data-practice-action="start" data-route="${route}" onclick="navigateToPractice('${category.id}','${set.id}')">Start Practice</button>
        </div>
      </div>
    </article>
  `;
}

function renderSelectedSet(category, activeSet, visibleSets) {
  const route = buildPracticeRoute(category.id, activeSet.id);
  const completed = Boolean(analyticsState.sessions[route]);

  return `
    <div class="practice-detail__top">
      <div>
        <div class="practice-detail__eyebrow">${category.tag}</div>
        <h4 class="practice-detail__title">${activeSet.title}</h4>
        <p class="practice-detail__description">${activeSet.description}</p>
      </div>
      <span class="practice-badge${completed ? ' practice-badge--success' : ''}">${completed ? 'Completed' : activeSet.difficulty}</span>
    </div>
    <div class="practice-detail__grid">
      <div class="practice-detail__metric"><strong>${activeSet.duration}</strong><span>Duration</span></div>
      <div class="practice-detail__metric"><strong>${activeSet.countLabel}</strong><span>${category.countsLabel}</span></div>
      <div class="practice-detail__metric"><strong>${visibleSets.length}</strong><span>Visible sets</span></div>
    </div>
    <div class="practice-detail__actions">
      <button type="button" class="btn btn-primary" data-practice-action="start" data-route="${route}" onclick="navigateToPractice('${category.id}','${activeSet.id}')">Start Practice</button>
      <span class="practice-route-label">${route}</span>
    </div>
  `;
}

function renderHome() {
  const selectedCategory = homeState.categoryId ? getCategory(homeState.categoryId) : null;
  const visibleSets = selectedCategory ? getVisibleSets(selectedCategory) : [];
  const selectedSet = selectedCategory ? getSet(selectedCategory, visibleSets[0]?.id || selectedCategory.sets[0].id) : null;
  const completedCount = selectedCategory
    ? visibleSets.filter((set) => analyticsState.sessions[buildPracticeRoute(selectedCategory.id, set.id)]).length
    : Object.keys(analyticsState.sessions).length;
  const completionPercent = selectedCategory && visibleSets.length > 0 ? Math.round((completedCount / visibleSets.length) * 100) : 0;

  shell.categoryList.innerHTML = Object.values(practiceCatalog).map(renderCategoryButton).join('');
  shell.search.value = homeState.search;
  shell.difficulty.value = homeState.difficulty;
  shell.setCount.textContent = String(visibleSets.length || 0);
  shell.completedCount.textContent = String(completedCount);
  shell.routeLabel.textContent = selectedCategory ? buildPracticeRoute(selectedCategory.id, selectedSet.id) : 'Choose a category to reveal sets';
  shell.tag.textContent = selectedCategory ? selectedCategory.tag : 'SSB PRACTICE';
  shell.title.textContent = selectedCategory ? selectedCategory.title : 'Practice Tests';
  shell.description.textContent = selectedCategory
    ? selectedCategory.description
    : 'Choose PPDT, TAT, WAT, SRT, or SD to reveal the live practice sets and begin a real timed drill.';

  shell.homeEmpty.hidden = Boolean(selectedCategory);
  shell.homeView.hidden = !selectedCategory;

  if (!selectedCategory) {
    shell.emptyState.innerHTML = `
      <div class="practice-empty-card">
        <div class="practice-detail__eyebrow">Collapsed set browser</div>
        <h4>Select a test category</h4>
        <p>Click PPDT, TAT, WAT, SRT, or SD to reveal the live practice sets. Each route opens a real timed practice flow.</p>
      </div>
    `;
    return;
  }

  shell.selectedSet.innerHTML = renderSelectedSet(selectedCategory, selectedSet, visibleSets);
  shell.setGrid.innerHTML = visibleSets.map((set) => renderSetCard(selectedCategory, set, set.id === selectedSet.id)).join('');

  if (visibleSets.length === 0) {
    shell.emptyState.hidden = false;
    shell.emptyState.innerHTML = `
      <div class="practice-empty-card">
        <div class="practice-detail__eyebrow">No matches</div>
        <h4>No sets match the current filter</h4>
        <p>Clear the search or difficulty filter to see the available practice sets again.</p>
      </div>
    `;
  } else {
    shell.emptyState.hidden = true;
    shell.emptyState.innerHTML = '';
  }

  shell.routeLabel.textContent = `${buildPracticeRoute(selectedCategory.id, selectedSet.id)} · Completed ${completedCount}/${visibleSets.length || selectedCategory.sets.length} (${completionPercent}%)`;
}

function updateAnalytics(completion) {
  const previous = analyticsState.sessions[completion.route];

  if (previous) {
    analyticsState.totalPracticeSeconds -= Number(previous.totalSeconds) || 0;
    analyticsState.attemptedQuestions -= Number(previous.attemptedItems) || 0;
  }

  analyticsState.sessions[completion.route] = {
    route: completion.route,
    totalSeconds: Number(completion.totalSeconds) || 0,
    attemptedItems: Number(completion.attemptedItems) || 0,
    completedItems: Number(completion.completedItems) || 0,
    completedAt: new Date().toISOString(),
  };

  analyticsState.totalPracticeSeconds += Number(completion.totalSeconds) || 0;
  analyticsState.attemptedQuestions += Number(completion.attemptedItems) || 0;
  saveAnalyticsState();
  renderHome();
}

function stopActiveSession() {
  if (activeSession && typeof activeSession.destroy === 'function') {
    activeSession.destroy();
  }
  activeSession = null;
  shell.practiceRoot.innerHTML = '';
}

function showLandingShell() {
  [shell.quickBar, shell.topbar, shell.main, shell.footer].forEach((node) => {
    if (node) {
      node.hidden = false;
    }
  });
  shell.practiceRoot.hidden = true;
  stopActiveSession();
}

function showSessionShell() {
  [shell.quickBar, shell.topbar, shell.main, shell.footer].forEach((node) => {
    if (node) {
      node.hidden = true;
    }
  });
  shell.practiceRoot.hidden = false;
}

function goHome(replace = false) {
  if (replace) {
    window.history.replaceState({ kind: 'home' }, '', '/');
  } else {
    window.history.pushState({ kind: 'home' }, '', '/');
  }
  renderApp();
}

function navigateToPractice(categoryId, setId, replace = false) {
  const category = getCategory(categoryId);
  const practiceSet = getSet(category, setId);
  const route = buildPracticeRoute(category.id, practiceSet.id);

  if (replace) {
    window.history.replaceState({ kind: 'session', route }, '', route);
  } else {
    window.history.pushState({ kind: 'session', route }, '', route);
  }

  renderApp();
}

window.navigateToPractice = navigateToPractice;
window.renderPracticeSession = function renderPracticeSessionFromWindow(categoryId, setId) {
  navigateToPractice(categoryId, setId);
};

function renderPracticeSession(categoryId, setId) {
  const category = getCategory(categoryId);
  const practiceSet = getSet(category, setId);
  const mountNode = shell.practiceRoot;

  stopActiveSession();
  mountNode.hidden = false;

  const commonProps = {
    mountNode,
    route: buildPracticeRoute(category.id, practiceSet.id),
    category,
    practiceSet,
    onBack: () => goHome(),
    onRecordComplete: updateAnalytics,
  };

  switch (category.id) {
    case 'ppdt':
      activeSession = mountPPDTPractice(commonProps);
      break;
    case 'tat':
      activeSession = mountTATPractice(commonProps);
      break;
    case 'wat':
      activeSession = mountWATPractice(commonProps);
      break;
    case 'srt':
      activeSession = mountSRTPractice(commonProps);
      break;
    case 'sd':
      activeSession = mountSDPractice(commonProps);
      break;
    default:
      activeSession = mountPPDTPractice({
        ...commonProps,
        category: practiceCatalog[DEFAULT_PRACTICE_CATEGORY],
        practiceSet: practiceCatalog[DEFAULT_PRACTICE_CATEGORY].sets[0],
      });
      break;
  }
}

function renderApp() {
  const routeState = getRouteFromLocation();

  if (routeState.kind === 'session') {
    showSessionShell();
    renderPracticeSession(routeState.categoryId, routeState.setId);
    return;
  }

  showLandingShell();
  renderHome();
}

shell.categoryList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');

  if (!button) {
    return;
  }

  event.preventDefault();
  homeState = {
    ...homeState,
    categoryId: button.dataset.category,
  };
  saveHomeState();
  renderHome();
});

shell.search.addEventListener('input', (event) => {
  homeState = {
    ...homeState,
    search: event.target.value,
  };
  saveHomeState();
  renderHome();
});

shell.difficulty.addEventListener('change', (event) => {
  homeState = {
    ...homeState,
    difficulty: event.target.value,
  };
  saveHomeState();
  renderHome();
});

shell.selectedSet.addEventListener('click', (event) => {
  const actionButton = event.target.closest('[data-practice-action]');
  if (!actionButton) {
    return;
  }

  event.preventDefault();
  const [categoryId, setId] = actionButton.dataset.route.split('/').slice(2);
  navigateToPractice(categoryId, setId);
});

shell.setGrid.addEventListener('click', (event) => {
  const actionButton = event.target.closest('[data-practice-action]');
  if (!actionButton) {
    return;
  }

  event.preventDefault();
  const [categoryId, setId] = actionButton.dataset.route.split('/').slice(2);
  navigateToPractice(categoryId, setId);
});

window.addEventListener('popstate', () => {
  renderApp();
});

window.addEventListener('beforeunload', () => {
  saveHomeState();
  saveAnalyticsState();
});

renderApp();
