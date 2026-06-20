'use client';

// MatchBoard — the full battlefield. Reads/writes the live match via useGameStore.
//   PLUG-IN POINT: every interaction here calls a gameStore action. To go online,
//   forward these to boardgame.io moves / Socket.io events instead.
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getCard } from '@/lib/game/cards';
import type { CardDef } from '@/lib/game/types';
import { useGameStore } from '@/store/gameStore';
import CardTile from '@/components/CardTile';
import CardPreviewModal from '@/components/CardPreviewModal';
import HeroPortrait from './HeroPortrait';
import UnitToken from './UnitToken';
import ActionLog from './ActionLog';

function spellNeedsTarget(def: CardDef): boolean {
  return def.type === 'spell' && !!def.requiresTarget;
}

export default function MatchBoard() {
  const router = useRouter();
  const s = useGameStore();
  const {
    player,
    opponent,
    activePlayer,
    phase,
    turn,
    timer,
    targeting,
    winner,
    log,
  } = s;

  // local UI states
  const [pendingSpell, setPendingSpell] = useState<number | null>(null); // hand uid awaiting target
  const [preview, setPreview] = useState<CardDef | null>(null);

  const myTurn = activePlayer === 'player' && phase !== 'gameover';
  const attackerIid = targeting.active ? targeting.sourceIid : null;
  const spellTargeting = pendingSpell !== null;

  // ---- hand interactions ----
  function onHandClick(uid: number, def: CardDef) {
    if (!myTurn) return;
    if (def.cost > player.mana) return;
    if (spellNeedsTarget(def)) {
      setPendingSpell((cur) => (cur === uid ? null : uid));
      useGameStore.setState({ targeting: { active: false, sourceIid: null } });
      return;
    }
    s.playCard(uid);
  }

  // ---- choosing a target for a pending spell ----
  function resolveSpell(target: number | 'hero') {
    if (pendingSpell === null) return;
    s.playCard(pendingSpell, target);
    setPendingSpell(null);
  }

  // ---- friendly unit click → pick attacker ----
  function onMyUnitClick(iid: number, canAttack: boolean) {
    if (!myTurn || !canAttack) return;
    setPendingSpell(null);
    if (attackerIid === iid) {
      s.cancelTargeting();
    } else {
      s.beginAttack(iid);
    }
  }

  // ---- enemy unit click → attack target or spell target ----
  function onEnemyUnitClick(iid: number) {
    if (spellTargeting) {
      resolveSpell(iid);
    } else if (attackerIid !== null) {
      s.attack(attackerIid, iid);
    }
  }

  // ---- enemy hero click → face attack or spell-to-face ----
  function onEnemyHeroClick() {
    if (spellTargeting) {
      resolveSpell('hero');
    } else if (attackerIid !== null) {
      s.attack(attackerIid, 'hero');
    }
  }

  const enemyHasGuard = opponent.board.some((u) => u.keywords.includes('guard'));
  function enemyUnitTargetable(hasGuard: boolean): boolean {
    if (spellTargeting) return true;
    if (attackerIid === null) return false;
    return enemyHasGuard ? hasGuard : true;
  }
  const heroTargetable =
    spellTargeting ? true : attackerIid !== null && !enemyHasGuard;

  return (
    <div className="relative flex h-[100dvh] flex-col gap-2 bg-[radial-gradient(circle_at_50%_-10%,#16182b,#06070d_60%)] p-3">
      {/* top bar */}
      <div className="flex items-center justify-between">
        <HeroPortrait
          side={opponent}
          isOpponent
          active={activePlayer === 'opponent'}
          targetable={heroTargetable}
          onClick={onEnemyHeroClick}
        />
        <div className="flex flex-col items-center gap-1">
          <span className="chip">Turn {turn}</span>
          <span
            className={
              'text-xs font-bold ' +
              (myTurn ? 'text-[var(--color-neon)]' : 'text-[var(--color-muted)]')
            }
          >
            {phase === 'gameover'
              ? 'Match over'
              : myTurn
                ? 'Your turn'
                : "Opponent's turn"}
          </span>
          <span className="text-[11px] tabular-nums text-[var(--color-muted)]">
            ⏱ {timer}s
          </span>
        </div>
        <button
          onClick={s.concede}
          className="btn text-xs text-[var(--color-oni)]"
        >
          Concede
        </button>
      </div>

      {/* opponent board */}
      <Zone label="Enemy Board">
        <AnimatePresence>
          {opponent.board.map((u) => (
            <UnitToken
              key={u.iid}
              unit={u}
              targetable={enemyUnitTargetable(u.keywords.includes('guard'))}
              onClick={() => onEnemyUnitClick(u.iid)}
            />
          ))}
        </AnimatePresence>
        {opponent.board.length === 0 && <EmptyHint />}
      </Zone>

      <div className="flex flex-1 gap-2">
        {/* battlefield center (boards) */}
        <div className="flex flex-1 flex-col justify-center gap-2">
          {/* player board */}
          <Zone label="Your Board" highlight={attackerIid !== null}>
            <AnimatePresence>
              {player.board.map((u) => (
                <UnitToken
                  key={u.iid}
                  unit={u}
                  ready={u.canAttack && myTurn}
                  selected={attackerIid === u.iid}
                  onClick={() => onMyUnitClick(u.iid, u.canAttack && myTurn)}
                />
              ))}
            </AnimatePresence>
            {player.board.length === 0 && <EmptyHint />}
          </Zone>
        </div>

        {/* battle log */}
        <div className="hidden w-60 lg:block">
          <ActionLog log={log} />
        </div>
      </div>

      {/* hint banner */}
      {(spellTargeting || attackerIid !== null) && (
        <div className="pointer-events-none absolute left-1/2 top-28 -translate-x-1/2 rounded-full border border-[var(--color-oni)] bg-black/70 px-4 py-1 text-xs font-bold text-[var(--color-oni)] animate-pulse-glow">
          {spellTargeting ? 'Select a target for your spell' : 'Select a target to attack'}
        </div>
      )}

      {/* player hero + hand */}
      <div className="flex items-end justify-between gap-3">
        <HeroPortrait side={player} active={myTurn} />

        <div className="flex flex-1 items-end justify-center gap-2 overflow-x-auto pb-1">
          {player.hand.map((h) => {
            const def = getCard(h.cardId);
            const affordable = myTurn && def.cost <= player.mana;
            return (
              <motion.div
                key={h.uid}
                layout
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{ y: -14 }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setPreview(def);
                }}
              >
                <CardTile
                  card={def}
                  size="sm"
                  selected={pendingSpell === h.uid}
                  disabled={!affordable}
                  onClick={() => onHandClick(h.uid, def)}
                />
              </motion.div>
            );
          })}
          {player.hand.length === 0 && (
            <span className="pb-6 text-xs text-[var(--color-muted)]">
              Empty hand
            </span>
          )}
        </div>

        <button
          onClick={() => {
            setPendingSpell(null);
            s.endTurn();
          }}
          disabled={!myTurn}
          className="btn-primary h-14 px-6 text-sm font-black disabled:opacity-40"
        >
          End Turn
        </button>
      </div>

      {/* right-click preview */}
      <CardPreviewModal card={preview} onClose={() => setPreview(null)} />

      {/* game over overlay */}
      <AnimatePresence>
        {phase === 'gameover' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="panel flex flex-col items-center gap-4 px-12 py-10 text-center"
            >
              <div className="text-6xl">{winner === 'player' ? '🏆' : '💀'}</div>
              <h2 className="neon-text text-3xl font-black">
                {winner === 'player' ? 'Victory' : 'Defeat'}
              </h2>
              <p className="text-sm text-[var(--color-muted)]">
                {winner === 'player'
                  ? 'Your clan stands triumphant.'
                  : 'The shadows claim this battle.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/play')}
                  className="btn"
                >
                  Home
                </button>
                <button
                  onClick={() => router.refresh()}
                  className="btn-primary"
                >
                  Rematch
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Zone({
  label,
  highlight,
  children,
}: {
  label: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        'relative flex min-h-[7rem] items-center justify-center gap-2 rounded-2xl border px-3 py-2 transition ' +
        (highlight
          ? 'border-[var(--color-neon)]/60 bg-[var(--color-neon)]/5'
          : 'border-[var(--color-line)] bg-black/20')
      }
    >
      <span className="absolute left-3 top-1 text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
        {label}
      </span>
      {children}
    </div>
  );
}

function EmptyHint() {
  return <span className="text-xs text-[var(--color-muted)]">— empty —</span>;
}
