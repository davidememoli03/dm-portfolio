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

function isPrivateIp(ip) {
  if (ip === '::1' || ip === '127.0.0.1') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) return true;
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
