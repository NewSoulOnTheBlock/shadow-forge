'use client';

// /match/[id] — the live battlefield.
//   Next 16: route `params` is a Promise; unwrap it with React.use().
//   PLUG-IN POINT (multiplayer): today we boot a local match vs an AI deck. To go
//   online, fetch the authoritative match by id and subscribe to server snapshots
//   instead of calling initMatch locally.
import { use, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { useGameStore } from '@/store/gameStore';
import { db } from '@/lib/mock-data';
import MatchBoard from '@/components/game/MatchBoard';

// Expand a deck's [{cardId, count}] into a flat list of card ids.
function expandDeck(cards: { cardId: string; count: number }[]): string[] {
  return cards.flatMap((c) => Array.from({ length: c.count }, () => c.cardId));
}

export default function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') ?? 'casual';

  const profile = useAppStore((s) => s.profile);
  const decks = useAppStore((s) => s.decks);
  const activeDeckId = useAppStore((s) => s.activeDeckId);
  const initMatch = useGameStore((s) => s.initMatch);

  // Resolve the player's deck (active, else first) and an opponent deck.
  const { myDeckIds, foeDeckIds, foe } = useMemo(() => {
    const mine = decks.find((d) => d.id === activeDeckId) ?? decks[0];
    const allDecks = db.getDecks();
    const foeDeck =
      allDecks.find((d) => d.id !== mine?.id) ?? allDecks[0] ?? mine;
    const opponents = db.practiceOpponents;
    const pick = opponents[Math.floor(Math.random() * opponents.length)];
    return {
      myDeckIds: mine ? expandDeck(mine.cards) : [],
      foeDeckIds: foeDeck ? expandDeck(foeDeck.cards) : [],
      foe: pick ?? { name: 'Rival Shinobi', avatar: '🐉' },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDeckId, decks]);

  // Boot the match once per id.
  const booted = useRef<string | null>(null);
  useEffect(() => {
    if (booted.current === id) return;
    booted.current = id;
    initMatch({
      matchId: id,
      mode,
      deckCardIds: myDeckIds,
      playerName: profile.displayName,
      playerAvatar: profile.avatar,
      opponentName: foe.name,
      opponentAvatar: foe.avatar,
      opponentDeckIds: foeDeckIds,
    });
  }, [id, mode, myDeckIds, foeDeckIds, foe, profile, initMatch]);

  // Turn countdown.
  const tickTimer = useGameStore((s) => s.tickTimer);
  useEffect(() => {
    const t = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(t);
  }, [tickTimer]);

  return <MatchBoard />;
}
