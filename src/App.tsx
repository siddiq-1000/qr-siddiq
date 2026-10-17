/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  CreatorProfile,
  DEFAULT_CREATOR_PROFILE,
} from './types/portfolio';
import {
  loadProfileFromStorageOrUrl,
  saveProfileToStorage,
} from './utils/deepLinks';
import { NfcPortfolioSheet } from './components/NfcPortfolioSheet';
import { QrBadgeGenerator } from './components/QrBadgeGenerator';
import { StudioEditorPanel } from './components/StudioEditorPanel';
import {
  Smartphone,
  ArrowUpRight,
  Sun,
  Moon,
} from 'lucide-react';

const THEME_STORAGE_KEY = 'tapcard_studio_theme_v1';

export default function App() {
  const [profile, setProfile] = useState<CreatorProfile>(DEFAULT_CREATOR_PROFILE);
  const [scanModalOpen, setScanModalOpen] = useState<boolean>(false);

  // Initialize theme from localStorage or system preference (prefers-color-scheme: dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore storage errors
    }
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Also listen for OS-level system theme changes if the user hasn't locked a manual override
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      try {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      } catch {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  // Apply `.dark` class to root `<html>` element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    const { profile: loadedProfile, isScannedMode } =
      loadProfileFromStorageOrUrl();
    setProfile(loadedProfile);
    if (isScannedMode) {
      setScanModalOpen(true);
    }
  }, []);

  const handleUpdateProfile = (updated: CreatorProfile) => {
    setProfile(updated);
    saveProfileToStorage(updated);
  };

  const handleUpdateQrConfig = (
    updates: Partial<CreatorProfile['qrConfig']>
  ) => {
    const next: CreatorProfile = {
      ...profile,
      qrConfig: {
        ...profile.qrConfig,
        ...updates,
      },
    };
    handleUpdateProfile(next);
  };

  const handleResetDefault = () => {
    setProfile(DEFAULT_CREATOR_PROFILE);
    saveProfileToStorage(DEFAULT_CREATOR_PROFILE);
  };

  const batchCount = profile.socials.filter(
    (s) => s.enabledForBatchFollow
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Top Header with Global Theme Toggle */}
      <header className="sticky top-0 z-30 bg-[#FAF9F6]/90 dark:bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 whitespace-nowrap shrink-0"
          >
            TapCard Studio
          </a>

          {/* Zone 2: 4 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a
              href="#qr-pass"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              QR Pass
            </a>
            <a
              href="#studio-builder"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Social Channels
            </a>
            <a
              href="#live-popup"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Pop-up Preview
            </a>
            <a
              href="#how-it-works"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Deep-Link Guide
            </a>
          </nav>

          {/* Zone 3: Global Theme Toggle + Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label={
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              className="min-h-[40px] px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-zinc-700 shrink-0" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setScanModalOpen(true)}
              className="min-h-[40px] px-4 py-2 text-xs font-medium text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 rounded-xl hover:bg-zinc-800 dark:hover:bg-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Launch Scan Pop-up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-14">
        {/* Hero Section & Full-Width Quantitative Proof Strip */}
        <section className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span>NFC-Style Mobile Sheet</span>
              <span aria-hidden="true">·</span>
              <span>Multi-Platform App Deep Linking</span>
              <span aria-hidden="true">·</span>
              <span>Interactive Mini-Portfolio</span>
            </div>

            <h1
              className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1]"
              style={{ textWrap: 'balance' }}
            >
              One QR scan to pop up your creative world and follow every channel.
            </h1>

            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Just like tapping an NFC tag, scanning your custom QR code triggers an
              instant slide-up portfolio card on any phone—introducing what you do,
              how you create, and launching your social accounts directly inside
              their installed apps or next browser tabs.
            </p>
          </div>

          {/* Full-width 4-column metric & capability bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#141417] transition-colors">
              <div className="font-mono-tabular text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {profile.socials.length} Platforms
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                LinkedIn, Instagram & custom handles linked
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#141417] transition-colors">
              <div className="font-mono-tabular text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {batchCount} in Queue
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Enabled for one-tap Follow All burst & stepper
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#141417] transition-colors">
              <div className="font-mono-tabular text-xl font-bold text-zinc-900 dark:text-zinc-100">
                iOS & Android
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Universal Links, URI schemes & new-tab fallback
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#141417] transition-colors">
              <div className="font-mono-tabular text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {profile.works.length} Case Studies
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Interactive What I Do & How I Create sheet tabs
              </div>
            </div>
          </div>
        </section>

        {/* Primary 12-Column Split Workspace: Left Studio & QR Generator / Right Live Mobile Pop-up Preview */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column (7 cols): QR Code Studio Card + Full Social & Portfolio Editor */}
          <div className="lg:col-span-7 space-y-8">
            <div id="qr-pass">
              <QrBadgeGenerator
                profile={profile}
                onSimulateScan={() => setScanModalOpen(true)}
                onUpdateQrConfig={handleUpdateQrConfig}
              />
            </div>

            <div id="studio-builder">
              <StudioEditorPanel
                profile={profile}
                onChangeProfile={handleUpdateProfile}
                onResetDefault={handleResetDefault}
              />
            </div>
          </div>

          {/* Right Column (5 cols): Sticky Live NFC-Style Mobile Pop-up Simulator */}
          <div id="live-popup" className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <Smartphone className="w-4 h-4 text-rose-600 dark:text-rose-500" />
                <span>Live Mobile Scan Pop-up Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setScanModalOpen(true)}
                className="text-xs font-medium text-zinc-900 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Open Full-Screen Sheet</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Simulated Mobile Viewport Frame housing the NFC Pop-up Sheet */}
            <div className="p-3 sm:p-4 rounded-[36px] bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 shadow-xl">
              <div className="flex items-center justify-between px-4 pb-2.5 text-[11px] font-mono-tabular text-zinc-400">
                <span>9:41</span>
                <span>NFC / QR SHEET TRIGGERED</span>
                <span>5G</span>
              </div>

              <NfcPortfolioSheet
                profile={profile}
                isFullScreenModal={false}
                globalTheme={theme}
              />
            </div>
          </div>
        </section>

        {/* Section 3: Technical Explanation of How Mobile App Launching & Multi-Follow Work */}
        <section
          id="how-it-works"
          className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-6"
        >
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Architecture & Mobile OS Behavior
            </div>
            <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              How the QR Pop-up & App Deep-Linking Work on Phones
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141417] space-y-2.5 transition-colors">
              <div className="font-mono-tabular text-xs font-semibold text-rose-600 dark:text-rose-500">
                01. Instant NFC-Style Sheet
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100">
                Zero-App-Install Pop-up Card
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Your QR code encodes a direct `?scan=1` trigger parameter along
                with your live profile data. As soon as a visitor scans the code
                with their native iOS or Android camera, the slide-up
                mini-portfolio sheet appears immediately and adapts to their
                system theme.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141417] space-y-2.5 transition-colors">
              <div className="font-mono-tabular text-xs font-semibold text-rose-600 dark:text-rose-500">
                02. Smart App Deep Links
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100">
                Native App Trigger + Tab Fallback
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Each platform is wired with both Universal Links and native mobile
                URI schemes (`instagram://user?username=...`, `linkedin://in/...`,
                and Android `intent://` packages). If the app is installed, the OS
                launches it directly; otherwise, it opens cleanly in the next
                browser tab.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141417] space-y-2.5 transition-colors">
              <div className="font-mono-tabular text-xs font-semibold text-rose-600 dark:text-rose-500">
                03. Multi-Account Follow Queue
              </div>
              <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100">
                Bypassing Mobile Popup Limits
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Because mobile browsers block websites from opening 5 apps at the
                exact same millisecond, tapping <strong>Follow All</strong> opens
                a multi-tab burst on desktop and activates a 1-tap{' '}
                <strong>Rapid Follow Stepper</strong> on mobile so visitors can
                follow every account in seconds.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#09090B] mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            <span>{profile.name}</span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span>{profile.roleTitle}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setScanModalOpen(true)}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              Preview Scanned Pop-up
            </button>
            <span aria-hidden="true">·</span>
            <a
              href="#qr-pass"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Download QR Pass
            </a>
          </div>
        </div>
      </footer>

      {/* Full-Screen NFC-Style Slide-Up Modal (Triggered automatically when QR is scanned via `?scan=1` or when clicking "Simulate Scan Pop-up") */}
      {scanModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onClick={() => setScanModalOpen(false)}
        >
          <div
            className="w-full max-w-[440px]"
            onClick={(e) => e.stopPropagation()}
          >
            <NfcPortfolioSheet
              profile={profile}
              isFullScreenModal={true}
              onCloseModal={() => setScanModalOpen(false)}
              globalTheme={theme}
              autoStartSequenceOnMount={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
