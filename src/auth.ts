import crypto from 'node:crypto';

// ─── Config ───────────────────────────────────────────────────────────────────
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 jam
const COOKIE_NAME = 'repo_session';

// ─── Token (HMAC-SHA256) ──────────────────────────────────────────────────────
function sign(payload: string): string {
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payload);
  return hmac.digest('hex');
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_DURATION_MS;
  const payload = `admin:${expires}`;
  const sig = sign(payload);
  // encode: payload|signature → base64url
  return Buffer.from(`${payload}|${sig}`).toString('base64url');
}

export function verifySessionToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const lastPipe = decoded.lastIndexOf('|');
    if (lastPipe === -1) return false;

    const payload = decoded.slice(0, lastPipe);
    const sig = decoded.slice(lastPipe + 1);

    // Check signature
    if (!crypto.timingSafeEqual(Buffer.from(sign(payload)), Buffer.from(sig))) {
      return false;
    }

    // Check expiry
    const parts = payload.split(':');
    const expires = parseInt(parts[1] ?? '0', 10);
    if (isNaN(expires) || Date.now() > expires) return false;

    return true;
  } catch {
    return false;
  }
}

// ─── Cookie Helpers ───────────────────────────────────────────────────────────
export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k) cookies[k.trim()] = decodeURIComponent(rest.join('=').trim());
  }
  return cookies;
}

export function getSessionCookie(cookieHeader: string | undefined): string | null {
  const cookies = parseCookies(cookieHeader);
  return cookies[COOKIE_NAME] ?? null;
}

export function makeSetCookieHeader(token: string): string {
  const maxAge = Math.floor(SESSION_DURATION_MS / 1000);
  return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function makeClearCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

// ─── Validate credentials ─────────────────────────────────────────────────────
export function checkCredentials(username: string, password: string): boolean {
  // Timing-safe comparison to prevent timing attacks
  const validUser = Buffer.from(ADMIN_USERNAME);
  const validPass = Buffer.from(ADMIN_PASSWORD);
  const inputUser = Buffer.from(username);
  const inputPass = Buffer.from(password);

  if (validUser.length !== inputUser.length || validPass.length !== inputPass.length) {
    // Still perform comparison to keep timing consistent
    crypto.timingSafeEqual(validUser, validUser);
    crypto.timingSafeEqual(validPass, validPass);
    return false;
  }

  const userOk = crypto.timingSafeEqual(validUser, inputUser);
  const passOk = crypto.timingSafeEqual(validPass, inputPass);
  return userOk && passOk;
}

// ─── Check if request is authenticated ───────────────────────────────────────
export function isAuthenticated(cookieHeader: string | undefined): boolean {
  const token = getSessionCookie(cookieHeader);
  if (!token) return false;
  return verifySessionToken(token);
}

