import { CountdownTimer } from '../components/Timer.js';
import { renderProgressBar } from '../components/ProgressBar.js';
import { renderPracticeLayout } from '../components/PracticeLayout.js';
import { renderTestHeader } from '../components/TestHeader.js';
import { renderTextAreaCard, renderReviewBlock } from '../components/ResponseArea.js';
import { escapeHtml, formatDuration, loadSessionState, saveSessionState } from './shared.js';

const TIMER_SECONDS = 15;

function createDefaultState(practiceSet) {
  return {
    started: false,
    completed: false,
    currentIndex: 0,
    timerRemaining: TIMER_SECONDS,
    responses: practiceSet.items.map(() => ({ sentence: '' })),
    attemptedIndices: [],
    totalElapsedSeconds: 0,
    startedAt: null,
    completedAt: null,
  };
}

function responseFieldIds(index) {
  return {
    sentence: `wat-sentence-${index}`,
  };
}

function readCurrentResponse(index) {
  const ids = responseFieldIds(index);
  return {
    sentence: document.getElementById(ids.sentence)?.value || '',
  };
}

function renderIntro(route, category, practiceSet) {
  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - WAT Drill`,
    subtitle: 'A single word appears at the centre. Write the first clear sentence that comes to mind before the timer ends.',
    routeLabel: route,
    analytics: `${practiceSet.items.length} words`,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Practice set</div>
        <h3 class="practice-panel-title">${practiceSet.title}</h3>
        <p class="practice-panel-copy">${practiceSet.description}</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${practiceSet.items.length}</strong><span>Words</span></div>
        <div class="practice-metric"><strong>${formatDuration(TIMER_SECONDS)}</strong><span>Per word</span></div>
        <div class="practice-metric"><strong>${practiceSet.difficulty}</strong><span>Level</span></div>
      </div>
      <div class="practice-note-box">
        <strong>Instructions</strong>
        <ul>
          <li>Respond in one clean sentence per word.</li>
          <li>The word auto-advances when time ends.</li>
          <li>Autosave keeps each sentence on refresh.</li>
        </ul>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'WAT - Instructions',
        title: 'Word Association Test',
        subtitle: 'Focus on quick, constructive associations. The drill is intentionally fast.',
        routeLabel: route,
        statusLabel: `${practiceSet.items.length} words ready`,
      })}
      <section class="practice-session-summary__card">
        <h3>How the drill works</h3>
        <div class="practice-session-summary__item"><span>Time per word</span><strong>15 seconds</strong></div>
        <div class="practice-session-summary__item"><span>Auto-next</span><strong>Enabled</strong></div>
        <div class="practice-session-summary__item"><span>Review</span><strong>Final submission page</strong></div>
      </section>
      <div class="practice-session-controls">
        <button type="button" class="btn btn-primary" data-action="start-wat">Start Test</button>
        <span class="practice-session-note">Write the first useful response that fits the word.</span>
      </div>
      ${renderProgressBar({ value: 0, label: 'Progress', detail: '0 of ' + practiceSet.items.length + ' words completed' })}
    `,
  });
}

function renderActive(route, category, practiceSet, state) {
  const currentItem = practiceSet.items[state.currentIndex];
  const response = state.responses[state.currentIndex] || { sentence: '' };
  const progressValue = ((state.currentIndex + (state.timerRemaining < TIMER_SECONDS ? 0.5 : 0)) / practiceSet.items.length) * 100;
  const ids = responseFieldIds(state.currentIndex);

  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - WAT Drill`,
    subtitle: 'The current word stays centered while the timer counts down. The next word loads automatically when time expires.',
    routeLabel: route,
    analytics: `${state.responses.filter((item) => item.sentence.trim().length > 0).length}/${practiceSet.items.length} drafted`,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Word ${state.currentIndex + 1} of ${practiceSet.items.length}</div>
        <h3 class="practice-panel-title">Quick association</h3>
        <p class="practice-panel-copy">Use a sentence that feels direct, useful, and positive.</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${practiceSet.items[state.currentIndex]}</strong><span>Flash word</span></div>
        <div class="practice-metric"><strong>${formatDuration(state.timerRemaining)}</strong><span>Countdown</span></div>
        <div class="practice-metric"><strong>${practiceSet.difficulty}</strong><span>Difficulty</span></div>
      </div>
      <div class="practice-session-summary__card">
        <div class="practice-session-summary__item"><span>Current status</span><strong>${state.timerRemaining > 0 ? 'Write now' : 'Advance'}</strong></div>
        <div class="practice-session-summary__item"><span>Completion</span><strong>${Math.round(progressValue)}%</strong></div>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'WAT - Live Test',
        title: currentItem,
        subtitle: 'Keep your response short and useful. The timer is short by design so the drill feels fast and realistic.',
        routeLabel: route,
        statusLabel: `${formatDuration(state.timerRemaining)} left`,
      })}
      <div class="practice-mode-visual practice-mode-visual--word">
        <div class="practice-word">${escapeHtml(currentItem)}</div>
        <div class="practice-mode-image__hint">Think first, then write the sentence that best fits the word.</div>
      </div>
      ${renderTextAreaCard({
        id: ids.sentence,
        label: 'Response sentence',
        value: response.sentence,
        placeholder: 'Write one sentence here...',
        rows: 5,
        helpText: 'The answer auto-saves and the next word appears when the timer expires.',
        large: true,
      })}
      <div class="practice-session-controls">
        <button type="button" class="btn btn-outline" data-action="previous-wat"${state.currentIndex === 0 ? ' disabled' : ''}>Previous word</button>
        <button type="button" class="btn btn-primary" data-action="next-wat">${state.currentIndex === practiceSet.items.length - 1 ? 'Finish and Review' : 'Next word'}</button>
      </div>
      ${renderProgressBar({ value: progressValue, label: 'Progress', detail: `${Math.min(state.currentIndex + 1, practiceSet.items.length)} of ${practiceSet.items.length}` })}
    `,
  });
}

function renderReview(route, category, practiceSet, state) {
  const cards = practiceSet.items.map((item, index) => renderReviewBlock({
    title: item,
    content: `
      <p><strong>Your response:</strong><br>${escapeHtml(state.responses[index]?.sentence || 'No response recorded')}</p>
    `,
  })).join('');

  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - Final Review`,
    subtitle: 'Your WAT answers are saved locally. Review the quick associations and export the set if needed.',
    routeLabel: route,
    analytics: `${state.attemptedIndices.length}/${practiceSet.items.length} drafted`,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Completed</div>
        <h3 class="practice-panel-title">WAT review</h3>
        <p class="practice-panel-copy">The draft stays in local storage so you can return to this route later.</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${practiceSet.items.length}</strong><span>Words</span></div>
        <div class="practice-metric"><strong>${state.attemptedIndices.length}</strong><span>Drafted</span></div>
        <div class="practice-metric"><strong>${formatDuration(state.totalElapsedSeconds)}</strong><span>Practice time</span></div>
      </div>
      <div class="practice-note-box">
        <strong>Suggestions</strong>
        <ul>
          <li>Keep the sentence short and active.</li>
          <li>Choose constructive associations quickly.</li>
          <li>Do not overthink the flash.</li>
        </ul>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'WAT - Review',
        title: 'Submission screen',
        subtitle: 'Use the review to judge speed, clarity, and how naturally each word linked to your response.',
        routeLabel: route,
        statusLabel: `${state.attemptedIndices.length}/${practiceSet.items.length} words attempted`,
      })}
      <div class="practice-session-controls">
        <button type="button" class="btn btn-primary" data-action="restart-wat">Restart set</button>
        <button type="button" class="btn btn-outline" data-action="export-wat">Export response JSON</button>
      </div>
      <div class="practice-session-summary">${renderProgressBar({ value: 100, label: 'Completion', detail: '100% finished' })}</div>
      <div class="practice-session-summary">${cards}</div>
      <section class="practice-suggestion-box">
        <h3>Improvement suggestions</h3>
        <p>Practice staying brief, natural, and positive. Faster responses usually sound more confident and less rehearsed.</p>
      </section>
    `,
  });
}

export function mountWATPractice({ mountNode, route, category, practiceSet, onBack, onRecordComplete }) {
  const stored = loadSessionState(route, null);
  const state = stored || createDefaultState(practiceSet);
  state.route = route;

  let timer = null;

  function persist() {
    saveSessionState(route, state);
  }

  function stopTimer() {
    if (timer) {
      timer.stop();
      timer = null;
    }
  }

  function saveCurrentResponse() {
    const response = readCurrentResponse(state.currentIndex);
    state.responses[state.currentIndex] = response;

    if (!state.attemptedIndices.includes(state.currentIndex) && response.sentence.trim().length > 0) {
      state.attemptedIndices.push(state.currentIndex);
    }

    persist();
  }

  function beginTimer(resume = false) {
    stopTimer();
    const seconds = resume ? Math.max(1, state.timerRemaining || TIMER_SECONDS) : TIMER_SECONDS;
    state.timerRemaining = seconds;
    persist();
    render();
    timer = new CountdownTimer({
      seconds,
      onTick: (remaining) => {
        state.timerRemaining = remaining;
        persist();
        render();
      },
      onComplete: () => {
        state.timerRemaining = 0;
        saveCurrentResponse();
        if (state.currentIndex >= practiceSet.items.length - 1) {
          finishPractice();
          return;
        }
        state.currentIndex += 1;
        state.timerRemaining = TIMER_SECONDS;
        persist();
        beginTimer();
      },
    });
    timer.start();
  }

  function startPractice() {
    state.started = true;
    state.startedAt = state.startedAt || new Date().toISOString();
    state.currentIndex = 0;
    state.timerRemaining = TIMER_SECONDS;
    persist();
    beginTimer();
  }

  function goNext() {
    saveCurrentResponse();

    if (state.currentIndex >= practiceSet.items.length - 1) {
      finishPractice();
      return;
    }

    state.currentIndex += 1;
    state.timerRemaining = TIMER_SECONDS;
    persist();
    beginTimer();
  }

  function goPrevious() {
    saveCurrentResponse();

    if (state.currentIndex === 0) {
      return;
    }

    state.currentIndex -= 1;
    state.timerRemaining = TIMER_SECONDS;
    persist();
    beginTimer();
  }

  function finishPractice() {
    stopTimer();
    saveCurrentResponse();
    state.completed = true;
    state.completedAt = new Date().toISOString();
    if (state.startedAt) {
      const total = Math.round((new Date(state.completedAt).getTime() - new Date(state.startedAt).getTime()) / 1000);
      state.totalElapsedSeconds = Math.max(state.totalElapsedSeconds, total);
    }
    persist();
    if (typeof onRecordComplete === 'function') {
      onRecordComplete({ route, totalSeconds: state.totalElapsedSeconds, attemptedItems: state.attemptedIndices.length, completedItems: practiceSet.items.length });
    }
    render();
  }

  function exportResponses() {
    const blob = new Blob([JSON.stringify({ route, practiceSet, state }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `wat-${practiceSet.id}-responses.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function render() {
    mountNode.innerHTML = state.completed
      ? renderReview(route, category, practiceSet, state)
      : state.started
        ? renderActive(route, category, practiceSet, state)
        : renderIntro(route, category, practiceSet);
  }

  mountNode.onclick = (event) => {
    const target = event.target.closest('[data-action]');

    if (!target) {
      return;
    }

    switch (target.dataset.action) {
      case 'back':
        stopTimer();
        if (typeof onBack === 'function') {
          onBack();
        }
        break;
      case 'start-wat':
        startPractice();
        break;
      case 'next-wat':
        goNext();
        break;
      case 'previous-wat':
        goPrevious();
        break;
      case 'restart-wat':
        stopTimer();
        localStorage.removeItem(`ssb-practice-session:${route}`);
        Object.assign(state, createDefaultState(practiceSet), { route });
        render();
        break;
      case 'export-wat':
        exportResponses();
        break;
      default:
        break;
    }
  };

  mountNode.oninput = (event) => {
    if (!(event.target instanceof HTMLTextAreaElement)) {
      return;
    }

    if (!state.started || state.completed) {
      return;
    }

    saveCurrentResponse();
  };

  render();
  if (state.started && !state.completed) {
    beginTimer(true);
  }

  return {
    destroy() {
      stopTimer();
      mountNode.onclick = null;
      mountNode.oninput = null;
    },
  };
}
