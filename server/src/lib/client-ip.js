import { isPrivateIp } from './geoip.js';

function normalizeIp(value) {
  if (!value) return null;
  let ip = value.trim();
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }
  return ip || null;
}

/**
 * Resolve the visitor IP behind Caddy/nginx reverse proxies.
 * Falls back to req.ip when no public address is found (e.g. local dev).
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    for (const part of forwarded.split(',')) {
      const ip = normalizeIp(part);
      if (ip && !isPrivateIp(ip)) {
        return ip;
      }
    }
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    const ip = normalizeIp(realIp);
    if (ip && !isPrivateIp(ip)) {
      return ip;
    }
  }

  return normalizeIp(req.ip ?? req.socket?.remoteAddress ?? null);
}
