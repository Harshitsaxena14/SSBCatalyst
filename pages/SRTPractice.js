import { CountdownTimer } from '../components/Timer.js';
import { renderProgressBar } from '../components/ProgressBar.js';
import { renderPracticeLayout } from '../components/PracticeLayout.js';
import { renderTestHeader } from '../components/TestHeader.js';
import { renderTextAreaCard, renderReviewBlock } from '../components/ResponseArea.js';
import { escapeHtml, formatDuration, loadSessionState, saveSessionState } from './shared.js';

const TIMER_SECONDS = 30;

function createDefaultState(practiceSet) {
  return {
    started: false,
    completed: false,
    currentIndex: 0,
    timerRemaining: TIMER_SECONDS,
    responses: practiceSet.items.map(() => ({ response: '' })),
    attemptedIndices: [],
    totalElapsedSeconds: 0,
    startedAt: null,
    completedAt: null,
  };
}

function responseFieldIds(index) {
  return {
    response: `srt-response-${index}`,
  };
}

function readCurrentResponse(index) {
  const ids = responseFieldIds(index);
  return {
    response: document.getElementById(ids.response)?.value || '',
  };
}

function renderIntro(route, category, practiceSet) {
  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - SRT Drill`,
    subtitle: 'Read the situation, write a practical response, and keep moving with the timer. Previous and next controls stay available.',
    routeLabel: route,
    analytics: `${practiceSet.items.length} situations`,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Practice set</div>
        <h3 class="practice-panel-title">${practiceSet.title}</h3>
        <p class="practice-panel-copy">${practiceSet.description}</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${practiceSet.items.length}</strong><span>Situations</span></div>
        <div class="practice-metric"><strong>${formatDuration(TIMER_SECONDS)}</strong><span>Per item</span></div>
        <div class="practice-metric"><strong>${practiceSet.difficulty}</strong><span>Level</span></div>
      </div>
      <div class="practice-note-box">
        <strong>Instructions</strong>
        <ul>
          <li>Read one situation at a time.</li>
          <li>Write a practical response in 30 seconds.</li>
          <li>Autosave keeps the draft when you refresh.</li>
        </ul>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'SRT - Instructions',
        title: 'Situation Reaction Test',
        subtitle: 'Respond like the situation is real. Keep the answer practical, quick, and grounded.',
        routeLabel: route,
        statusLabel: `${practiceSet.items.length} situations ready`,
      })}
      <section class="practice-session-summary__card">
        <h3>How the drill works</h3>
        <div class="practice-session-summary__item"><span>Time per situation</span><strong>30 seconds</strong></div>
        <div class="practice-session-summary__item"><span>Navigation</span><strong>Previous and next</strong></div>
        <div class="practice-session-summary__item"><span>Review</span><strong>Final submission page</strong></div>
      </section>
      <div class="practice-session-controls">
        <button type="button" class="btn btn-primary" data-action="start-srt">Start Test</button>
        <span class="practice-session-note">Keep the answer action-oriented and believable.</span>
      </div>
      ${renderProgressBar({ value: 0, label: 'Progress', detail: '0 of ' + practiceSet.items.length + ' situations completed' })}
    `,
  });
}

function renderActive(route, category, practiceSet, state) {
  const currentItem = practiceSet.items[state.currentIndex];
  const response = state.responses[state.currentIndex] || { response: '' };
  const progressValue = ((state.currentIndex + (state.timerRemaining < TIMER_SECONDS ? 0.5 : 0)) / practiceSet.items.length) * 100;
  const ids = responseFieldIds(state.currentIndex);

  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - SRT Drill`,
    subtitle: 'Use the timer to keep the answer decisive. The next situation loads when you move on or when time expires.',
    routeLabel: route,
    analytics: `${state.responses.filter((item) => item.response.trim().length > 0).length}/${practiceSet.items.length} drafted`,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Situation ${state.currentIndex + 1} of ${practiceSet.items.length}</div>
        <h3 class="practice-panel-title">${currentItem.title}</h3>
        <p class="practice-panel-copy">${currentItem.responseCue}</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${currentItem.pressure}</strong><span>Pressure</span></div>
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
        stageLabel: 'SRT - Live Test',
        title: currentItem.title,
        subtitle: 'Write a practical reaction that you could actually take in the situation shown on the card.',
        routeLabel: route,
        statusLabel: `${formatDuration(state.timerRemaining)} left`,
      })}
      <div class="practice-mode-visual">
        <div class="practice-situation">${escapeHtml(currentItem.situation)}</div>
      </div>
      ${renderTextAreaCard({
        id: ids.response,
        label: 'Your reaction',
        value: response.response,
        placeholder: 'Write the practical response here...',
        rows: 8,
        helpText: 'Keep the response action-first and realistic.',
        large: true,
      })}
      <div class="practice-session-controls">
        <button type="button" class="btn btn-outline" data-action="previous-srt"${state.currentIndex === 0 ? ' disabled' : ''}>Previous situation</button>
        <button type="button" class="btn btn-primary" data-action="next-srt">${state.currentIndex === practiceSet.items.length - 1 ? 'Finish and Review' : 'Next situation'}</button>
      </div>
      ${renderProgressBar({ value: progressValue, label: 'Progress', detail: `${Math.min(state.currentIndex + 1, practiceSet.items.length)} of ${practiceSet.items.length}` })}
    `,
  });
}

function renderReview(route, category, practiceSet, state) {
  const cards = practiceSet.items.map((item, index) => renderReviewBlock({
    title: item.title,
    content: `
      <p><strong>Situation:</strong> ${escapeHtml(item.situation)}</p>
      <p><strong>Response cue:</strong> ${escapeHtml(item.responseCue)}</p>
      <p><strong>Your response:</strong><br>${escapeHtml(state.responses[index]?.response || 'No response recorded')}</p>
    `,
  })).join('');

  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - Final Review`,
    subtitle: 'Review the situation responses, export the draft, and restart if you want another pass.',
    routeLabel: route,
    analytics: `${state.attemptedIndices.length}/${practiceSet.items.length} drafted`,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Completed</div>
        <h3 class="practice-panel-title">SRT review</h3>
        <p class="practice-panel-copy">The draft stays in local storage so you can return to this route later.</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${practiceSet.items.length}</strong><span>Situations</span></div>
        <div class="practice-metric"><strong>${state.attemptedIndices.length}</strong><span>Drafted</span></div>
        <div class="practice-metric"><strong>${formatDuration(state.totalElapsedSeconds)}</strong><span>Practice time</span></div>
      </div>
      <div class="practice-note-box">
        <strong>Suggestions</strong>
        <ul>
          <li>Lead with the safest immediate action.</li>
          <li>Keep the answer calm and practical.</li>
          <li>Finish with a clear outcome or next step.</li>
        </ul>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'SRT - Review',
        title: 'Submission screen',
        subtitle: 'Read the drafts below, then export or restart as needed.',
        routeLabel: route,
        statusLabel: `${state.attemptedIndices.length}/${practiceSet.items.length} situations attempted`,
      })}
      <div class="practice-session-controls">
        <button type="button" class="btn btn-primary" data-action="restart-srt">Restart set</button>
        <button type="button" class="btn btn-outline" data-action="export-srt">Export response JSON</button>
      </div>
      <div class="practice-session-summary">${renderProgressBar({ value: 100, label: 'Completion', detail: '100% finished' })}</div>
      <div class="practice-session-summary">${cards}</div>
      <section class="practice-suggestion-box">
        <h3>Improvement suggestions</h3>
        <p>In SRT, safety, leadership, and practical organization should appear early in the response. Keep the reaction grounded and direct.</p>
      </section>
    `,
  });
}

export function mountSRTPractice({ mountNode, route, category, practiceSet, onBack, onRecordComplete }) {
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

    if (!state.attemptedIndices.includes(state.currentIndex) && response.response.trim().length > 0) {
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
    anchor.download = `srt-${practiceSet.id}-responses.json`;
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
      case 'start-srt':
        startPractice();
        break;
      case 'next-srt':
        goNext();
        break;
      case 'previous-srt':
        goPrevious();
        break;
      case 'restart-srt':
        stopTimer();
        localStorage.removeItem(`ssb-practice-session:${route}`);
        Object.assign(state, createDefaultState(practiceSet), { route });
        render();
        break;
      case 'export-srt':
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
