import { useState } from 'react';
import { GOALS, PROGRAMS, PROG_WEEKS, MEALS, RANKS, SYNC_SOURCES, WD, rankOf } from './data.js';
import { allRecipes, progOf, progSession, target } from './store.js';
import { Bars, Header, Icon, Pills, Stepper } from './ui.jsx';
import { useT, localeOf } from './i18n.jsx';
import { askCoach } from './coach.js';

const TILES = [
  ['TRAIN', [['programs', 'Programs', '4-week plans', '#38D6F2', <path key="a" d="M4 7h16v13H4zM4 11h16M9 4v4M15 4v4" />]]],
  ['BODY AND FOOD', [
    ['sleep', 'Sleep', 'Rest and recovery', '#8CC4FF', <path key="a" d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />],
    ['body', 'Body', 'Measure and photos', '#FF8FB1', <path key="a" d="M3 12h18M6 8v8M18 8v8M9 10v4M15 10v4" />],
    ['recipes', 'Recipes', 'Planner and list', '#46D6A0', <path key="a" d="M5 3v8a3 3 0 003 3v7M8 3v6M11 3v8a3 3 0 01-3 3M17 3c-2 2-2.5 5-2.5 8h2.5v10" />],
    ['coach', 'AI coach', 'Tips and chat', '#38D6F2', <path key="a" d="M4 7h16v12H4zM12 7V4M9 12h.01M15 12h.01M9 16h6" />]]],
  ['APP', [
    ['sync', 'Connected apps', 'Simulated sync', '#93A8CF', <path key="a" d="M20 8a8 8 0 00-14-2M4 4v4h4M4 16a8 8 0 0014 2M20 20v-4h-4" />],
    ['settings', 'Settings', 'Safety and privacy', '#93A8CF', <path key="a" d="M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3" />]]]
];

export function Profile({ s, go }) {
  const t = useT();
  return (
    <div className="scroll">
      <Header label="PLAYER PROFILE" title={s.name.toUpperCase()} />
      <section className="win" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[['LEVEL', s.level], ['RANK', RANKS[rankOf(s.level)]], ['GOLD', s.gold], ['STREAK', s.streak], ['DUNGEONS', s.cleared], ['RECOVERY', s.rec]].map(([k, v]) => <div key={k}><div className="mono mute">{t(k)}</div><div className="raj" style={{ fontSize: 22 }}>{v}</div></div>)}
      </section>
      {TILES.map(([label, tiles]) => (
        <section key={label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><div className="lbl">[ {t(label)} ]</div>
          <div className="grid2">{tiles.map(([k, title, sub, col, d]) => (
            <button key={k} className="tile" onClick={() => go(k)}><span className="ti" style={{ color: col, borderColor: col }}><Icon d={d} /></span><span className="tt">{t(title)}</span><span className="ts">{t(sub)}</span></button>))}</div></section>
      ))}
    </div>
  );
}

export function Sleep({ s, dispatch, go, lang }) {
  const t = useT(); const [h, setH] = useState(7.5); const [q, setQ] = useState(3);
  const sl = s.sleep; const series = sl.log.slice(-6).concat([sl.today]);
  const vals = series.filter(Boolean); const avg = vals.length ? vals.reduce((a, e) => a + e.h, 0) / vals.length : 0;
  const last = sl.today || [...series].reverse().find(Boolean) || null;
  const ready = last ? Math.round(Math.min(last.h / 8, 1) * 60 + last.q * 8) : 0;
  const title = !last ? 'READINESS: UNKNOWN' : ready >= 75 ? 'READY TO PUSH' : ready >= 50 ? 'TRAIN, BUT KEEP IT LIGHTER' : 'PRIORITISE REST TODAY';
  const day = (back) => new Date(Date.now() - back * 86400000).toLocaleDateString(localeOf(lang), { weekday: 'short' }).toUpperCase();
  return (
    <div className="scroll">
      <Header label="RECOVERY" title="SLEEP AND REST" back={() => go('profile')} />
      <section className="panel" style={{ borderColor: !last ? undefined : ready >= 75 ? 'var(--good)' : ready >= 50 ? 'var(--gold)' : 'var(--bad)' }}>
        <div className="raj" style={{ fontSize: 20 }}>{t(title)}</div>
        <div className="mute" style={{ fontSize: 13 }}>{last ? `${last.h} h · ${t('Sleep quality')} ${last.q} / 5. ${t('This is a rough guide, not medical advice.')}` : t('Log last night to get a readiness read.')}</div></section>
      <section className="panel"><div className="lbl">[ {t('LAST NIGHT')} ]</div>
        <Stepper value={`${h} h`} minusLabel="Less sleep" plusLabel="More sleep" onMinus={() => setH(Math.max(3, Math.round((h - 0.5) * 10) / 10))} onPlus={() => setH(Math.min(12, Math.round((h + 0.5) * 10) / 10))} />
        <div className="lbl">{t('QUALITY')}</div>
        <Pills cols={5} options={[[1, 'POOR'], [2, 'FAIR'], [3, 'OK'], [4, 'GOOD'], [5, 'GREAT']]} value={q} onPick={setQ} />
        <button className="btn" onClick={() => dispatch({ type: 'sleep', h, q })}>{sl.today ? t("UPDATE TODAY'S SLEEP") : t('LOG SLEEP (+15 XP)')}</button></section>
      <section className="panel"><div className="lbl">[ {t('LAST 7 DAYS')} ]</div>
        <Bars label={t('Sleep hours for the last days')} data={series.map((e, i) => ({ val: e ? `${e.h}h` : '-', label: day(series.length - 1 - i), h: Math.round((e ? e.h : 0) / 10 * 72), empty: !e, color: e && e.h >= 7 ? 'var(--good)' : '#4DA3FF' }))} />
        <div className="note">{vals.length ? `${t('Average')}: ${Math.round(avg * 10) / 10} h` : t('No nights logged yet.')}</div>
        {vals.length >= 3 && avg < 6 && <div className="warn">{t('You are averaging under 6 hours. If poor sleep is worrying you, it is worth talking to a doctor.')}</div>}</section>
      <button className="btn2" disabled={sl.rest} style={{ height: 52 }} onClick={() => dispatch({ type: 'rest' })}>{sl.rest ? t('REST DAY TAKEN') : t('TAKE A REST DAY (+10 XP)')}</button>
      <div className="note">{t('Hours of 7 or more add +1 to your Recovery stat. Rest days count too. Rest is when you get stronger.')}</div>
    </div>
  );
}

const PHOTO_KEY = 'ascend-photos-v1';
const loadPhotos = () => { try { const p = JSON.parse(localStorage.getItem(PHOTO_KEY) || '[]'); return Array.isArray(p) ? p.slice(0, 8) : []; } catch { return []; } };
const BF = [['waist', 'Waist'], ['chest', 'Chest'], ['hips', 'Hips'], ['arm', 'Upper arm'], ['thigh', 'Thigh']];
export function Body({ s, dispatch, go, lang }) {
  const t = useT(); const [d, setD] = useState({}); const [kg, setKg] = useState(''); const [photos, setPhotos] = useState(loadPhotos); const [msg, setMsg] = useState('');
  const first = s.body[0]; const last = s.body[s.body.length - 1];
  const save = () => {
    const e = { t: Date.now() }; let n = 0; let bad = false;
    BF.forEach(([k]) => { const raw = String(d[k] || '').trim(); if (!raw) { e[k] = null; return; } const v = parseFloat(raw); if (!(v >= 10 && v <= 250)) bad = true; else { e[k] = Math.round(v * 10) / 10; n += 1; } });
    if (bad) { setMsg('[ERROR] Enter measurements between 10 and 250 cm.'); return; }
    if (!n) { setMsg('[SYSTEM] Enter at least one measurement.'); return; }
    setMsg(''); dispatch({ type: 'bodySave', entry: e }); setD({});
  };
  const persist = (list) => { setPhotos(list); try { localStorage.setItem(PHOTO_KEY, JSON.stringify(list)); } catch { setMsg('[NOT SAVED] Storage is full. This photo disappears when you close the page.'); } };
  const addPhoto = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    if (photos.length >= 8) { setMsg('[LIMIT] Up to 8 progress photos. Delete one first.'); return; }
    const url = URL.createObjectURL(f); const img = new Image();
    img.onload = () => {
      const sc = Math.min(1, 360 / Math.max(img.width, img.height)); const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(img.width * sc)); cv.height = Math.max(1, Math.round(img.height * sc));
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url); setMsg(''); persist([...photos, { t: Date.now(), src: cv.toDataURL('image/jpeg', 0.7) }]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); setMsg('[ERROR] That image could not be used.'); };
    img.src = url; e.target.value = '';
  };
  const fmt = (ts) => new Date(ts).toLocaleDateString(localeOf(lang), { month: 'short', day: 'numeric' });
  return (
    <div className="scroll">
      <Header label="BODY CHECK-IN" title="MEASURE AND COMPARE" back={() => go('profile')} />
      <div className="note">{t('Optional. Measure when you like, ideally every 1 to 2 weeks. Skip anything you do not want to track.')}</div>
      {msg && <div className="warn" role="status">{t(msg)}</div>}
      <section className="panel">
        {BF.map(([k, label]) => <div key={k} className="row"><label htmlFor={'bf' + k}>{t(label)} (cm)</label><input id={'bf' + k} inputMode="decimal" maxLength={6} value={d[k] || ''} onChange={(e) => setD({ ...d, [k]: e.target.value })} style={{ width: 110, textAlign: 'right' }} /></div>)}
        <button className="btn" onClick={save}>{t('SAVE CHECK-IN (+20 XP)')}</button></section>
      {last && <section className="win"><div className="lbl">[ {t('LATEST')} ]</div><div className="mono mute">{s.body.length} {t('check-in')} · {fmt(last.t)}</div>
        {BF.filter(([k]) => last[k] != null).map(([k, label]) => { const dv = first && first !== last && first[k] != null ? Math.round((last[k] - first[k]) * 10) / 10 : null; return <div key={k} className="row sep"><span>{t(label)}</span><span className="mono">{last[k]} cm <span className="mute">{dv === null ? '' : `${dv > 0 ? '+' : ''}${dv} cm`}</span></span></div>; })}</section>}
      <section className="panel"><div className="lbl">[ {t('WEIGHT')} ]</div>
        <div className="row"><input aria-label={t('WEIGHT')} inputMode="decimal" placeholder="kg" value={kg} onChange={(e) => setKg(e.target.value)} style={{ flex: 1 }} /><button className="btn2 inline" onClick={() => { dispatch({ type: 'weight', kg: parseFloat(kg) }); setKg(''); }}>{t('LOG WEIGHT')}</button></div>
        {s.weights.length > 0 && <div className="mono mute">{s.weights.slice(-5).map((w) => w.kg).join(' → ')} kg</div>}</section>
      <section className="panel"><div className="lbl">[ {t('PROGRESS PHOTOS')} ]</div>
        <div style={{ position: 'relative' }}><input id="bphoto" type="file" accept="image/*" onChange={addPhoto} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', height: '100%' }} /><label htmlFor="bphoto" className="btn2" style={{ pointerEvents: 'none' }}>{t('ADD A PHOTO')}</label></div>
        {photos.length >= 2 && <div className="grid2"><div><img className="photo" src={photos[0].src} alt={t('First progress photo')} /><div className="mono mute" style={{ textAlign: 'center' }}>{t('START')}</div></div><div><img className="photo" src={photos[photos.length - 1].src} alt={t('Latest progress photo')} /><div className="mono mute" style={{ textAlign: 'center' }}>{t('LATEST')}</div></div></div>}
        {photos.map((p, i) => <div key={p.t} className="row sep" style={{ justifyContent: 'flex-start' }}><img src={p.src} alt={`${t('Progress photo')} ${i + 1}`} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }} /><span className="mono" style={{ flex: 1 }}>{fmt(p.t)}</span><button className="link danger" aria-label={`${t('Delete progress photo')} ${i + 1}`} onClick={() => persist(photos.filter((_, j) => j !== i))}>{t('DELETE')}</button></div>)}
        <div className="note">{t('Photos are shrunk and kept only on this device. They are never uploaded or shared. Up to 8.')}</div></section>
    </div>
  );
}

export function Programs({ s, dispatch, go }) {
  const t = useT(); const P = progOf(s); const total = PROG_WEEKS * 3;
  return (
    <div className="scroll">
      <Header label="PROGRAMS" title="TRAINING PLANS" back={() => go('profile')} />
      {P && (() => { const ss = progSession(P, Math.min(s.prog.done, total - 1)); return (
        <section className="win"><div className="lbl">[ {t('ACTIVE PROGRAM')} ]</div><div className="raj" style={{ fontSize: 24 }}>{t(P.name)}</div>
          <div className="bar"><i style={{ width: `${Math.round(s.prog.done / total * 100)}%` }} /></div>
          <div className="mono mute">{t(ss.label)}</div>
          <div className="raj" style={{ fontSize: 18 }}>{t('NEXT:')} {t(ss.day.name)}</div>
          <div style={{ fontSize: 13 }}>{ss.day.ex.map((e) => `${t(e.n)} ${e.sets}x${e.reps}`).join(' · ')}</div>
          <button className="btn" onClick={() => go('dungeons')}>{t("START TODAY'S SESSION")}</button>
          <button className="link danger" onClick={() => dispatch({ type: 'progQuit' })}>{t('End program')}</button></section>); })()}
      {PROGRAMS.map((p) => { const on = P && P.id === p.id; return (
        <section key={p.id} className="panel"><div className="raj" style={{ fontSize: 20 }}>{t(p.name)}</div><div className="mono" style={{ fontSize: 12, color: 'var(--sky)' }}>{t('3 sessions a week for 4 weeks')}</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{t(p.desc)}</div><div className="note">{t('Sessions')}: {p.days.map((x) => t(x.name)).join(', ')}</div>
          <button className="btn2" disabled={on} aria-label={`${t('Start')} ${t(p.name)}`} onClick={() => dispatch({ type: 'progStart', id: p.id })}>{on ? t('ACTIVE') : P ? t('SWITCH TO THIS') : t('START PROGRAM')}</button></section>); })}
      <div className="note">{t('Each session appears as a gate at the top of Dungeons. Starting weights follow your best lifts. Leave a rest day between sessions. Stop if anything hurts.')}</div>
    </div>
  );
}

export function Recipes({ s, dispatch, go }) {
  const t = useT(); const [tab, setTab] = useState('recipes'); const [meal, setMeal] = useState('Breakfast'); const [day, setDay] = useState((new Date().getDay() + 6) % 7); const [name, setName] = useState('');
  const all = allRecipes(s); const byId = (id) => all.find((r) => r.id === id);
  const tot = (R) => R.items.reduce((a, x) => ({ kcal: a.kcal + x.kcal, p: a.p + x.p }), { kcal: 0, p: 0 });
  const planned = s.plan[day].map((e, i) => ({ e, i, R: byId(e.rid) })).filter((x) => x.R);
  const shop = {}; s.plan.forEach((d) => d.forEach((e) => { const R = byId(e.rid); if (R) R.items.forEach((it) => { shop[it.name] = (shop[it.name] || 0) + 1; }); }));
  const todayIdx = (new Date().getDay() + 6) % 7;
  return (
    <div className="scroll">
      <Header label="RECIPES" title="RECIPES AND PLANNER" back={() => go('fuel')} />
      <Pills cols={3} options={[['recipes', 'RECIPES'], ['plan', 'PLANNER'], ['shop', 'SHOPPING']]} value={tab} onPick={setTab} />
      {tab === 'recipes' && <>
        <div className="note">{t('Adding to')} {t(WD[day])} ({t(meal)}).</div>
        <Pills options={MEALS.map((m) => [m, m.toUpperCase()])} value={meal} onPick={setMeal} />
        {all.map((R) => { const x = tot(R); return (
          <section key={R.id} className="panel"><div className="row"><b>{t(R.name)}</b><span className="mono">{Math.round(x.kcal)} kcal</span></div>
            <div className="mono mute">P {Math.round(x.p * 10) / 10} g · {R.items.length} {t('items')} · {R.builtin ? t('Starter recipe, estimates') : t('Your recipe')}</div>
            <div className="grid2"><button className="btn inline" aria-label={`${t('Log')} ${t(R.name)}`} onClick={() => dispatch({ type: 'recLog', recipe: R, meal })}>{t('LOG IT')}</button>
              <button className="btn2 inline" aria-label={`${t('Add')} ${t(R.name)} ${t('to')} ${t(WD[day])}`} onClick={() => dispatch({ type: 'planAdd', day, rid: R.id, meal, name: R.name })}>{t('ADD TO PLAN')}</button></div>
            {!R.builtin && <button className="link danger" onClick={() => dispatch({ type: 'recDel', id: R.id })}>{t('Delete recipe')}</button>}</section>); })}
        {s.food.length > 0 && <section className="panel"><div className="lbl">[ {t('SAVE A MEAL FROM TODAY')} ]</div>
          <label htmlFor="rn">{t('Recipe name')}</label><input id="rn" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
          {MEALS.filter((m) => s.food.some((f) => f.meal === m)).map((m) => <button key={m} className="btn2" onClick={() => { if (!name.trim()) return; dispatch({ type: 'recSave', name: name.trim(), items: s.food.filter((f) => f.meal === m).map((f) => ({ name: f.name, kcal: f.kcal, p: f.p })) }); setName(''); }}>{t('SAVE')} {t(m.toUpperCase())}</button>)}</section>}
      </>}
      {tab === 'plan' && <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>{WD.map((w, i) => <button key={w} className={'pill' + (day === i ? ' on' : '')} style={{ padding: 0, fontSize: 12 }} aria-label={`${t('Plan for')} ${t(w)}`} onClick={() => setDay(i)}>{t(w)}</button>)}</div>
        <div className="mono">{t('Planned for')} {t(WD[day])}: {Math.round(planned.reduce((a, x) => a + tot(x.R).kcal, 0))} kcal</div>
        {!planned.length && <div className="note">{t('Nothing planned for this day. Add recipes from the RECIPES tab.')}</div>}
        {planned.map((x) => <div key={x.i} className="panel row"><div><b>{t(x.R.name)}</b><div className="mono mute">{t(x.e.meal)} · {Math.round(tot(x.R).kcal)} kcal</div></div><button className="link danger" onClick={() => dispatch({ type: 'planDel', day, i: x.i })}>{t('REMOVE')}</button></div>)}
        {day === todayIdx && planned.length > 0 && <button className="btn" onClick={() => dispatch({ type: 'planLog', day })}>{t("LOG TODAY'S PLAN (+10 XP)")}</button>}
      </>}
      {tab === 'shop' && <>
        <div className="note">{t('Built from every recipe in your weekly plan. Quantities are counted per recipe, not per package.')}</div>
        {!Object.keys(shop).length && <div className="note">{t('Your plan is empty, so there is nothing to buy yet.')}</div>}
        <section className="panel" style={{ padding: '4px 12px' }}>{Object.keys(shop).sort().map((k) => { const on = !!s.shopDone[k]; return (
          <button key={k} role="checkbox" aria-checked={on} className="row" style={{ justifyContent: 'flex-start', minHeight: 44, background: 'none', border: 0, borderTop: '1px solid var(--line2)', textAlign: 'left', color: on ? 'var(--mute)' : 'inherit', textDecoration: on ? 'line-through' : 'none' }} onClick={() => dispatch({ type: 'shopToggle', k })}>
            <span style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid ' + (on ? 'var(--good)' : 'var(--line)'), background: on ? 'var(--good)' : 'transparent', color: '#06101F', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{on ? '✓' : ''}</span>{t(k)}{shop[k] > 1 ? `  x${shop[k]}` : ''}</button>); })}</section>
        <button className="btn2" onClick={() => dispatch({ type: 'shopClear' })}>{t('CLEAR TICKS')}</button>
      </>}
    </div>
  );
}

export function Sync({ s, dispatch, go, lang }) {
  const t = useT();
  return (
    <div className="scroll">
      <Header label="CONNECTED APPS" title="SYNC" back={() => go('profile')} />
      <div className="warn">{t('Simulated. No real device or account is read. This shows how synced steps and workouts would appear in your diary.')}</div>
      <section className="panel" style={{ padding: '6px 14px' }}>
        {SYNC_SOURCES.map((x) => { const on = s.sync[x.k]; return (
          <div key={x.k} className="row" style={{ minHeight: 68, borderBottom: '1px solid var(--line2)' }}>
            <div><div style={{ fontWeight: 600 }}>{t(x.name)}</div><div className="mute">{t(x.desc)}</div><div className="mono" style={{ fontSize: 11, color: 'var(--sky)' }}>{t(!on ? 'NOT CONNECTED' : s.syncedDay[x.k] ? 'SYNCED TODAY' : 'READY TO SYNC')}</div></div>
            <button role="switch" aria-checked={on} aria-label={`${t('Connect')} ${t(x.name)}`} className={'pill' + (on ? ' on' : '')} onClick={() => dispatch({ type: 'syncToggle', k: x.k })}>{on ? 'ON' : 'OFF'}</button></div>); })}</section>
      <button className="btn" onClick={() => dispatch({ type: 'syncNow' })}>{t('SYNC NOW')}</button>
      <div className="mono mute" style={{ textAlign: 'center' }}>{t('Last sync')}: {s.lastSync ? new Date(s.lastSync).toLocaleTimeString(localeOf(lang), { hour: 'numeric', minute: '2-digit' }) : t('never')}</div>
      <div className="note">{t('Real syncing with health apps and watches needs a native phone app. Imported activity lands in the Exercise section of your diary.')}</div>
    </div>
  );
}

export function Settings({ s, dispatch, go, lang, setLang, theme, setTheme }) {
  const t = useT(); const [show, setShow] = useState(false);
  const keep = ['started', 'name', 'goal', 'level', 'xp', 'gold', 'streak', 'cleared', 'kcalAdj', 'weights', 'body', 'sleep', 'recipes', 'plan', 'prog'];
  const out = {}; keep.forEach((k) => { out[k] = s[k]; });
  return (
    <div className="scroll">
      <Header label="SETTINGS" title="PRIVACY AND COMFORT" back={() => go('profile')} />
      <section className="panel"><div className="lbl">[ {t('Language')} ]</div><Pills options={[['en', 'English'], ['zh', '中文']]} value={lang} onPick={setLang} /></section>
      <section className="panel"><div className="lbl">[ {t('Theme')} ]</div><Pills options={[['dark', 'Dark'], ['light', 'Light']]} value={theme} onPick={setTheme} /></section>
      <section className="panel"><div className="lbl">[ {t('YOUR DATA')} ]</div>
        <div className="note">{t('Everything lives in this browser. Nothing is sent anywhere. Export it, or delete it all.')}</div>
        <button className="btn2" onClick={() => setShow(!show)}>{show ? t('HIDE MY DATA') : t('SHOW MY DATA (EXPORT)')}</button>
        {show && <textarea readOnly rows={10} aria-label={t('Your exported data')} value={JSON.stringify(out, null, 1)} style={{ fontFamily: 'monospace', fontSize: 11 }} />}
        <button className="btn2 danger" onClick={() => { if (window.confirm(t('DELETE ALL MY DATA') + '?')) { try { localStorage.removeItem('ascend-photos-v1'); } catch { /* ignore */ } dispatch({ type: 'reset' }); } }}>{t('DELETE ALL MY DATA')}</button></section>
      <div className="note">{t('Private by default. Only your name, level and weekly totals are ever shown. Other players here are sample data for the prototype.')}</div>
    </div>
  );
}

export function Coach({ s, go, lang, from }) {
  const t = useT(); const [turns, setTurns] = useState([]); const [q, setQ] = useState(''); const [busy, setBusy] = useState(false);
  const send = async (text) => {
    text = text.trim().slice(0, 500); if (!text || busy) return;
    const history = turns.map((x) => ({ role: x.role, content: x.text }));
    setTurns((p) => [...p, { role: 'user', text }]); setQ(''); setBusy(true);
    const a = await askCoach(text, s, history, lang);
    setTurns((p) => [...p, { role: 'assistant', text: a.text, ai: a.ai }]); setBusy(false);
  };
  return (
    <div className="scroll">
      <Header label="AI COACH" title="ASK ME" back={() => go(from || 'fuel')} />
      <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>{['Review my day', 'What should I eat next?', 'Plan my next workout'].map((c) => <button key={c} className="pill" onClick={() => send(t(c))}>{t(c)}</button>)}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-live="polite">
        {turns.map((x, i) => <div key={i} className="panel" style={{ alignSelf: x.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%', whiteSpace: 'pre-wrap' }}><span className="mono mute">{x.role === 'user' ? t('YOU') : x.ai ? t('COACH (AI)') : t('COACH')}</span>{x.text}</div>)}
        {busy && <div className="mute">{t('Thinking...')}</div>}</div>
      <form className="row" onSubmit={(e) => { e.preventDefault(); send(q); }}>
        <input aria-label={t('MESSAGE')} maxLength={500} value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn inline" disabled={busy}>{t('SEND')}</button></form>
      <div className="note">{t('AI replies can be wrong and are not medical advice.')} {import.meta.env.VITE_COACH_URL ? '' : t('Basic coach mode: answers come from your diary numbers.')}</div>
    </div>
  );
}
