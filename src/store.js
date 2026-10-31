import { useEffect, useReducer } from 'react';
import { TITLES, SHOP, ALLIES, DAILY, G_BASE, G_GOAL, GATES, HIDDEN, LIB, GOALS, PROGRAMS, PROG_WEEKS, RECIPES, SYNC_SOURCES, xpNeed } from './data.js';

const KEY = 'ascend-react-v2';
export const MIN_KCAL = 1500; export const MAX_KCAL = 4500;
export const target = (s) => GOALS[s.goal].kcal + s.kcalAdj;

const fresh = () => ({
  started: false, name: '', goal: 'muscle', level: 1, xp: 0, gold: 0, streak: 0, qp: {}, qDone: {}, food: [], water: 0, waterDone: false,
  wk: null, cleared: 0, toast: null, ageOk: false, kcalAdj: 0, exLog: [], diaryDone: false, archive: [], weights: [],
  sleep: { today: null, log: [], rest: false }, rec: 0, body: [], prog: null, recipes: [], plan: [[], [], [], [], [], [], []], shopDone: {},
  sync: { health: false, watch: false, run: false }, syncedDay: { health: false, watch: false, run: false }, lastSync: 0, tour: 0,
  c: { dungeons: 0, quests: 0, volume: 0, prs: 0 }, maxStreak: 0, best: {}, allies: [], booster: 0, shield: 0, hidden: {}, flags: {}, pq: null,
  log: [], hist: [], today: { vol: 0, xp: 0 }, guildClaimed: false, showLb: true, title: 'rookie', custom: []
});

export const progOf = (s) => (s.prog ? PROGRAMS.find((p) => p.id === s.prog.id) || null : null);
export const progSession = (P, n) => ({ day: P.days[n % P.days.length], label: `Session ${n + 1} of ${PROG_WEEKS * 3} · Week ${Math.floor(n / 3) + 1}` });
export function progGate(s) {
  const P = progOf(s); if (!P) return null;
  const ss = progSession(P, Math.min(s.prog.done, PROG_WEEKS * 3 - 1));
  return { id: 'prog', rank: 'PLAN', name: `${P.name}: ${ss.day.name}`, sub: ss.label, minLevel: 1, xp: 100, gold: 45, ex: ss.day.ex };
}
export const allGates = (s) => [progGate(s), ...GATES, ...s.custom].filter(Boolean);
export const allRecipes = (s) => [...RECIPES, ...s.recipes];

const say = (s, t, k = 'good') => { s.toast = { t, k }; };
const logEv = (s, k, t) => { s.log.unshift({ k, t, at: Date.now() }); if (s.log.length > 60) s.log.length = 60; };
const timeFlags = (s) => { const h = new Date().getHours(); if (h < 7) s.flags.early = true; if (h >= 22) s.flags.night = true; };
export const allyBonus = (s) => ALLIES.reduce((a, x) => a + (s.allies.includes(x.id) ? x.bonus : 0), 0);
export const statVal = (s, k) => (k === 'streak' ? s.maxStreak : s.c[k]);
const gain = (s, base) => {
  let mult = 1 + allyBonus(s) / 100; if (s.booster > 0) { mult += 0.5; s.booster -= 1; }
  const n = Math.max(1, Math.round(base * mult)); s.today.xp += n;
  s.xp += n;
  while (s.xp >= xpNeed(s.level)) { s.xp -= xpNeed(s.level); s.level += 1; say(s, `LEVEL UP! You are now level ${s.level}`); logEv(s, 'level', `Reached Level ${s.level}`); }
};
const sync = (s) => {
  if (s.streak > s.maxStreak) s.maxStreak = s.streak;
  const g = GOALS[s.goal]; const p = s.food.reduce((a, f) => a + f.p, 0);
  s.qp.meals = new Set(s.food.map((f) => f.meal)).size; s.qp.protein = p;
  DAILY.forEach((q) => {
    if (s.qDone[q.id]) return;
    const done = q.id === 'protein' ? p >= g.p : (s.qp[q.id] || 0) >= q.target;
    if (done) { s.qDone[q.id] = true; s.c.quests += 1; gain(s, q.xp); s.gold += q.gold; say(s, `[QUEST COMPLETE] ${q.name}  +${q.xp} XP`); }
  });
  ALLIES.forEach((a) => { if (!s.allies.includes(a.id) && statVal(s, a.stat) >= a.goal) { s.allies.push(a.id); logEv(s, 'ally', `${a.name} joined your party`); say(s, `[ALLY JOINED] ${a.name}  +${a.bonus}% XP`); } });
  HIDDEN.forEach((h) => { if (!s.hidden[h.id] && h.ok(s)) { s.hidden[h.id] = true; s.gold += 60; gain(s, 150); logEv(s, 'quest', `Hidden quest cleared: ${h.name}`); say(s, `[HIDDEN QUEST] ${h.name}  +150 XP  +60 gold`); } });
};
const addFood = (s, meal, it) => { s.food.push({ id: Date.now() + Math.random(), meal, name: it.name, kcal: Math.round(it.kcal), p: Math.round(it.p * 10) / 10 }); };

export function reducer(st, a) {
  if (a.type === 'reset') return fresh();
  const s = JSON.parse(JSON.stringify(st));
  switch (a.type) {
    case 'start': Object.assign(s, { started: true, name: a.name || 'Hunter', goal: a.goal, ageOk: true }); say(s, '[SYSTEM] Player registered. Daily quests have begun.', 'info'); break;
    case 'quest': s.qp[a.id] = Math.min(a.target, (s.qp[a.id] || 0) + a.step); break;
    case 'food': addFood(s, a.meal, a); gain(s, 10); say(s, `[LOGGED] ${a.name}  +10 XP`); break;
    case 'foods': a.items.forEach((it) => addFood(s, a.meal, it)); gain(s, a.xp); say(s, `[LOGGED] ${a.items.length} items  +${a.xp} XP`); break;
    case 'unfood': s.food = s.food.filter((f) => f.id !== a.id); break;
    case 'copyMeal': a.items.forEach((it) => addFood(s, it.meal, it)); say(s, `[COPIED] ${a.items.length} items added to today`); break;
    case 'water': s.water = Math.max(0, Math.min(12, s.water + a.d)); if (s.water >= 8 && !s.waterDone) { s.waterDone = true; gain(s, 10); say(s, '[HYDRATED] 8 cups logged  +10 XP'); } break;
    case 'exAdd': if (s.exLog.length >= 12) { say(s, '[LIMIT] 12 exercise entries a day.', 'bad'); break; } s.exLog.push({ id: Date.now() + Math.random(), name: a.name, kcal: a.kcal }); break;
    case 'exDel': s.exLog = s.exLog.filter((x) => x.id !== a.id); break;
    case 'diary': if (!s.food.length) { say(s, '[SYSTEM] Log at least one food before completing your diary.', 'bad'); break; } s.diaryDone = true; gain(s, 20); say(s, '[DIARY COMPLETE] Nice work  +20 XP'); break;
    case 'kcal': {
      const next = target(s) + a.d;
      if (next < MIN_KCAL) { say(s, '[SAFETY] Targets under 1,500 kcal are not supported here. Please talk to a doctor or dietitian.', 'bad'); break; }
      if (next > MAX_KCAL) { say(s, '[SAFETY] 4,500 kcal is the highest target supported.', 'bad'); break; }
      s.kcalAdj += a.d; break; }
    case 'weight':
      if (!(a.kg >= 30 && a.kg <= 300)) { say(s, '[ERROR] Enter a weight between 30 and 300 kg.', 'bad'); break; }
      s.weights.push({ kg: Math.round(a.kg * 10) / 10, t: Date.now() }); if (s.weights.length > 60) s.weights.shift(); say(s, `[WEIGHT LOGGED] ${a.kg.toFixed(1)} kg`); break;
    case 'enter': s.wk = { gid: a.g.id, snap: a.g, vol: 0, prs: 0, ex: a.g.ex.map((e) => ({ ...e, w: s.best[e.n] || e.w || 0, step: e.step || 2.5, done: 0, pr: false })), done: false }; break;
    case 'wt': { const e = s.wk.ex[a.i]; e.w = Math.max(0, Math.round((e.w + a.d * e.step) * 10) / 10); break; }
    case 'set': {
      const e = s.wk.ex[a.i]; if (e.done >= e.sets) break; e.done += 1; timeFlags(s); gain(s, 8);
      if (!e.bw) {
        s.wk.vol += e.w * e.reps; s.today.vol += e.w * e.reps; s.c.volume += e.w * e.reps; const b = s.best[e.n];
        if (b !== undefined && e.w > b && !e.pr) { e.pr = true; s.wk.prs += 1; s.c.prs += 1; logEv(s, 'pr', `New record: ${e.n} ${e.w} kg`); say(s, `[NEW RECORD] ${e.n} ${e.w} kg`); }
        if (b === undefined || e.w > b) s.best[e.n] = e.w;
      }
      if (s.wk.ex.every((x) => x.done >= x.sets) && !s.wk.done) {
        const g = s.wk.snap; gain(s, g.xp + 50 * s.wk.prs); s.gold += g.gold; s.cleared += 1; s.c.dungeons += 1; s.wk.done = true;
        if (g.id === 'boss') s.flags.boss = true; if (s.wk.vol >= 1000) s.flags.heavy = true;
        logEv(s, 'dungeon', `Cleared ${g.name} (${Math.round(s.wk.vol)} kg lifted)`);
        s.exLog.push({ id: Date.now(), name: `Dungeon: ${g.name}`, kcal: Math.min(600, g.ex.reduce((t, x) => t + x.sets, 0) * 9) });
        say(s, `[DUNGEON CLEARED] ${g.name}  +${g.xp} XP`);
        if (g.id === 'prog') {
          s.prog.done += 1;
          if (s.prog.done >= PROG_WEEKS * 3) { gain(s, 250); s.gold += 200; say(s, `[PROGRAM COMPLETE] ${progOf(st).name}  +250 XP  +200 gold`); s.prog = null; }
        }
      }
      break; }
    case 'leave': s.wk = null; break;
    case 'day': {
      const all = DAILY.every((q) => s.qDone[q.id]);
      let pen = false;
      if (all) { s.streak += 1; s.gold += 25; } else if (s.shield > 0) { s.shield -= 1; pen = 'shield'; } else { s.streak = 0; s.gold = Math.max(0, s.gold - 30); if (!s.pq) s.pq = { km: 0, target: 2 }; pen = true; }
      s.hist.push({ vol: s.today.vol, xp: s.today.xp, kcal: Math.round(s.food.reduce((t, f) => t + f.kcal, 0)) }); if (s.hist.length > 6) s.hist.shift(); s.today = { vol: 0, xp: 0 };
      s.archive.push({ food: s.food, exLog: s.exLog, water: s.water, diaryDone: s.diaryDone, goal: target(s) }); if (s.archive.length > 14) s.archive.shift();
      s.sleep.log.push(s.sleep.today); if (s.sleep.log.length > 13) s.sleep.log.shift(); s.sleep.today = null; s.sleep.rest = false;
      Object.assign(s, { qp: {}, qDone: {}, food: [], water: 0, waterDone: false, exLog: [], diaryDone: false, syncedDay: { health: false, watch: false, run: false } });
      say(s, all ? `[NEW DAY] Streak ${s.streak}. +25 gold` : pen === 'shield' ? '[SHIELD] Your Streak Shield absorbed the penalty.' : '[PENALTY] Streak reset, -30 gold. A penalty quest was issued.', all || pen === 'shield' ? 'good' : 'bad'); break; }
    case 'sleep': {
      const first = !s.sleep.today; s.sleep.today = { h: a.h, q: a.q };
      if (first) { gain(s, 15); if (a.h >= 7) s.rec += 1; say(s, `[SLEEP LOGGED] ${a.h} h  +15 XP${a.h >= 7 ? '  Recovery +1' : ''}`); } else say(s, '[UPDATED] Sleep entry changed', 'info'); break; }
    case 'rest': if (s.sleep.rest) break; s.sleep.rest = true; s.rec += 1; gain(s, 10); say(s, '[REST DAY] Recovery +1  +10 XP. Rest is part of training.'); break;
    case 'bodySave': {
      const prev = s.body[s.body.length - 1]; const xp = !prev || a.entry.t - prev.t > 6 * 86400000 ? 20 : 0;
      if (xp) gain(s, xp); s.body.push(a.entry); if (s.body.length > 30) s.body.shift(); say(s, `[CHECK-IN SAVED]${xp ? '  +20 XP' : ''}`); break; }
    case 'progStart': s.prog = { id: a.id, done: 0 }; say(s, `[PROGRAM STARTED] ${PROGRAMS.find((p) => p.id === a.id).name}. Find your session in Dungeons.`); break;
    case 'progQuit': s.prog = null; say(s, '[PROGRAM] Program ended. Your progress is still in your log.', 'info'); break;
    case 'recSave':
      if (s.recipes.length >= 12) { say(s, '[LIMIT] You can keep 12 recipes. Delete one first.', 'bad'); break; }
      s.recipes.push({ id: 'u' + Date.now(), name: a.name, items: a.items }); say(s, `[RECIPE SAVED] ${a.name}`); break;
    case 'recDel': s.recipes = s.recipes.filter((r) => r.id !== a.id); s.plan = s.plan.map((d) => d.filter((e) => e.rid !== a.id)); break;
    case 'planAdd':
      if (s.plan[a.day].length >= 6) { say(s, '[LIMIT] Up to 6 recipes a day.', 'bad'); break; }
      s.plan[a.day].push({ rid: a.rid, meal: a.meal }); say(s, `[PLANNED] ${a.name}`); break;
    case 'planDel': s.plan[a.day].splice(a.i, 1); break;
    case 'planLog': {
      const day = s.plan[a.day]; let n = 0; const all = allRecipes(st);
      day.forEach((e) => { const R = all.find((r) => r.id === e.rid); if (R) { R.items.forEach((it) => addFood(s, e.meal, it)); n += 1; } });
      if (n) { gain(s, 10); say(s, `[PLAN LOGGED] ${n} recipes added to today  +10 XP`); } break; }
    case 'recLog': a.recipe.items.forEach((it) => addFood(s, a.meal, it)); gain(s, 10); say(s, `[LOGGED] ${a.recipe.name} to ${a.meal}  +10 XP`); break;
    case 'shopToggle': if (s.shopDone[a.k]) delete s.shopDone[a.k]; else s.shopDone[a.k] = true; break;
    case 'shopClear': s.shopDone = {}; break;
    case 'syncToggle': s.sync[a.k] = !s.sync[a.k]; break;
    case 'syncNow': {
      let n = 0;
      SYNC_SOURCES.forEach((x, i) => {
        if (s.sync[x.k] && !s.syncedDay[x.k] && s.exLog.length < 12) {
          const e = [{ name: 'Steps (simulated): 6,200', kcal: 248 }, { name: 'Watch workout (simulated): 45 min', kcal: 280 }, { name: 'Run (simulated): 5.2 km', kcal: 360 }][i];
          s.exLog.push({ id: Date.now() + i, ...e }); s.syncedDay[x.k] = true; n += 1;
        }
      });
      s.lastSync = Date.now(); say(s, n ? `[SYNC] ${n} source${n === 1 ? '' : 's'} imported (simulated data)` : '[SYNC] Nothing new. Connect a source first, or you are up to date.', n ? 'good' : 'info'); break; }
    case 'tour': s.tour = a.n; break;
    case 'pqStep': if (!s.pq) break; timeFlags(s); s.pq.km = Math.round((s.pq.km + 0.5) * 10) / 10; if (s.pq.km >= s.pq.target) { s.pq = null; gain(s, 30); logEv(s, 'quest', 'Penalty quest cleared'); say(s, '[PENALTY CLEARED] +30 XP. Fresh start.'); } break;
    case 'buy': { const it = SHOP.find((x) => x.id === a.id); if (!it || s.gold < it.price) break; s.gold -= it.price; if (it.id === 'booster') s.booster += 5; else s.shield = Math.min(3, s.shield + 1); say(s, `[SHOP] ${it.name} purchased.`); break; }
    case 'title': if (TITLES.find((x) => x.id === a.id && x.ok(s))) s.title = a.id; break;
    case 'guildClaim': if (s.guildClaimed || G_BASE + s.c.dungeons < G_GOAL) break; s.guildClaimed = true; s.gold += 150; gain(s, 200); logEv(s, 'guild', 'Guild weekly goal claimed'); say(s, '[GUILD] Weekly goal claimed. +200 XP, +150 gold'); break;
    case 'lbToggle': s.showLb = !s.showLb; break;
    case 'dBuild': {
      const x = a.draft;
      if (!x.name.trim()) { say(s, '[ERROR] Give your dungeon a name.', 'bad'); break; }
      if (x.ex.length < 1) { say(s, '[ERROR] Add at least one exercise.', 'bad'); break; }
      if (s.custom.length >= 6) { say(s, '[LIMIT] You can keep 6 custom dungeons. Delete one first.', 'bad'); break; }
      s.custom.push({ id: 'cu' + Date.now(), rank: 'MY', name: x.name.trim(), sub: `${x.ex.length} exercises · custom`, minLevel: 1, xp: 40, gold: 20, ex: x.ex });
      logEv(s, 'dungeon', `Built dungeon: ${x.name.trim()}`); say(s, `[DUNGEON CREATED] ${x.name.trim()}`); break; }
    case 'dDel': s.custom = s.custom.filter((c) => c.id !== a.id); break;
    case 'clearToast': s.toast = null; return s;
    default: return st;
  }
  sync(s); return s;
}

export function useGame() {
  const [s, dispatch] = useReducer(reducer, null, () => {
    try { return { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}'), toast: null }; } catch { return fresh(); }
  });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage full or blocked */ } }, [s]);
  useEffect(() => { if (!s.toast) return undefined; const t = setTimeout(() => dispatch({ type: 'clearToast' }), 3200); return () => clearTimeout(t); }, [s.toast]);
  return [s, dispatch];
}
