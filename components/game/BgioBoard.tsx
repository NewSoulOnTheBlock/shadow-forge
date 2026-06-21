'use client';

import Icon from '@/components/Icon';
// BgioBoard — the Legend of Ki battlefield, driven by the REAL boardgame.io
// engine (SkyforgeGame). It reads authoritative state from `G`/`ctx` and issues
// `moves`/`events` instead of the placeholder gameStore. This is the board that
// renders whenever a match starts.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { BoardProps } from 'boardgame.io/react';
import type { GState, TargetRef, UnitInstance, Prism } from '@/lib/game/types';
import { RULES } from '@/lib/game/types';
import { getCard } from '@/lib/game/cards';
import {
  opponentOf,
  canAttackTarget,
  isLegalCardTarget,
} from '@/lib/game/engine';
import type { CardDef } from '@/lib/game/types';
import type { BoardUnit } from '@/store/gameStore';
import { cx } from '@/lib/ui';
import CardTile from '@/components/CardTile';
import CardPreviewModal from '@/components/CardPreviewModal';
import UnitToken from './UnitToken';
import HealthDisplay from './HealthDisplay';
import ResourceDisplay from './ResourceDisplay';
import ActionLog from './ActionLog';
import LoadingScreen from '@/components/LoadingScreen';
import { useAppStore } from '@/store/appStore';
import type { MatchMode } from '@/lib/types';

interface ExtraProps {
  myName: string;
  myAvatar: string;
  oppName: string;
  oppAvatar: string;
  myCards: string[];
  myPrisms: Prism[];
  mode: string;
  myDeckName: string;
}

type Selection =
  | { kind: 'none' }
  | { kind: 'play'; handIndex: number }
  | { kind: 'attack'; iid: number };

// Horizontal centre (% of viewport width) of each of the 5 board slots, measured
// to line up with the stone panels painted into /playmat.png. Top = opponent row,
// bottom = player row (wider, due to the arena's perspective).
const OPP_SLOTS = [34.5, 42, 50, 58, 65.5];
const MY_SLOTS = [33, 41.5, 50, 58.5, 67];

// Adapt an engine UnitInstance to the presentational UnitToken's shape.
function toToken(u: UnitInstance, owner: 'player' | 'opponent'): BoardUnit {
  const def = getCard(u.cardId);
  return {
    iid: u.iid,
    cardId: u.cardId,
    name: def.name,
    art: def.art,
    attack: u.attack,
    health: u.health,
    maxHealth: u.maxHealth,
    keywords: u.keywords,
    canAttack: u.attacksLeft > 0,
    owner,
  };
}

export default function BgioBoard(props: BoardProps<GState> & ExtraProps) {
  const { G, ctx, moves, events, playerID } = props;
  const router = useRouter();
  const me = playerID ?? '0';
  const opp = opponentOf(me);
  const [sel, setSel] = useState<Selection>({ kind: 'none' });
  const [preview, setPreview] = useState<CardDef | null>(null);

  const phase = ctx.phase;
  const myTurn = ctx.currentPlayer === me && phase === 'play' && !ctx.gameover;

  // Auto-submit my active deck the moment the duel opens (no deck-select UI here;
  // the deck was already chosen in the deck builder). The bot submits its own.
  useEffect(() => {
    if (phase === 'deckSelect' && !G.players[me]?.deckSubmitted) {
      moves.submitDeck?.(props.myCards, props.myPrisms);
    }
  }, [phase, G.players, me, moves, props.myCards, props.myPrisms]);

  // Reset selection when the turn flips, and support Esc to cancel.
  useEffect(() => setSel({ kind: 'none' }), [ctx.currentPlayer, ctx.turn]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSel({ kind: 'none' });
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Persist the match result exactly once when the game ends. Only the human
  // seat ('0') renders this board, so only the human's record is written.
  const recordMatch = useAppStore((s) => s.recordMatch);
  const recordedRef = useRef(false);
  useEffect(() => {
    const over = ctx.gameover as { winner?: string; draw?: boolean } | undefined;
    if (!over || recordedRef.current) return;
    recordedRef.current = true;
    const outcome: 'win' | 'loss' | 'draw' = over.draw
      ? 'draw'
      : over.winner === me
        ? 'win'
        : 'loss';
    const allowed: MatchMode[] = ['ranked', 'casual', 'single', 'custom'];
    const mode: MatchMode = (allowed as string[]).includes(props.mode)
      ? (props.mode as MatchMode)
      : 'casual';
    void recordMatch({
      result: outcome,
      mode,
      opponent: props.oppName,
      opponentAvatar: props.oppAvatar,
      deckName: props.myDeckName,
      durationSec: Math.max(1, ctx.turn) * 20,
    });
  }, [ctx.gameover, ctx.turn, me, props.mode, props.oppName, props.oppAvatar, props.myDeckName, recordMatch]);


  const meP = G.players[me];
  const oppP = G.players[opp];

  // ----- targeting predicates -----
  const isTargetable = (t: TargetRef): boolean => {
    if (sel.kind === 'play') {
      const card = getCard(meP.hand[sel.handIndex]);
      if (!card.requiresTarget) return false;
      return isLegalCardTarget(G, me, card.requiresTarget, t);
    }
    if (sel.kind === 'attack') {
      const attacker = meP.board.find((u) => u.iid === sel.iid);
      return attacker ? canAttackTarget(G, attacker, t).ok : false;
    }
    return false;
  };

  const unitCanAct = (u: UnitInstance): boolean =>
    myTurn &&
    u.attacksLeft > 0 &&
    u.attack > 0 &&
    (canAttackTarget(G, u, { kind: 'hero', player: opp }).ok ||
      oppP.board.some((e) => canAttackTarget(G, u, { kind: 'unit', iid: e.iid }).ok));

  // ----- interactions -----
  const playHandCard = (handIndex: number) => {
    if (!myTurn) return;
    const card = getCard(meP.hand[handIndex]);
    if (card.cost > meP.mana) return;
    if (card.type === 'unit' && meP.board.length >= RULES.boardWidth) return;
    if (sel.kind === 'play' && sel.handIndex === handIndex) {
      setSel({ kind: 'none' });
      return;
    }
    if (card.requiresTarget) setSel({ kind: 'play', handIndex });
    else {
      moves.playCard(handIndex);
      setSel({ kind: 'none' });
    }
  };

  const clickTarget = (t: TargetRef): boolean => {
    if (sel.kind === 'play' && isTargetable(t)) {
      moves.playCard(sel.handIndex, t);
      setSel({ kind: 'none' });
      return true;
    }
    if (sel.kind === 'attack' && isTargetable(t)) {
      moves.attack(sel.iid, t);
      setSel({ kind: 'none' });
      return true;
    }
    return false;
  };

  const clickMyUnit = (u: UnitInstance) => {
    if (sel.kind === 'play' && clickTarget({ kind: 'unit', iid: u.iid })) return;
    if (sel.kind === 'attack' && sel.iid === u.iid) {
      setSel({ kind: 'none' });
      return;
    }
    if (unitCanAct(u)) setSel({ kind: 'attack', iid: u.iid });
  };

  // ----- deck-select: brief loading while decks submit -----
  if (phase === 'deckSelect') {
    return <LoadingScreen label="Preparing the duel" />;
  }

  const gameover = ctx.gameover as { winner?: string; draw?: boolean } | undefined;
  const result = gameover
    ? gameover.draw
      ? 'draw'
      : gameover.winner === me
        ? 'win'
        : 'lose'
    : null;

  const heroTargetable = isTargetable({ kind: 'hero', player: opp });
  const myHeroTargetable = isTargetable({ kind: 'hero', player: me });

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-black"
      style={{
        backgroundImage: "url('/playmat.png')",
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
      }}
    >
      {/* faint vignette so tokens + HUD stay readable over the busy arena art */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {/* turn indicator — top center */}
      <div className="absolute left-1/2 top-2 z-30 flex -translate-x-1/2 flex-col items-center gap-1">
        <span className="chip">Turn {ctx.turn}</span>
        <span
          className={cx(
            'rounded-full bg-black/55 px-3 py-0.5 text-xs font-bold backdrop-blur-sm',
            myTurn ? 'text-[var(--color-neon)]' : 'text-[var(--color-muted)]',
          )}
        >
          {ctx.gameover ? 'Match over' : myTurn ? 'Your turn' : "Opponent's turn"}
        </span>
      </div>

      {/* forfeit — top right */}
      <button
        onClick={() => router.push('/play')}
        className="btn absolute right-3 top-3 z-30 bg-black/55 text-xs text-[var(--color-oni)] backdrop-blur-sm"
      >
        Forfeit
      </button>

      {/* opponent hero — top-left altar pad */}
      <div
        className="absolute z-30 rounded-2xl bg-black/45 p-2 backdrop-blur-sm"
        style={{ left: '20.5%', top: '27.5%', transform: 'translate(-50%,-50%)' }}
      >
        <HeroPanel
          name={props.oppName}
          avatar={props.oppAvatar}
          hp={oppP.hero.hp}
          maxHp={oppP.hero.maxHp}
          mana={oppP.mana}
          maxMana={oppP.maxMana}
          deckCount={oppP.deckCount}
          handCount={oppP.hand.length}
          active={ctx.currentPlayer === opp && phase === 'play'}
          targetable={heroTargetable}
          onClick={() => clickTarget({ kind: 'hero', player: opp })}
        />
      </div>

      {/* player hero — bottom-left altar pad */}
      <div
        className="absolute z-30 rounded-2xl bg-black/45 p-2 backdrop-blur-sm"
        style={{ left: '15%', top: '66%', transform: 'translate(-50%,-50%)' }}
      >
        <HeroPanel
          name={props.myName}
          avatar={props.myAvatar}
          hp={meP.hero.hp}
          maxHp={meP.hero.maxHp}
          mana={meP.mana}
          maxMana={meP.maxMana}
          deckCount={meP.deckCount}
          handCount={meP.hand.length}
          active={myTurn}
          targetable={myHeroTargetable}
          onClick={() => clickTarget({ kind: 'hero', player: me })}
        />
      </div>

      {/* opponent board — 5 slots aligned to the top stone panels */}
      <AnimatePresence>
        {OPP_SLOTS.map((sx, i) => {
          const u = oppP.board[i];
          return (
            <Slot key={`o${i}`} x={sx} y={20.5}>
              {u && (
                <UnitToken
                  key={u.iid}
                  unit={toToken(u, 'opponent')}
                  targetable={isTargetable({ kind: 'unit', iid: u.iid })}
                  onClick={() => clickTarget({ kind: 'unit', iid: u.iid })}
                />
              )}
            </Slot>
          );
        })}
      </AnimatePresence>

      {/* player board — 5 slots aligned to the bottom stone panels */}
      <AnimatePresence>
        {MY_SLOTS.map((sx, i) => {
          const u = meP.board[i];
          return (
            <Slot key={`m${i}`} x={sx} y={79} highlight={sel.kind === 'attack'}>
              {u && (
                <UnitToken
                  key={u.iid}
                  unit={toToken(u, 'player')}
                  ready={unitCanAct(u)}
                  selected={sel.kind === 'attack' && sel.iid === u.iid}
                  targetable={isTargetable({ kind: 'unit', iid: u.iid })}
                  onClick={() => clickMyUnit(u)}
                />
              )}
            </Slot>
          );
        })}
      </AnimatePresence>

      {/* battle log — floating, large screens only */}
      <div className="absolute right-3 top-1/2 z-20 hidden w-56 -translate-y-1/2 xl:block">
        <ActionLog log={G.log} />
      </div>

      {/* targeting hint */}
      {sel.kind !== 'none' && (
        <div className="pointer-events-none absolute left-1/2 top-16 z-40 -translate-x-1/2 rounded-full border border-[var(--color-oni)] bg-black/70 px-4 py-1 text-xs font-bold text-[var(--color-oni)] animate-pulse-glow">
          {sel.kind === 'play' ? 'Select a target (Esc to cancel)' : 'Select what to attack (Esc to cancel)'}
        </div>
      )}

      {/* End Turn — bottom-right altar pad */}
      <button
        onClick={() => {
          setSel({ kind: 'none' });
          events.endTurn?.();
        }}
        disabled={!myTurn}
        className="btn-primary absolute z-40 h-14 px-6 text-sm font-black disabled:opacity-40"
        style={{ left: '85.5%', top: '66%', transform: 'translate(-50%,-50%)' }}
      >
        End Turn
      </button>

      {/* hand — fanned along the bottom wooden step */}
      <div className="absolute bottom-1 left-1/2 z-40 flex -translate-x-1/2 items-end justify-center gap-2 px-2">
        {meP.hand.map((id, i) => {
          if (id === 'HIDDEN') return null;
          const def = getCard(id);
          const affordable = myTurn && def.cost <= meP.mana;
          return (
            <motion.div
              key={`${id}-${i}`}
              layout
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ y: -18 }}
              onContextMenu={(e) => {
                e.preventDefault();
                setPreview(def);
              }}
            >
              <CardTile
                card={def}
                size="sm"
                selected={sel.kind === 'play' && sel.handIndex === i}
                disabled={!affordable}
                onClick={() => playHandCard(i)}
              />
            </motion.div>
          );
        })}
        {meP.hand.length === 0 && (
          <span className="pb-6 text-xs text-[var(--color-muted)]">Empty hand</span>
        )}
      </div>

      <CardPreviewModal card={preview} onClose={() => setPreview(null)} />

      {/* game over */}
      <AnimatePresence>
        {result && (
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
              <div className="text-6xl">{result === 'win' ? <Icon icon="ph:trophy-duotone" size={64} /> : result === 'lose' ? <Icon icon="ph:skull-duotone" size={64} /> : <Icon icon="ph:scales-duotone" size={64} />}</div>
              <h2 className="neon-text text-3xl font-black">
                {result === 'win' ? 'Victory' : result === 'lose' ? 'Defeat' : 'Draw'}
              </h2>
              <p className="text-sm text-[var(--color-muted)]">
                {result === 'win'
                  ? 'Your clan stands triumphant.'
                  : result === 'lose'
                    ? 'The shadows claim this battle.'
                    : 'Both clans fall as one.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => router.push('/play')} className="btn">Home</button>
                <button onClick={() => router.refresh()} className="btn-primary">Rematch</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeroPanel({
  name,
  avatar,
  hp,
  maxHp,
  mana,
  maxMana,
  deckCount,
  handCount,
  active,
  targetable,
  onClick,
}: {
  name: string;
  avatar: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  deckCount: number;
  handCount: number;
  active?: boolean;
  targetable?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <motion.button
        onClick={onClick}
        disabled={!targetable}
        whileHover={targetable ? { scale: 1.06 } : undefined}
        className={cx(
          'relative grid h-20 w-20 place-items-center rounded-full border-2 text-4xl transition',
          active ? 'border-[var(--color-neon)] glow-ring' : 'border-[var(--color-line)]',
          targetable && 'cursor-crosshair border-[var(--color-oni)] animate-pulse-glow',
        )}
        style={{ background: 'radial-gradient(circle at 50% 30%, #1c1f33, #0b0c16)' }}
      >
        {avatar}
        {targetable && <Icon icon="ph:target-duotone" size={18} className="absolute -right-1 -top-1" />}
      </motion.button>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{name}</span>
        <HealthDisplay hp={hp} maxHp={maxHp} />
        <ResourceDisplay mana={mana} maxMana={maxMana} />
        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-muted)]"><Icon icon="ph:cards-duotone" size={13} /> {deckCount} · <Icon icon="ph:hand-duotone" size={13} /> {handCount}</span>
      </div>
    </div>
  );
}

function Slot({
  x,
  y,
  highlight,
  children,
}: {
  x: number; // centre, % of viewport width
  y: number; // centre, % of viewport height
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        'absolute z-20 grid h-[104px] w-[80px] place-items-center rounded-xl border transition',
        highlight ? 'border-[var(--color-neon)]/50' : 'border-white/5',
      )}
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}
    >
      {children}
    </div>
  );
}
