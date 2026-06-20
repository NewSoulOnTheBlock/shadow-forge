'use client';

// Campaign hub — full-screen frame layout.
//   The art frame `public/campaign-bg.png` is stretched to fill the whole viewport
//   (background-size: 100% 100%, so it never leaves empty space) and every piece of
//   live UI is absolutely positioned to land inside one of the frame's boxes.
//   Box rectangles below were measured from the frame image (percent coords).
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import CampaignNode from '@/components/CampaignNode';
import PlayerAvatar from '@/components/PlayerAvatar';
import { db } from '@/lib/mock-data';
import type { CampaignNode as CampaignNodeType, Difficulty } from '@/lib/types';
import { cx } from '@/lib/ui';
import { useAppStore } from '@/store/appStore';

// Absolutely-positioned box, coordinates in % of the viewport (match the frame art).
function Region({
  l,
  t,
  w,
  h,
  className = '',
  style,
  children,
}: {
  l: number;
  t: number;
  w: number;
  h: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%`, ...style }}
    >
      {children}
    </div>
  );
}

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  beginner: 'var(--color-shadow)',
  intermediate: 'var(--color-sage)',
  expert: 'var(--color-oni)',
  boss: 'var(--color-gold)',
};

// Campaign node positions, expressed as % of the MAP PANEL region (not the viewport),
// converted from the frame's painted node circles so each live node lands on its art circle.
const NODE_POS: { x: number; y: number }[] = [
  { x: 16.03, y: 74.17 },
  { x: 37.4, y: 74.17 },
  { x: 11.45, y: 43.33 },
  { x: 45.8, y: 31.67 },
  { x: 67.94, y: 31.67 },
  { x: 59.54, y: 60.0 },
  { x: 90.84, y: 18.33 },
  { x: 87.79, y: 71.67 },
];

const TUTORIALS = [
  { id: 1, title: 'Basics: Summoning', icon: '🥷', description: 'Learn how to call ninja allies, read costs, and build an opening board.', state: 'Complete', locked: false, progress: 100 },
  { id: 2, title: 'Combat & Guard', icon: '⚔️', description: 'Master attacks, guard windows, and tempo trades before entering the wilds.', state: 'In progress', locked: false, progress: 45 },
  { id: 3, title: 'Spells & Targeting', icon: '📜', description: 'Practice spell timing, valid targets, and response sequencing.', state: 'Ready', locked: false, progress: 0 },
  { id: 4, title: 'Keywords', icon: '✨', description: 'A guided gauntlet for stealth, guard, rush, and clan-specific text.', state: 'Locked', locked: true, progress: 0 },
];

function DifficultyChip({ difficulty }: { difficulty: Difficulty }) {
  const color = DIFFICULTY_COLOR[difficulty];
  return (
    <span className="chip capitalize" style={{ borderColor: color, color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {difficulty}
    </span>
  );
}

type Overlay = null | 'practice' | 'tutorial';

export default function SinglePlayerPage() {
  const router = useRouter();
  const campaign = useMemo(() => db.getCampaign(), []);
  const profile = useAppStore((s) => s.profile);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [selectedNode, setSelectedNode] = useState<CampaignNodeType>(() =>
    campaign.find((node) => node.unlocked && !node.completed) ?? campaign[0],
  );

  // Re-map each campaign node onto its painted frame circle (panel-relative coords).
  const framedNodes = useMemo(
    () => campaign.map((node, i) => ({ ...node, x: (NODE_POS[i] ?? node).x, y: (NODE_POS[i] ?? node).y })),
    [campaign],
  );

  const completedCount = campaign.filter((node) => node.completed).length;
  const completionPercent = Math.round((completedCount / campaign.length) * 100);

  const startBattle = (node: CampaignNodeType) => {
    if (!node.unlocked) return;
    // PLUG-IN POINT: hydrate match setup from the campaign rules engine and AI profile.
    router.push(`/match/${node.id}?mode=single`);
  };

  return (
    <div
      className="fixed inset-0 select-none text-[var(--color-ink)]"
      style={{ backgroundImage: 'url(/campaign-bg.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
    >
      {/* ===== LEFT — title bar ===== */}
      <Region l={12.5} t={5} w={36.5} h={10.5} className="flex flex-col justify-center px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--color-neon)]">Single Player</p>
        <h1 className="text-2xl font-black leading-none tracking-tight sm:text-3xl">
          <span className="neon-text">Shadow Campaign</span>
        </h1>
        <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
          Walk the hidden path, {profile.displayName}. Eight clans bar the way.
        </p>
      </Region>

      {/* ===== LEFT — progress box ===== */}
      <Region l={50} t={5} w={17.5} h={10.5} className="flex items-center gap-3 px-4">
        <div className="min-w-0">
          <p className="stat-label">Sealed</p>
          <p className="text-xl font-black leading-none">
            {completedCount}
            <span className="text-sm text-[var(--color-muted)]">/{campaign.length}</span>
          </p>
        </div>
        <div
          className="ml-auto grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[var(--color-line)] text-[11px] font-black"
          style={{ background: `conic-gradient(var(--color-neon) ${completionPercent}%, rgba(0,0,0,0.45) 0)` }}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-black/70">{completionPercent}%</span>
        </div>
      </Region>

      {/* ===== MAP PANEL — campaign nodes land on the painted circles ===== */}
      <Region l={2.5} t={18} w={65.5} h={60}>
        {framedNodes.map((node) => (
          <CampaignNode key={node.id} node={node} selected={node.id === selectedNode.id} onSelect={setSelectedNode} />
        ))}
      </Region>

      {/* ===== LEGEND strip ===== */}
      <Region l={3.5} t={79} w={33.5} h={4.5} className="flex items-center justify-around px-2 text-[11px]">
        {(['beginner', 'intermediate', 'expert', 'boss'] as Difficulty[]).map((difficulty) => (
          <DifficultyChip key={difficulty} difficulty={difficulty} />
        ))}
      </Region>

      {/* ===== RIGHT — opponent avatar / name bar ===== */}
      <Region l={71.5} t={4.5} w={24} h={11} className="flex items-center gap-3 px-4">
        <PlayerAvatar avatar={selectedNode.opponentAvatar} name="" size="md" active={selectedNode.unlocked} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-black leading-tight">{selectedNode.opponentName ?? selectedNode.name}</h2>
          <p className="truncate text-[11px] text-[var(--color-muted)]">{selectedNode.name}</p>
        </div>
        <DifficultyChip difficulty={selectedNode.difficulty} />
      </Region>

      {/* ===== RIGHT — subtitle / deck ===== */}
      <Region l={72} t={24} w={23.5} h={6} className="flex flex-col justify-center px-4">
        {selectedNode.subtitle && (
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-[var(--color-neon)]">{selectedNode.subtitle}</p>
        )}
        {selectedNode.deckName && (
          <span className="mt-0.5 inline-flex w-fit max-w-full items-center gap-1 truncate text-xs font-bold text-[var(--color-gold)]">
            🎴 {selectedNode.deckName}
          </span>
        )}
      </Region>

      {/* ===== RIGHT — story (scrollable) ===== */}
      <Region l={72} t={31} w={23.5} h={25} className="overflow-hidden px-4 py-3">
        <p className="stat-label mb-1.5">The story</p>
        <div className="h-[calc(100%-1.5rem)] space-y-2 overflow-y-auto pr-2 text-[12px] leading-5 text-[var(--color-muted)] [scrollbar-width:thin]">
          <p className="text-[var(--color-ink)]">{selectedNode.description}</p>
          {selectedNode.story?.map((paragraph, i) => (
            <p key={i} className={cx(paragraph.trim().startsWith('"') && 'italic text-[var(--color-ink)]')}>{paragraph}</p>
          ))}
        </div>
      </Region>

      {/* ===== RIGHT — strategy + rewards ===== */}
      <Region l={72} t={57} w={23.5} h={16} className="overflow-hidden px-4 py-3">
        {selectedNode.strategy && (
          <>
            <p className="stat-label mb-1">Strategy</p>
            <p className="line-clamp-3 text-[12px] leading-5 text-[var(--color-ink)]">{selectedNode.strategy}</p>
          </>
        )}
        <p className="stat-label mb-1 mt-2">Rewards</p>
        <div className="flex flex-wrap gap-2">
          {selectedNode.rewards.map((reward) => (
            <span
              key={reward.id}
              title={reward.label}
              className={cx(
                'inline-flex items-center gap-1 rounded-lg border border-[var(--color-line)] bg-black/30 px-2 py-1 text-[11px]',
                reward.claimed && 'opacity-45',
              )}
            >
              <span className="text-base">{reward.icon}</span>
              <span className="max-w-24 truncate font-semibold">{reward.label}</span>
            </span>
          ))}
        </div>
      </Region>

      {/* ===== RIGHT — Challenge button (gold) ===== */}
      <Region l={72} t={78} w={23.5} h={6}>
        <button
          type="button"
          disabled={!selectedNode.unlocked}
          onClick={() => startBattle(selectedNode)}
          className="flex h-full w-full items-center justify-center px-4 text-sm font-black tracking-wide text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="truncate">
            {selectedNode.unlocked ? `⚔ Challenge ${selectedNode.opponentName ?? 'the clan'}` : '🔒 Locked'}
          </span>
        </button>
      </Region>

      {/* ===== BOTTOM-LEFT nav — overlay clickable targets on the painted icons ===== */}
      {([
        { l: 2.5, href: '/play', label: 'Play' },
        { l: 12.5, href: '/deck-builder', label: 'Decks' },
        { l: 22.5, href: '/collection', label: 'Collection' },
        { l: 32.5, href: '/leaderboard', label: 'Ranks' },
        { l: 42.5, action: 'practice', label: 'Practice' },
        { l: 52.5, action: 'tutorial', label: 'Tutorial' },
      ] as { l: number; href?: string; action?: Overlay; label: string }[]).map((item) => (
        <Region key={item.label} l={item.l} t={86} w={9} h={11}>
          {item.href ? (
            <Link href={item.href} aria-label={item.label} className="block h-full w-full rounded-lg transition hover:bg-white/5" />
          ) : (
            <button type="button" aria-label={item.label} onClick={() => setOverlay(item.action ?? null)} className="block h-full w-full rounded-lg transition hover:bg-white/5" />
          )}
        </Region>
      ))}

      {/* ===== BOTTOM-RIGHT nav ===== */}
      {[
        { l: 70, w: 6, href: '/collection', label: 'Collection' },
        { l: 79, w: 6, href: '/profile', label: 'Profile' },
        { l: 88, w: 6, href: '/settings', label: 'Settings' },
      ].map((item) => (
        <Region key={item.label} l={item.l} t={88} w={item.w} h={8}>
          <Link href={item.href} aria-label={item.label} className="block h-full w-full rounded-lg transition hover:bg-white/5" />
        </Region>
      ))}

      {/* ===== Practice / Tutorial overlays (preserve single-player sub-modes) ===== */}
      <AnimatePresence>
        {overlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setOverlay(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="panel max-h-[88vh] w-full max-w-4xl overflow-y-auto p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black">{overlay === 'practice' ? 'Practice Dojo' : 'Learning Track'}</h2>
                <button type="button" onClick={() => setOverlay(null)} className="btn">Close ✕</button>
              </div>

              {overlay === 'practice' && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {db.practiceOpponents.map((opp) => (
                    <article key={opp.id} className="panel panel-hover p-5">
                      <PlayerAvatar avatar={opp.avatar} name={opp.name} size="lg" />
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <DifficultyChip difficulty={opp.difficulty} />
                        <button type="button" className="btn btn-primary" onClick={() => router.push(`/match/practice_${opp.id}?mode=single`)}>
                          Practice
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {overlay === 'tutorial' && (
                <div className="grid gap-4 md:grid-cols-2">
                  {TUTORIALS.map((tutorial) => (
                    <article key={tutorial.id} className={cx('panel panel-hover p-5', tutorial.locked && 'opacity-55')}>
                      <div className="flex items-start gap-4">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-2)] text-3xl">{tutorial.locked ? '🔒' : tutorial.icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black">{tutorial.title}</h3>
                            <span className="chip">{tutorial.state}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{tutorial.description}</p>
                        </div>
                      </div>
                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/35">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-neon),var(--color-neon-2))]" style={{ width: `${tutorial.progress}%` }} />
                      </div>
                      <button type="button" disabled={tutorial.locked} className="btn mt-5 w-full" onClick={() => router.push(`/match/tutorial_${tutorial.id}?mode=single`)}>
                        Start
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
