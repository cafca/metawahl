const KEY = "uuid";

function randomUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "u-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getOrCreateUuid(): string {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing && existing.length > 0) return existing;
    const fresh = randomUuid();
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    return randomUuid();
  }
}
