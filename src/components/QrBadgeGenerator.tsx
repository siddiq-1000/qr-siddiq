import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { CreatorProfile, QrFrameStyle } from '../types/portfolio';
import { buildShareableScanUrl } from '../utils/deepLinks';
import {
  Download,
  Copy,
  Check,
  QrCode as QrIcon,
  Smartphone,
  Sparkles,
  Frame,
} from 'lucide-react';

interface QrBadgeGeneratorProps {
  profile: CreatorProfile;
  onSimulateScan: () => void;
  onUpdateQrConfig: (updates: Partial<CreatorProfile['qrConfig']>) => void;
}

const COLOR_PRESETS = [
  { name: 'Obsidian Ink', fg: '#09090B', bg: '#FFFFFF' },
  { name: 'Cinnabar Crimson', fg: '#9F1239', bg: '#FFF1F2' },
  { name: 'Cobalt Studio', fg: '#1E3A8A', bg: '#F8FAFC' },
  { name: 'Forest Monograph', fg: '#064E3B', bg: '#F0FDF4' },
];

const FRAME_STYLE_OPTIONS: {
  id: QrFrameStyle;
  label: string;
  description: string;
}[] = [
  {
    id: 'squircle',
    label: 'Soft Squircle',
    description: 'Smooth continuous corners',
  },
  {
    id: 'pill-capsule',
    label: 'Modern Pill',
    description: 'Vertical capsule frame with scan tag',
  },
  {
    id: 'circular-halo',
    label: 'Circular Halo',
    description: 'Concentric circular lens badge',
  },
  {
    id: 'architectural-brackets',
    label: 'Corner Brackets',
    description: 'Precision viewfinder reticle',
  },
];

export const QrBadgeGenerator: React.FC<QrBadgeGeneratorProps> = ({
  profile,
  onSimulateScan,
  onUpdateQrConfig,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [downloadingBadge, setDownloadingBadge] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const scanUrl = buildShareableScanUrl(profile);
  const activeFrameStyle: QrFrameStyle =
    profile.qrConfig.frameStyle || 'squircle';

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(scanUrl, {
      width: 560,
      margin: 2,
      color: {
        dark: profile.qrConfig.fgColor || '#09090B',
        light: profile.qrConfig.bgColor || '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch(() => {
        QRCode.toDataURL(`${window.location.origin}${window.location.pathname}?scan=1`, {
          width: 560,
          margin: 2,
          color: {
            dark: profile.qrConfig.fgColor || '#09090B',
            light: profile.qrConfig.bgColor || '#FFFFFF',
          },
        }).then((fallbackUrl) => {
          if (isMounted) setQrDataUrl(fallbackUrl);
        });
      });

    return () => {
      isMounted = false;
    };
  }, [scanUrl, profile.qrConfig.fgColor, profile.qrConfig.bgColor]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scanUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_qr_code.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadPrintableCard = async () => {
    if (!qrDataUrl) return;
    setDownloadingBadge(true);
    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#09090B';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#27272A';
      ctx.lineWidth = 3;
      ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

      ctx.fillStyle = '#E11D48';
      ctx.font = '600 22px "JetBrains Mono", monospace';
      ctx.fillText('TAPCARD STUDIO // INSTANT QR PASS', 84, 110);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 64px "Outfit", sans-serif';
      ctx.fillText(profile.name, 84, 195);

      ctx.fillStyle = '#A1A1AA';
      ctx.font = '500 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(profile.roleTitle.slice(0, 48), 84, 245);

      const qrBoxSize = 560;
      const qrBoxX = (canvas.width - qrBoxSize) / 2;
      const qrBoxY = 315;
      const bgFill = profile.qrConfig.bgColor || '#FFFFFF';
      const fgInk = profile.qrConfig.fgColor || '#09090B';

      // Draw frame according to activeFrameStyle
      if (activeFrameStyle === 'circular-halo') {
        const centerX = canvas.width / 2;
        const centerY = qrBoxY + qrBoxSize / 2;
        const outerRadius = qrBoxSize / 2 + 28;

        // Outer dashed halo ring
        ctx.save();
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Main circular disc
        ctx.fillStyle = bgFill;
        ctx.beginPath();
        ctx.arc(centerX, centerY, qrBoxSize / 2 + 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeFrameStyle === 'pill-capsule') {
        const pillWidth = qrBoxSize + 20;
        const pillHeight = qrBoxSize + 86;
        const pillX = (canvas.width - pillWidth) / 2;
        const pillY = qrBoxY - 16;

        ctx.fillStyle = bgFill;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 140);
        ctx.fill();

        ctx.strokeStyle = fgInk;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Bottom pill scan badge
        ctx.fillStyle = fgInk;
        ctx.font = '600 20px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SCAN FOR MINI-PORTFOLIO', canvas.width / 2, pillY + pillHeight - 28);
        ctx.textAlign = 'start';
      } else if (activeFrameStyle === 'architectural-brackets') {
        ctx.fillStyle = bgFill;
        ctx.beginPath();
        ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 12);
        ctx.fill();

        // Draw 4 precision corner viewfinder brackets
        const bLen = 48;
        const pad = 16;
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 6;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(qrBoxX - pad, qrBoxY - pad + bLen);
        ctx.lineTo(qrBoxX - pad, qrBoxY - pad);
        ctx.lineTo(qrBoxX - pad + bLen, qrBoxY - pad);
        // Top-right
        ctx.moveTo(qrBoxX + qrBoxSize + pad - bLen, qrBoxY - pad);
        ctx.lineTo(qrBoxX + qrBoxSize + pad, qrBoxY - pad);
        ctx.lineTo(qrBoxX + qrBoxSize + pad, qrBoxY - pad + bLen);
        // Bottom-left
        ctx.moveTo(qrBoxX - pad, qrBoxY + qrBoxSize + pad - bLen);
        ctx.lineTo(qrBoxX - pad, qrBoxY + qrBoxSize + pad);
        ctx.lineTo(qrBoxX - pad + bLen, qrBoxY + qrBoxSize + pad);
        // Bottom-right
        ctx.moveTo(qrBoxX + qrBoxSize + pad - bLen, qrBoxY + qrBoxSize + pad);
        ctx.lineTo(qrBoxX + qrBoxSize + pad, qrBoxY + qrBoxSize + pad);
        ctx.lineTo(qrBoxX + qrBoxSize + pad, qrBoxY + qrBoxSize + pad - bLen);
        ctx.stroke();
      } else {
        // Default 'squircle'
        ctx.fillStyle = bgFill;
        ctx.beginPath();
        ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 48);
        ctx.fill();
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = qrDataUrl;
      });

      const qrInset = activeFrameStyle === 'circular-halo' ? 76 : 42;
      ctx.drawImage(
        img,
        qrBoxX + qrInset,
        qrBoxY + qrInset,
        qrBoxSize - qrInset * 2,
        qrBoxSize - qrInset * 2
      );

      ctx.fillStyle = '#FAFAFA';
      ctx.font = '600 30px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        profile.qrConfig.cardHeadline || 'Scan to open mini-portfolio & follow all socials',
        canvas.width / 2,
        1010
      );

      const platformSummary = profile.socials
        .slice(0, 5)
        .map((s) => s.label)
        .join('  ·  ');
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '500 24px "JetBrains Mono", monospace';
      ctx.fillText(platformSummary, canvas.width / 2, 1070);

      ctx.fillStyle = '#71717A';
      ctx.font = '400 20px "JetBrains Mono", monospace';
      ctx.fillText(profile.handle + '  ·  ' + profile.location, canvas.width / 2, 1165);

      const badgeUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = badgeUrl;
      a.download = `${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_studio_pass.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloadingBadge(false);
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-6 space-y-6 shadow-xs transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <QrIcon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500" />
            <span>Live Scannable Pass</span>
            <span aria-hidden="true">·</span>
            <span>Auto-Updates</span>
          </div>
          <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            Physical-Style QR Badge
          </h3>
        </div>

        <button
          type="button"
          onClick={onSimulateScan}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Simulate Scan Pop-up</span>
        </button>
      </div>

      {/* Physical Dark Studio Pass Card Preview */}
      <div className="rounded-2xl bg-zinc-950 text-white p-6 border border-zinc-800 space-y-5">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
          <div className="min-w-0">
            <div className="font-mono-tabular text-[11px] text-rose-500">
              NFC / QR POP-UP TRIGGER
            </div>
            <div className="font-display text-xl font-bold tracking-tight truncate mt-0.5">
              {profile.name}
            </div>
            <div className="text-xs text-zinc-400 truncate">
              {profile.roleTitle}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono-tabular text-xs font-semibold text-zinc-200">
              {profile.socials.length} Apps
            </div>
            <div className="text-[11px] text-zinc-500">Linked</div>
          </div>
        </div>

        {/* Scannable QR Image Container with Dynamic Frame & Shape Rendering */}
        <div className="flex flex-col items-center justify-center py-2">
          {/* 1. Soft Squircle Frame */}
          {activeFrameStyle === 'squircle' && (
            <div
              className="p-5 rounded-[36px] shadow-md border-2 border-zinc-800 transition-all duration-200"
              style={{ backgroundColor: profile.qrConfig.bgColor || '#FFFFFF' }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${profile.name}'s social media and mini-portfolio`}
                  referrerPolicy="no-referrer"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-2xl"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-zinc-400">
                  Generating QR...
                </div>
              )}
            </div>
          )}

          {/* 2. Modern Pill-Shaped Capsule Frame */}
          {activeFrameStyle === 'pill-capsule' && (
            <div
              className="px-6 pt-6 pb-4 rounded-[56px] shadow-md border-2 transition-all duration-200 flex flex-col items-center gap-2.5"
              style={{
                backgroundColor: profile.qrConfig.bgColor || '#FFFFFF',
                borderColor: profile.qrConfig.fgColor || '#09090B',
              }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${profile.name}'s social media and mini-portfolio`}
                  referrerPolicy="no-referrer"
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-2xl"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-xs text-zinc-400">
                  Generating QR...
                </div>
              )}
              <div
                className="font-mono-tabular text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full"
                style={{
                  backgroundColor: profile.qrConfig.fgColor || '#09090B',
                  color: profile.qrConfig.bgColor || '#FFFFFF',
                }}
              >
                Scan Mini-Portfolio
              </div>
            </div>
          )}

          {/* 3. Circular Halo Lens Frame */}
          {activeFrameStyle === 'circular-halo' && (
            <div className="relative p-3 rounded-full border border-dashed border-rose-500/80 flex items-center justify-center">
              <div
                className="p-7 sm:p-8 rounded-full shadow-md border-2 border-zinc-800 flex items-center justify-center transition-all duration-200"
                style={{ backgroundColor: profile.qrConfig.bgColor || '#FFFFFF' }}
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${profile.name}'s social media and mini-portfolio`}
                    referrerPolicy="no-referrer"
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-xs text-zinc-400">
                    Generating QR...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Architectural Viewfinder Corner Brackets Frame */}
          {activeFrameStyle === 'architectural-brackets' && (
            <div className="relative p-3.5">
              {/* Four precision corner viewfinder brackets */}
              <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-rose-500 rounded-tl-md pointer-events-none" />
              <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-rose-500 rounded-tr-md pointer-events-none" />
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-rose-500 rounded-bl-md pointer-events-none" />
              <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-rose-500 rounded-br-md pointer-events-none" />

              <div
                className="p-4 rounded-xl shadow-md border border-zinc-800 transition-all duration-200"
                style={{ backgroundColor: profile.qrConfig.bgColor || '#FFFFFF' }}
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${profile.name}'s social media and mini-portfolio`}
                    referrerPolicy="no-referrer"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-md"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-zinc-400">
                    Generating QR...
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-xs font-medium text-zinc-200 text-center mt-4 max-w-xs">
            {profile.qrConfig.cardHeadline}
          </p>
          <p className="text-[11px] text-zinc-400 text-center mt-1">
            Point any phone camera here to test the pop-up experience
          </p>
        </div>

        {/* Included Platforms Summary Row (Unboxed Typography with Separators) */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-zinc-400 font-mono-tabular">
          {profile.socials.map((soc, idx) => (
            <React.Fragment key={soc.id}>
              {idx > 0 && <span aria-hidden="true">·</span>}
              <span className="text-zinc-300">{soc.label}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* QR Border Shape & Frame Style Configuration Panel */}
      <div className="space-y-4 pt-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Frame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500" />
              <span>QR Border & Frame Shape</span>
            </label>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Applies to live pass & lock-screen export
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FRAME_STYLE_OPTIONS.map((option) => {
              const isSelected = activeFrameStyle === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onUpdateQrConfig({ frameStyle: option.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                    isSelected
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-semibold whitespace-nowrap truncate">
                      {option.label}
                    </span>
                    {/* Micro geometric shape preview icon */}
                    <span
                      className={`w-3.5 h-3.5 shrink-0 border ${
                        isSelected
                          ? 'border-white dark:border-zinc-900'
                          : 'border-zinc-400 dark:border-zinc-500'
                      } ${
                        option.id === 'circular-halo'
                          ? 'rounded-full'
                          : option.id === 'pill-capsule'
                          ? 'rounded-full w-2.5 h-4'
                          : option.id === 'squircle'
                          ? 'rounded-md'
                          : 'rounded-none border-dashed'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] leading-tight line-clamp-1 ${
                      isSelected
                        ? 'text-zinc-300 dark:text-zinc-600'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* QR Color & Headline Customizer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            QR Ink & Surface Palette
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {COLOR_PRESETS.map((preset) => {
              const isSelected =
                profile.qrConfig.fgColor.toLowerCase() === preset.fg.toLowerCase();
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    onUpdateQrConfig({ fgColor: preset.fg, bgColor: preset.bg })
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {preset.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="qr-card-headline"
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Badge Callout Line
          </label>
          <input
            id="qr-card-headline"
            type="text"
            value={profile.qrConfig.cardHeadline}
            onChange={(e) => onUpdateQrConfig({ cardHeadline: e.target.value })}
            placeholder="Scan to open mini-portfolio & follow all socials"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors"
          />
        </div>
      </div>

      {/* Export & Share Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleDownloadQrPng}
          className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>QR PNG</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPrintableCard}
          disabled={downloadingBadge}
          className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-rose-600 dark:text-rose-500 shrink-0" />
          <span>{downloadingBadge ? 'Rendering...' : 'Lock-Screen Pass'}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
        >
          {copiedUrl ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Link Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 shrink-0" />
              <span>Copy Scan URL</span>
            </>
          )}
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
