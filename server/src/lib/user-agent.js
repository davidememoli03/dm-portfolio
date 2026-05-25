export function detectDevice(userAgent) {
  if (!userAgent) {
    return 'unknown';
  }

  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) {
    return 'mobile';
  }
  if (/mozilla|chrome|safari|firefox|edg\//i.test(ua)) {
    return 'desktop';
  }
  return 'unknown';
}

export function normalizeReferrer(referrer) {
  if (!referrer || referrer.trim() === '') {
    return 'Direct / none';
  }

  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return referrer.slice(0, 120);
  }
}
