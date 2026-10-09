import "server-only";

const buckets = new Map();

export function checkRateLimit({
  intervalMs = 10 * 60 * 1000,
  key,
  limit = 8,
}) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + intervalMs,
    });
    return { isLimited: false, remaining: limit - 1, resetAt: now + intervalMs };
  }

  if (bucket.count >= limit) {
    return { isLimited: true, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    isLimited: false,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

export function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
}
