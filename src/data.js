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
  { name: 'Apple', kcal: 95, p: 0.5 }, { name: 'Peanut butter (2 tbsp)', kcal: 190, p: 7 }, { name: 'Whole wheat bread (slice)', kcal: 80, p: 4 },
  { name: 'Mixed berries (1/2 cup)', kcal: 40, p: 0.5 }, { name: 'Cheddar (1 oz)', kcal: 110, p: 7 }, { name: 'Tofu (1/2 cup)', kcal: 94, p: 10 }, { name: 'Cooked lentils (1 cup)', kcal: 230, p: 18 }, { name: 'Canned tuna in water', kcal: 120, p: 26 }
];
export const xpNeed = (lvl) => Math.max(10, Math.round(100 * Math.pow(lvl, 1.4) * 0.6 / 10) * 10);
export const rankOf = (lvl) => RANK_CAP.findIndex((c) => lvl <= c);

export const WD = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const PROGRAMS = [
  { id: 'ppl', name: 'Push / Pull / Legs', desc: 'The classic split. Rotate push, pull and legs with a rest day between sessions.', days: [
    { name: 'Push', ex: [{ n: 'Bench press', sets: 4, reps: 8, w: 40 }, { n: 'Overhead press', sets: 3, reps: 8, w: 25 }, { n: 'Triceps pushdown', sets: 3, reps: 12, w: 20 }] },
    { name: 'Pull', ex: [{ n: 'Deadlift', sets: 3, reps: 5, w: 60 }, { n: 'Barbell row', sets: 3, reps: 8, w: 40 }, { n: 'Biceps curl', sets: 3, reps: 12, w: 12 }] },
    { name: 'Legs', ex: [{ n: 'Back squat', sets: 4, reps: 6, w: 60 }, { n: 'Romanian deadlift', sets: 3, reps: 8, w: 50 }, { n: 'Calf raise', sets: 3, reps: 15, w: 40 }] }] },
  { id: 'fb', name: 'Full Body Starter', desc: 'Beginner friendly. Two full-body sessions that alternate, with light weights to learn the lifts.', days: [
    { name: 'Full Body A', ex: [{ n: 'Back squat', sets: 3, reps: 8, w: 40 }, { n: 'Bench press', sets: 3, reps: 8, w: 30 }, { n: 'Barbell row', sets: 3, reps: 8, w: 30 }] },
    { name: 'Full Body B', ex: [{ n: 'Romanian deadlift', sets: 3, reps: 8, w: 40 }, { n: 'Overhead press', sets: 3, reps: 8, w: 20 }, { n: 'Lat pulldown', sets: 3, reps: 10, w: 35 }] }] },
  { id: 'str', name: 'Strength 5x5', desc: 'Heavy and simple. Alternate two sessions and add weight when every set is clean.', days: [
    { name: 'Strength A', ex: [{ n: 'Back squat', sets: 5, reps: 5, w: 60 }, { n: 'Bench press', sets: 5, reps: 5, w: 40 }, { n: 'Barbell row', sets: 5, reps: 5, w: 40 }] },
    { name: 'Strength B', ex: [{ n: 'Back squat', sets: 5, reps: 5, w: 60 }, { n: 'Overhead press', sets: 5, reps: 5, w: 25 }, { n: 'Deadlift', sets: 1, reps: 5, w: 60 }] }] },
  { id: 'pulse', name: 'Pulse Builder', desc: 'No weights needed. Interval and endurance sessions that build your cardio base.', days: [
    { name: 'Intervals', ex: [{ n: 'Interval sprints', sets: 6, reps: 30, unit: 'sec', bw: true }, { n: 'Jump rope', sets: 4, reps: 60, unit: 'sec', bw: true }] },
    { name: 'Endurance', ex: [{ n: 'Jump rope', sets: 6, reps: 60, unit: 'sec', bw: true }, { n: 'Burpees', sets: 4, reps: 10, bw: true }] }] }
];
export const PROG_WEEKS = 4;
export const RECIPES = [
  { id: 'r_oats', name: 'Protein oats', builtin: true, items: [{ name: 'Cooked oatmeal (1 cup)', kcal: 160, p: 6 }, { name: 'Whey protein (1 scoop)', kcal: 120, p: 24 }, { name: 'Banana', kcal: 105, p: 1.3 }] },
  { id: 'r_bowl', name: 'Chicken rice bowl', builtin: true, items: [{ name: 'Grilled chicken breast', kcal: 165, p: 31 }, { name: 'Cooked white rice (1 cup)', kcal: 205, p: 4.3 }, { name: 'Broccoli (1 cup)', kcal: 55, p: 3.7 }, { name: 'Olive oil (1 tsp)', kcal: 40, p: 0 }] },
  { id: 'r_parf', name: 'Yogurt parfait', builtin: true, items: [{ name: 'Greek yogurt (1 cup)', kcal: 130, p: 23 }, { name: 'Mixed berries (1/2 cup)', kcal: 40, p: 0.5 }, { name: 'Granola (1/4 cup)', kcal: 120, p: 3 }] },
  { id: 'r_omel', name: 'Veggie omelette', builtin: true, items: [{ name: 'Large egg x3', kcal: 234, p: 18.9 }, { name: 'Spinach and pepper', kcal: 30, p: 2 }, { name: 'Cheddar (1 oz)', kcal: 110, p: 7 }] }
];
export const SYNC_SOURCES = [
  { k: 'health', name: 'Health app', desc: 'Daily steps' },
  { k: 'watch', name: 'Smartwatch', desc: 'Workouts and heart rate' },
  { k: 'run', name: 'Running app', desc: 'Runs and walks' }
];
export const TOUR = [
  { t: 'Quests', x: 'Each day you get a short list of quests. Finish them all to keep your streak and earn XP and gold. Find them under the Quests tab.' },
  { t: 'Dungeons', x: 'Dungeons are workouts. Pick one, log your sets, and clear it for XP. You can follow a training program from Profile.' },
  { t: 'Fuel', x: 'The big middle button is your food diary. Search, speak or snap a photo of your meal to log it.' },
  { t: 'Your coach', x: 'Tap ASK COACH on any screen to ask a question about food, training or sleep. Profile has everything else, like sleep, recipes and settings.' }
];
export const PARQ = [
  'Do you feel pain in your chest when you exercise?',
  'Do you lose your balance because of dizziness, or ever lose consciousness?',
  'Has a doctor ever said you have a heart condition, or that you should only exercise under medical supervision?',
  'Does a doctor currently prescribe medication for blood pressure, or do you have a bone or joint problem that exercise could make worse?'
];
