'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import CampaignNode from '@/components/CampaignNode';
import PlayerAvatar from '@/components/PlayerAvatar';
import { db } from '@/lib/mock-data';
import type { CampaignNode as CampaignNodeType, Difficulty } from '@/lib/types';
import { cx } from '@/lib/ui';

type Tab = 'Campaign' | 'Practice' | 'Tutorial';

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  beginner: 'var(--color-shadow)',
  intermediate: 'var(--color-sage)',
  expert: 'var(--color-oni)',
  boss: 'var(--color-gold)',
};

const TUTORIALS = [
  {
    id: 1,
    title: 'Basics: Summoning',
    icon: '🥷',
    description: 'Learn how to call ninja allies, read costs, and build an opening board.',
    state: 'Complete',
    locked: false,
    progress: 100,
  },
  {
    id: 2,
    title: 'Combat & Guard',
    icon: '⚔️',
    description: 'Master attacks, guard windows, and tempo trades before entering the wilds.',
    state: 'In progress',
    locked: false,
    progress: 45,
  },
  {
    id: 3,
    title: 'Spells & Targeting',
    icon: '📜',
    description: 'Practice spell timing, valid targets, and response sequencing.',
    state: 'Ready',
    locked: false,
    progress: 0,
  },
  {
    id: 4,
    title: 'Keywords',
    icon: '✨',
    description: 'A guided gauntlet for stealth, guard, rush, and clan-specific text.',
    state: 'Locked',
    locked: true,
    progress: 0,
  },
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

export default function SinglePlayerPage() {
  const router = useRouter();
  const campaign = useMemo(() => db.getCampaign(), []);
  const profile = useMemo(() => db.getProfile(), []);
  const [activeTab, setActiveTab] = useState<Tab>('Campaign');
  const [selectedNode, setSelectedNode] = useState<CampaignNodeType>(() =>
    campaign.find((node) => node.unlocked && !node.completed) ?? campaign[0],
  );

  const nodeById = useMemo(() => new Map(campaign.map((node) => [node.id, node])), [campaign]);
  const completedCount = campaign.filter((node) => node.completed).length;
  const completionPercent = Math.round((completedCount / campaign.length) * 100);

  const startBattle = (node: CampaignNodeType) => {
    if (!node.unlocked) return;
    // PLUG-IN POINT: hydrate match setup from the campaign rules engine and AI profile.
    router.push(`/match/${node.id}?mode=single`);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/" className="text-sm font-bold text-[var(--color-neon)] hover:underline">
            ← Shadow Forge
          </Link>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            <span className="neon-text">Campaign</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--color-muted)]">
            Walk the hidden path, defeat rival clans, and unlock relics for {profile.displayName}&apos;s forge.
          </p>
        </div>
        <div className="panel flex min-w-56 items-center justify-between gap-5 p-4">
          <div>
            <p className="stat-label">Campaign complete</p>
            <p className="text-2xl font-black">{completedCount}/{campaign.length}</p>
          </div>
          <div className="grid h-16 w-16 place-items-center rounded-full border border-[var(--color-line)] bg-[conic-gradient(var(--color-neon)_var(--progress),var(--color-panel-2)_0)] text-sm font-black" style={{ ['--progress' as string]: `${completionPercent}%` }}>
            {completionPercent}%
          </div>
        </div>
      </header>

      <nav className="panel flex flex-wrap gap-2 p-2">
        {(['Campaign', 'Practice', 'Tutorial'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cx('btn flex-1 sm:flex-none', activeTab === tab && 'btn-primary')}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'Campaign' && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="panel relative min-h-[480px] overflow-hidden p-4 sm:min-h-[560px]">
            <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),radial-gradient(circle_at_20%_30%,rgba(0,229,255,0.14),transparent_28%),radial-gradient(circle_at_80%_60%,rgba(177,75,255,0.14),transparent_30%)] [background-size:42px_42px,42px_42px,100%_100%,100%_100%]" />
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {campaign.flatMap((node) =>
                node.connects.map((targetId) => {
                  const target = nodeById.get(targetId);
                  if (!target) return null;
                  const completePath = node.completed && target.completed;

                  return (
                    <line
                      key={`${node.id}-${targetId}`}
                      x1={node.x}
                      y1={node.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={completePath ? 'var(--color-neon)' : 'var(--color-line)'}
                      strokeWidth={completePath ? 0.75 : 0.45}
                      strokeDasharray={completePath ? undefined : '2 2'}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      opacity={completePath ? 0.9 : 0.72}
                    />
                  );
                }),
              )}
            </svg>
            {campaign.map((node) => (
              <CampaignNode key={node.id} node={node} selected={node.id === selectedNode.id} onSelect={setSelectedNode} />
            ))}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 rounded-xl border border-[var(--color-line)] bg-black/35 p-3 backdrop-blur">
              {(['beginner', 'intermediate', 'expert', 'boss'] as Difficulty[]).map((difficulty) => (
                <DifficultyChip key={difficulty} difficulty={difficulty} />
              ))}
            </div>
          </div>

          <motion.aside
            key={selectedNode.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel animate-float-in overflow-hidden p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <PlayerAvatar avatar={selectedNode.opponentAvatar} name={selectedNode.name} size="lg" active={selectedNode.unlocked} />
              <DifficultyChip difficulty={selectedNode.difficulty} />
            </div>
            <p className="mt-5 text-sm leading-6 text-[var(--color-muted)]">{selectedNode.description}</p>
            <div className="mt-6">
              <p className="stat-label mb-3">Rewards</p>
              <div className="space-y-2">
                {selectedNode.rewards.map((reward) => (
                  <div key={reward.id} className={cx('flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-black/20 p-3', reward.claimed && 'opacity-45')}>
                    <span className="text-2xl">{reward.icon}</span>
                    <div>
                      <p className="font-bold">{reward.label}</p>
                      <p className="text-xs capitalize text-[var(--color-muted)]">{reward.claimed ? 'Claimed' : reward.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={!selectedNode.unlocked}
              onClick={() => startBattle(selectedNode)}
              className="btn btn-gold mt-6 w-full"
            >
              ⚔ Battle
            </button>
          </motion.aside>
        </section>
      )}

      {activeTab === 'Practice' && (
        <section className="space-y-5">
          <div className="panel p-5">
            <p className="font-bold">Practice dojo</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              No rewards or rank impact.
            </p>
            {/* PLUG-IN POINT: tune AI difficulty from /lib/game for each sparring profile. */}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {db.practiceOpponents.map((opp) => (
              <motion.article key={opp.id} whileHover={{ y: -4 }} className="panel panel-hover p-5">
                <PlayerAvatar avatar={opp.avatar} name={opp.name} size="lg" />
                <div className="mt-5 flex items-center justify-between gap-3">
                  <DifficultyChip difficulty={opp.difficulty} />
                  <button type="button" className="btn btn-primary" onClick={() => router.push(`/match/practice_${opp.id}?mode=single`)}>
                    Practice
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'Tutorial' && (
        <section className="space-y-5">
          <div className="panel p-5">
            <p className="font-bold">Learning track</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Guided battles that teach the rules one shadow step at a time.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {TUTORIALS.map((tutorial) => (
              <motion.article key={tutorial.id} whileHover={tutorial.locked ? undefined : { y: -4 }} className={cx('panel panel-hover p-5', tutorial.locked && 'opacity-55')}>
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-2)] text-3xl">{tutorial.locked ? '🔒' : tutorial.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black">{tutorial.title}</h2>
                      <span className="chip">{tutorial.state}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{tutorial.description}</p>
                  </div>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/35">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-neon),var(--color-neon-2))]" style={{ width: `${tutorial.progress}%` }} />
                </div>
                <button
                  type="button"
                  disabled={tutorial.locked}
                  className="btn mt-5 w-full"
                  onClick={() => router.push(`/match/tutorial_${tutorial.id}?mode=single`)}
                >
                  Start
                </button>
              </motion.article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
