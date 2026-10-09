"use client";

const prefix = "biui:";
const version = 1;

export function readLocalCache(key) {
  if (!canUseStorage()) return null;

  try {
    const rawValue = window.localStorage.getItem(getCacheKey(key));
    if (!rawValue) return null;

    const entry = JSON.parse(rawValue);

    if (entry.version !== version || Date.now() > entry.expiresAt) {
      window.localStorage.removeItem(getCacheKey(key));
      return null;
    }

    return entry.value;
  } catch {
    return null;
  }
}

export function writeLocalCache(key, value, ttlMs) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(
      getCacheKey(key),
      JSON.stringify({
        expiresAt: Date.now() + ttlMs,
        value,
        version,
      }),
    );
  } catch {
    // Storage can be full or blocked; the app should keep working without cache.
  }
}

export function clearLocalCache(key) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(getCacheKey(key));
  } catch {
    // Ignore storage failures.
  }
}

export function getUserCacheKey(user, key) {
  return `user:${user?.id ?? "anonymous"}:${key}`;
}

function getCacheKey(key) {
  return `${prefix}${key}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}
