import { renderProgressBar } from '../components/ProgressBar.js';
import { renderPracticeLayout } from '../components/PracticeLayout.js';
import { renderTestHeader } from '../components/TestHeader.js';
import { renderTextAreaCard, renderReviewBlock } from '../components/ResponseArea.js';
import { escapeHtml, loadSessionState, saveSessionState } from './shared.js';
import { sdSectionBlueprint } from '../data/sdData.js';

function createDefaultState() {
  return {
    started: false,
    completed: false,
    responses: Object.fromEntries(sdSectionBlueprint.map((section) => [section.id, ''])),
    startedAt: null,
    completedAt: null,
    totalElapsedSeconds: 0,
  };
}

function readCurrentFormState() {
  return Object.fromEntries(
    sdSectionBlueprint.map((section) => [section.id, document.getElementById(section.id)?.value || '']),
  );
}

function countCompletedSections(responses) {
  return sdSectionBlueprint.filter((section) => (responses[section.id] || '').trim().length > 0).length;
}

function renderIntro(route, category, practiceSet, hasDraft) {
  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - SD Drill`,
    subtitle: 'Build a balanced self-description using the seven standard sections. The draft auto-saves and can be resumed later.',
    routeLabel: route,
    analytics: `${sdSectionBlueprint.length} sections`,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Practice set</div>
        <h3 class="practice-panel-title">${practiceSet.title}</h3>
        <p class="practice-panel-copy">${practiceSet.description}</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${sdSectionBlueprint.length}</strong><span>Sections</span></div>
        <div class="practice-metric"><strong>Autosave</strong><span>Enabled</span></div>
        <div class="practice-metric"><strong>${practiceSet.difficulty}</strong><span>Level</span></div>
      </div>
      <div class="practice-note-box">
        <strong>Instructions</strong>
        <ul>
          <li>Answer all seven sections clearly.</li>
          <li>Keep the language balanced and honest.</li>
          <li>You can export or resume the draft later.</li>
        </ul>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'SD - Instructions',
        title: 'Self Description Practice',
        subtitle: 'Use the form to build a realistic profile across parents, friends, teachers, self-view, goals, weaknesses, and strengths.',
        routeLabel: route,
        statusLabel: hasDraft ? 'Draft found - resume available' : 'New draft',
      })}
      <section class="practice-session-summary__card">
        <h3>How the drill works</h3>
        <div class="practice-session-summary__item"><span>Autosave</span><strong>Enabled</strong></div>
        <div class="practice-session-summary__item"><span>Draft restore</span><strong>Available on refresh</strong></div>
        <div class="practice-session-summary__item"><span>Export</span><strong>JSON download</strong></div>
      </section>
      <div class="practice-session-controls">
        <button type="button" class="btn btn-primary" data-action="start-sd">${hasDraft ? 'Resume Draft' : 'Start Draft'}</button>
        <button type="button" class="btn btn-outline" data-action="reset-sd">Reset Draft</button>
      </div>
      ${renderProgressBar({ value: hasDraft ? 0 : 0, label: 'Progress', detail: '7 sections ready' })}
    `,
  });
}

function renderForm(route, category, practiceSet, state) {
  const completedSections = countCompletedSections(state.responses);
  const progressValue = (completedSections / sdSectionBlueprint.length) * 100;

  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - SD Drill`,
    subtitle: 'Write each section in full. The draft saves while you type and can be exported for review.',
    routeLabel: route,
    analytics: `${completedSections}/${sdSectionBlueprint.length} sections drafted`,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Form progress</div>
        <h3 class="practice-panel-title">${practiceSet.focus}</h3>
        <p class="practice-panel-copy">Keep your answers balanced, direct, and believable.</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${completedSections}</strong><span>Sections complete</span></div>
        <div class="practice-metric"><strong>${sdSectionBlueprint.length - completedSections}</strong><span>Remaining</span></div>
        <div class="practice-metric"><strong>${practiceSet.difficulty}</strong><span>Difficulty</span></div>
      </div>
      <div class="practice-note-box">
        <strong>Suggestions</strong>
        <ul>
          <li>Show self-awareness without sounding rehearsed.</li>
          <li>Keep strengths practical and weaknesses improvable.</li>
          <li>Make life goals feel specific and realistic.</li>
        </ul>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'SD - Live Form',
        title: 'Self Description Form',
        subtitle: 'Fill all seven sections below. Use the save draft action if you want to stop and come back later.',
        routeLabel: route,
        statusLabel: `${completedSections}/${sdSectionBlueprint.length} completed`,
      })}
      <div class="practice-session-controls">
        <button type="button" class="btn btn-primary" data-action="save-sd">Save Draft</button>
        <button type="button" class="btn btn-outline" data-action="export-sd">Export Response</button>
        <button type="button" class="btn btn-outline" data-action="submit-sd">Submit Practice</button>
      </div>
      ${renderProgressBar({ value: progressValue, label: 'Completion', detail: `${completedSections}/${sdSectionBlueprint.length} sections` })}
      <div class="practice-session-grid">
        ${sdSectionBlueprint
          .map((section) => renderTextAreaCard({
            id: section.id,
            label: section.label,
            value: state.responses[section.id],
            placeholder: section.placeholder,
            rows: 6,
            helpText: section.prompt,
            large: true,
          }))
          .join('')}
      </div>
    `,
  });
}

function renderReview(route, category, practiceSet, state) {
  const cards = sdSectionBlueprint.map((section) => renderReviewBlock({
    title: section.label,
    content: `
      <p><strong>Prompt:</strong> ${escapeHtml(section.prompt)}</p>
      <p><strong>Your response:</strong><br>${escapeHtml(state.responses[section.id] || 'No response recorded')}</p>
    `,
  })).join('');

  return renderPracticeLayout({
    eyebrow: category.tag,
    title: `${practiceSet.title} - Final Review`,
    subtitle: 'Review the self-description draft, export it, or restart if you want another version.',
    routeLabel: route,
    analytics: `${countCompletedSections(state.responses)}/${sdSectionBlueprint.length} sections complete`,
    sidebar: `
      <div class="practice-panel-head">
        <div class="practice-detail__eyebrow">Completed</div>
        <h3 class="practice-panel-title">SD review</h3>
        <p class="practice-panel-copy">The completed form remains in local storage for later review.</p>
      </div>
      <div class="practice-metric-grid">
        <div class="practice-metric"><strong>${countCompletedSections(state.responses)}</strong><span>Sections filled</span></div>
        <div class="practice-metric"><strong>${practiceSet.difficulty}</strong><span>Difficulty</span></div>
        <div class="practice-metric"><strong>${state.totalElapsedSeconds ? `${state.totalElapsedSeconds}s` : 'Saved'}</strong><span>Practice time</span></div>
      </div>
      <div class="practice-note-box">
        <strong>Suggestions</strong>
        <ul>
          <li>Keep the answer honest and concise.</li>
          <li>Let strengths sound practical, not exaggerated.</li>
          <li>Make goals and weaknesses consistent with the rest of the form.</li>
        </ul>
      </div>
    `,
    body: `
      ${renderTestHeader({
        stageLabel: 'SD - Review',
        title: 'Submission screen',
        subtitle: 'The draft is complete. Review the full form below and export a copy if needed.',
        routeLabel: route,
        statusLabel: `${countCompletedSections(state.responses)}/${sdSectionBlueprint.length} sections complete`,
      })}
      <div class="practice-session-controls">
        <button type="button" class="btn btn-primary" data-action="restart-sd">Restart set</button>
        <button type="button" class="btn btn-outline" data-action="export-sd">Export response JSON</button>
      </div>
      <div class="practice-session-summary">${renderProgressBar({ value: 100, label: 'Completion', detail: '100% finished' })}</div>
      <div class="practice-session-summary">${cards}</div>
      <section class="practice-suggestion-box">
        <h3>Improvement suggestions</h3>
        <p>Keep each section short, specific, and internally consistent. The strongest SD answers sound honest and balanced rather than polished or generic.</p>
      </section>
    `,
  });
}

export function mountSDPractice({ mountNode, route, category, practiceSet, onBack, onRecordComplete }) {
  const stored = loadSessionState(route, null);
  const state = stored || createDefaultState();
  state.route = route;

  function persist() {
    saveSessionState(route, state);
  }

  function saveCurrentDraft() {
    state.responses = readCurrentFormState();
    persist();
  }

  function startPractice() {
    state.started = true;
    state.startedAt = state.startedAt || new Date().toISOString();
    persist();
    render();
  }

  function submitPractice() {
    saveCurrentDraft();
    state.completed = true;
    state.completedAt = new Date().toISOString();
    if (state.startedAt) {
      const total = Math.round((new Date(state.completedAt).getTime() - new Date(state.startedAt).getTime()) / 1000);
      state.totalElapsedSeconds = Math.max(state.totalElapsedSeconds, total);
    }
    persist();
    if (typeof onRecordComplete === 'function') {
      onRecordComplete({ route, totalSeconds: state.totalElapsedSeconds, attemptedItems: countCompletedSections(state.responses), completedItems: sdSectionBlueprint.length });
    }
    render();
  }

  function exportResponses() {
    const blob = new Blob([JSON.stringify({ route, practiceSet, state }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sd-${practiceSet.id}-responses.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function render() {
    const hasDraft = countCompletedSections(state.responses) > 0 && !state.completed;
    mountNode.innerHTML = state.completed
      ? renderReview(route, category, practiceSet, state)
      : state.started
        ? renderForm(route, category, practiceSet, state)
        : renderIntro(route, category, practiceSet, hasDraft);
  }

  mountNode.onclick = (event) => {
    const target = event.target.closest('[data-action]');

    if (!target) {
      return;
    }

    switch (target.dataset.action) {
      case 'back':
        if (typeof onBack === 'function') {
          onBack();
        }
        break;
      case 'start-sd':
        startPractice();
        break;
      case 'reset-sd':
        localStorage.removeItem(`ssb-practice-session:${route}`);
        Object.assign(state, createDefaultState(), { route });
        render();
        break;
      case 'save-sd':
        saveCurrentDraft();
        break;
      case 'submit-sd':
        submitPractice();
        break;
      case 'restart-sd':
        localStorage.removeItem(`ssb-practice-session:${route}`);
        Object.assign(state, createDefaultState(), { route });
        render();
        break;
      case 'export-sd':
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

    saveCurrentDraft();
  };

  render();

  return {
    destroy() {
      mountNode.onclick = null;
      mountNode.oninput = null;
    },
  };
}
