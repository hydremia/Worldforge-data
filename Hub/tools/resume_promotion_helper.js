// Worldforge Hub v3.0.1 — Resume Promotion Helper
// Pure function that promotes/demotes the 'Resume' card based on availability.
export function applyResumePromotion(menu, resumeAvailable, { demoteWhenUnavailable = true } = {}) {
  const clone = JSON.parse(JSON.stringify(menu || {}));
  const cards = Array.isArray(clone.cards) ? clone.cards.slice() : [];
  const idx = cards.findIndex(c =>
    (String(c.id || '').toUpperCase() === 'RESUME') || /resume/i.test(String(c.title || ''))
  );
  if (idx === -1) { clone.cards = cards; return clone; }

  const card = { ...cards[idx] };

  if (!resumeAvailable) {
    card.disabled = true;
    if (demoteWhenUnavailable && typeof card.order === 'number') {
      card.order += 10; // push down
    }
  } else {
    card.disabled = false;
    if (typeof card.order === 'number') {
      card.order = Math.min(card.order, 2);
    } else {
      card.order = 2;
    }
  }

  cards[idx] = card;
  clone.cards = cards.sort((a,b) => (a.order ?? 999) - (b.order ?? 999));
  return clone;
}
