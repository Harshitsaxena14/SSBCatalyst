import { escapeHtml } from '../pages/shared.js';

export function renderTextAreaCard({
  id,
  label,
  value = '',
  placeholder = '',
  rows = 6,
  helpText = '',
  large = false,
}) {
  return `
    <label class="practice-response-card${large ? ' practice-response-card--large' : ''}" for="${id}">
      <div class="practice-response-card__head">
        <span class="practice-response-card__label">${label}</span>
        ${helpText ? `<span class="practice-response-card__help">${helpText}</span>` : ''}
      </div>
      <textarea id="${id}" class="practice-session-textarea" rows="${rows}" placeholder="${placeholder}">${escapeHtml(value)}</textarea>
    </label>
  `;
}

export function renderFieldCards(fields) {
  return fields.map((field) => renderTextAreaCard(field)).join('');
}

export function renderInputGrid(items) {
  return `
    <div class="practice-input-grid">
      ${items
        .map(
          (item) => `
            <label class="practice-input-card" for="${item.id}">
              <span class="practice-input-card__label">${item.label}</span>
              <input id="${item.id}" class="practice-session-input" type="text" value="${escapeHtml(item.value || '')}" placeholder="${item.placeholder || ''}" />
            </label>
          `,
        )
        .join('')}
    </div>
  `;
}

export function renderReviewBlock({ title, content }) {
  return `
    <section class="practice-review-block">
      <h3>${title}</h3>
      <div class="practice-review-block__content">${content}</div>
    </section>
  `;
}
