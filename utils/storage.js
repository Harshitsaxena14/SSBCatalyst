export function safeParseJSON(serialized, fallback) {
  if (!serialized) {
    return fallback;
  }

  try {
    return JSON.parse(serialized);
  } catch {
    return fallback;
  }
}

export function loadJSON(key, fallback) {
  return safeParseJSON(localStorage.getItem(key), fallback);
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeJSON(key) {
  localStorage.removeItem(key);
}
