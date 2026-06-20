'use client';

// =============================================================================
// Deck Builder (spec section 6).
// Singleton format: max 1 copy per card, 1–2 clans, 15–25 cards (RULES).
// PLUG-IN POINT: saving currently writes to the Zustand app store (mock). Wire
// `upsertDeck` to a `decks`/`deck_cards` table write.
// =============================================================================
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { db } from '@/lib/mock-data';
import { validateDeck } from '@/lib/game/decks';
import { RULES } from '@/lib/game/types';
import { getCard } from '@/lib/game/cards';
import type { Card, Deck, Prism } from '@/lib/types';
import { PRISMS } from '@/lib/game/types';
import { PRISM_META, CLAN_COLOR, cx } from '@/lib/ui';
import CardTile from '@/components/CardTile';
import CardPreviewModal from '@/components/CardPreviewModal';
import { useCardFilter, CardFilters } from '@/components/CardFilters';
import DeckList from '@/components/deck-builder/DeckList';
import DeckStats from '@/components/deck-builder/DeckStats';

const CATALOG = db.getCatalog();

export default function DeckBuilderPage() {
  const router = useRouter();
  const decks = useAppStore((s) => s.decks);
  const upsertDeck = useAppStore((s) => s.upsertDeck);
  const deleteDeck = useAppStore((s) => s.deleteDeck);
  const duplicateDeck = useAppStore((s) => s.duplicateDeck);
  const setActiveDeck = useAppStore((s) => s.setActiveDeck);
  const activeDeckId = useAppStore((s) => s.activeDeckId);
  const userId = useAppStore((s) => s.user.id);

  const [editingId, setEditingId] = useState<string>(activeDeckId);
  const initial = decks.find((d) => d.id === editingId) ?? decks[0];
  const [name, setName] = useState(initial?.name ?? 'New Clan');
  const [prisms, setPrisms] = useState<Prism[]>(initial ? [...initial.prisms] : []);
  const [deck, setDeck] = useState<string[]>(
    initial ? initial.cards.flatMap((c) => Array(c.count).fill(c.cardId)) : [],
  );
  const [preview, setPreview] = useState<Card | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // pool restricted to chosen clans (all clans until one is picked)
  const pool = useMemo(
    () => (prisms.length ? CATALOG.filter((c) => prisms.includes(c.prism)) : CATALOG),
    [prisms],
  );
  const { filter, setFilter, filtered } = useCardFilter(pool);

  const inDeck = useMemo(() => new Set(deck), [deck]);
  const error = validateDeck(deck, prisms);

  function applyDeck(d: Deck) {
    setEditingId(d.id);
    setName(d.name);
    setPrisms([...d.prisms]);
    setDeck(d.cards.flatMap((c) => Array(c.count).fill(c.cardId)));
    setNotice(null);
  }

  function loadDeck(id: string) {
    const d = decks.find((x) => x.id === id);
    if (!d) return;
    applyDeck(d);
  }

  function newDeck() {
    setEditingId(`deck_${Math.random().toString(36).slice(2, 8)}`);
    setName('New Clan');
    setPrisms([]);
    setDeck([]);
  }

  function togglePrism(p: Prism) {
    setPrisms((cur) => {
      if (cur.includes(p)) {
        // removing a clan drops its cards from the deck
        setDeck((d) => d.filter((id) => getCard(id).prism !== p));
        return cur.filter((x) => x !== p);
      }
      if (cur.length >= RULES.maxPrisms) {
        setNotice(`A deck can use at most ${RULES.maxPrisms} clans.`);
        return cur;
      }
      return [...cur, p];
    });
  }

  function addCard(card: Card) {
    if (inDeck.has(card.id)) return; // singleton: already added
    if (deck.length >= RULES.maxDeck) {
      setNotice(`Decks hold at most ${RULES.maxDeck} cards.`);
      return;
    }
    // auto-pick the clan if there's room
    if (!prisms.includes(card.prism)) {
      if (prisms.length >= RULES.maxPrisms) {
        setNotice(`${card.name} is outside your chosen clans.`);
        return;
      }
      setPrisms((p) => [...p, card.prism]);
    }
    setNotice(null);
    setDeck((d) => [...d, card.id]);
  }

  async function save() {
    if (error) {
      setNotice(error);
      return;
    }
    const counts: Record<string, number> = {};
    deck.forEach((id) => (counts[id] = (counts[id] ?? 0) + 1));
    const next: Deck = {
      id: editingId,
      name: name.trim() || 'Untitled',
      ownerId: userId,
      prisms,
      cards: Object.entries(counts).map(([cardId, count]) => ({ cardId, count })),
      active: editingId === activeDeckId,
      updatedAt: new Date().toISOString(),
      coverArt: prisms[0] ? PRISM_META[prisms[0]].glyph : '🎴',
    };
    const saved = await upsertDeck(next);
    if (saved) {
      setEditingId(saved.id);
      setNotice('Deck saved ✓');
    } else {
      setNotice('Could not save deck. Try again.');
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Ornate frame backdrop, stretched to fill the viewport. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/deckbuilder-bg.png)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
        }}
      />

      {/* Top-center title (over the compass strip) + back button. */}
      <button
        onClick={() => router.push('/play')}
        className="absolute left-[3%] top-[3%] z-20 flex items-center gap-1.5 rounded-lg border border-[var(--color-line)] bg-black/50 px-3 py-1.5 text-xs font-bold text-[var(--color-muted)] backdrop-blur transition hover:border-[var(--color-neon)] hover:text-[var(--color-ink)]"
      >
        ← Hub
      </button>
      <div className="absolute left-1/2 top-[6.5%] z-10 -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className="text-lg font-black tracking-[0.3em] text-[var(--color-gold)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          DECK&nbsp;FORGE
        </h1>
      </div>

      {/* ---- LEFT PANEL: filters ---- */}
      <Region l={5.2} t={13.8} w={15.6} h={73}>
        <div className="flex h-full flex-col">
          <PanelHeader>Filters</PanelHeader>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <CardFilters filter={filter} setFilter={setFilter} />
          </div>
        </div>
      </Region>

      {/* ---- CENTER PANEL: clan picker + collection grid ---- */}
      <Region l={22.7} t={15.5} w={52.9} h={80.5}>
        <div className="flex h-full flex-col">
          {/* Clan picker */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {PRISMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePrism(p)}
                className={cx(
                  'chip border px-2.5 py-1 text-xs',
                  prisms.includes(p) ? 'border-current' : 'border-[var(--color-line)]',
                )}
                style={{ color: prisms.includes(p) ? CLAN_COLOR[p] : undefined }}
              >
                {PRISM_META[p].glyph} {PRISM_META[p].label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2.5">
              {filtered.map((c) => (
                <CardTile
                  key={c.id}
                  card={c}
                  size="sm"
                  selected={inDeck.has(c.id)}
                  onClick={() => addCard(c)}
                  className={inDeck.has(c.id) ? 'opacity-50' : ''}
                />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full grid place-items-center p-10 text-sm text-[var(--color-muted)]">
                  No cards match these filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </Region>

      {/* ---- RIGHT PANEL: deck list, stats, actions ---- */}
      <Region l={77.3} t={13.8} w={17.2} h={74.5}>
        <div className="flex h-full flex-col">
          {/* Deck selector */}
          <div className="mb-2 flex items-center gap-1.5">
            <select
              value={editingId}
              onChange={(e) => loadDeck(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-[var(--color-line)] bg-black/50 px-2 py-1.5 text-xs outline-none focus:border-[var(--color-neon)]"
            >
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
              {!decks.some((d) => d.id === editingId) && <option value={editingId}>{name} (new)</option>}
            </select>
            <button className="btn shrink-0 px-2 py-1.5 text-xs" onClick={newDeck}>
              + New
            </button>
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-line)] bg-black/50 px-3 py-2 text-sm font-bold outline-none focus:border-[var(--color-neon)]"
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex gap-1.5">
              {prisms.length ? (
                prisms.map((p) => (
                  <span key={p} style={{ color: CLAN_COLOR[p] }}>
                    {PRISM_META[p].glyph}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[var(--color-muted)]">No clan</span>
              )}
            </div>
            <span
              className={cx(
                'text-sm font-black',
                deck.length < RULES.minDeck || deck.length > RULES.maxDeck
                  ? 'text-[var(--color-oni)]'
                  : 'text-[var(--color-shadow)]',
              )}
            >
              {deck.length}/{RULES.maxDeck}
            </span>
          </div>

          <div className="my-2 min-h-0 flex-1 overflow-y-auto pr-1">
            <DeckList
              cardIds={deck}
              onRemove={(id) => setDeck((d) => d.filter((x, i) => i !== d.indexOf(id)))}
              onInspect={(id) => setPreview(getCard(id))}
            />
          </div>

          {(notice || error) && (
            <div
              className={cx(
                'mb-2 rounded-lg px-3 py-2 text-xs font-semibold',
                notice === 'Deck saved ✓'
                  ? 'bg-[var(--color-shadow)]/15 text-[var(--color-shadow)]'
                  : 'bg-[var(--color-oni)]/15 text-[var(--color-oni)]',
              )}
            >
              {notice ?? error}
            </div>
          )}

          <div className="mb-2 rounded-xl border border-[var(--color-line)] bg-black/30 p-2">
            <DeckStats cardIds={deck} />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button className="btn btn-primary text-xs" disabled={!!error} onClick={save}>
              💾 Save
            </button>
            <button
              className="btn text-xs"
              disabled={!!error}
              onClick={() => {
                setActiveDeck(editingId);
                setNotice('Set as active deck ✓');
              }}
            >
              ⭐ Active
            </button>
            <button
              className="btn text-xs"
              onClick={async () => {
                const copy = await duplicateDeck(editingId);
                if (copy) applyDeck(copy);
              }}
            >
              ⧉ Copy
            </button>
            <button
              className="btn text-xs"
              onClick={() => {
                if (decks.length <= 1) {
                  setNotice('You need at least one deck.');
                  return;
                }
                deleteDeck(editingId);
                const remaining = decks.filter((d) => d.id !== editingId)[0];
                if (remaining) loadDeck(remaining.id);
              }}
            >
              🗑 Delete
            </button>
          </div>

          <button
            className="btn btn-gold mt-1.5 text-xs"
            disabled={!!error}
            onClick={() => {
              setActiveDeck(editingId);
              router.push('/play');
            }}
          >
            ⚔️ Battle with this deck
          </button>
        </div>
      </Region>

      <CardPreviewModal
        card={preview}
        onClose={() => setPreview(null)}
        footer={
          preview && !inDeck.has(preview.id) ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                addCard(preview);
                setPreview(null);
              }}
            >
              + Add to deck
            </button>
          ) : null
        }
      />
    </div>
  );
}

// Absolutely-positioned panel keyed to the painted boxes in deckbuilder-bg.png
// (percent coordinates of the 1536x1024 frame).
function Region({
  l,
  t,
  w,
  h,
  children,
}: {
  l: number;
  t: number;
  w: number;
  h: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute z-10"
      style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` }}
    >
      {children}
    </div>
  );
}

function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 border-b border-[var(--color-line)] pb-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-gold)]">
      {children}
    </div>
  );
}
