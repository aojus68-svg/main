import { GOALS, RANKS, rankOf } from './data.js';

// Answers from the player's own numbers. Always available, no network.
function localCoachZh(q, s) {
  q = q.toLowerCase(); const g = GOALS[s.goal]; const tgt = g.kcal + (s.kcalAdj || 0);
  const eaten = Math.round(s.food.reduce((a, f) => a + f.kcal, 0)); const prot = Math.round(s.food.reduce((a, f) => a + f.p, 0)); const left = tgt - eaten;
  const has = (...w) => w.some((x) => q.includes(x));
  if (has('review', 'my day', '回顾', '今天', '一天', '怎么样')) return `你今天已摄入 ${eaten} / ${tgt} 千卡（还剩 ${left}），蛋白质 ${prot} / ${g.p} 克，饮水 ${s.water} / 8 杯。${s.food.length ? '先补最大的缺口，通常是蛋白质或水。' : '记录第一餐后，我才能给你完整的回顾。'}`;
  if (has('protein', '蛋白')) return `你的蛋白质目标约为每天 ${g.p} 克，目前是 ${prot} 克。容易获取的来源：鸡肉、鸡蛋、希腊酸奶、金枪鱼、豆腐、扁豆或乳清蛋白奶昔。`;
  if (has('eat', 'meal', 'food', 'hungry', 'dinner', 'lunch', 'breakfast', 'snack', '吃', '餐', '饿', '食')) return left > 0 ? `你今天还剩 ${left} 千卡。可以搭配瘦肉蛋白、主食和蔬菜，比如鸡肉、米饭和西兰花。也可以看看“食谱”页的灵感。` : '你今天已达到或超过目标。如果还饿，可以选蔬菜、水果或希腊酸奶。';
  if (has('workout', 'train', 'lift', 'gym', 'exercise', 'program', '训练', '锻炼', '健身', '运动', '计划')) return s.prog ? '你正在进行训练计划。请在“副本”页开始下一次训练，两次训练之间休息一天。' : '可以在“我的”里选一个训练计划，比如推/拉/腿或全身入门。每周三次、训练之间休息一天是不错的开始。如有疼痛请停止。';
  if (has('sleep', 'tired', 'rest', 'recover', '睡', '累', '休息', '恢复')) return '目标是睡7到9小时。请在“我的”→睡眠中记录昨晚。如果酸痛或疲劳，轻松训练或休息一天同样是进步。';
  if (has('water', 'drink', 'hydrat', '水', '喝')) return `你今天喝了 ${s.water} / 8 杯水。把水瓶放在手边，每餐喝一杯。`;
  if (has('weight', 'lose', 'fat', 'diet', 'calor', '体重', '减', '脂', '卡路里', '热量')) return `你的目标是“${g.label}”，每天 ${tgt} 千卡。循序渐进效果最好。这里不支持低于1,500千卡的目标，如需更低请咨询医生或营养师。`;
  if (has('xp', 'level', 'rank', 'quest', 'streak', '经验', '等级', '段位', '任务', '连胜')) return `你现在是等级 ${s.level}，段位 ${RANKS[rankOf(s.level)]}，连胜 ${s.streak} 天。完成全部每日任务即可保持连胜并获得额外金币。`;
  return '我可以帮你看卡路里、蛋白质、饮水、训练、睡眠和任务。试试“回顾我的一天”。';
}
export function localCoach(q, s, lang) {
  if (lang === 'zh') return localCoachZh(q, s);
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
export async function askCoach(q, s, history, lang) {
  const url = import.meta.env.VITE_COACH_URL;
  if (url) {
    try {
      const g = GOALS[s.goal];
      const ctx = { goal: g.label, calorieTarget: g.kcal, caloriesEaten: Math.round(s.food.reduce((a, f) => a + f.kcal, 0)), proteinG: Math.round(s.food.reduce((a, f) => a + f.p, 0)), proteinTargetG: g.p, waterCups: s.water, streak: s.streak, level: s.level, language: lang === 'zh' ? 'Simplified Chinese' : 'English' };
      const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question: q, context: ctx, history: history.slice(-8) }) });
      if (r.ok) { const j = await r.json(); if (j.answer) return { text: String(j.answer), ai: true }; }
    } catch { /* fall through */ }
  }
  return { text: localCoach(q, s, lang), ai: false };
}

// Photo meal scan. Needs the coach server (VITE_COACH_URL); returns {items} or {error}.
export async function scanPhoto(dataUrl) {
  const url = import.meta.env.VITE_COACH_URL;
  if (!url) return { error: 'off' };
  try {
    const r = await fetch(url.replace(/\/$/, '') + '/photo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ image: dataUrl }) });
    if (!r.ok) return { error: 'failed' };
    const j = await r.json(); return { items: Array.isArray(j.items) ? j.items : [] };
  } catch { return { error: 'failed' }; }
}
