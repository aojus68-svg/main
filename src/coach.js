import { GOALS, RANKS, rankOf } from './data.js';

// Answers from the player's own numbers. Always available, no network.
export function localCoach(q, s) {
  q = q.toLowerCase();
  const g = GOALS[s.goal]; const eaten = Math.round(s.food.reduce((a, f) => a + f.kcal, 0));
  const prot = Math.round(s.food.reduce((a, f) => a + f.p, 0)); const left = g.kcal - eaten;
  const has = (...w) => w.some((x) => q.includes(x));
  if (has('review', 'my day', 'how am i', 'today')) return `You have eaten ${eaten} of ${g.kcal} kcal (${left} left), ${prot} g of ${g.p} g protein and ${s.water} of 8 cups of water.${s.food.length ? ' Fill the biggest gap first.' : ' Log a meal to get a proper review.'}`;
  if (has('protein')) return `Your protein target is about ${g.p} g and you are at ${prot} g. Easy sources: chicken, eggs, Greek yogurt, tuna, tofu or a whey shake.`;
  if (has('eat', 'meal', 'food', 'hungry', 'dinner', 'lunch', 'breakfast', 'snack')) return left > 0 ? `You have ${left} kcal left. Aim for a lean protein, a carb and some vegetables, for example chicken, rice and broccoli.` : 'You are at or over your target. If you are still hungry, choose vegetables, fruit or Greek yogurt.';
  if (has('workout', 'train', 'lift', 'gym', 'exercise')) return 'Pick a dungeon from the Gates tab. Three sessions a week with a rest day between them is a solid start. Stop if anything hurts.';
  if (has('sleep', 'tired', 'rest', 'recover')) return 'Aim for 7 to 9 hours. If you are sore or tired, a lighter session or a rest day still counts as progress.';
  if (has('water', 'drink', 'hydrat')) return `You are at ${s.water} of 8 cups. Keep a bottle nearby and drink a cup with each meal.`;
  if (has('lose', 'fat', 'diet', 'calor', 'weight')) return `Your target is ${g.kcal} kcal for "${g.label}". Steady changes work best. For targets under 1,500 kcal, please talk to a doctor or dietitian.`;
  if (has('xp', 'level', 'rank', 'quest', 'streak')) return `You are level ${s.level}, rank ${RANKS[rankOf(s.level)]}, with a ${s.streak}-day streak. Finish all daily quests to keep it.`;
  return 'I can help with calories, protein, water, workouts, sleep and quests. Try "Review my day".';
}

// If VITE_COACH_URL is set, questions go to your own server (see server/coach.js)
// which holds the API key. Otherwise, or on any failure, the local coach answers.
export async function askCoach(q, s, history) {
  const url = import.meta.env.VITE_COACH_URL;
  if (url) {
    try {
      const g = GOALS[s.goal];
      const ctx = { goal: g.label, calorieTarget: g.kcal, caloriesEaten: Math.round(s.food.reduce((a, f) => a + f.kcal, 0)), proteinG: Math.round(s.food.reduce((a, f) => a + f.p, 0)), proteinTargetG: g.p, waterCups: s.water, streak: s.streak, level: s.level };
      const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question: q, context: ctx, history: history.slice(-8) }) });
      if (r.ok) { const j = await r.json(); if (j.answer) return { text: String(j.answer), ai: true }; }
    } catch { /* fall through */ }
  }
  return { text: localCoach(q, s), ai: false };
}
