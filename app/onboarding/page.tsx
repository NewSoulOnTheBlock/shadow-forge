'use client';

// Onboarding — shown once after a brand-new account signs in (needsOnboarding).
//   Step 1: forge an identity (display name).
//   Step 2: the Path Selection Ceremony — a cinematic ritual where the player
//   chooses one of five Legendary Heroes. The choice is permanent: it sets the
//   starting champion, unlocks the hero's starter deck + campaign, and becomes
//   the account avatar. `POST /api/profile` persists name + hero, then a hard
//   navigation to /play re-bootstraps the store.
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api/client';
import Icon from '@/components/Icon';
import { HEROES, type Hero } from '@/lib/game/heroes';

const DIFFICULTY_PIPS: Record<Hero['difficulty'], number> = { Easy: 1, Medium: 2, Hard: 3 };

export default function OnboardingPage() {
  const [step, setStep] = useState<'identity' | 'ceremony'>('identity');
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Hero | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = name.trim();
  const validName = trimmed.length >= 3 && trimmed.length <= 20;

  const commit = async () => {
    if (!selected || busy) return;
    setError(null);
    setBusy(true);
    try {
      await api.saveProfile(trimmed, selected.avatar, selected.id);
      window.location.href = '/play';
    } catch (err) {
      console.error('[ceremony]', err);
      setError('The ritual was interrupted. Please try again.');
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#05060c]">
      {/* Moonlit temple backdrop */}
      <div
        className="absolute inset-0 scale-110 blur-[3px] opacity-60"
        style={{ backgroundImage: 'url(/signin-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(130%_120%_at_50%_-10%,rgba(90,209,200,0.10),rgba(5,6,12,0.0)_45%),radial-gradient(120%_120%_at_50%_110%,rgba(139,109,214,0.14),rgba(5,6,12,0.0)_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(5,6,12,0.45),rgba(5,6,12,0.92))]" />

      {/* Floating lanterns */}
      {LANTERNS.map((l, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute"
          style={{ left: l.left, top: l.top }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, -16, 0], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: l.dur, repeat: Infinity, ease: 'easeInOut', delay: l.delay }}
        >
          <Icon icon="game-icons:paper-lantern" size={l.size} className="text-[#f0a429] drop-shadow-[0_0_14px_rgba(240,164,41,0.65)]" />
        </motion.div>
      ))}

      {/* Falling cherry blossom petals */}
      {PETALS.map((p, i) => (
        <motion.div
          key={`p${i}`}
          className="pointer-events-none absolute top-[-6%]"
          style={{ left: p.left }}
          initial={{ y: '-6vh', x: 0, rotate: 0, opacity: 0 }}
          animate={{ y: '112vh', x: p.sway, rotate: p.spin, opacity: [0, 0.9, 0.9, 0] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'linear', delay: p.delay }}
        >
          <Icon icon="game-icons:cherry" size={p.size} className="text-[#f3a7c4]/80" />
        </motion.div>
      ))}

      <div className="relative grid h-full place-items-center p-4">
        <AnimatePresence mode="wait">
          {step === 'identity' ? (
            <motion.div
              key="identity"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="panel w-full max-w-lg p-7 shadow-2xl backdrop-blur-xl"
              style={{ background: 'rgba(12,13,24,0.82)' }}
            >
              <div className="text-center">
                <span className="grid mx-auto h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-neon)] to-[var(--color-neon-2)] text-black shadow-lg">
                  <Icon icon="game-icons:ninja-mask" size={30} />
                </span>
                <h1 className="mt-4 text-2xl font-black tracking-tight">
                  Forge your <span className="neon-text">identity</span>
                </h1>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Speak your name, then walk the temple to choose your path.
                </p>
              </div>

              <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
                Display name
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && validName && setStep('ceremony')}
                maxLength={20}
                placeholder="ShadowFox"
                className="mt-2 w-full rounded-xl border border-[var(--color-line)] bg-black/40 px-4 py-3 font-bold outline-none transition focus:border-[var(--color-neon)]"
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">3–20 characters.</p>

              <button
                type="button"
                disabled={!validName}
                onClick={() => setStep('ceremony')}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-neon)] to-[var(--color-neon-2)] px-4 py-3 font-black text-black shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enter the Temple
                <Icon icon="game-icons:temple-gate" size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="ceremony"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative grid h-full w-full max-w-6xl grid-rows-[auto_1fr] gap-2"
            >
              <div className="pt-4 text-center">
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-black uppercase tracking-[0.2em] sm:text-3xl"
                >
                  The Path Selection Ceremony
                </motion.h1>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Five Legendary Heroes await, <span className="text-[var(--color-neon)]">{trimmed}</span>. Choose the one whose path is yours.
                </p>
              </div>

              {/* The circular ritual stage */}
              <div className="relative grid place-items-center">
                <div className="relative aspect-square w-full max-w-[min(80vh,640px)]">
                  {/* Glowing central sigil */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <motion.div
                      className="grid h-36 w-36 place-items-center rounded-full sm:h-44 sm:w-44"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(90,209,200,0.28), rgba(139,109,214,0.10) 60%, transparent 72%)',
                      }}
                      animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.06, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                        className="grid place-items-center rounded-full border border-dashed border-[var(--color-neon)]/40 p-6"
                      >
                        <Icon
                          icon="game-icons:yin-yang"
                          size={56}
                          className="text-[var(--color-neon)] drop-shadow-[0_0_20px_rgba(90,209,200,0.7)]"
                        />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Hero statues in a circle */}
                  {HEROES.map((hero, i) => {
                    const angle = (-90 + i * (360 / HEROES.length)) * (Math.PI / 180);
                    const radius = 42; // % from center
                    const x = 50 + radius * Math.cos(angle);
                    const y = 50 + radius * Math.sin(angle);
                    const active = selected?.id === hero.id;
                    return (
                      <motion.button
                        key={hero.id}
                        type="button"
                        onClick={() => setSelected(hero)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 outline-none"
                        style={{ left: `${x}%`, top: `${y}%` }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 200, damping: 18 }}
                        whileHover={{ scale: 1.08 }}
                      >
                        <div
                          className={`grid place-items-center rounded-2xl border p-3 transition sm:p-4 ${
                            active ? 'scale-110 border-2' : 'border-[var(--color-line)] bg-black/40 hover:border-white/40'
                          }`}
                          style={
                            active
                              ? {
                                  borderColor: hero.accent,
                                  background: `radial-gradient(circle at 50% 30%, ${hero.accent}33, rgba(8,9,16,0.85))`,
                                  boxShadow: `0 0 28px ${hero.accent}88`,
                                }
                              : undefined
                          }
                        >
                          <Icon
                            icon={hero.glyph}
                            size={44}
                            style={{ color: hero.accent }}
                            className="drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]"
                          />
                        </div>
                        <div className="mt-1 text-center text-[11px] font-bold tracking-wide sm:text-xs">{hero.name}</div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hero information panel (slides in when a statue is chosen) */}
      <AnimatePresence>
        {step === 'ceremony' && selected && (
          <motion.aside
            key={selected.id}
            initial={{ x: '110%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '110%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed right-0 top-0 z-20 flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto border-l border-[var(--color-line)] bg-[rgba(8,9,16,0.94)] p-6 backdrop-blur-xl sm:right-4 sm:top-4 sm:h-[calc(100%-2rem)] sm:rounded-2xl sm:border"
          >
            <div className="flex items-center gap-4">
              <span
                className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border"
                style={{ borderColor: selected.accent, background: `${selected.accent}22`, boxShadow: `0 0 22px ${selected.accent}66` }}
              >
                <Icon icon={selected.glyph} size={38} style={{ color: selected.accent }} />
              </span>
              <div>
                <h2 className="text-xl font-black leading-tight">{selected.name}</h2>
                <p className="text-sm italic text-[var(--color-muted)]">{selected.title}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selected.playstyle.map((p) => (
                <span key={p} className="rounded-full border border-[var(--color-line)] bg-black/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
                  {p}
                </span>
              ))}
              <span className="ml-auto flex items-center gap-1 text-xs font-bold text-[var(--color-muted)]">
                Difficulty
                {Array.from({ length: 3 }).map((_, i) => (
                  <Icon
                    key={i}
                    icon="game-icons:katana"
                    size={14}
                    style={{ color: i < DIFFICULTY_PIPS[selected.difficulty] ? selected.accent : 'rgba(255,255,255,0.18)' }}
                  />
                ))}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-[var(--color-muted)]">{selected.lore}</p>

            <Detail icon="game-icons:swirl-string" accent={selected.accent} label={`Hero Ability · ${selected.ability.name}`}>
              {selected.ability.description}
            </Detail>
            <Detail icon="game-icons:card-pickup" accent={selected.accent} label="Starter Deck">
              {selected.starterDeckTheme}
            </Detail>
            <Detail icon="game-icons:rolling-dices" accent={selected.accent} label="Campaign Reward">
              {selected.campaignReward}
            </Detail>
            <Detail icon="game-icons:laurel-crown" accent={selected.accent} label="Hero Mastery Reward">
              {selected.masteryReward} <span className="text-[var(--color-muted)]">— earned only by completing this hero&apos;s campaign.</span>
            </Detail>

            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-black text-black shadow-lg transition hover:brightness-110"
              style={{ background: `linear-gradient(90deg, ${selected.accent}, #f0a429)` }}
            >
              <Icon icon="game-icons:temple-gate" size={20} />
              Walk the Path of {selected.name}
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Confirmation ritual */}
      <AnimatePresence>
        {confirming && selected && (
          <motion.div
            className="fixed inset-0 z-30 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !busy && setConfirming(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="panel w-full max-w-md p-7 text-center"
              style={{ background: 'rgba(12,13,24,0.96)' }}
            >
              <span
                className="grid mx-auto h-16 w-16 place-items-center rounded-2xl border"
                style={{ borderColor: selected.accent, background: `${selected.accent}22`, boxShadow: `0 0 24px ${selected.accent}66` }}
              >
                <Icon icon={selected.glyph} size={38} style={{ color: selected.accent }} />
              </span>
              <h2 className="mt-4 text-xl font-black">Swear the Oath?</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                Your first hero determines your starting path. Additional heroes may be unlocked later.
              </p>

              {error && <p className="mt-3 text-sm text-[var(--color-oni)]">{error}</p>}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirming(false)}
                  className="flex-1 rounded-xl border border-[var(--color-line)] bg-black/40 px-4 py-3 font-bold transition hover:border-white/40 disabled:opacity-50"
                >
                  Reconsider
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={commit}
                  className="flex-1 rounded-xl px-4 py-3 font-black text-black shadow-lg transition hover:brightness-110 disabled:opacity-60"
                  style={{ background: `linear-gradient(90deg, ${selected.accent}, #f0a429)` }}
                >
                  {busy ? 'Binding…' : `I am ${selected.name}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Detail({
  icon,
  accent,
  label,
  children,
}: {
  icon: string;
  accent: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-black/30 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>
        <Icon icon={icon} size={16} />
        {label}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-white/85">{children}</p>
    </div>
  );
}

const LANTERNS = [
  { left: '8%', top: '18%', size: 40, dur: 6, delay: 0 },
  { left: '86%', top: '14%', size: 52, dur: 7, delay: 1.2 },
  { left: '16%', top: '64%', size: 34, dur: 5.5, delay: 0.6 },
  { left: '78%', top: '70%', size: 46, dur: 6.5, delay: 1.8 },
  { left: '50%', top: '8%', size: 30, dur: 8, delay: 0.3 },
];

const PETALS = Array.from({ length: 16 }).map((_, i) => ({
  left: `${(i * 6.3 + 3) % 100}%`,
  size: 12 + (i % 4) * 5,
  dur: 9 + (i % 5) * 2.5,
  delay: (i % 7) * 1.4,
  sway: i % 2 === 0 ? [0, 30, -20, 25, 0] : [0, -28, 22, -18, 0],
  spin: i % 2 === 0 ? 240 : -260,
}));
