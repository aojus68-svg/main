export const RANKS = ['E', 'D', 'C', 'B', 'A', 'S', 'NATIONAL'];
export const RANK_CAP = [9, 19, 34, 49, 74, 99, 9999];
export const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
export const GOALS = {
  muscle: { label: 'Build muscle', sub: 'Small surplus, heavy lifting', kcal: 2650, p: 160 },
  fat: { label: 'Lose fat', sub: 'Gentle deficit, high protein', kcal: 1950, p: 150 },
  strong: { label: 'Get stronger', sub: 'Maintenance, low reps', kcal: 2400, p: 150 }
};
export const DAILY = [
  { id: 'push', name: 'Push-ups: 100', target: 100, step: 25, xp: 120, gold: 30 },
  { id: 'sit', name: 'Sit-ups: 100', target: 100, step: 25, xp: 100, gold: 25 },
  { id: 'squat', name: 'Squats: 100', target: 100, step: 25, xp: 120, gold: 30 },
  { id: 'run', name: 'Run 5 km', target: 5, step: 1, xp: 180, gold: 40 },
  { id: 'meals', name: 'Log 3 meals', auto: 'meals', target: 3, xp: 80, gold: 20 },
  { id: 'protein', name: 'Hit your protein goal', auto: 'protein', xp: 100, gold: 25 }
];
export const GATES = [
  { id: 'e1', rank: 'E', name: 'Iron Gate', sub: 'Push day', minLevel: 1, xp: 80, gold: 40, ex: [
    { n: 'Bench press', sets: 3, reps: 8, w: 40 }, { n: 'Overhead press', sets: 3, reps: 8, w: 25 }, { n: 'Triceps pushdown', sets: 3, reps: 12, w: 20 }] },
  { id: 'd1', rank: 'D', name: 'Pull Cavern', sub: 'Pull day', minLevel: 3, xp: 120, gold: 55, ex: [
    { n: 'Deadlift', sets: 3, reps: 5, w: 60 }, { n: 'Barbell row', sets: 3, reps: 8, w: 40 }, { n: 'Biceps curl', sets: 3, reps: 12, w: 12 }] },
  { id: 'c1', rank: 'C', name: 'Leg Ruins', sub: 'Leg day', minLevel: 6, xp: 160, gold: 70, ex: [
    { n: 'Back squat', sets: 4, reps: 6, w: 60 }, { n: 'Romanian deadlift', sets: 3, reps: 8, w: 50 }, { n: 'Calf raise', sets: 3, reps: 15, w: 40 }] }
];
export const FOODS = [
  { name: 'Large egg', kcal: 72, p: 6.3 }, { name: 'Banana', kcal: 105, p: 1.3 }, { name: 'Cooked oatmeal (1 cup)', kcal: 160, p: 6 },
  { name: 'Grilled chicken breast', kcal: 165, p: 31 }, { name: 'Cooked white rice (1 cup)', kcal: 205, p: 4.3 }, { name: 'Greek yogurt (1 cup)', kcal: 130, p: 23 },
  { name: 'Salmon fillet', kcal: 208, p: 22 }, { name: 'Broccoli (1 cup)', kcal: 55, p: 3.7 }, { name: 'Whey protein (1 scoop)', kcal: 120, p: 24 },
  { name: 'Apple', kcal: 95, p: 0.5 }, { name: 'Peanut butter (2 tbsp)', kcal: 190, p: 7 }, { name: 'Whole wheat bread (slice)', kcal: 80, p: 4 }
];
export const xpNeed = (lvl) => Math.max(10, Math.round(100 * Math.pow(lvl, 1.4) * 0.6 / 10) * 10);
export const rankOf = (lvl) => RANK_CAP.findIndex((c) => lvl <= c);
