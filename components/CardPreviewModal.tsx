'use client';

// CardPreviewModal — large card zoom with full text + keyword glossary.
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '@/lib/types';
import {
  CLAN_COLOR,
  RARITY_COLOR,
  RARITY_LABEL,
  PRISM_META,
  KEYWORD_META,
} from '@/lib/ui';
import CardTile from './CardTile';

interface Props {
  card: Card | null;
  onClose: () => void;
  footer?: React.ReactNode; // e.g. "Add to deck" actions
}

export default function CardPreviewModal({ card, onClose, footer }: Props) {
  return (
    <AnimatePresence>
      {card && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="panel w-full max-w-lg p-6"
            initial={{ scale: 0.9, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-5">
              <div className="shrink-0">
                <CardTile card={card} size="lg" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-black">{card.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className="chip"
                    style={{ color: CLAN_COLOR[card.prism] }}
                  >
                    {PRISM_META[card.prism].glyph} {PRISM_META[card.prism].label}
                  </span>
                  <span
                    className="chip"
                    style={{ color: RARITY_COLOR[(card.rarity ?? 'common') as 'common'] }}
                  >
                    {RARITY_LABEL[(card.rarity ?? 'common') as 'common']}
                  </span>
                  <span className="chip capitalize">{card.type}</span>
                  <span className="chip">◈ {card.cost} mana</span>
                </div>

                {card.type === 'unit' && (
                  <div className="mt-3 flex gap-4 text-lg font-black">
                    <span className="text-[var(--color-oni)]">{card.attack ?? 0} ⚔</span>
                    <span className="text-[var(--color-shadow)]">{card.health ?? 0} ❤</span>
                  </div>
                )}

                {card.text && (
                  <p className="mt-3 text-sm text-[var(--color-ink)]">{card.text}</p>
                )}

                {!!card.keywords?.length && (
                  <div className="mt-3 space-y-1.5">
                    {card.keywords.map((k) => (
                      <div key={k} className="text-xs">
                        <span className="font-bold">
                          {KEYWORD_META[k].icon} {KEYWORD_META[k].label}
                        </span>
                        <span className="text-[var(--color-muted)]"> — {KEYWORD_META[k].tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
            <button
              className="btn mt-4 w-full"
              onClick={onClose}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
