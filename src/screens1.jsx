import { PenaltyCard, HiddenList } from './screens3.jsx';
import { useState } from 'react';
import { DAILY, FOODS, GOALS, MEALS, PARQ, RANKS, TOUR, rankOf, xpNeed } from './data.js';
import { allGates, progOf, progSession, target } from './store.js';
import { Header, Icon, Pills } from './ui.jsx';
import { useT, localeOf } from './i18n.jsx';
import { parseMeal } from './parse.js';

export function Awaken({ dispatch, lang, setLang }) {
  const t = useT();
  const [name, setName] = useState(''); const [goal, setGoal] = useState('muscle'); const [age, setAge] = useState(false); const [parq, setParq] = useState({});
  const flagged = PARQ.some((_, i) => parq[i] === true); const answered = PARQ.every((_, i) => parq[i] !== undefined);
  return (
    <div className="scroll">
      <button className="langbtn" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}>{lang === 'zh' ? 'English' : '中文'}</button>
      <Header label="SYSTEM" title="AWAKEN" />
      <div className="mute">{t('Register as a player. Your goal sets your daily calorie and protein targets.')}</div>
      <label className="lbl" htmlFor="nm">{t('PLAYER NAME')}</label>
      <input id="nm" value={name} maxLength={16} onChange={(e) => setName(e.target.value)} />
      {Object.entries(GOALS).map(([k, g]) => (
        <button key={k} className={'panel pill' + (goal === k ? ' on' : '')} style={{ alignItems: 'flex-start', textAlign: 'left', padding: 14 }} onClick={() => setGoal(k)}>
          <span className="raj" style={{ fontSize: 18 }}>{t(g.label)}</span><span className="mute">{t(g.sub)} · {g.kcal} {t('kcal')}</span>
        </button>
      ))}
      <section className="panel"><div className="lbl">[ {t('QUICK READINESS CHECK')} ]</div>
        {PARQ.map((q, i) => (
          <div key={i} className="sep"><div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>{i + 1}. {t(q)}</div>
            <div className="row" style={{ justifyContent: 'flex-start' }}>
              {[[true, 'YES'], [false, 'NO']].map(([v, l]) => <button key={l} className={'pill' + (parq[i] === v ? ' on' : '')} style={{ minWidth: 64 }} aria-label={`${t(l)} ${i + 1}`} onClick={() => setParq({ ...parq, [i]: v })}>{t(l)}</button>)}
            </div></div>
        ))}
        {flagged && <div className="warn">{t('Please check with a doctor before starting a new training plan. This app is not medical advice.')}</div>}
      </section>
      <label className="row" style={{ justifyContent: 'flex-start', minHeight: 44 }}><input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} style={{ width: 22, height: 22 }} /><span>{t('I am 13 or older')}</span></label>
      <button className="btn" disabled={!age || !answered} onClick={() => dispatch({ type: 'start', name: name.trim(), goal })}>{t('BEGIN')}</button>
      <div className="note">{t('ASCEND is a prototype and gives no medical advice. Stop exercising and see a doctor if something hurts or feels wrong.')}</div>
    </div>
  );
}

export function Home({ s, dispatch }) {
  const t = useT(); const need = xpNeed(s.level);
  return (
    <div className="scroll">
      <Header label="STATUS WINDOW" title={s.name.toUpperCase()} />
      <div className="mono mute">{t('LEVEL')} {s.level} · {t('RANK')} {RANKS[rankOf(s.level)]} · {t('STREAK')} {s.streak}</div>
      {s.tour < TOUR.length && (
        <section className="win" role="region" aria-label={t('Quick tour')}>
          <div className="row"><span className="lbl">[ {t('QUICK TOUR')} {s.tour + 1} / {TOUR.length} ]</span><button className="link" onClick={() => dispatch({ type: 'tour', n: TOUR.length })}>{t('Skip')}</button></div>
          <div className="raj" style={{ fontSize: 22 }}>{t(TOUR[s.tour].t)}</div>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>{t(TOUR[s.tour].x)}</div>
          <button className="btn" onClick={() => dispatch({ type: 'tour', n: s.tour + 1 })}>{s.tour >= TOUR.length - 1 ? t('GOT IT') : t('NEXT')}</button>
        </section>
      )}
      <section className="win"><div className="row"><span className="lbl">XP</span><span className="mono">{s.xp} / {need}</span></div><div className="bar"><i style={{ width: `${(s.xp / need) * 100}%` }} /></div>
        <div className="row mute"><span>{t('GOLD')} {s.gold}</span><span>{t('DUNGEONS CLEARED')} {s.cleared}</span></div></section>
      <section className="panel"><div className="lbl">[ {t('TODAY')} ]</div>
        {DAILY.map((q) => <div key={q.id} className="row sep"><span style={{ textDecoration: s.qDone[q.id] ? 'line-through' : 'none', color: s.qDone[q.id] ? 'var(--mute)' : 'inherit' }}>{t(q.name)}</span><span className="mono mute">{s.qDone[q.id] ? t('DONE') : `+${q.xp} XP`}</span></div>)}
      </section>
    </div>
  );
}

export function Quests({ s, dispatch }) {
  const t = useT();
  return (
    <div className="scroll">
      <Header label="QUEST BOARD" title="DAILY QUESTS" />
      <PenaltyCard s={s} dispatch={dispatch} />
      {DAILY.map((q) => {
        const cur = q.id === 'protein' ? Math.round(s.qp.protein || 0) : s.qp[q.id] || 0; const tgt = q.id === 'protein' ? GOALS[s.goal].p : q.target;
        return (
          <section key={q.id} className="panel">
            <div className="row"><span style={{ fontWeight: 600 }}>{t(q.name)}</span><span className="mono mute">+{q.xp} XP · +{q.gold} {t('gold')}</span></div>
            <div className="bar"><i style={{ width: `${Math.min(100, (cur / tgt) * 100)}%` }} /></div>
            <div className="row"><span className="mono mute">{cur} / {tgt}</span>
              {q.auto ? <span className="mute">{t('Updates from your Fuel diary.')}</span> : <button className="btn2 inline" disabled={s.qDone[q.id]} onClick={() => dispatch({ type: 'quest', id: q.id, target: q.target, step: q.step })}>+{q.step}</button>}</div>
          </section>
        );
      })}
      <HiddenList s={s} />
    </div>
  );
}

export function Fuel({ s, dispatch, go, lang }) {
  const t = useT(); const [off, setOff] = useState(0); const [more, setMore] = useState(false); const [meal, setMeal] = useState('Breakfast'); const [q, setQ] = useState('');
  const past = off < 0 ? s.archive[s.archive.length + off] : null;
  const dayLabel = off === 0 ? 'TODAY' : off === -1 ? 'YESTERDAY' : null;
  const dayDate = new Date(Date.now() + off * 86400000).toLocaleDateString(localeOf(lang), { weekday: 'short', month: 'short', day: 'numeric' });
  const nav = (
    <div className="row">
      <button className="step" aria-label={t('Previous day')} disabled={s.archive.length + off <= 0} onClick={() => setOff(off - 1)}>‹</button>
      <div style={{ textAlign: 'center' }}><div className="raj" style={{ fontSize: 20 }}>{dayLabel ? t(dayLabel) : lang === 'zh' ? `${-off} 天前` : `${-off} DAYS AGO`}</div><div className="mono mute">{dayDate}</div></div>
      <button className="step" aria-label={t('Next day')} disabled={off >= 0} onClick={() => setOff(off + 1)}>›</button>
    </div>
  );
  if (off < 0 && past) {
    const eat = Math.round(past.food.reduce((a, f) => a + f.kcal, 0)); const burn = past.exLog.reduce((a, x) => a + x.kcal, 0);
    return (
      <div className="scroll"><Header label="FUEL" title="DIARY" />{nav}
        <section className="win"><div className="lbl">[ {t('DAY SUMMARY')} ]</div>
          <div className="grid2" style={{ gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
            {[[eat, 'FOOD'], [burn, 'EXERCISE'], [past.goal + burn - eat, 'LEFT']].map(([v, l]) => <div key={l}><div className="raj" style={{ fontSize: 22 }}>{v}</div><div className="mono mute">{t(l)}</div></div>)}
          </div>
          <div className="note">{past.water} / 8 {t('cups')} · {past.diaryDone ? t('Diary completed') : t('Diary not completed')}</div></section>
        {MEALS.map((m) => { const items = past.food.filter((f) => f.meal === m); return (
          <section key={m} className="panel"><div className="row"><div><span className="raj" style={{ fontSize: 20 }}>{t(m)}</span> <span className="mono mute">{items.reduce((a, f) => a + f.kcal, 0)} kcal</span></div>
            {items.length > 0 && <button className="btn2 inline" style={{ fontSize: 13 }} aria-label={`${t('Copy')} ${t(m)} ${t('to today')}`} onClick={() => dispatch({ type: 'copyMeal', items })}>{t('COPY TO TODAY')}</button>}</div>
            {!items.length && <div className="note">{t('Nothing logged.')}</div>}
            {items.map((f) => <div key={f.id} className="sep" style={{ minHeight: 44 }}><div>{t(f.name)}</div><div className="mono mute">{f.kcal} kcal · P {f.p} g</div></div>)}</section>); })}
        <div className="note">{t('Past days are read-only. Copy a meal to today to log it again.')}</div>
      </div>
    );
  }
  const goal = target(s); const eaten = Math.round(s.food.reduce((a, f) => a + f.kcal, 0)); const burn = s.exLog.reduce((a, x) => a + x.kcal, 0); const left = goal - eaten + burn;
  const hits = FOODS.filter((f) => t(f.name).toLowerCase().includes(q.toLowerCase()) || f.name.toLowerCase().includes(q.toLowerCase()));
  const tot = s.food.reduce((a, f) => ({ p: a.p + f.p }), { p: 0 });
  return (
    <div className="scroll">
      <Header label="FUEL" title="DIARY" />{nav}
      <section className="win"><div className="lbl">[ {t('CALORIES REMAINING')} ]</div>
        <div className="row" style={{ textAlign: 'center' }}>
          {[[goal, 'GOAL'], [eaten, 'FOOD'], [burn, 'EXERCISE'], [left, 'LEFT']].map(([v, l], i) => <div key={l} style={{ flex: 1 }}><div className="raj" style={{ fontSize: 22, color: i === 3 ? 'var(--sky)' : i === 2 ? 'var(--good)' : 'inherit' }}>{v}</div><div className="mono mute">{t(l)}</div></div>)}
        </div>
        <div className="note">{t('PROTEIN')} {Math.round(tot.p)} / {GOALS[s.goal].p} g</div></section>
      <div className="grid2">
        <button className="btn2" onClick={() => go('voice')}>{t('VOICE LOG')}</button>
        <button className="btn2" onClick={() => go('photo')}>{t('PHOTO SCAN')}</button>
        <button className="btn2" onClick={() => go('scan')}>{t('SCAN BARCODE')}</button>
        <button className="btn2" onClick={() => go('recipes')}>{t('RECIPES')}</button>
      </div>
      <section className="panel"><div className="row"><span className="lbl">[ {t('WATER')} ]</span><span className="mono">{s.water} / 8 {t('cups')}</span></div>
        <div className="row"><button className="step" aria-label={t('Remove a cup')} onClick={() => dispatch({ type: 'water', d: -1 })}>−</button><div className="bar" style={{ flex: 1 }}><i style={{ width: `${Math.min(100, s.water / 8 * 100)}%` }} /></div><button className="step" aria-label={t('Add a cup')} onClick={() => dispatch({ type: 'water', d: 1 })}>+</button></div></section>
      <section className="panel"><div className="lbl">[ {t('ADD FOOD')} ]</div>
        <Pills options={MEALS.map((m) => [m, m.toUpperCase()])} value={meal} onPick={setMeal} />
        <input aria-label={t('SEARCH FOODS')} placeholder={t('SEARCH FOODS')} value={q} onChange={(e) => setQ(e.target.value)} />
        {(q ? hits : hits.slice(0, 5)).map((f) => <div key={f.name} className="row sep"><div><div>{t(f.name)}</div><div className="mono mute">{f.kcal} kcal · P {f.p} g</div></div><button className="btn2 inline" aria-label={`${t('Add')} ${t(f.name)}`} onClick={() => dispatch({ type: 'food', meal, name: f.name, kcal: f.kcal, p: f.p })}>{t('ADD')}</button></div>)}
        {!hits.length && <div className="note">{t('No foods match.')}</div>}</section>
      {MEALS.map((m) => { const items = s.food.filter((f) => f.meal === m); return items.length ? (
        <section key={m} className="panel"><div className="raj" style={{ fontSize: 20 }}>{t(m)}</div>
          {items.map((f) => <div key={f.id} className="row sep"><span>{t(f.name)} <span className="mono mute">{f.kcal} kcal</span></span><button className="link danger" aria-label={`${t('Remove')} ${t(f.name)}`} onClick={() => dispatch({ type: 'unfood', id: f.id })}>{t('REMOVE')}</button></div>)}</section>) : null; })}
      <section className="panel"><div className="lbl">[ {t('EXERCISE')} ]</div>
        {s.exLog.map((x) => <div key={x.id} className="row sep"><span>{t(x.name)}</span><span className="mono mute">{x.kcal} kcal <button className="link danger" aria-label={`${t('Remove')} ${t(x.name)}`} onClick={() => dispatch({ type: 'exDel', id: x.id })}>✕</button></span></div>)}
        {!s.exLog.length && <div className="note">{t('Dungeons you clear are added automatically. You can also log other activity.')}</div>}
        <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>{[['Walk, 30 min', 140], ['Run, 20 min', 220], ['Cycling, 30 min', 250], ['Yoga, 30 min', 120]].map(([n, k]) => <button key={n} className="pill" onClick={() => dispatch({ type: 'exAdd', name: n, kcal: k })}>{t(n)}</button>)}</div></section>
      <button className="btn" disabled={s.diaryDone} onClick={() => dispatch({ type: 'diary' })}>{s.diaryDone ? t('DIARY COMPLETED TODAY') : t('COMPLETE DIARY (+20 XP)')}</button>
      <button className="btn2" aria-expanded={more} onClick={() => setMore(!more)}>{more ? t('FEWER DETAILS') : t('MORE DETAILS')}</button>
      {more && <section className="panel"><div className="lbl">[ {t('DAILY TARGET')} ]</div>
        <div className="row"><button className="step" aria-label={t('Lower calorie target')} onClick={() => dispatch({ type: 'kcal', d: -50 })}>−</button><div className="raj" style={{ fontSize: 24 }}>{goal} kcal</div><button className="step" aria-label={t('Raise calorie target')} onClick={() => dispatch({ type: 'kcal', d: 50 })}>+</button></div>
        <div className="note">{t('Safe range: 1,500 to 4,500 kcal. Not medical advice.')}</div></section>}
    </div>
  );
}

export function Voice({ s, dispatch, go, lang }) {
  const t = useT(); const [text, setText] = useState(''); const [items, setItems] = useState([]); const [un, setUn] = useState([]); const [err, setErr] = useState(''); const [rec, setRec] = useState(null); const [meal, setMeal] = useState('Breakfast');
  const listen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setErr('Voice input is not available in this browser. Type what you ate instead.'); return; }
    if (rec) { rec.stop(); return; }
    try {
      const r = new SR(); r.lang = localeOf(lang); r.interimResults = false; r.continuous = false;
      r.onresult = (ev) => setText((p) => ((p ? p + ', ' : '') + Array.from(ev.results).map((x) => x[0].transcript).join(' ')).slice(0, 300));
      r.onerror = (ev) => { setRec(null); setErr(ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ? 'Microphone access is blocked here. Type what you ate instead.' : 'Could not hear that. Try again, or type it.'); };
      r.onend = () => setRec(null); setRec(r); setErr(''); r.start();
    } catch { setErr('Voice input could not start. Type what you ate instead.'); }
  };
  const find = () => { const r = parseMeal(text); setItems(r.items); setUn(r.unmatched); if (!r.items.length) setErr('No foods recognised. Try simpler names, like "two eggs and a banana".'); else setErr(''); };
  const bump = (i, d) => setItems(items.map((x, j) => (j === i ? { ...x, qty: Math.max(0.5, Math.min(10, x.qty + d)) } : x)));
  return (
    <div className="scroll">
      <Header label="VOICE LOG" title="SAY WHAT YOU ATE" back={() => go('fuel')} />
      <button className="btn" style={{ height: 64, fontSize: 18 }} onClick={listen}>{rec ? t('LISTENING... TAP TO STOP') : t('TAP TO SPEAK')}</button>
      {err && <div className="warn" role="status">{t(err)}</div>}
      <label className="lbl" htmlFor="vt">{t('WHAT YOU ATE')}</label>
      <textarea id="vt" rows={3} value={text} onChange={(e) => setText(e.target.value.slice(0, 300))} />
      <div className="note">{t('Try:')} {t('"two eggs, a banana and a cup of oatmeal". Speech or typing both work.')}</div>
      <button className="btn2" onClick={find}>{t('FIND FOODS')}</button>
      {un.length > 0 && <div className="note danger">{t('Could not match')}: {un.join(', ')}</div>}
      {items.map((x, i) => (
        <div key={i} className="panel"><div className="row"><b>{t(x.name)}</b><span className="mono">{Math.round(x.kcal * x.qty)} kcal</span></div>
          <div className="row"><div className="row" style={{ gap: 8 }}><button className="step" aria-label={t('Less of this food')} onClick={() => bump(i, -0.5)}>−</button><span className="mono">x{x.qty}</span><button className="step" aria-label={t('More of this food')} onClick={() => bump(i, 0.5)}>+</button></div>
            <button className="link danger" onClick={() => setItems(items.filter((_, j) => j !== i))}>{t('REMOVE')}</button></div></div>
      ))}
      {items.length > 0 && <>
        <Pills options={MEALS.map((m) => [m, m.toUpperCase()])} value={meal} onPick={setMeal} />
        <button className="btn" style={{ height: 54 }} onClick={() => { dispatch({ type: 'foods', meal, xp: 10, items: items.map((x) => ({ name: x.name, kcal: x.kcal * x.qty, p: x.p * x.qty })) }); go('fuel'); }}>{t('LOG ALL (+10 XP)')}</button></>}
      <div className="note">{t("Voice uses your browser's speech recognition where available. Foods are matched to the sample database, so check the amounts.")}</div>
    </div>
  );
}

export function Dungeons({ s, dispatch, go }) {
  const t = useT();
  if (s.wk) {
    const g = s.wk.snap;
    return (
      <div className="scroll">
        <Header label="ACTIVE DUNGEON" title={g.name.toUpperCase()} />
        {s.wk.ex.map((e, i) => <section key={e.n + i} className="panel"><div className="row"><b>{t(e.n)}</b><span className="mono mute">{e.reps} {e.unit === 'sec' ? 'sec' : t('reps')}</span></div>
          {!e.bw && <div className="row" style={{ justifyContent: 'center', gap: 14 }}><button className="step" aria-label={t('Lighter')} disabled={e.done >= e.sets} onClick={() => dispatch({ type: 'wt', i, d: -1 })}>−</button><b className="raj" style={{ fontSize: 24 }}>{e.w} kg{e.pr ? ' ★' : ''}</b><button className="step" aria-label={t('Heavier')} disabled={e.done >= e.sets} onClick={() => dispatch({ type: 'wt', i, d: 1 })}>+</button></div>}
          <div className="row"><span className="mono">{e.done} / {e.sets} {t('SETS').toLowerCase()}</span><button className="btn inline" disabled={e.done >= e.sets} onClick={() => dispatch({ type: 'set', i })}>{t('LOG SET')}</button></div></section>)}
        <button className="btn2" onClick={() => dispatch({ type: 'leave' })}>{s.wk.done ? t('BACK TO GATES') : t('RETREAT')}</button>
      </div>
    );
  }
  const P = progOf(s);
  return (
    <div className="scroll">
      <Header label="DUNGEON GATES" title="DUNGEONS" />
      {P && <div className="note">{t('Program')}: {t(P.name)} · {t(progSession(P, Math.min(s.prog.done, 11)).label)}</div>}
      <button className="btn2" onClick={() => go('builder')}>{t('BUILD YOUR OWN DUNGEON')}</button>
      {allGates(s).map((g) => { const lock = s.level < g.minLevel; return (
        <section key={g.id} className="panel" style={{ opacity: lock ? 0.7 : 1, borderColor: g.id === 'prog' ? 'var(--sky)' : undefined }}>
          <div className="row"><span className="raj" style={{ fontSize: 20 }}>{g.rank} · {t(g.name)}</span><span className="mono mute">+{g.xp} XP</span></div>
          <div className="mute">{t(g.sub)}: {g.ex.map((e) => t(e.n)).join(', ')}</div>
          {lock ? <div className="mute">{t('LOCKED. Reach Level')} {g.minLevel}.</div> : <button className="btn" onClick={() => dispatch({ type: 'enter', g })}>{t('ENTER')}</button>}
          {g.rank === 'MY' && <button className="link danger" onClick={() => dispatch({ type: 'dDel', id: g.id })}>{t('Delete dungeon')}</button>}
        </section>); })}
    </div>
  );
}
