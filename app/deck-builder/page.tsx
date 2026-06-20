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

  function loadDeck(id: string) {
    const d = decks.find((x) => x.id === id);
    if (!d) return;
    setEditingId(id);
    setName(d.name);
    setPrisms([...d.prisms]);
    setDeck(d.cards.flatMap((c) => Array(c.count).fill(c.cardId)));
    setNotice(null);
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

  function save() {
    if (error) {
      setNotice(error);
      return;
    }
    const counts: Record<string, number> = {};
    deck.forEach((id) => (counts[id] = (counts[id] ?? 0) + 1));
    const next: Deck = {
      id: editingId,
      name: name.trim() || 'Untitled',
      ownerId: 'u_self',
      prisms,
      cards: Object.entries(counts).map(([cardId, count]) => ({ cardId, count })),
      active: editingId === activeDeckId,
      updatedAt: new Date().toISOString(),
      coverArt: prisms[0] ? PRISM_META[prisms[0]].glyph : '🎴',
    };
    upsertDeck(next);
    setNotice('Deck saved ✓');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Deck Builder</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Choose up to {RULES.maxPrisms} clans · {RULES.minDeck}–{RULES.maxDeck} cards · singleton.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={editingId}
            onChange={(e) => loadDeck(e.target.value)}
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-neon)]"
          >
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
            {!decks.some((d) => d.id === editingId) && <option value={editingId}>{name} (new)</option>}
          </select>
          <button className="btn text-sm" onClick={newDeck}>
            + New
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr_320px]">
        {/* Filters */}
        <aside className="panel h-fit p-4 lg:sticky lg:top-20">
          <CardFilters filter={filter} setFilter={setFilter} />
        </aside>

        {/* Collection grid */}
        <section>
          {/* Clan picker */}
          <div className="mb-3 flex flex-wrap gap-2">
            {PRISMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePrism(p)}
                className={cx(
                  'chip border px-3 py-1.5',
                  prisms.includes(p) ? 'border-current' : 'border-[var(--color-line)]',
                )}
                style={{ color: prisms.includes(p) ? CLAN_COLOR[p] : undefined }}
              >
                {PRISM_META[p].glyph} {PRISM_META[p].label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(124px,1fr))] gap-3">
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
        </section>

        {/* Deck panel */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="panel flex max-h-[calc(100vh-6rem)] flex-col p-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 font-bold outline-none focus:border-[var(--color-neon)]"
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

            <div className="my-3 flex-1 overflow-y-auto pr-1">
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

            <div className="mb-3 rounded-xl border border-[var(--color-line)] p-3">
              <DeckStats cardIds={deck} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="btn btn-primary" disabled={!!error} onClick={save}>
                💾 Save
              </button>
              <button
                className="btn"
                disabled={!!error}
                onClick={() => {
                  setActiveDeck(editingId);
                  setNotice('Set as active deck ✓');
                }}
              >
                ⭐ Set Active
              </button>
              <button
                className="btn text-sm"
                onClick={() => {
                  const copy = duplicateDeck(editingId);
                  if (copy) loadDeck(copy.id);
                }}
              >
                ⧉ Duplicate
              </button>
              <button
                className="btn text-sm"
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
              className="btn btn-gold mt-2"
              disabled={!!error}
              onClick={() => {
                setActiveDeck(editingId);
                router.push('/play');
              }}
            >
              ⚔️ Battle with this deck
            </button>
          </div>
        </aside>
      </div>

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
