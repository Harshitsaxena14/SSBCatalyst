import { loadJSON, saveJSON } from '../utils/storage.js';

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function getSessionStorageKey(route) {
  return `ssb-practice-session:${route}`;
}

export function getAnalyticsStorageKey() {
  return 'ssb-practice-analytics';
}

export function loadSessionState(route, fallback) {
  return loadJSON(getSessionStorageKey(route), fallback);
}

export function saveSessionState(route, state) {
  saveJSON(getSessionStorageKey(route), state);
}

export function clearSessionState(route) {
  localStorage.removeItem(getSessionStorageKey(route));
}

export function renderSummaryList(items) {
  return `
    <div class="practice-review-list">
      ${items
        .map(
          (item) => `
            <article class="practice-review-item">
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.body)}</p>
              ${item.meta ? `<div class="practice-review-item__meta">${escapeHtml(item.meta)}</div>` : ''}
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}

export function createDraftExport(route, payload) {
  return new Blob([JSON.stringify({ route, payload, exportedAt: new Date().toISOString() }, null, 2)], {
    type: 'application/json',
  });
}
