import React from 'react';
import { SocialPlatformId } from '../types/portfolio';
import {
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Globe,
  MessageCircle,
  Music,
  AtSign,
  Layers,
  Video,
  Twitter,
} from 'lucide-react';

interface PlatformIconProps {
  platform: SocialPlatformId;
  className?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  className = 'w-5 h-5',
}) => {
  switch (platform) {
    case 'instagram':
      return <Instagram className={className} />;
    case 'linkedin':
      return <Linkedin className={className} />;
    case 'x':
      return <Twitter className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'tiktok':
      return <Video className={className} />;
    case 'github':
      return <Github className={className} />;
    case 'threads':
      return <AtSign className={className} />;
    case 'behance':
      return <Layers className={className} />;
    case 'spotify':
      return <Music className={className} />;
    case 'whatsapp':
      return <MessageCircle className={className} />;
    case 'custom':
    default:
      return <Globe className={className} />;
  }
};

interface ArtworkVisualProps {
  theme: 'spatial' | 'hardware' | 'editorial' | 'kinetic';
  title: string;
  category: string;
  className?: string;
}

/**
 * High-craft architectural and geometric SVG compositions for portfolio cards
 * (Enforces Zero-Broken-Image Policy with gallery-grade visual craft).
 */
export const PortfolioArtworkGraphic: React.FC<ArtworkVisualProps> = ({
  theme,
  title,
  category,
  className = 'w-full h-48',
}) => {
  if (theme === 'hardware') {
    return (
      <div
        className={`relative overflow-hidden bg-[#141417] text-white flex flex-col justify-between p-5 select-none ${className}`}
      >
        <svg
          className="absolute right-[-10%] top-[-15%] w-64 h-64 opacity-85 pointer-events-none"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="120"
            cy="120"
            r="96"
            stroke="#3F3F46"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          <circle
            cx="120"
            cy="120"
            r="74"
            fill="#1E1E24"
            stroke="#52525B"
            strokeWidth="1.5"
          />
          <circle
            cx="120"
            cy="120"
            r="52"
            fill="#09090B"
            stroke="#E11D48"
            strokeWidth="1.5"
          />
          <line
            x1="120"
            y1="68"
            x2="120"
            y2="92"
            stroke="#E11D48"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="120" cy="120" r="6" fill="#F4F4F5" />
        </svg>

        <div className="relative z-10 flex items-center gap-2 text-[11px] font-mono-tabular text-zinc-400">
          <span>01</span>
          <span aria-hidden="true">·</span>
          <span>{category}</span>
        </div>

        <div className="relative z-10 max-w-[75%]">
          <p className="font-display text-base font-semibold tracking-tight text-zinc-100 leading-snug">
            {title}
          </p>
        </div>
      </div>
    );
  }

  if (theme === 'spatial') {
    return (
      <div
        className={`relative overflow-hidden bg-[#18181B] text-white flex flex-col justify-between p-5 select-none ${className}`}
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-80 pointer-events-none"
          viewBox="0 0 400 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="#27272A" strokeWidth="1">
            <line x1="0" y1="55" x2="400" y2="55" />
            <line x1="0" y1="110" x2="400" y2="110" />
            <line x1="0" y1="165" x2="400" y2="165" />
            <line x1="100" y1="0" x2="100" y2="220" />
            <line x1="200" y1="0" x2="200" y2="220" />
            <line x1="300" y1="0" x2="300" y2="220" />
          </g>
          <rect
            x="195"
            y="38"
            width="145"
            height="92"
            rx="10"
            fill="#09090B"
            stroke="#52525B"
            strokeWidth="1.25"
          />
          <rect
            x="225"
            y="66"
            width="145"
            height="92"
            rx="10"
            fill="#27272A"
            fillOpacity="0.7"
            stroke="#E11D48"
            strokeWidth="1.25"
          />
          <circle cx="250" cy="92" r="8" fill="#E11D48" />
          <line x1="268" y1="92" x2="340" y2="92" stroke="#A1A1AA" strokeWidth="2" />
          <line x1="242" y1="118" x2="325" y2="118" stroke="#71717A" strokeWidth="1.5" />
          <line x1="242" y1="134" x2="295" y2="134" stroke="#71717A" strokeWidth="1.5" />
        </svg>

        <div className="relative z-10 flex items-center gap-2 text-[11px] font-mono-tabular text-zinc-400">
          <span>02</span>
          <span aria-hidden="true">·</span>
          <span>{category}</span>
        </div>

        <div className="relative z-10 max-w-[70%]">
          <p className="font-display text-base font-semibold tracking-tight text-zinc-100 leading-snug">
            {title}
          </p>
        </div>
      </div>
    );
  }

  // Editorial / Kinetic Monograph with dark mode adaptation
  return (
    <div
      className={`relative overflow-hidden bg-[#F4F1EA] dark:bg-[#1E1E22] text-zinc-900 dark:text-zinc-100 border-b border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between p-5 select-none ${className}`}
    >
      <svg
        className="absolute right-4 top-4 w-44 h-44 opacity-90 pointer-events-none"
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="16"
          y="16"
          width="148"
          height="148"
          className="stroke-zinc-300 dark:stroke-zinc-700"
          strokeWidth="1"
        />
        <circle
          cx="90"
          cy="90"
          r="54"
          className="stroke-zinc-900 dark:stroke-zinc-300"
          strokeWidth="1.5"
        />
        <path d="M36 90H144" stroke="#E11D48" strokeWidth="1.5" />
        <path
          d="M90 36V144"
          className="stroke-zinc-900 dark:stroke-zinc-300"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <circle cx="90" cy="90" r="14" className="fill-zinc-900 dark:fill-zinc-100" />
      </svg>

      <div className="relative z-10 flex items-center gap-2 text-[11px] font-mono-tabular text-zinc-600 dark:text-zinc-400">
        <span>03</span>
        <span aria-hidden="true">·</span>
        <span>{category}</span>
      </div>

      <div className="relative z-10 max-w-[75%]">
        <p className="font-serif-editorial italic text-lg font-normal text-zinc-900 dark:text-zinc-100 leading-snug">
          {title}
        </p>
      </div>
    </div>
  );
};

export const CreatorAvatarVisual: React.FC<{
  name: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ name, size = 'md' }) => {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const dimensions =
    size === 'lg'
      ? 'w-20 h-20 text-2xl'
      : size === 'sm'
      ? 'w-10 h-10 text-sm'
      : 'w-14 h-14 text-lg';

  return (
    <div
      className={`${dimensions} rounded-2xl bg-zinc-900 dark:bg-zinc-950 text-white flex items-center justify-center font-display font-semibold tracking-tight relative overflow-hidden shrink-0 border border-zinc-800 dark:border-zinc-700/80 shadow-sm`}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="85" cy="15" r="45" stroke="#E11D48" strokeWidth="2" />
        <circle cx="20" cy="85" r="35" stroke="#71717A" strokeWidth="1.5" />
      </svg>
      <span className="relative z-10">{initials || 'S'}</span>
    </div>
  );
};
