export function googleAuthConfigured() {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export function demoAuthAllowed() {
  return process.env.NODE_ENV !== "production" && !googleAuthConfigured();
}
