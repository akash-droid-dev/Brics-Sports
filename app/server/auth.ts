// Password login for event control, with a signed, HTTP-only session cookie.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const isProd = process.env.NODE_ENV === 'production';
const PASSWORD = process.env.ADMIN_PASSWORD ?? (isProd ? '' : 'admin');
if (!PASSWORD) throw new Error('ADMIN_PASSWORD must be set in production');
if (!process.env.ADMIN_PASSWORD) console.warn('[auth] ADMIN_PASSWORD not set — using "admin" for local development');

// A fixed secret keeps admins signed in across restarts; a random one signs everyone out on restart.
const SECRET = process.env.SESSION_SECRET ?? randomBytes(32).toString('hex');
const COOKIE = 'lh_admin';
const TTL = 12 * 3600 * 1000;

const sign = (v: string) => createHmac('sha256', SECRET).update(v).digest('base64url');
const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

function readCookie(req: Request) {
  const raw = req.headers.cookie ?? '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === COOKIE) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function isAdmin(req: Request) {
  const c = readCookie(req);
  if (!c) return false;
  const [exp, sig] = c.split('.');
  return !!exp && !!sig && safeEq(sig, sign(exp)) && Number(exp) > Date.now();
}

const failures = new Map<string, { n: number; until: number }>();

export function login(req: Request, res: Response) {
  const ip = req.ip ?? 'unknown';
  const f = failures.get(ip);
  if (f && f.until > Date.now()) return res.status(429).json({ error: 'Too many attempts. Try again in a minute.' });
  const pw = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!safeEq(sign(pw), sign(PASSWORD))) {
    const n = (f?.n ?? 0) + 1;
    failures.set(ip, { n, until: n >= 5 ? Date.now() + 60_000 : 0 });
    return res.status(401).json({ error: 'Wrong password.' });
  }
  failures.delete(ip);
  const exp = String(Date.now() + TTL);
  res.cookie(COOKIE, `${exp}.${sign(exp)}`, { httpOnly: true, sameSite: 'strict', secure: isProd, maxAge: TTL, path: '/' });
  res.json({ ok: true });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE, { path: '/' });
  res.json({ ok: true });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Sign in required.' });
  next();
}
