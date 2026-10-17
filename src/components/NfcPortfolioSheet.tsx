import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CreatorProfile,
  PortfolioWorkItem,
  SocialAccount,
  PLATFORM_REGISTRY,
} from '../types/portfolio';
import {
  PlatformIcon,
  PortfolioArtworkGraphic,
  CreatorAvatarVisual,
} from './PlatformIcons';
import {
  downloadCreatorVCard,
  launchSocialAccount,
} from '../utils/deepLinks';
import {
  ArrowUpRight,
  Check,
  UserPlus,
  Smartphone,
  Sparkles,
  X,
  ChevronRight,
  ExternalLink,
  Copy,
  Monitor,
  Sun,
  Moon,
  PartyPopper,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

export type SheetThemePreference = 'system' | 'light' | 'dark';

interface NfcPortfolioSheetProps {
  profile: CreatorProfile;
  isFullScreenModal?: boolean;
  onCloseModal?: () => void;
  globalTheme?: 'light' | 'dark';
  autoStartSequenceOnMount?: boolean;
}

function triggerFollowAllConfetti() {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.65 },
      zIndex: 9999,
    });
    return;
  }

  const colors = ['#E11D48', '#F43F5E', '#10B981', '#F59E0B', '#3B82F6', '#FAFAFA'];

  confetti({
    particleCount: 85,
    spread: 75,
    startVelocity: 42,
    origin: { x: 0.5, y: 0.62 },
    colors,
    zIndex: 9999,
  });

  setTimeout(() => {
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0.15, y: 0.68 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 0.85, y: 0.68 },
      colors,
      zIndex: 9999,
    });
  }, 160);
}

export const NfcPortfolioSheet: React.FC<NfcPortfolioSheetProps> = ({
  profile,
  isFullScreenModal = false,
  onCloseModal,
  globalTheme,
  autoStartSequenceOnMount = false,
}) => {
  const [activeTab, setActiveTab] = useState<'socials' | 'work' | 'process'>('socials');
  const [useNativeDeepScheme, setUseNativeDeepScheme] = useState<boolean>(false);
  const [followedIds, setFollowedIds] = useState<Record<string, boolean>>({});
  const [flowCompletedCelebrated, setFlowCompletedCelebrated] = useState<boolean>(false);
  const [selectedWorkModal, setSelectedWorkModal] = useState<PortfolioWorkItem | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [savedContact, setSavedContact] = useState<boolean>(false);

  // Sequential Auto-Redirect Engine State (1. LinkedIn -> 2. GitHub -> 3. Instagram -> Done)
  const [sequenceRunning, setSequenceRunning] = useState<boolean>(false);
  const [sequencePaused, setSequencePaused] = useState<boolean>(false);
  const [currentSeqIndex, setCurrentSeqIndex] = useState<number>(0);
  const [seqProgressPct, setSeqProgressPct] = useState<number>(0);
  const hasAutoStartedRef = useRef<boolean>(false);

  // Respect the user's system theme preference by default ('system')
  const [sheetThemePref, setSheetThemePref] = useState<SheetThemePreference>('system');
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (globalTheme) {
      setSheetThemePref('system');
    }
  }, [globalTheme]);

  const resolvedDark =
    sheetThemePref === 'system'
      ? globalTheme
        ? globalTheme === 'dark'
        : systemPrefersDark
      : sheetThemePref === 'dark';

  const cycleSheetTheme = () => {
    setSheetThemePref((prev) => {
      if (prev === 'system') return systemPrefersDark ? 'light' : 'dark';
      if (prev === 'dark') return 'light';
      return 'system';
    });
  };

  const batchSocials = profile.socials.filter((s) => s.enabledForBatchFollow);
  const activeSequenceAccount: SocialAccount | undefined = batchSocials[currentSeqIndex];

  const launchAccountAndRecord = (account: SocialAccount) => {
    setFollowedIds((prev) => ({ ...prev, [account.id]: true }));
    launchSocialAccount(account, { useDeepSchemeFirst: useNativeDeepScheme });
  };

  /**
   * Starts the ordered 1 -> 2 -> 3 auto-redirect sequence:
   * Step 1: LinkedIn -> Step 2: GitHub -> Step 3: Instagram -> Done (Confetti!)
   */
  const startOrderedAutoSequence = () => {
    if (batchSocials.length === 0) return;
    setFollowedIds({});
    setFlowCompletedCelebrated(false);
    setCurrentSeqIndex(0);
    setSeqProgressPct(0);
    setSequencePaused(false);
    setSequenceRunning(true);

    // Immediately launch Step 1 (LinkedIn)
    launchAccountAndRecord(batchSocials[0]);
  };

  // Auto-start sequence when QR code is scanned or when user opens the Scan Pop-up Modal
  useEffect(() => {
    if (autoStartSequenceOnMount && !hasAutoStartedRef.current && batchSocials.length > 0) {
      hasAutoStartedRef.current = true;
      const timer = setTimeout(() => {
        startOrderedAutoSequence();
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [autoStartSequenceOnMount, batchSocials.length]);

  // Timer that drives the automatic 1 -> 2 -> 3 progression AND listens for tab focus return
  useEffect(() => {
    if (!sequenceRunning || sequencePaused || batchSocials.length === 0) return;

    const STEP_DURATION_MS = 1800;
    const TICK_MS = 60;
    let elapsed = 0;

    const advanceToNextOrFinish = () => {
      const nextIndex = currentSeqIndex + 1;
      if (nextIndex < batchSocials.length) {
        setCurrentSeqIndex(nextIndex);
        setSeqProgressPct(0);
        launchAccountAndRecord(batchSocials[nextIndex]);
      } else {
        // Sequence 1 -> 2 -> 3 is completely done!
        setSequenceRunning(false);
        setSeqProgressPct(100);
        setFlowCompletedCelebrated(true);
        triggerFollowAllConfetti();
      }
    };

    const interval = setInterval(() => {
      elapsed += TICK_MS;
      const pct = Math.min(100, Math.round((elapsed / STEP_DURATION_MS) * 100));
      setSeqProgressPct(pct);
      if (elapsed >= STEP_DURATION_MS) {
        clearInterval(interval);
        advanceToNextOrFinish();
      }
    }, TICK_MS);

    // Also if the user switches back from the opened native app / tab, advance cleanly
    const handleVisibilityReturn = () => {
      if (document.visibilityState === 'visible' && elapsed > 400) {
        clearInterval(interval);
        advanceToNextOrFinish();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityReturn);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityReturn);
    };
  }, [sequenceRunning, sequencePaused, currentSeqIndex, batchSocials.length]);

  const handleManualStepAdvance = () => {
    if (!activeSequenceAccount) return;
    const nextIndex = currentSeqIndex + 1;
    if (nextIndex < batchSocials.length) {
      setCurrentSeqIndex(nextIndex);
      setSeqProgressPct(0);
      launchAccountAndRecord(batchSocials[nextIndex]);
    } else {
      setSequenceRunning(false);
      setSeqProgressPct(100);
      setFlowCompletedCelebrated(true);
      triggerFollowAllConfetti();
    }
  };

  const checkAndCelebrateCompletion = (nextFollowedMap: Record<string, boolean>) => {
    if (batchSocials.length === 0) return;
    const allBatchFollowed = batchSocials.every((acc) => Boolean(nextFollowedMap[acc.id]));
    if (allBatchFollowed && !flowCompletedCelebrated) {
      setSequenceRunning(false);
      setFlowCompletedCelebrated(true);
      triggerFollowAllConfetti();
    }
  };

  const handleSingleSocialLaunch = (account: SocialAccount) => {
    setFollowedIds((prev) => {
      const updated = { ...prev, [account.id]: true };
      checkAndCelebrateCompletion(updated);
      return updated;
    });
    launchSocialAccount(account, { useDeepSchemeFirst: useNativeDeepScheme });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleDownloadVCard = () => {
    downloadCreatorVCard(profile);
    setSavedContact(true);
    setTimeout(() => setSavedContact(false), 2500);
  };

  const followedCount = Object.keys(followedIds).length;

  return (
    <div className={resolvedDark ? 'dark' : ''}>
      <div
        className={`relative flex flex-col bg-white dark:bg-[#111114] text-zinc-900 dark:text-zinc-100 transition-colors duration-200 ${
          isFullScreenModal
            ? 'w-full max-w-[440px] mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[92vh] overflow-hidden'
            : 'w-full rounded-[28px] border border-zinc-200/90 dark:border-zinc-800/90 shadow-lg overflow-hidden'
        }`}
      >
        {/* Top NFC / QR Pop-up Sheet Grab Handle & Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#111114]/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800/80 px-5 pt-3 pb-3 transition-colors">
          <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium min-w-0">
              <Smartphone className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500 shrink-0" />
              <span className="truncate">Auto-Redirect QR Pass</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={cycleSheetTheme}
                title="Switch sheet appearance (System / Light / Dark)"
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {sheetThemePref === 'system' ? (
                  <Monitor className="w-3 h-3" />
                ) : resolvedDark ? (
                  <Moon className="w-3 h-3" />
                ) : (
                  <Sun className="w-3 h-3" />
                )}
                <span>
                  {sheetThemePref === 'system'
                    ? `System (${resolvedDark ? 'Dark' : 'Light'})`
                    : resolvedDark
                    ? 'Dark'
                    : 'Light'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadVCard}
                className="min-h-[36px] px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {savedContact ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Contact Saved</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Save Contact</span>
                  </>
                )}
              </button>

              {isFullScreenModal && onCloseModal && (
                <button
                  type="button"
                  onClick={onCloseModal}
                  aria-label="Close pop-up card"
                  className="min-h-[36px] min-w-[36px] rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Sheet Body */}
        <div className="overflow-y-auto px-5 pt-5 pb-6 space-y-6 flex-1">
          {/* Creator Identity Header */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <CreatorAvatarVisual name={profile.name} size="lg" />
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="truncate">{profile.handle}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{profile.location}</span>
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-0.5 leading-tight">
                  {profile.name}
                </h2>
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 mt-1 leading-snug">
                  {profile.roleTitle}
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {profile.bioShort}
            </p>
          </div>

          {/* Primary 1 -> 2 -> 3 Auto-Redirect Sequence Controller Box */}
          <div className="p-4 rounded-2xl bg-zinc-900 dark:bg-zinc-950 border border-transparent dark:border-zinc-800 text-white space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                  <span>Sequential Auto-Redirect</span>
                  <span className="text-zinc-500" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-mono-tabular text-rose-400">
                    { batchSocials.map((s, i) => `${i + 1}. ${s.label}`).join(' → ') }
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Automatically redirects in order and finishes once all {batchSocials.length} are opened
                </div>
              </div>
              <span className="font-mono-tabular text-xs text-zinc-300 shrink-0">
                {followedCount}/{batchSocials.length} done
              </span>
            </div>

            {/* 3-Step Visual Progress Tracker (1. LinkedIn -> 2. GitHub -> 3. Instagram) */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {batchSocials.map((acc, idx) => {
                const isDone = Boolean(followedIds[acc.id]);
                const isCurrent = sequenceRunning && currentSeqIndex === idx;
                return (
                  <div
                    key={acc.id}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'border-rose-500 bg-rose-500/15 text-white'
                        : isDone
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-900/80 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono-tabular">
                      <span>STEP 0{idx + 1}</span>
                      {isDone ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <PlatformIcon platform={acc.platform} className="w-3 h-3" />
                      )}
                    </div>
                    <div className="text-xs font-semibold truncate mt-1 text-white">
                      {acc.label}
                    </div>
                    <div className="text-[10px] truncate text-zinc-400">
                      {acc.handle}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Auto-Redirect Progress Bar & Controls */}
            {sequenceRunning && activeSequenceAccount && (
              <div className="p-3 rounded-xl bg-zinc-800/90 border border-zinc-700 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200 font-medium">
                    Redirecting #{currentSeqIndex + 1}:{' '}
                    <strong className="text-white">{activeSequenceAccount.label}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSequencePaused(!sequencePaused)}
                      className="px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-[11px] text-zinc-200 flex items-center gap-1 cursor-pointer"
                    >
                      {sequencePaused ? (
                        <>
                          <Play className="w-3 h-3" />
                          <span>Resume</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleManualStepAdvance}
                      className="px-2.5 py-1 rounded bg-white text-zinc-900 hover:bg-zinc-100 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {currentSeqIndex + 1 < batchSocials.length
                          ? `Next: ${batchSocials[currentSeqIndex + 1].label}`
                          : 'Finish'}
                      </span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-75"
                    style={{ width: `${seqProgressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Primary Trigger Button */}
            <button
              type="button"
              onClick={startOrderedAutoSequence}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              {flowCompletedCelebrated ? (
                <>
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">
                    Sequence Complete (1 → 2 → 3 Done) · Run Again
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">
                    Start Auto-Redirect (1. LinkedIn → 2. GitHub → 3. Instagram)
                  </span>
                </>
              )}
            </button>

            {/* Celebratory Completion Banner */}
            {flowCompletedCelebrated && !sequenceRunning && (
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2 text-xs text-emerald-400">
                <div className="flex items-center gap-2 min-w-0">
                  <PartyPopper className="w-4 h-4 shrink-0" />
                  <span className="truncate font-medium">
                    LinkedIn, GitHub & Instagram sequence completed!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={triggerFollowAllConfetti}
                  className="text-[11px] text-zinc-300 hover:text-white underline underline-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Celebrate Again
                </button>
              </div>
            )}

            {/* Deep-link mode toggle */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
              <span>App trigger mode:</span>
              <button
                type="button"
                onClick={() => setUseNativeDeepScheme(!useNativeDeepScheme)}
                className="text-zinc-200 underline underline-offset-2 hover:text-white cursor-pointer"
              >
                {useNativeDeepScheme
                  ? 'Force App URI (linkedin://, instagram://)'
                  : 'Smart Universal Links + New Tab'}
              </button>
            </div>
          </div>

          {/* Segmented Navigation Tabs inside the Mini-Portfolio Pop-up */}
          <div
            role="tablist"
            aria-label="Mini-portfolio sections"
            className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-transparent dark:border-zinc-800/80"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'socials'}
              onClick={() => setActiveTab('socials')}
              className={`min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'socials'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              1 → 2 → 3 Links
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'work'}
              onClick={() => setActiveTab('work')}
              className={`min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'work'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              What I Do
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'process'}
              onClick={() => setActiveTab('process')}
              className={`min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'process'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              How I Create
            </button>
          </div>

          {/* TAB 1: ORDERED SOCIAL CHANNELS (1. LinkedIn -> 2. GitHub -> 3. Instagram) */}
          {activeTab === 'socials' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
                <span>Ordered Redirect Queue</span>
                <span className="font-mono-tabular">
                  {profile.socials.length} active links
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/50">
                {profile.socials.map((account, index) => {
                  const isOpened = Boolean(followedIds[account.id]);
                  const meta =
                    PLATFORM_REGISTRY[account.platform] || PLATFORM_REGISTRY.custom;
                  const formatted = meta.buildUrls(account.handle);

                  return (
                    <a
                      key={account.id}
                      href={account.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (useNativeDeepScheme) {
                          e.preventDefault();
                          handleSingleSocialLaunch(account);
                        } else {
                          setFollowedIds((prev) => {
                            const updated = { ...prev, [account.id]: true };
                            checkAndCelebrateCompletion(updated);
                            return updated;
                          });
                        }
                      }}
                      className="min-h-[68px] px-4 py-3 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 text-zinc-800 dark:text-zinc-200 flex items-center justify-center transition-colors shrink-0 relative">
                          <PlatformIcon platform={account.platform} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono-tabular text-xs font-bold text-rose-600 dark:text-rose-500">
                              0{index + 1}.
                            </span>
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {account.label}
                            </span>
                            <span
                              className="text-zinc-300 dark:text-zinc-600"
                              aria-hidden="true"
                            >
                              ·
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono-tabular truncate">
                              {formatted.cleanHandle}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                            {account.webUrl}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-medium transition-colors whitespace-nowrap ${
                            isOpened
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-zinc-700 dark:text-zinc-300 group-hover:text-rose-600 dark:group-hover:text-rose-400'
                          }`}
                        >
                          {isOpened ? 'Redirected' : 'Open'}
                        </span>
                        {isOpened ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: WHAT I DO & SELECTED WORKS */}
          {activeTab === 'work' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Focus & Capabilities
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {profile.whatIDo}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Selected Projects</span>
                  <span>Tap card for details</span>
                </div>

                {profile.works.map((work) => (
                  <div
                    key={work.id}
                    onClick={() => setSelectedWorkModal(work)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedWorkModal(work);
                      }
                    }}
                    className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/60 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer"
                  >
                    <PortfolioArtworkGraphic
                      theme={work.visualTheme}
                      title={work.title}
                      category={work.category}
                      className="w-full h-36"
                    />
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>
                          {work.role} · {work.year}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {work.summary}
                      </p>
                      <div className="pt-1 text-[11px] font-mono-tabular text-zinc-500 dark:text-zinc-400">
                        {work.metrics}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HOW I CREATE (STUDIO PROCESS) */}
          {activeTab === 'process' && (
            <div className="space-y-5">
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {profile.howICreateIntro}
              </p>

              <div className="space-y-4">
                {profile.processSteps.map((step) => (
                  <div
                    key={step.id}
                    className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono-tabular text-xs font-semibold text-rose-600 dark:text-rose-500">
                        {step.indexNumber}
                      </span>
                      <h4 className="font-display text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="pt-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono-tabular">
                      Output · {step.deliverable}
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Contact Strip inside Mini-Portfolio */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Direct Studio Inquiry
                  </div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                    {profile.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="min-h-[40px] px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lightbox Modal when clicking a Portfolio Project inside the Sheet */}
        {selectedWorkModal && (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedWorkModal(null)}
          >
            <div
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <PortfolioArtworkGraphic
                theme={selectedWorkModal.visualTheme}
                title={selectedWorkModal.title}
                category={selectedWorkModal.category}
                className="w-full h-48"
              />
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {selectedWorkModal.category} · {selectedWorkModal.year}
                    </div>
                    <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                      {selectedWorkModal.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedWorkModal(null)}
                    className="min-h-[36px] min-w-[36px] rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {selectedWorkModal.summary}
                </p>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Role: {selectedWorkModal.role}</span>
                  <span className="font-mono-tabular">{selectedWorkModal.metrics}</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={selectedWorkModal.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Open Case Study</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedWorkModal(null)}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
