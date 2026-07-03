import { CountdownTimer } from '../components/Timer.js';
import { renderProgressBar } from '../components/ProgressBar.js';
import { renderPracticeLayout } from '../components/PracticeLayout.js';
import { renderTestHeader } from '../components/TestHeader.js';
import { renderFieldCards, renderInputGrid, renderTextAreaCard } from '../components/ResponseArea.js';
import { escapeHtml, formatDuration, loadSessionState, saveSessionState } from './shared.js';

const VIEW_SECONDS = 30;

function createDefaultState(practiceSet) {
  return {
    started: false,
    completed: false,
    currentIndex: 0,
    phase: 'intro',
    timerRemaining: VIEW_SECONDS,
    responses: practiceSet.items.map(() => ({
      story: '',
      protagonist: '',
      supportingCharacters: '',
      action: '',
      summary: '',
    })),
    answeredIndices: [],
    totalElapsedSeconds: 0,
    startedAt: null,
    completedAt: null,
  };
}

function buildResponseIds(index) {
  return {
    story: `ppdt-story-${index}`,
    protagonist: `ppdt-protagonist-${index}`,
    supportingCharacters: `ppdt-supporting-${index}`,
    action: `ppdt-action-${index}`,
    summary: `ppdt-summary-${index}`,
  };
}

function readResponse(index) {
  const ids = buildResponseIds(index);

  return {
    story: document.getElementById(ids.story)?.value || '',
    protagonist: document.getElementById(ids.protagonist)?.value || '',
    supportingCharacters: document.getElementById(ids.supportingCharacters)?.value || '',
    action: document.getElementById(ids.action)?.value || '',
    summary: document.getElementById(ids.summary)?.value || '',
  };
}

function saveCurrentResponse(state, practiceSet) {
  const response = readResponse(state.currentIndex);
  state.responses[state.currentIndex] = response;

  if (
    !state.answeredIndices.includes(state.currentIndex) &&
    Object.values(response).some((value) => value.trim().length > 0)
  ) {
    state.answeredIndices.push(state.currentIndex);
  }

  saveSessionState(state.route, state);
  return response;
}

function renderIntro(route, category, practiceSet, state, analyticsSummary) {
  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - PPDT Drill`,
    subtitle: 'See the hazy picture, wait for the timer, and then build a disciplined story with character details and a clear summary.',
    routeLabel: route,
    analytics: analyticsSummary,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Practice set</div>
        <h3 class="practice-panel-title">${practiceSet.title}</h3>
        <p class="practice-panel-copy">${practiceSet.description}</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${practiceSet.items.length}</strong><span>Images</span></div>
        <div class="practice-metric"><strong>${formatDuration(VIEW_SECONDS)}</strong><span>View time</span></div>
        <div class="practice-metric"><strong>${practiceSet.difficulty}</strong><span>Level</span></div>
      </div>
      <div class="practice-note-box">
        <strong>Instructions</strong>
        <ul>
          <li>Image stays visible for 30 seconds only.</li>
          <li>Write one story per image with a clear lead character.</li>
          <li>Keep the response practical, positive, and sequential.</li>
        </ul>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'PPDT - Instructions',
        title: 'Prepare for the picture flash',
        subtitle: 'You will see each image once, then write the story with concise character details and a short narration summary.',
        routeLabel: route,
        statusLabel: `${practiceSet.items.length} images ready`,
      })}
      <section class="practice-panel-copy-block">
        <h3>What to do</h3>
        <p>Start the test when you are ready. The image auto-hides after the timer. Save your response before moving to the next frame.</p>
      </section>
      <div class="practice-start-row">
        <button type="button" class="btn btn-primary" data-action="start-ppdt">Start Test</button>
        <span class="practice-start-row__hint">Use fullscreen focus for a more realistic drill.</span>
      </div>
      ${renderProgressBar({ value: 0, label: 'Progress', detail: '0 of ' + practiceSet.items.length + ' images completed' })}
    `,
  });
}

function renderResponseStage(route, category, practiceSet, state, analyticsSummary, timerLabel) {
  const currentItem = practiceSet.items[state.currentIndex];
  const response = state.responses[state.currentIndex];
  const progressValue = ((state.currentIndex + (state.phase === 'review' ? 1 : state.phase === 'response' ? 0.5 : 0)) / practiceSet.items.length) * 100;
  const ids = buildResponseIds(state.currentIndex);

  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - PPDT Drill`,
    subtitle: 'The image disappears after the viewing window. The response block stays open for your story, character sketch, and summary.',
    routeLabel: route,
    analytics: analyticsSummary,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Image ${state.currentIndex + 1} of ${practiceSet.items.length}</div>
        <h3 class="practice-panel-title">${currentItem.title}</h3>
        <p class="practice-panel-copy">${currentItem.scenarioHint}</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${currentItem.characterCount}</strong><span>Characters</span></div>
        <div class="practice-metric"><strong>${currentItem.mood}</strong><span>Mood</span></div>
        <div class="practice-metric"><strong>${timerLabel}</strong><span>View timer</span></div>
      </div>
      <div class="practice-note-box">
        <strong>Focus points</strong>
        <ul>
          <li>Lead with the main character.</li>
          <li>Keep the scene practical and organized.</li>
          <li>End with a clean, believable outcome.</li>
        </ul>
      </div>
      <div class="practice-stage-steps">
        <div class="practice-stage-step${state.phase === 'viewing' ? ' is-active' : ''}">1. Observe the image</div>
        <div class="practice-stage-step${state.phase === 'response' ? ' is-active' : ''}">2. Write the response</div>
        <div class="practice-stage-step${state.phase === 'review' ? ' is-active' : ''}">3. Final submission</div>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'PPDT - Live Test',
        title: currentItem.title,
        subtitle: 'The image panel will disappear automatically after the view timer. Save your response before advancing to the next picture.',
        routeLabel: route,
        statusLabel: state.phase === 'viewing' ? `${timerLabel} left` : `${state.responses.filter((item) => item.story.trim().length > 0).length} responses drafted`,
      })}
      <div class="practice-live-grid practice-live-grid--ppdt">
        <section class="practice-live-stage">
          <div class="practice-image-card">
            {imageMarkup}
          </div>
          <div class="practice-timer-strip">
            <span>Timer</span>
            <strong>{timerLabel}</strong>
          </div>
        </section>
        <section class="practice-live-response">
          <div class="practice-response-card practice-response-card--large">
            <div class="practice-response-card__head">
              <span class="practice-response-card__label">Story writing</span>
              <span class="practice-response-card__help">Write the first impression story after the image hides.</span>
            </div>
            <textarea id="${ids.story}" rows="7" placeholder="Write the full PPDT story here..."></textarea>
          </div>
          <div class="practice-response-grid">
            ${renderInputGrid([
              { id: ids.protagonist, label: 'Lead character', value: response.protagonist, placeholder: 'Who is the main person?', },
              { id: ids.supportingCharacters, label: 'Other characters', value: response.supportingCharacters, placeholder: 'Who else is present?', },
              { id: ids.action, label: 'Key action', value: response.action, placeholder: 'What action moves the scene?', },
            ])}
          </div>
          ${renderTextAreaCard({
            id: ids.summary,
            label: 'Narration summary',
            value: response.summary,
            placeholder: 'Summarize the story in 2-3 lines.',
            rows: 4,
            helpText: 'Use a short, crisp narration that you could speak in review.',
            large: true,
          })}
          <div class="practice-action-row">
            <button type="button" class="btn btn-outline" data-action="previous-image"${state.currentIndex === 0 ? ' disabled' : ''}>Previous image</button>
            <button type="button" class="btn btn-primary" data-action="next-image">${state.currentIndex === practiceSet.items.length - 1 ? 'Finish and Review' : 'Next image'}</button>
          </div>
          ${renderProgressBar({ value: progressValue, label: 'Progress', detail: `${Math.min(state.currentIndex + 1, practiceSet.items.length)} of ${practiceSet.items.length} images` })}
        </section>
      </div>
    `
      .replace('{imageMarkup}', state.phase === 'viewing' ? `<img class="practice-image-card__image" src="${currentItem.imageUrl}" alt="${escapeHtml(currentItem.title)}" />` : `<div class="practice-image-card__hidden">Image hidden. Write the response from memory.</div>`)
      .replace('{timerLabel}', timerLabel),
  });
}

function renderReview(route, category, practiceSet, state, analyticsSummary) {
  const reviewItems = practiceSet.items.map((item, index) => {
    const response = state.responses[index] || {};

    return `
      <article class="practice-review-card">
        <div class="practice-review-card__title-row">
          <h4>${item.title}</h4>
          <span>${item.mood}</span>
        </div>
        <p>${item.scenarioHint}</p>
        <div class="practice-review-card__responses">
          <div><strong>Story</strong><span>${escapeHtml(response.story || 'No response recorded')}</span></div>
          <div><strong>Lead character</strong><span>${escapeHtml(response.protagonist || 'No response recorded')}</span></div>
          <div><strong>Other characters</strong><span>${escapeHtml(response.supportingCharacters || 'No response recorded')}</span></div>
          <div><strong>Key action</strong><span>${escapeHtml(response.action || 'No response recorded')}</span></div>
          <div><strong>Summary</strong><span>${escapeHtml(response.summary || 'No response recorded')}</span></div>
        </div>
      </article>
    `;
  }).join('');

  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - Final Submission`,
    subtitle: 'Your PPDT drill is complete. Review the responses, export the draft, and use the suggestions to improve your next attempt.',
    routeLabel: route,
    analytics: analyticsSummary,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Completed</div>
        <h3 class="practice-panel-title">PPDT review</h3>
        <p class="practice-panel-copy">You can keep this draft in local storage and return to the same route later.</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${practiceSet.items.length}</strong><span>Images</span></div>
        <div class="practice-metric"><strong>${state.answeredIndices.length}</strong><span>Responses saved</span></div>
        <div class="practice-metric"><strong>${formatDuration(state.totalElapsedSeconds)}</strong><span>Practice time</span></div>
      </div>
      <div class="practice-note-box">
        <strong>Suggestions</strong>
        <ul>
          <li>Use one central character and one clear goal.</li>
          <li>Keep the story socially useful and practical.</li>
          <li>Leave the scene with a visible resolution.</li>
        </ul>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'PPDT - Review',
        title: 'Submission screen',
        subtitle: 'All responses are saved locally. Review the drafts below and restart the set if you want another run.',
        routeLabel: route,
        statusLabel: `${state.answeredIndices.length}/${practiceSet.items.length} images attempted`,
      })}
      <div class="practice-review-actions">
        <button type="button" class="btn btn-primary" data-action="restart-ppdt">Restart set</button>
        <button type="button" class="btn btn-outline" data-action="export-ppdt">Export response JSON</button>
      </div>
      <div class="practice-review-summary">${renderProgressBar({ value: 100, label: 'Completion', detail: '100% finished' })}</div>
      <div class="practice-review-grid">
        ${reviewItems}
      </div>
      <section class="practice-suggestion-box">
        <h3>Improvement suggestions</h3>
        <p>Next time, open with a stronger first sentence, identify the main actor faster, and give the ending more measurable progress.</p>
      </section>
    `,
  });
}

export function mountPPDTPractice({ mountNode, route, category, practiceSet, onBack, onRecordComplete }) {
  const storageState = loadSessionState(route, null);
  const state = storageState || createDefaultState(practiceSet);
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

  function completeItemIfNeeded() {
    saveCurrentResponse(state, practiceSet);
  }

  function startViewingPhase(resume = false) {
    stopTimer();
    state.phase = 'viewing';
    state.timerRemaining = resume ? state.timerRemaining || VIEW_SECONDS : VIEW_SECONDS;
    persist();
    render();
    timer = new CountdownTimer({
      seconds: state.timerRemaining,
      onTick: (remaining) => {
        state.timerRemaining = remaining;
        persist();
        render();
      },
      onComplete: () => {
        state.phase = 'response';
        state.timerRemaining = 0;
        persist();
        render();
      },
    });
    timer.start();
  }

  function startPractice() {
    state.started = true;
    state.phase = 'viewing';
    state.currentIndex = 0;
    state.timerRemaining = VIEW_SECONDS;
    state.startedAt = state.startedAt || new Date().toISOString();
    persist();
    render();
    startViewingPhase();
  }

  function goNext() {
    completeItemIfNeeded();

    if (state.currentIndex >= practiceSet.items.length - 1) {
      finishPractice();
      return;
    }

    state.currentIndex += 1;
    state.phase = 'viewing';
    state.timerRemaining = VIEW_SECONDS;
    persist();
    startViewingPhase();
  }

  function goPrevious() {
    completeItemIfNeeded();

    if (state.currentIndex === 0) {
      return;
    }

    state.currentIndex -= 1;
    state.phase = 'viewing';
    state.timerRemaining = VIEW_SECONDS;
    persist();
    startViewingPhase();
  }

  function finishPractice() {
    stopTimer();
    completeItemIfNeeded();
    state.completed = true;
    state.phase = 'review';
    state.completedAt = new Date().toISOString();
    if (state.startedAt) {
      const total = Math.round((new Date(state.completedAt).getTime() - new Date(state.startedAt).getTime()) / 1000);
      state.totalElapsedSeconds = Math.max(state.totalElapsedSeconds, total);
    }
    persist();
    if (typeof onRecordComplete === 'function') {
      onRecordComplete({ route, totalSeconds: state.totalElapsedSeconds, attemptedItems: state.answeredIndices.length, completedItems: practiceSet.items.length });
    }
    render();
  }

  function exportResponses() {
    const blob = new Blob([JSON.stringify({ route, practiceSet, state }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ppdt-${practiceSet.id}-responses.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function render() {
    const analyticsSummary = typeof onRecordComplete === 'function' ? '' : '';
    mountNode.innerHTML = state.completed
      ? renderReview(route, category, practiceSet, state, analyticsSummary)
      : state.started
        ? renderResponseStage(route, category, practiceSet, state, analyticsSummary, formatDuration(Math.max(state.timerRemaining, 0)))
        : renderIntro(route, category, practiceSet, state, analyticsSummary);
  }

  mountNode.onclick = (event) => {
    const target = event.target.closest('[data-action]');

    if (!target) {
      return;
    }

    const action = target.dataset.action;

    if (action === 'back') {
      stopTimer();
      if (typeof onBack === 'function') {
        onBack();
      }
      return;
    }

    if (action === 'start-ppdt') {
      startPractice();
      return;
    }

    if (action === 'next-image') {
      goNext();
      return;
    }

    if (action === 'previous-image') {
      goPrevious();
      return;
    }

    if (action === 'restart-ppdt') {
      stopTimer();
      localStorage.removeItem(`ssb-practice-session:${route}`);
      const freshState = createDefaultState(practiceSet);
      Object.assign(state, freshState, { route });
      render();
      return;
    }

    if (action === 'export-ppdt') {
      exportResponses();
    }
  };

  mountNode.oninput = (event) => {
    if (!(event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement)) {
      return;
    }

    if (!state.started || state.completed) {
      return;
    }

    saveCurrentResponse(state, practiceSet);
  };

  render();
  if (state.started && !state.completed) {
    if (state.phase === 'viewing' && state.timerRemaining > 0) {
      startViewingPhase(true);
    } else {
      render();
    }
  }

  return {
    destroy() {
      stopTimer();
      mountNode.onclick = null;
      mountNode.oninput = null;
    },
  };
}
