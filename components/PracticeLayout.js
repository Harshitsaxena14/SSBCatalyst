export function renderPracticeLayout({
  eyebrow = '',
  title = '',
  subtitle = '',
  routeLabel = '',
  analytics = '',
  sidebar = '',
  body = '',
  footer = '',
}) {
  return `
    <section class="practice-session-shell">
      <div class="practice-session-shell__card">
        <header class="practice-session-topbar">
          <div class="practice-session-topbar__left">
            <div class="practice-session-topbar__title">
              <span>${eyebrow}</span>
              <strong>${title}</strong>
              <span>${subtitle}</span>
            </div>
          </div>
          <div class="practice-session-topbar__right">
            <span class="practice-session-chip">${routeLabel}</span>
            <span class="practice-session-chip">${analytics}</span>
          </div>
        </header>
        <div class="practice-session-shell__body">
          <div class="practice-session-layout">
            <aside class="practice-session-card practice-session-card--wide practice-panel practice-panel--sidebar">
              ${sidebar}
            </aside>
            <main class="practice-session-card practice-panel practice-panel--main">
              ${body}
            </main>
          </div>
        </div>
        ${footer ? `<footer class="practice-session-shell__footer">${footer}</footer>` : ''}
      </div>
    </section>
  `;
}
