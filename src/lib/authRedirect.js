export function safeNextPath(value) {
  // Only dashboard destinations are part of the sign-in flow.
  return typeof value === "string" && /^\/dashboard(?:[/?#]|$)/.test(value) && !/[\\\u0000-\u0020]/.test(value)
    ? value
    : "/dashboard";
}
