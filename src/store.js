import { useEffect, useReducer } from 'react';
import { DAILY, GATES, GOALS, xpNeed } from './data.js';
const KEY = 'ascend-react-v1';
const fresh = () => ({ started: false, name: '', goal: 'muscle', level: 1, xp: 0, gold: 0, streak: 0, qp: {}, qDone: {}, food: [], water: 0, wk: null, cleared: 0, toast: null });
const gain = (s, n) => { s.xp += n; while (s.xp >= xpNeed(s.level)) { s.xp -= xpNeed(s.level); s.level += 1; s.toast = { t: `LEVEL UP! You are now level ${s.level}`, k: 'good' }; } };
const sync = (s) => {
  const g = GOALS[s.goal]; const p = s.food.reduce((a, f) => a + f.p, 0);
  s.qp.meals = new Set(s.food.map((f) => f.meal)).size; s.qp.protein = p;
  DAILY.forEach((q) => {
    if (s.qDone[q.id]) return;
    const done = q.id === 'protein' ? p >= g.p : (s.qp[q.id] || 0) >= q.target;
    if (done) { s.qDone[q.id] = true; gain(s, q.xp); s.gold += q.gold; s.toast = { t: `QUEST COMPLETE: ${q.name}  +${q.xp} XP`, k: 'good' }; }
  });
};
function reducer(st, a) {
  const s = JSON.parse(JSON.stringify(st));
  switch (a.type) {
    case 'start': Object.assign(s, { started: true, name: a.name || 'Hunter', goal: a.goal }); break;
    case 'quest': s.qp[a.id] = Math.min(a.target, (s.qp[a.id] || 0) + a.step); break;
    case 'food': s.food.push({ id: Date.now() + Math.random(), meal: a.meal, name: a.name, kcal: a.kcal, p: a.p }); gain(s, 10); break;
    case 'unfood': s.food = s.food.filter((f) => f.id !== a.id); break;
    case 'water': s.water = Math.max(0, Math.min(12, s.water + a.d)); if (s.water === 8 && a.d > 0) { gain(s, 10); s.toast = { t: 'HYDRATED +10 XP', k: 'good' }; } break;
    case 'enter': s.wk = { gid: a.g.id, ex: a.g.ex.map((e) => ({ ...e, done: 0 })), done: false }; break;
    case 'set': {
      const e = s.wk.ex[a.i]; if (e.done < e.sets) e.done += 1; gain(s, 8);
      if (s.wk.ex.every((x) => x.done >= x.sets)) { const g = GATES.find((x) => x.id === s.wk.gid); gain(s, g.xp); s.gold += g.gold; s.cleared += 1; s.wk.done = true; s.toast = { t: `GATE CLEARED: ${g.name}  +${g.xp} XP`, k: 'good' }; }
      break; }
    case 'leave': s.wk = null; break;
    case 'day': {
      const all = DAILY.every((q) => s.qDone[q.id]);
      if (all) { s.streak += 1; s.gold += 25; } else { s.streak = 0; s.gold = Math.max(0, s.gold - 30); }
      s.qp = {}; s.qDone = {}; s.food = []; s.water = 0; s.toast = { t: all ? `NEW DAY. Streak ${s.streak}` : 'NEW DAY. Streak reset', k: all ? 'good' : 'bad' }; break; }
    case 'clearToast': s.toast = null; return s;
    case 'reset': return fresh();
    default: return st;
  }
  sync(s); return s;
}
export function useGame() {
  const [s, dispatch] = useReducer(reducer, null, () => { try { return { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}'), toast: null }; } catch { return fresh(); } });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }, [s]);
  useEffect(() => { if (!s.toast) return; const t = setTimeout(() => dispatch({ type: 'clearToast' }), 3000); return () => clearTimeout(t); }, [s.toast]);
  return [s, dispatch];
}
