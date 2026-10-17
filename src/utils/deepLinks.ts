import { CreatorProfile, DEFAULT_CREATOR_PROFILE, SocialAccount } from '../types/portfolio';

const STORAGE_KEY = 'tapcard_studio_profile_v2';

export function detectDeviceOS(): 'ios' | 'android' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || navigator.vendor || '';
  if (/iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream) {
    return 'ios';
  }
  if (/android/i.test(ua)) {
    return 'android';
  }
  return 'desktop';
}

/**
 * Resolves the optimal URL to trigger native mobile app opening when installed,
 * or universal link / web tab fallback when on desktop or when the app is not installed.
 */
export function resolveSmartAppUrl(account: SocialAccount, preferNativeScheme = false): string {
  const os = detectDeviceOS();
  if (preferNativeScheme) {
    if (os === 'android' && account.androidIntentUrl) {
      return account.androidIntentUrl;
    }
    if (os === 'ios' && account.iosDeepLink) {
      return account.iosDeepLink;
    }
  }
  // Universal HTTPS links (https://www.instagram.com/..., https://www.linkedin.com/in/...)
  // automatically trigger iOS Universal Links and Android App Links when opened from a user tap,
  // while gracefully falling back to the browser tab if the app is not installed.
  return account.webUrl;
}

/**
 * Triggers opening a social account. On mobile devices, can attempt native URI scheme
 * with automatic fallback to the web URL in a new tab.
 */
export function launchSocialAccount(
  account: SocialAccount,
  options: { useDeepSchemeFirst?: boolean } = {}
): void {
  const os = detectDeviceOS();

  if (options.useDeepSchemeFirst && os === 'ios' && account.iosDeepLink && !account.iosDeepLink.startsWith('http')) {
    const start = Date.now();
    window.location.href = account.iosDeepLink;
    setTimeout(() => {
      if (Date.now() - start < 1800) {
        window.open(account.webUrl, '_blank', 'noopener,noreferrer');
      }
    }, 1200);
    return;
  }

  if (options.useDeepSchemeFirst && os === 'android' && account.androidIntentUrl && account.androidIntentUrl.startsWith('intent://')) {
    window.location.href = account.androidIntentUrl;
    return;
  }

  // Standard new-tab launch (triggers Universal Links / App Links on mobile if installed, or opens next tab)
  const link = document.createElement('a');
  link.href = account.webUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a real .vcf (vCard 3.0) contact card containing the creator's
 * full name, role, email, phone, portfolio website, and all social media profile URLs.
 */
export function downloadCreatorVCard(profile: CreatorProfile): void {
  const socialNotes = profile.socials
    .map((s) => `${s.label}: ${s.webUrl}`)
    .join('\\n');

  const vcardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.name}`,
    `N:${profile.name};;;;`,
    `TITLE:${profile.roleTitle}`,
    `EMAIL;TYPE=INTERNET,WORK:${profile.email}`,
    `TEL;TYPE=CELL:${profile.phone}`,
    `URL:${profile.website}`,
    ...profile.socials.map(
      (s, idx) => `item${idx + 1}.URL:${s.webUrl}\nitem${idx + 1}.X-ABLabel:${s.label}`
    ),
    `NOTE:${profile.bioShort.replace(/\n/g, ' ')}\\n\\nSocial Profiles:\\n${socialNotes}`,
    'END:VCARD',
  ];

  const blob = new Blob([vcardLines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_contact.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Encodes essential profile data into a compact URL parameter so that scanning the QR code
 * on a completely separate phone renders the user's customized handles, bio, and portfolio!
 */
export function buildShareableScanUrl(profile: CreatorProfile): string {
  const baseUrl = window.location.origin + window.location.pathname;
  try {
    const compactPayload = {
      n: profile.name,
      h: profile.handle,
      r: profile.roleTitle,
      l: profile.location,
      a: profile.availabilityText,
      b: profile.bioShort,
      w: profile.whatIDo,
      e: profile.email,
      p: profile.phone,
      u: profile.website,
      m: [
        profile.metrics.audienceReach,
        profile.metrics.projectsShipped,
        profile.metrics.yearsExperience,
      ],
      s: profile.socials.map((soc) => ({
        p: soc.platform,
        l: soc.label,
        h: soc.handle,
        w: soc.webUrl,
        i: soc.iosDeepLink,
        a: soc.androidIntentUrl,
        f: soc.followerCount,
        e: soc.enabledForBatchFollow ? 1 : 0,
      })),
    };
    const jsonString = JSON.stringify(compactPayload);
    const encoded = btoa(encodeURIComponent(jsonString));
    // Keep QR code density scannable; if payload is reasonably compact, embed it
    if (encoded.length < 1600) {
      return `${baseUrl}?scan=1&d=${encoded}`;
    }
  } catch {
    // Fallback to clean scan parameter
  }
  return `${baseUrl}?scan=1`;
}

export function loadProfileFromStorageOrUrl(): {
  profile: CreatorProfile;
  isScannedMode: boolean;
} {
  const params = new URLSearchParams(window.location.search);
  const isScannedMode = params.get('scan') === '1';
  const encodedData = params.get('d');

  // First check localStorage
  let baseProfile: CreatorProfile = DEFAULT_CREATOR_PROFILE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      baseProfile = { ...DEFAULT_CREATOR_PROFILE, ...JSON.parse(saved) };
    }
  } catch {
    // ignore storage errors
  }

  // If scanned with embedded payload parameter `d`, hydrate from URL so another device sees customized socials
  if (encodedData) {
    try {
      const decodedJson = decodeURIComponent(atob(encodedData));
      const parsed = JSON.parse(decodedJson);
      if (parsed && parsed.n && Array.isArray(parsed.s)) {
        baseProfile = {
          ...baseProfile,
          name: parsed.n || baseProfile.name,
          handle: parsed.h || baseProfile.handle,
          roleTitle: parsed.r || baseProfile.roleTitle,
          location: parsed.l || baseProfile.location,
          availabilityText: parsed.a || baseProfile.availabilityText,
          bioShort: parsed.b || baseProfile.bioShort,
          whatIDo: parsed.w || baseProfile.whatIDo,
          email: parsed.e || baseProfile.email,
          phone: parsed.p || baseProfile.phone,
          website: parsed.u || baseProfile.website,
          metrics: parsed.m
            ? {
                audienceReach: parsed.m[0] || baseProfile.metrics.audienceReach,
                projectsShipped: parsed.m[1] || baseProfile.metrics.projectsShipped,
                yearsExperience: parsed.m[2] || baseProfile.metrics.yearsExperience,
              }
            : baseProfile.metrics,
          socials: parsed.s.map(
            (
              item: {
                p: CreatorProfile['socials'][0]['platform'];
                l: string;
                h: string;
                w: string;
                i?: string;
                a?: string;
                f?: string;
                e?: number;
              },
              index: number
            ) => ({
              id: `soc-url-${index}`,
              platform: item.p,
              label: item.l,
              handle: item.h,
              webUrl: item.w,
              iosDeepLink: item.i,
              androidIntentLink: item.a,
              followerCount: item.f,
              enabledForBatchFollow: item.e === 1,
            })
          ),
        };
      }
    } catch {
      // Fallback to baseProfile if decoding fails
    }
  }

  return { profile: baseProfile, isScannedMode };
}

export function saveProfileToStorage(profile: CreatorProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore storage quota errors
  }
}
