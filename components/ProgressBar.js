export function renderProgressBar({ value = 0, label = '', detail = '' } = {}) {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));

  return `
    <div class="practice-session-progress-wrap">
      <div class="practice-session-progressbar" aria-hidden="true">
        <span class="practice-session-progressbar__fill" style="width: ${clampedValue}%"></span>
      </div>
      <div class="practice-session-progress-meta">
        <span>${label}</span>
        <span>${detail}</span>
      </div>
    </div>
  `;
}

export function updateProgressBar(fillElement, value) {
  if (!fillElement) {
    return;
  }

  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));
  fillElement.style.width = `${clampedValue}%`;
}
