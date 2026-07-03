export function renderTestHeader({
  backLabel = 'Back to Practice Tests',
  title = '',
  subtitle = '',
  routeLabel = '',
  stageLabel = '',
  statusLabel = '',
} = {}) {
  return `
    <div class="practice-panel-head practice-test-header practice-session-screen">
      <div class="practice-controls">
        <button type="button" class="btn btn-outline" data-action="back">
          ${backLabel}
        </button>
        <span class="practice-session-note">${routeLabel}</span>
      </div>
      <div>
        <div class="practice-tag">${stageLabel}</div>
        <h2 class="practice-title">${title}</h2>
        <p class="practice-description">${subtitle}</p>
      </div>
      <div class="practice-session-note">${statusLabel}</div>
    </div>
  `;
}
