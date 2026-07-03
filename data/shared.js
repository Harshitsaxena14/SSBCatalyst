function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function chunkArray(items, chunkSize) {
  const chunks = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

export function createMockImageUrl({
  title,
  subtitle,
  label,
  from = '#0f172a',
  to = '#1d4ed8',
  accent = '#dbeafe',
}) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640" role="img" aria-label="${escapeXml(title)}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.95" />
          <stop offset="50%" stop-color="${accent}" stop-opacity="0.22" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="28" />
        </filter>
      </defs>
      <rect width="960" height="640" fill="url(#bg)" />
      <circle cx="220" cy="170" r="160" fill="url(#glow)" filter="url(#softBlur)" />
      <circle cx="720" cy="180" r="130" fill="${accent}" fill-opacity="0.18" filter="url(#softBlur)" />
      <circle cx="590" cy="440" r="190" fill="#ffffff" fill-opacity="0.08" filter="url(#softBlur)" />
      <path d="M80 510 C190 430, 250 430, 360 500 S560 590, 820 470" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="16" stroke-linecap="round" />
      <path d="M120 210 C210 130, 320 110, 430 170 S610 300, 790 190" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="12" stroke-linecap="round" />
      <rect x="92" y="78" width="776" height="484" rx="32" fill="#000000" fill-opacity="0.16" stroke="#ffffff" stroke-opacity="0.1" />
      <text x="132" y="174" fill="#ffffff" fill-opacity="0.84" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" letter-spacing="4">${escapeXml(label)}</text>
      <text x="132" y="252" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="800">${escapeXml(title)}</text>
      <text x="132" y="318" fill="#e2e8f0" fill-opacity="0.92" font-family="Arial, Helvetica, sans-serif" font-size="28">${escapeXml(subtitle)}</text>
      <text x="132" y="408" fill="#ffffff" fill-opacity="0.72" font-family="Arial, Helvetica, sans-serif" font-size="22">Hazy practice frame for timed observation and response.</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}
