export type SocialPlatformId =
  | 'instagram'
  | 'linkedin'
  | 'x'
  | 'youtube'
  | 'tiktok'
  | 'github'
  | 'threads'
  | 'behance'
  | 'spotify'
  | 'whatsapp'
  | 'custom';

export interface SocialAccount {
  id: string;
  platform: SocialPlatformId;
  label: string;
  handle: string;
  webUrl: string;
  iosDeepLink?: string;
  androidIntentUrl?: string;
  followerCount?: string;
  enabledForBatchFollow: boolean;
}

export interface PortfolioWorkItem {
  id: string;
  title: string;
  category: string;
  year: string;
  role: string;
  summary: string;
  metrics: string;
  linkUrl: string;
  visualTheme: 'spatial' | 'hardware' | 'editorial' | 'kinetic';
}

export interface CreatorStep {
  id: string;
  indexNumber: string;
  title: string;
  description: string;
  deliverable: string;
}

export type QrFrameStyle =
  | 'squircle'
  | 'pill-capsule'
  | 'circular-halo'
  | 'architectural-brackets';

export interface QrStyleConfig {
  fgColor: string;
  bgColor: string;
  cardAccent: string;
  frameStyle?: QrFrameStyle;
  autoTriggerPopupOnScan: boolean;
  instantFollowPromptOnScan: boolean;
  cardHeadline: string;
}

export interface CreatorProfile {
  name: string;
  handle: string;
  roleTitle: string;
  location: string;
  availabilityText: string;
  bioShort: string;
  whatIDo: string;
  howICreateIntro: string;
  email: string;
  phone: string;
  website: string;
  avatarStyle: 'monogram' | 'editorial-portrait' | 'geometric';
  metrics: {
    audienceReach: string;
    projectsShipped: string;
    yearsExperience: string;
  };
  socials: SocialAccount[];
  works: PortfolioWorkItem[];
  processSteps: CreatorStep[];
  qrConfig: QrStyleConfig;
}

export interface PlatformMetadata {
  id: SocialPlatformId;
  name: string;
  placeholderHandle: string;
  actionVerb: string;
  buildUrls: (input: string) => {
    cleanHandle: string;
    webUrl: string;
    iosDeepLink: string;
    androidIntentUrl: string;
  };
}

function extractCleanHandle(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  // If user pasted a full URL, extract the last path segment
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1] || '';
      return last.replace(/^@/, '');
    } catch {
      return trimmed.replace(/^@/, '');
    }
  }
  return trimmed.replace(/^@/, '').replace(/\/+$/, '');
}

export const PLATFORM_REGISTRY: Record<SocialPlatformId, PlatformMetadata> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    placeholderHandle: 'siddiq.studio',
    actionVerb: 'Follow on Instagram',
    buildUrls: (input: string) => {
      const h = extractCleanHandle(input) || 'siddiq.studio';
      return {
        cleanHandle: `@${h}`,
        webUrl: `https://www.instagram.com/${h}/`,
        iosDeepLink: `instagram://user?username=${h}`,
        androidIntentUrl: `intent://instagram.com/_u/${h}/#Intent;package=com.instagram.android;scheme=https;end`,
      };
    },
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    placeholderHandle: 'siddiq-creative',
    actionVerb: 'Connect on LinkedIn',
    buildUrls: (input: string) => {
      const h = extractCleanHandle(input) || 'siddiq-creative';
      return {
        cleanHandle: `/in/${h}`,
        webUrl: `https://www.linkedin.com/in/${h}/`,
        iosDeepLink: `linkedin://in/${h}`,
        androidIntentUrl: `intent://www.linkedin.com/in/${h}#Intent;package=com.linkedin.android;scheme=https;end`,
      };
    },
  },
  x: {
    id: 'x',
    name: 'X (Twitter)',
    placeholderHandle: 'siddiq_builds',
    actionVerb: 'Follow on X',
    buildUrls: (input: string) => {
      const h = extractCleanHandle(input) || 'siddiq_builds';
      return {
        cleanHandle: `@${h}`,
        webUrl: `https://x.com/intent/follow?screen_name=${h}`,
        iosDeepLink: `twitter://user?screen_name=${h}`,
        androidIntentUrl: `intent://twitter.com/${h}#Intent;package=com.twitter.android;scheme=https;end`,
      };
    },
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    placeholderHandle: 'SiddiqCreates',
    actionVerb: 'Subscribe on YouTube',
    buildUrls: (input: string) => {
      const h = extractCleanHandle(input) || 'SiddiqCreates';
      return {
        cleanHandle: `@${h}`,
        webUrl: `https://www.youtube.com/@${h}?sub_confirmation=1`,
        iosDeepLink: `vnd.youtube://www.youtube.com/@${h}`,
        androidIntentUrl: `intent://www.youtube.com/@${h}#Intent;package=com.google.android.youtube;scheme=https;end`,
      };
    },
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    placeholderHandle: 'siddiq.motion',
    actionVerb: 'Follow on TikTok',
    buildUrls: (input: string) => {
      const h = extractCleanHandle(input) || 'siddiq.motion';
      return {
        cleanHandle: `@${h}`,
        webUrl: `https://www.tiktok.com/@${h}`,
        iosDeepLink: `snssdk1233://user/profile/${h}`,
        androidIntentUrl: `intent://www.tiktok.com/@${h}#Intent;package=com.zhiliaoapp.musically;scheme=https;end`,
      };
    },
  },
  github: {
    id: 'github',
    name: 'GitHub',
    placeholderHandle: 'siddiq-dev',
    actionVerb: 'Follow on GitHub',
    buildUrls: (input: string) => {
      const h = extractCleanHandle(input) || 'siddiq-dev';
      return {
        cleanHandle: `github.com/${h}`,
        webUrl: `https://github.com/${h}`,
        iosDeepLink: `https://github.com/${h}`,
        androidIntentUrl: `intent://github.com/${h}#Intent;package=com.github.android;scheme=https;end`,
      };
    },
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    placeholderHandle: 'siddiq.studio',
    actionVerb: 'Follow on Threads',
    buildUrls: (input: string) => {
      const h = extractCleanHandle(input) || 'siddiq.studio';
      return {
        cleanHandle: `@${h}`,
        webUrl: `https://www.threads.net/@${h}`,
        iosDeepLink: `barcelona://user?username=${h}`,
        androidIntentUrl: `intent://www.threads.net/@${h}#Intent;package=com.instagram.barcelona;scheme=https;end`,
      };
    },
  },
  behance: {
    id: 'behance',
    name: 'Behance',
    placeholderHandle: 'siddiqworks',
    actionVerb: 'Follow on Behance',
    buildUrls: (input: string) => {
      const h = extractCleanHandle(input) || 'siddiqworks';
      return {
        cleanHandle: `be.net/${h}`,
        webUrl: `https://www.behance.net/${h}`,
        iosDeepLink: `https://www.behance.net/${h}`,
        androidIntentUrl: `https://www.behance.net/${h}`,
      };
    },
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    placeholderHandle: 'siddiqsound',
    actionVerb: 'Listen on Spotify',
    buildUrls: (input: string) => {
      const h = extractCleanHandle(input) || 'siddiqsound';
      return {
        cleanHandle: h,
        webUrl: `https://open.spotify.com/user/${h}`,
        iosDeepLink: `spotify:user:${h}`,
        androidIntentUrl: `intent://open.spotify.com/user/${h}#Intent;package=com.spotify.music;scheme=https;end`,
      };
    },
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    placeholderHandle: '15552345678',
    actionVerb: 'Message on WhatsApp',
    buildUrls: (input: string) => {
      const digits = input.replace(/[^0-9]/g, '') || '15552345678';
      return {
        cleanHandle: `+${digits}`,
        webUrl: `https://wa.me/${digits}`,
        iosDeepLink: `whatsapp://send?phone=${digits}`,
        androidIntentUrl: `intent://send?phone=${digits}#Intent;package=com.whatsapp;scheme=whatsapp;end`,
      };
    },
  },
  custom: {
    id: 'custom',
    name: 'Custom Website / Link',
    placeholderHandle: 'https://siddiq.design',
    actionVerb: 'Open Link',
    buildUrls: (input: string) => {
      const url = input.startsWith('http') ? input : `https://${input || 'siddiq.design'}`;
      return {
        cleanHandle: url.replace(/^https?:\/\//, ''),
        webUrl: url,
        iosDeepLink: url,
        androidIntentUrl: url,
      };
    },
  },
};

export const DEFAULT_CREATOR_PROFILE: CreatorProfile = {
  name: 'Mohammed Siddiq',
  handle: '@siddiqpower',
  roleTitle: 'Multidisciplinary Product Designer & Creative Technologist',
  location: 'San Francisco · Singapore',
  availabilityText: 'Available for select Q4 commissions & advisory',
  bioShort:
    'Designing tactile digital products, interactive spatial systems, and high-retention visual identities at the intersection of industrial craft and web engineering.',
  whatIDo:
    'I partner with founders and design-forward brands to architect flagship web experiences, design systems, and physical-digital brand worlds. My focus is turning complex technical capabilities into intuitive, sensory interfaces people love to use.',
  howICreateIntro:
    'Every project follows a three-stage studio discipline—moving rapidly from raw physical sketches and interaction prototypes directly into production code.',
  email: 'onlysiddiq100@gmail.com',
  phone: '+1 (415) 890-4321',
  website: 'https://github.com/siddiq-1000',
  avatarStyle: 'editorial-portrait',
  metrics: {
    audienceReach: '3 Channels',
    projectsShipped: '42',
    yearsExperience: '7 Yrs',
  },
  socials: [
    {
      id: 'soc-linkedin',
      platform: 'linkedin',
      label: 'LinkedIn',
      handle: 'mohammed-siddiq100',
      webUrl: 'https://www.linkedin.com/in/mohammed-siddiq100/',
      iosDeepLink: 'linkedin://in/mohammed-siddiq100',
      androidIntentUrl:
        'intent://www.linkedin.com/in/mohammed-siddiq100/#Intent;package=com.linkedin.android;scheme=https;end',
      followerCount: 'Step 01 · Connect',
      enabledForBatchFollow: true,
    },
    {
      id: 'soc-github',
      platform: 'github',
      label: 'GitHub',
      handle: 'siddiq-1000',
      webUrl: 'https://github.com/siddiq-1000',
      iosDeepLink: 'https://github.com/siddiq-1000',
      androidIntentUrl:
        'intent://github.com/siddiq-1000#Intent;package=com.github.android;scheme=https;end',
      followerCount: 'Step 02 · Follow',
      enabledForBatchFollow: true,
    },
    {
      id: 'soc-instagram',
      platform: 'instagram',
      label: 'Instagram',
      handle: 'siddiqpower',
      webUrl: 'https://www.instagram.com/siddiqpower/',
      iosDeepLink: 'instagram://user?username=siddiqpower',
      androidIntentUrl:
        'intent://instagram.com/_u/siddiqpower/#Intent;package=com.instagram.android;scheme=https;end',
      followerCount: 'Step 03 · Follow',
      enabledForBatchFollow: true,
    },
  ],
  works: [
    {
      id: 'work-1',
      title: 'Kinetix Spatial Sound Controller',
      category: 'Industrial & Interaction Design',
      year: '2026',
      role: 'Lead Product Designer',
      summary:
        'Anodized aluminum rotary hardware interface paired with a real-time WebAudio spatial synthesis engine for live electronic performers.',
      metrics: 'Featured in Dezeen · 14,000+ units reserved',
      linkUrl: 'https://siddiq.studio/works/kinetix',
      visualTheme: 'hardware',
    },
    {
      id: 'work-2',
      title: 'Aether — Autonomous Design System',
      category: 'Design Architecture & Engineering',
      year: '2026',
      role: 'Principal Architect',
      summary:
        'Multi-platform component language and token pipeline powering 18 consumer fintech and creative productivity applications.',
      metrics: 'Reduced UI build time by 64% across 90 engineers',
      linkUrl: 'https://siddiq.studio/works/aether',
      visualTheme: 'spatial',
    },
    {
      id: 'work-3',
      title: 'Monolith Issue 04: Tactile Futures',
      category: 'Editorial Direction & Print',
      year: '2025',
      role: 'Creative Director',
      summary:
        'A 240-page Swiss-bound physical monograph and interactive web companion exploring post-screen hardware interfaces.',
      metrics: 'Sold out 5,000 first-edition print run',
      linkUrl: 'https://siddiq.studio/works/monolith',
      visualTheme: 'editorial',
    },
  ],
  processSteps: [
    {
      id: 'step-1',
      indexNumber: '01.',
      title: 'Sensory Prototyping & Physical Sketching',
      description:
        'Before touching layout grids, I map out how an interface should feel in the hand—testing motion curves, thumb-zone ergonomics, and tactile pacing inside live interactive sandboxes.',
      deliverable: 'Interactive Motion Studies & Architecture Spec',
    },
    {
      id: 'step-2',
      indexNumber: '02.',
      title: 'Systemic Craft & Typography',
      description:
        'Every surface is governed by strict typographic hierarchy, optical contrast math, and bespoke SVG/shader visual systems that scale cleanly across mobile and desktop viewports.',
      deliverable: 'Tokenized Design System & Visual Language',
    },
    {
      id: 'step-3',
      indexNumber: '03.',
      title: 'Production-Grade Engineering',
      description:
        'I bridge the gap between studio concept and shipped reality by writing clean TypeScript, WebGL/Canvas interactions, and native deep-link protocols directly in production.',
      deliverable: 'Shipped Full-Stack Application & Brand Hardware',
    },
  ],
  qrConfig: {
    fgColor: '#09090B',
    bgColor: '#FFFFFF',
    cardAccent: '#E11D48',
    frameStyle: 'squircle',
    autoTriggerPopupOnScan: true,
    instantFollowPromptOnScan: true,
    cardHeadline: 'Scan to open mini-portfolio & follow all socials',
  },
};
