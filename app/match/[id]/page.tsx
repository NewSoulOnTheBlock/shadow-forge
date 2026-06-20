"use client";

// /match/[id] - the live battlefield, powered by the real boardgame.io engine.
//   Next 16: route `params` is a Promise; unwrap it with React.use().
//   The boardgame.io Client touches browser-only APIs, so MatchClient is loaded
//   with ssr:false.
//   PLUG-IN POINT (multiplayer): today we resolve decks locally and play vs an
//   AI bot. For online PvP, fetch the authoritative match by id and have
//   MatchClient use SocketIO instead of Local.
import { use, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { db, CAMPAIGN_ENCOUNTERS } from "@/lib/mock-data";
import { validateDeck, DEFAULT_DECK, STARTER_DECKS } from "@/lib/game/decks";
import type { Prism } from "@/lib/game/types";

const MatchClient = dynamic(() => import("@/components/game/MatchClient"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[100dvh] place-items-center bg-[#06070d]">
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl animate-pulse">🥷</div>
        <p className="text-sm text-[var(--color-muted)]">Entering the arena...</p>
      </div>
    </div>
  ),
});

function expandDeck(cards: { cardId: string; count: number }[]): string[] {
  return cards.flatMap((c) => Array.from({ length: c.count }, () => c.cardId));
}

// A legal decklist for the engine. Falls back to a starter preset if the chosen
// deck does not satisfy the rules (e.g. an unfinished custom deck).
function legalDeck(
  cards: string[],
  prisms: Prism[],
): { cards: string[]; prisms: Prism[] } {
  if (cards.length && !validateDeck(cards, prisms)) return { cards, prisms };
  return { cards: [...DEFAULT_DECK.cards], prisms: [...DEFAULT_DECK.prisms] };
}

export default function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? "casual";

  const profile = useAppStore((s) => s.profile);
  const decks = useAppStore((s) => s.decks);
  const activeDeckId = useAppStore((s) => s.activeDeckId);

  const cfg = useMemo(() => {
    const mine = decks.find((d) => d.id === activeDeckId) ?? decks[0];
    const my = legalDeck(
      mine ? expandDeck(mine.cards) : [],
      (mine?.prisms ?? []) as Prism[],
    );

    // Campaign nodes (ids c1..c8) drop the player straight into that boss's
    // hand-built deck. Anything else falls back to a random starter rival.
    const encounter = CAMPAIGN_ENCOUNTERS[id];
    if (encounter) {
      return {
        myCards: my.cards,
        myPrisms: my.prisms,
        oppCards: [...encounter.cards],
        oppPrisms: [...encounter.prisms] as Prism[],
        oppName: encounter.name,
        oppAvatar: encounter.avatar,
      };
    }

    const foePreset =
      STARTER_DECKS.find((d) => d.name !== mine?.name) ?? STARTER_DECKS[0];
    const opponents = db.practiceOpponents;
    const foe = opponents[Math.floor(Math.random() * opponents.length)] ?? {
      name: "Rival Shinobi",
      avatar: "🐉",
    };

    return {
      myCards: my.cards,
      myPrisms: my.prisms,
      oppCards: [...foePreset.cards],
      oppPrisms: [...foePreset.prisms] as Prism[],
      oppName: foe.name,
      oppAvatar: foe.avatar,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDeckId, decks, id]);

  return (
    <MatchClient
      matchId={id}
      mode={mode}
      myName={profile.displayName}
      myAvatar={profile.avatar}
      oppName={cfg.oppName}
      oppAvatar={cfg.oppAvatar}
      myCards={cfg.myCards}
      myPrisms={cfg.myPrisms}
      oppCards={cfg.oppCards}
      oppPrisms={cfg.oppPrisms}
    />
  );
}