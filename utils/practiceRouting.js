export const DEFAULT_PRACTICE_CATEGORY = 'ppdt';
export const DEFAULT_PRACTICE_SET = 'set-1';

export function buildPracticeRoute(categoryId, setId) {
  return `/practice/${categoryId}/${setId}`;
}

export function parsePracticeRoute(pathname) {
  const match = pathname.match(/^\/practice\/([a-z-]+)\/([a-z0-9-]+)\/?$/i);

  if (!match) {
    return { kind: 'home' };
  }

  return {
    kind: 'session',
    categoryId: match[1].toLowerCase(),
    setId: match[2].toLowerCase(),
  };
}
