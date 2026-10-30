import { FOODS } from './data.js';
const NUMW = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, half: 0.5, couple: 2 };
const SKIP = ['of', 'the', 'some', 'my', 'for', 'had', 'ate', 'have', 'cup', 'slice', 'piece', 'bowl', 'glass', 'i', 'just', 'about', 'with', 'scoop', 'tbsp', 'oz'];
const stem = (w) => {
  w = String(w).toLowerCase().replace(/[^a-z]/g, '');
  if (w.length > 3 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
};
// Turns "two eggs, a banana and chicken breast" into matched foods. English food names only.
export function parseMeal(text) {
  const parts = String(text).toLowerCase().replace(/\bplus\b|\bthen\b|&/g, ',').split(/,|\band\b/);
  const items = []; const unmatched = [];
  parts.forEach((raw) => {
    const chunk = raw.trim(); if (!chunk) return;
    let qty = 1; const toks = [];
    chunk.split(/\s+/).forEach((w) => {
      if (/^[0-9]+(\.[0-9]+)?$/.test(w)) qty = parseFloat(w);
      else if (NUMW[w] !== undefined) qty = NUMW[w];
      else { const st = stem(w); if (st.length > 1 && !SKIP.includes(st)) toks.push(st); }
    });
    let best = null; let bestScore = 0;
    FOODS.forEach((f) => {
      const ft = f.name.toLowerCase().split(/[^a-z]+/).filter((x) => x.length > 2).map(stem);
      const sc = ft.filter((x) => toks.includes(x)).length;
      if (sc > 0 && (sc > bestScore || (sc === bestScore && best && f.name.length < best.name.length))) { best = f; bestScore = sc; }
    });
    if (best && toks.length) items.push({ name: best.name, kcal: best.kcal, p: best.p, qty: Math.min(10, Math.max(0.5, qty)) });
    else unmatched.push(chunk);
  });
  return { items, unmatched };
}
