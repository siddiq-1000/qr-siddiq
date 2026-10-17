import React, { useState } from 'react';
import {
  CreatorProfile,
  PLATFORM_REGISTRY,
  PortfolioWorkItem,
  SocialAccount,
  SocialPlatformId,
} from '../types/portfolio';
import { PlatformIcon } from './PlatformIcons';
import {
  Plus,
  Trash2,
  RotateCcw,
  Check,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Sliders,
  Briefcase,
  User,
  Share2,
} from 'lucide-react';

interface StudioEditorPanelProps {
  profile: CreatorProfile;
  onChangeProfile: (updated: CreatorProfile) => void;
  onResetDefault: () => void;
}

const AVAILABLE_PLATFORMS: SocialPlatformId[] = [
  'linkedin',
  'instagram',
  'x',
  'youtube',
  'tiktok',
  'github',
  'threads',
  'behance',
  'spotify',
  'whatsapp',
  'custom',
];

export const StudioEditorPanel: React.FC<StudioEditorPanelProps> = ({
  profile,
  onChangeProfile,
  onResetDefault,
}) => {
  const [editorSection, setEditorSection] = useState<'socials' | 'identity' | 'portfolio'>(
    'socials'
  );

  const [newPlatform, setNewPlatform] = useState<SocialPlatformId>('instagram');
  const [newHandle, setNewHandle] = useState<string>('');
  const [newFollowerCount, setNewFollowerCount] = useState<string>('');

  const [newWorkTitle, setNewWorkTitle] = useState<string>('');
  const [newWorkCategory, setNewWorkCategory] = useState<string>('');
  const [newWorkSummary, setNewWorkSummary] = useState<string>('');
  const [newWorkMetrics, setNewWorkMetrics] = useState<string>('');

  const handleAddSocialAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const meta = PLATFORM_REGISTRY[newPlatform];
    const handleToUse = newHandle.trim() || meta.placeholderHandle;
    const urls = meta.buildUrls(handleToUse);

    const newAccount: SocialAccount = {
      id: `soc-${Date.now()}`,
      platform: newPlatform,
      label: meta.name,
      handle: handleToUse,
      webUrl: urls.webUrl,
      iosDeepLink: urls.iosDeepLink,
      androidIntentUrl: urls.androidIntentUrl,
      followerCount: newFollowerCount.trim() || undefined,
      enabledForBatchFollow: true,
    };

    onChangeProfile({
      ...profile,
      socials: [...profile.socials, newAccount],
    });

    setNewHandle('');
    setNewFollowerCount('');
  };

  const handleUpdateSocialHandle = (id: string, rawHandle: string) => {
    const updatedSocials = profile.socials.map((soc) => {
      if (soc.id !== id) return soc;
      const meta = PLATFORM_REGISTRY[soc.platform] || PLATFORM_REGISTRY.custom;
      const urls = meta.buildUrls(rawHandle);
      return {
        ...soc,
        handle: rawHandle,
        webUrl: urls.webUrl,
        iosDeepLink: urls.iosDeepLink,
        androidIntentUrl: urls.androidIntentUrl,
      };
    });
    onChangeProfile({ ...profile, socials: updatedSocials });
  };

  const handleUpdateSocialFollowers = (id: string, countText: string) => {
    const updatedSocials = profile.socials.map((soc) =>
      soc.id === id ? { ...soc, followerCount: countText } : soc
    );
    onChangeProfile({ ...profile, socials: updatedSocials });
  };

  const handleToggleBatchFollow = (id: string) => {
    const updatedSocials = profile.socials.map((soc) =>
      soc.id === id
        ? { ...soc, enabledForBatchFollow: !soc.enabledForBatchFollow }
        : soc
    );
    onChangeProfile({ ...profile, socials: updatedSocials });
  };

  const handleRemoveSocial = (id: string) => {
    onChangeProfile({
      ...profile,
      socials: profile.socials.filter((s) => s.id !== id),
    });
  };

  const handleMoveSocialOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= profile.socials.length) return;
    const nextSocials = [...profile.socials];
    const [moved] = nextSocials.splice(index, 1);
    nextSocials.splice(targetIndex, 0, moved);
    onChangeProfile({
      ...profile,
      socials: nextSocials,
    });
  };

  const handleAddPortfolioWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkTitle.trim()) return;
    const themes: PortfolioWorkItem['visualTheme'][] = [
      'spatial',
      'hardware',
      'editorial',
    ];
    const nextTheme = themes[profile.works.length % themes.length];

    const newItem: PortfolioWorkItem = {
      id: `work-${Date.now()}`,
      title: newWorkTitle.trim(),
      category: newWorkCategory.trim() || 'Product & Digital Craft',
      year: '2026',
      role: 'Creator & Lead',
      summary:
        newWorkSummary.trim() ||
        'Designed and engineered from initial concept through production release.',
      metrics: newWorkMetrics.trim() || 'Featured Launch',
      linkUrl: profile.website || 'https://siddiq.studio',
      visualTheme: nextTheme,
    };

    onChangeProfile({
      ...profile,
      works: [newItem, ...profile.works],
    });

    setNewWorkTitle('');
    setNewWorkCategory('');
    setNewWorkSummary('');
    setNewWorkMetrics('');
  };

  const handleRemoveWork = (id: string) => {
    onChangeProfile({
      ...profile,
      works: profile.works.filter((w) => w.id !== id),
    });
  };

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-6 sm:p-8 space-y-6 shadow-xs transition-colors">
      {/* Studio Editor Header & Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Sliders className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
            <span>Interactive Configuration</span>
          </div>
          <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            Customize Social Channels & Mini-Portfolio
          </h2>
        </div>

        <button
          type="button"
          onClick={onResetDefault}
          className="self-start sm:self-auto min-h-[38px] px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Functional Segmented Filter / Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl w-full sm:w-fit border border-transparent dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setEditorSection('socials')}
          className={`flex-1 sm:flex-initial min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            editorSection === 'socials'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Accounts ({profile.socials.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setEditorSection('identity')}
          className={`flex-1 sm:flex-initial min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            editorSection === 'identity'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Bio & Story</span>
        </button>

        <button
          type="button"
          onClick={() => setEditorSection('portfolio')}
          className={`flex-1 sm:flex-initial min-h-[40px] px-4 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            editorSection === 'portfolio'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Works & Process</span>
        </button>
      </div>

      {/* SECTION 1: SOCIAL ACCOUNTS & DEEP-LINK BUILDER */}
      {editorSection === 'socials' && (
        <div className="space-y-6">
          {/* Add New Platform Form */}
          <form
            onSubmit={handleAddSocialAccount}
            className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Add Social Media Platform
              </h3>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Auto-generates iOS & Android app deep links
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Platform
                </label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as SocialPlatformId)}
                  className="w-full min-h-[42px] px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                >
                  {AVAILABLE_PLATFORMS.map((platId) => (
                    <option key={platId} value={platId}>
                      {PLATFORM_REGISTRY[platId].name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Username or Profile URL
                </label>
                <input
                  type="text"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  placeholder={PLATFORM_REGISTRY[newPlatform].placeholderHandle}
                  className="w-full min-h-[42px] px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Audience Metric (Optional)
                </label>
                <input
                  type="text"
                  value={newFollowerCount}
                  onChange={(e) => setNewFollowerCount(e.target.value)}
                  placeholder="e.g. 24K Followers"
                  className="w-full min-h-[42px] px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono-tabular truncate max-w-md">
                Deep Link Preview:{' '}
                {
                  PLATFORM_REGISTRY[newPlatform].buildUrls(
                    newHandle || PLATFORM_REGISTRY[newPlatform].placeholderHandle
                  ).iosDeepLink
                }
              </div>

              <button
                type="submit"
                className="min-h-[40px] px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Platform</span>
              </button>
            </div>
          </form>

          {/* Existing Connected Socials List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Auto-Redirect Sequence Order (1 → 2 → 3)</span>
              <span>Use arrows to reorder sequence</span>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
              {profile.socials.map((account, idx) => (
                <div
                  key={account.id}
                  className="p-4 bg-white dark:bg-[#141417] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center shrink-0">
                      <PlatformIcon platform={account.platform} className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                          <span className="font-mono-tabular text-rose-600 dark:text-rose-500">
                            0{idx + 1}.
                          </span>
                          <span>{account.label}</span>
                          <a
                            href={account.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            title="Test link in new tab"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <input
                          type="text"
                          value={account.handle}
                          onChange={(e) =>
                            handleUpdateSocialHandle(account.id, e.target.value)
                          }
                          aria-label={`${account.label} handle`}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                        />
                      </div>

                      <div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                          Sequence Step Label
                        </div>
                        <input
                          type="text"
                          value={account.followerCount || ''}
                          onChange={(e) =>
                            handleUpdateSocialFollowers(account.id, e.target.value)
                          }
                          placeholder={`Step 0${idx + 1}`}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 shrink-0">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveSocialOrder(idx, 'up')}
                        disabled={idx === 0}
                        aria-label={`Move ${account.label} up`}
                        className="min-h-[36px] min-w-[36px] rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-35 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSocialOrder(idx, 'down')}
                        disabled={idx === profile.socials.length - 1}
                        aria-label={`Move ${account.label} down`}
                        className="min-h-[36px] min-w-[36px] rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-35 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleBatchFollow(account.id)}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer whitespace-nowrap ${
                        account.enabledForBatchFollow
                          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {account.enabledForBatchFollow
                          ? 'In Sequence'
                          : 'Skipped'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveSocial(account.id)}
                      aria-label={`Remove ${account.label}`}
                      className="min-h-[36px] min-w-[36px] rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CREATOR IDENTITY, BIO & STORY */}
      {editorSection === 'identity' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Creator / Studio Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  onChangeProfile({ ...profile, name: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Primary Handle
              </label>
              <input
                type="text"
                value={profile.handle}
                onChange={(e) =>
                  onChangeProfile({ ...profile, handle: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Headline Role / Discipline
              </label>
              <input
                type="text"
                value={profile.roleTitle}
                onChange={(e) =>
                  onChangeProfile({ ...profile, roleTitle: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Location / Base
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) =>
                  onChangeProfile({ ...profile, location: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Pop-up Intro Bio (Shown at top of scanned screen)
            </label>
            <textarea
              rows={2}
              value={profile.bioShort}
              onChange={(e) =>
                onChangeProfile({ ...profile, bioShort: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              What I Do (Detailed Practice Statement)
            </label>
            <textarea
              rows={3}
              value={profile.whatIDo}
              onChange={(e) =>
                onChangeProfile({ ...profile, whatIDo: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Combined Reach Metric
              </label>
              <input
                type="text"
                value={profile.metrics.audienceReach}
                onChange={(e) =>
                  onChangeProfile({
                    ...profile,
                    metrics: { ...profile.metrics, audienceReach: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono-tabular focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Shipped Works Metric
              </label>
              <input
                type="text"
                value={profile.metrics.projectsShipped}
                onChange={(e) =>
                  onChangeProfile({
                    ...profile,
                    metrics: {
                      ...profile.metrics,
                      projectsShipped: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono-tabular focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Direct Contact Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  onChangeProfile({ ...profile, email: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PORTFOLIO WORKS & HOW I CREATE */}
      {editorSection === 'portfolio' && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddPortfolioWork}
            className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-4"
          >
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Add Showcase Project to Mini-Portfolio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={newWorkTitle}
                onChange={(e) => setNewWorkTitle(e.target.value)}
                placeholder="Project Title (e.g. Chrono OS Interface)"
                className="px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
              />
              <input
                type="text"
                value={newWorkCategory}
                onChange={(e) => setNewWorkCategory(e.target.value)}
                placeholder="Discipline (e.g. Spatial Design & Code)"
                className="px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
              />
            </div>
            <textarea
              rows={2}
              value={newWorkSummary}
              onChange={(e) => setNewWorkSummary(e.target.value)}
              placeholder="Brief project summary..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
            />
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={newWorkMetrics}
                onChange={(e) => setNewWorkMetrics(e.target.value)}
                placeholder="Impact proof (e.g. +180K active users)"
                className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
              />
              <button
                type="submit"
                className="min-h-[40px] px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Current Mini-Portfolio Projects ({profile.works.length})
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
              {profile.works.map((work) => (
                <div
                  key={work.id}
                  className="p-4 bg-white dark:bg-[#141417] flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {work.title}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {work.category} · {work.metrics}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveWork(work.id)}
                    aria-label={`Remove ${work.title}`}
                    className="min-h-[36px] min-w-[36px] rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
