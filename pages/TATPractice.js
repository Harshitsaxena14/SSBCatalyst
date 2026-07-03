import { CountdownTimer } from '../components/Timer.js';
import { renderProgressBar } from '../components/ProgressBar.js';
import { renderPracticeLayout } from '../components/PracticeLayout.js';
import { renderTestHeader } from '../components/TestHeader.js';
import { renderTextAreaCard, renderReviewBlock } from '../components/ResponseArea.js';
import { escapeHtml, formatDuration, loadSessionState, saveSessionState } from './shared.js';

const TIMER_SECONDS = 240;

function createDefaultState(practiceSet) {
  return {
    started: false,
    completed: false,
    currentIndex: 0,
    timerRemaining: TIMER_SECONDS,
    responses: practiceSet.items.map(() => ({ story: '' })),
    attemptedIndices: [],
    totalElapsedSeconds: 0,
    startedAt: null,
    completedAt: null,
  };
}

function responseFieldIds(index) {
  return {
    story: `tat-story-${index}`,
  };
}

function readCurrentResponse(index) {
  const ids = responseFieldIds(index);
  return {
    story: document.getElementById(ids.story)?.value || '',
  };
}

function renderIntro(route, category, practiceSet) {
  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - TAT Drill`,
    subtitle: 'Write one focused story for each prompt. Keep the sequence continuous, realistic, and positive.',
    routeLabel: route,
    analytics: `${practiceSet.items.length} prompts`,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Practice set</div>
        <h3 class="practice-panel-title">${practiceSet.title}</h3>
        <p class="practice-panel-copy">${practiceSet.description}</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${practiceSet.items.length}</strong><span>Prompts</span></div>
        <div class="practice-metric"><strong>${formatDuration(TIMER_SECONDS)}</strong><span>Per story</span></div>
        <div class="practice-metric"><strong>${practiceSet.difficulty}</strong><span>Level</span></div>
      </div>
      <div class="practice-note-box">
        <strong>Instructions</strong>
        <ul>
          <li>Write one story per prompt under 4 minutes.</li>
          <li>Keep the plot direct with a clear positive outcome.</li>
          <li>Autosave keeps the story on refresh.</li>
        </ul>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'TAT - Instructions',
        title: 'Thematic Apperception Test',
        subtitle: 'Use the picture cue to create a practical story with a clear actor, action, and outcome.',
        routeLabel: route,
        statusLabel: `${practiceSet.items.length} prompts ready`,
      })}
      <section class="practice-session-summary__card">
        <h3>How the drill works</h3>
        <div class="practice-session-summary__item"><span>Time per story</span><strong>4 minutes</strong></div>
        <div class="practice-session-summary__item"><span>Autosave</span><strong>Enabled</strong></div>
        <div class="practice-session-summary__item"><span>Review</span><strong>Final submission page</strong></div>
      </section>
      <div class="practice-session-controls">
        <button type="button" class="btn btn-primary" data-action="start-tat">Start Test</button>
        <span class="practice-session-note">Stay in one sequence and keep the plot realistic.</span>
      </div>
      ${renderProgressBar({ value: 0, label: 'Progress', detail: '0 of ' + practiceSet.items.length + ' prompts completed' })}
    `,
  });
}

function renderActive(route, category, practiceSet, state) {
  const currentItem = practiceSet.items[state.currentIndex];
  const response = state.responses[state.currentIndex] || { story: '' };
  const progressValue = ((state.currentIndex + (state.timerRemaining < TIMER_SECONDS ? 0.5 : 0)) / practiceSet.items.length) * 100;
  const ids = responseFieldIds(state.currentIndex);

  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - TAT Drill`,
    subtitle: 'The prompt stays visible while you write. The timer keeps moving and the next prompt is queued automatically when time is up.',
    routeLabel: route,
    analytics: `${state.responses.filter((item) => item.story.trim().length > 0).length}/${practiceSet.items.length} drafted`,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Prompt ${state.currentIndex + 1} of ${practiceSet.items.length}</div>
        <h3 class="practice-panel-title">${currentItem.title}</h3>
        <p class="practice-panel-copy">${currentItem.prompt}</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${currentItem.emotionalTheme}</strong><span>Theme</span></div>
        <div class="practice-metric"><strong>${currentItem.ageGroup}</strong><span>Age group</span></div>
        <div class="practice-metric"><strong>${currentItem.difficulty}</strong><span>Difficulty</span></div>
      </div>
      <div class="practice-mode-visual">
        <div class="practice-mode-image" style="background-image: url('${currentItem.imageUrl}')">
          <div>
            <div class="practice-mode-image__caption">${escapeHtml(currentItem.title)}</div>
            <div class="practice-mode-image__hint">${escapeHtml(currentItem.subtitle)}</div>
          </div>
        </div>
      </div>
      <div class="practice-session-summary__card">
        <div class="practice-session-summary__item"><span>Timer</span><strong>${formatDuration(state.timerRemaining)}</strong></div>
        <div class="practice-session-summary__item"><span>Status</span><strong>${state.timerRemaining <= 0 ? 'Write now' : 'Time running'}</strong></div>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'TAT - Live Test',
        title: currentItem.title,
        subtitle: 'Write a complete story before the timer reaches zero. The response box auto-saves every change.',
        routeLabel: route,
        statusLabel: `${formatDuration(state.timerRemaining)} left`,
      })}
      <div class="practice-session-grid practice-session-screen">
        ${renderTextAreaCard({
          id: ids.story,
          label: 'Story writing',
          value: response.story,
          placeholder: 'Write the full TAT story here...',
          rows: 12,
          helpText: 'Keep the plot direct, realistic, and positive.',
          large: true,
        })}
        <div class="practice-session-controls">
          <button type="button" class="btn btn-outline" data-action="previous-tat"${state.currentIndex === 0 ? ' disabled' : ''}>Previous story</button>
          <button type="button" class="btn btn-primary" data-action="next-tat">${state.currentIndex === practiceSet.items.length - 1 ? 'Finish and Review' : 'Next story'}</button>
        </div>
        ${renderProgressBar({ value: progressValue, label: 'Progress', detail: `${Math.min(state.currentIndex + 1, practiceSet.items.length)} of ${practiceSet.items.length}` })}
      </div>
    `,
  });
}

function renderReview(route, category, practiceSet, state) {
  const cards = practiceSet.items.map((item, index) => renderReviewBlock({
    title: item.title,
    content: `
      <p><strong>Theme:</strong> ${escapeHtml(item.emotionalTheme)}</p>
      <p><strong>Prompt:</strong> ${escapeHtml(item.prompt)}</p>
      <p><strong>Your story:</strong><br>${escapeHtml(state.responses[index]?.story || 'No response recorded')}</p>
    `,
  })).join('');

  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - Final Review`,
    subtitle: 'Your TAT answers are saved locally. Review the stories, export the set, or restart the drill.',
    routeLabel: route,
    analytics: `${state.attemptedIndices.length}/${practiceSet.items.length} drafted`,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Completed</div>
        <h3 class="practice-panel-title">TAT review</h3>
        <p class="practice-panel-copy">The draft stays in local storage so you can return to this route later.</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${practiceSet.items.length}</strong><span>Prompts</span></div>
        <div class="practice-metric"><strong>${state.attemptedIndices.length}</strong><span>Drafted</span></div>
        <div class="practice-metric"><strong>${formatDuration(state.totalElapsedSeconds)}</strong><span>Practice time</span></div>
      </div>
      <div class="practice-note-box">
        <strong>Suggestions</strong>
        <ul>
          <li>Give the protagonist a job to do early.</li>
          <li>Let the story move toward order and progress.</li>
          <li>End with a measurable result.</li>
        </ul>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'TAT - Review',
        title: 'Submission screen',
        subtitle: 'Read the stories below, then export or restart if you want another run.',
        routeLabel: route,
        statusLabel: `${state.attemptedIndices.length}/${practiceSet.items.length} prompts attempted`,
      })}
      <div class="practice-session-controls">
        <button type="button" class="btn btn-primary" data-action="restart-tat">Restart set</button>
        <button type="button" class="btn btn-outline" data-action="export-tat">Export response JSON</button>
      </div>
      <div class="practice-session-summary">${renderProgressBar({ value: 100, label: 'Completion', detail: '100% finished' })}</div>
      <div class="practice-session-summary">${cards}</div>
      <section class="practice-suggestion-box">
        <h3>Improvement suggestions</h3>
        <p>Try to open each story with a clear actor, keep the sequence tight, and finish with a realistic positive outcome.</p>
      </section>
    `,
  });
}

export function mountTATPractice({ mountNode, route, category, practiceSet, onBack, onRecordComplete }) {
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

  function currentResponse() {
    return readCurrentResponse(state.currentIndex);
  }

  function saveCurrentResponse() {
    const response = currentResponse();
    state.responses[state.currentIndex] = response;

    if (!state.attemptedIndices.includes(state.currentIndex) && response.story.trim().length > 0) {
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
    anchor.download = `tat-${practiceSet.id}-responses.json`;
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
      case 'start-tat':
        startPractice();
        break;
      case 'next-tat':
        goNext();
        break;
      case 'previous-tat':
        goPrevious();
        break;
      case 'restart-tat':
        stopTimer();
        localStorage.removeItem(`ssb-practice-session:${route}`);
        Object.assign(state, createDefaultState(practiceSet), { route });
        render();
        break;
      case 'export-tat':
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
