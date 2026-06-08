import geoip from 'geoip-lite';

export function resolveGeo(ip) {
  if (!ip || isPrivateIp(ip)) {
    return { country: null, region: null, city: null };
  }

  const lookup = geoip.lookup(ip);
  if (!lookup) {
    return { country: null, region: null, city: null };
  }

  return {
    country: lookup.country ?? null,
    region: lookup.region ?? null,
    city: lookup.city ?? null,
  };
}

export function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip === '::1' || ip === '127.0.0.1') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) return true;
  return false;
}

export function countryLabel(code) {
  if (!code) return 'Unknown';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}
