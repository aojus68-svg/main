import { useState } from 'react';
import { MEALS, ALLIES, G_BASE, G_GOAL, GROUPS, HIDDEN, LIB, NPCS, SHOP, TITLES } from './data.js';
import { allyBonus, statVal } from './store.js';
import { Bars, Header, Pills, Stepper } from './ui.jsx';
import { useT, localeOf } from './i18n.jsx';
import { scanPhoto } from './coach.js';

const KIND = { level: '#8CC4FF', pr: '#F2C14E', dungeon: '#46D6A0', quest: '#A98BFF', ally: '#38D6F2', guild: '#B7A3FF' };
const short = (v) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(Math.round(v)));

export function PenaltyCard({ s, dispatch }) {
  const t = useT();
  if (!s.pq) return null;
  return (
    <section className="panel" style={{ borderColor: 'var(--bad)' }}>
      <div className="row"><b>{t('PENALTY QUEST: Walk 2 km')}</b><span className="mono" style={{ color: 'var(--bad)' }}>+30 XP</span></div>
      <div className="note">{t('Easy but required. No gold, just 30 XP.')}</div>
      <div className="bar"><i style={{ width: `${(s.pq.km / s.pq.target) * 100}%`, background: 'var(--bad)' }} /></div>
      <div className="row"><span className="mono mute">{s.pq.km} / {s.pq.target} km</span><button className="btn2 inline" onClick={() => dispatch({ type: 'pqStep' })}>+0.5 KM</button></div>
    </section>
  );
}

export function HiddenList({ s }) {
  const t = useT(); const n = HIDDEN.filter((h) => s.hidden[h.id]).length;
  return (
    <>
      <div className="lbl">[ {t('HIDDEN QUESTS')} {n} / {HIDDEN.length} ]</div>
      {HIDDEN.map((h) => { const d = !!s.hidden[h.id]; return (
        <section key={h.id} className="panel" style={{ borderColor: d ? 'var(--good)' : undefined }}>
          <div className="row"><b>{d ? t(h.name) : '???'}</b><span className="mono mute">{d ? t('DONE') : t('LOCKED')}</span></div>
          <div className="note">{d ? `${t('Unlocked')}: ${t(h.req)}. +150 XP, +60 ${t('gold')}.` : t(h.hint)}</div>
        </section>); })}
    </>
  );
}

export function Log({ s, go, lang }) {
  const t = useT();
  const series = s.hist.slice(-6); while (series.length < 6) series.unshift({ vol: 0, xp: 0, kcal: 0 });
  series.push({ vol: s.today.vol, xp: s.today.xp, kcal: Math.round(s.food.reduce((a, f) => a + f.kcal, 0)) });
  const labels = series.map((_, i) => (i === 6 ? t('TODAY') : `D-${6 - i}`));
  const chart = (title, key, color, unit) => {
    const v = series.map((x) => x[key]); const max = Math.max(1, ...v);
    return (
      <section key={key} className="panel"><div className="row"><b>{t(title)}</b><span className="mono mute">{t('7 DAYS')}: {Math.round(v.reduce((a, b) => a + b, 0))} {unit}</span></div>
        <Bars label={`${t(title)}`} data={v.map((x, i) => ({ val: x ? short(x) : '', label: labels[i], h: Math.max(2, Math.round((x / max) * 60)), color }))} /></section>
    );
  };
  return (
    <div className="scroll">
      <Header label="HUNTER LOG" title="PROGRESS" back={() => go('profile')} />
      {chart('VOLUME', 'vol', '#4DA3FF', 'kg')}{chart('XP EARNED', 'xp', '#A98BFF', 'XP')}{chart('CALORIES', 'kcal', '#46D6A0', 'kcal')}
      <div className="lbl">[ {t('EVENTS')} ]</div>
      {!s.log.length && <div className="note">{t('Nothing yet. Clear a dungeon or finish a quest.')}</div>}
      <section className="panel">{s.log.map((e, i) => (
        <div key={i} className="row sep" style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, marginTop: 5, background: KIND[e.k] || '#8CC4FF', flex: 'none' }} />
          <div><div>{t(e.t)}</div><div className="mono mute">{new Date(e.at).toLocaleString(localeOf(lang), { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div></div></div>))}</section>
    </div>
  );
}

export function Guild({ s, dispatch, go }) {
  const t = useT(); const [tab, setTab] = useState('xp');
  const prog = Math.min(G_GOAL, G_BASE + s.c.dungeons); const ready = prog >= G_GOAL && !s.guildClaimed;
  const wxp = s.hist.reduce((a, h) => a + h.xp, 0) + s.today.xp; const wvol = s.hist.reduce((a, h) => a + h.vol, 0) + s.today.vol;
  const me = { n: s.name || 'YOU', lv: s.level, xp: wxp, vol: wvol, st: s.streak, me: true };
  const board = NPCS.concat(s.showLb ? [me] : []).sort((a, b) => b[tab] - a[tab]);
  const fmt = (p) => (tab === 'xp' ? `${Math.round(p.xp)} XP` : tab === 'vol' ? `${Math.round(p.vol)} kg` : `${p.st} d`);
  return (
    <div className="scroll">
      <Header label="GUILD" title="IRON ORDER" back={() => go('profile')} />
      <section className="win"><div className="lbl">[ {t('WEEKLY GOAL')} ]</div>
        <div>{t('Clear 75 dungeons together')}</div>
        <div className="bar"><i style={{ width: `${(prog / G_GOAL) * 100}%`, background: prog >= G_GOAL ? 'var(--good)' : '#B7A3FF' }} /></div>
        <div className="mono mute">{prog} / {G_GOAL}</div>
        <button className="btn" disabled={!ready} onClick={() => dispatch({ type: 'guildClaim' })}>{s.guildClaimed ? t('CLAIMED') : ready ? t('CLAIM REWARD (+200 XP, +150 gold)') : t('GOAL NOT REACHED')}</button>
        <div className="note">{t('Guild members are sample data in this prototype.')}</div></section>
      <Pills cols={3} options={[['xp', 'WEEKLY XP'], ['vol', 'VOLUME'], ['st', 'STREAK']]} value={tab} onPick={setTab} />
      <section className="panel">{board.map((p, i) => (
        <div key={p.n} className="row sep" style={{ minHeight: 48, background: p.me ? 'rgba(27,100,242,.18)' : 'transparent' }}>
          <span><span className="mono mute">{i + 1}</span>&nbsp; <b>{p.me ? `${p.n} (${t('you')})` : p.n}</b> <span className="mono mute">{t('LEVEL')} {p.lv}</span></span><span className="mono">{fmt(p)}</span></div>))}</section>
      <button className="btn2" role="switch" aria-checked={s.showLb} onClick={() => dispatch({ type: 'lbToggle' })}>{s.showLb ? t('SHOWN ON LEADERBOARD') : t('HIDDEN FROM LEADERBOARD')}</button>
    </div>
  );
}

export function Shop({ s, dispatch, go }) {
  const t = useT();
  return (
    <div className="scroll">
      <Header label="SHOP AND ALLIES" title="REWARDS" back={() => go('profile')} />
      <section className="win"><div className="row"><span className="mono mute">{t('GOLD')}</span><span className="raj" style={{ fontSize: 24 }}>{s.gold}</span></div>
        <div className="note">{t('Booster charges')}: {s.booster} · {t('Streak Shields')}: {s.shield} · {t('Ally bonus')}: +{allyBonus(s)}%</div></section>
      {SHOP.map((it) => <section key={it.id} className="panel"><div className="row"><b>{t(it.name)}</b><span className="mono">{it.price} {t('gold')}</span></div><div className="mute">{t(it.desc)}</div>
        <button className="btn2" disabled={s.gold < it.price} onClick={() => dispatch({ type: 'buy', id: it.id })}>{t('BUY')}</button></section>)}
      <div className="lbl">[ {t('ALLIES')} ]</div>
      {ALLIES.map((a) => { const have = s.allies.includes(a.id); const cur = Math.min(statVal(s, a.stat), a.goal); return (
        <section key={a.id} className="panel" style={{ borderColor: have ? 'var(--good)' : undefined }}>
          <div className="row"><b>{t(a.name)}</b><span className="mono">+{a.bonus}% XP</span></div><div className="mute">{t(a.req)}</div>
          <div className="bar"><i style={{ width: `${(cur / a.goal) * 100}%` }} /></div><div className="mono mute">{have ? t('JOINED') : `${Math.round(cur)} / ${a.goal}`}</div></section>); })}
      <div className="lbl">[ {t('TITLES')} ]</div>
      {TITLES.map((x) => { const ok = x.ok(s); const on = s.title === x.id; return (
        <section key={x.id} className="panel row"><div><b>{ok ? t(x.name) : '???'}</b><div className="mute">{t(x.req)}</div></div>
          <button className="btn2 inline" disabled={!ok || on} onClick={() => dispatch({ type: 'title', id: x.id })}>{on ? t('EQUIPPED') : ok ? t('EQUIP') : t('LOCKED')}</button></section>); })}
    </div>
  );
}

export function Builder({ s, dispatch, go }) {
  const t = useT(); const [d, setD] = useState({ name: '', ex: [] }); const [grp, setGrp] = useState('All'); const [q, setQ] = useState('');
  const rows = LIB.filter((l) => (grp === 'All' || l.g === grp) && (!q.trim() || l.n.toLowerCase().includes(q.trim().toLowerCase()))).slice(0, 12);
  const add = (l) => { if (d.ex.length >= 10 || d.ex.some((x) => x.n === l.n)) return; setD({ ...d, ex: [...d.ex, { n: l.n, sets: 3, reps: l.reps || 10, w: l.w || 0, step: l.step || 2.5, bw: !!l.bw, unit: l.unit }] }); };
  const upd = (i, k, delta, lo, hi) => setD({ ...d, ex: d.ex.map((x, j) => (j === i ? { ...x, [k]: Math.min(hi, Math.max(lo, Math.round((x[k] + delta) * 10) / 10)) } : x)) });
  return (
    <div className="scroll">
      <Header label="DUNGEON BUILDER" title="BUILD YOUR OWN" back={() => go('dungeons')} />
      <label htmlFor="dn">{t('Dungeon name')}</label><input id="dn" maxLength={24} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
      {d.ex.map((x, i) => <section key={x.n} className="panel"><div className="row"><b>{t(x.n)}</b><button className="link danger" onClick={() => setD({ ...d, ex: d.ex.filter((_, j) => j !== i) })}>{t('REMOVE')}</button></div>
        <div className="row"><span className="mono">{t('Sets')}</span><span><button className="step" aria-label={t('Fewer sets')} onClick={() => upd(i, 'sets', -1, 1, 8)}>−</button> <b className="mono">{x.sets}</b> <button className="step" aria-label={t('More sets')} onClick={() => upd(i, 'sets', 1, 1, 8)}>+</button></span></div>
        <div className="row"><span className="mono">{x.unit === 'sec' ? t('Seconds') : t('Reps')}</span><span><button className="step" aria-label={t('Fewer reps')} onClick={() => upd(i, 'reps', -1, 1, 200)}>−</button> <b className="mono">{x.reps}</b> <button className="step" aria-label={t('More reps')} onClick={() => upd(i, 'reps', 1, 1, 200)}>+</button></span></div></section>)}
      {!d.ex.length && <div className="note">{t('Add exercises from the list below.')}</div>}
      <button className="btn" onClick={() => { dispatch({ type: 'dBuild', draft: d }); if (d.name.trim() && d.ex.length && s.custom.length < 6) go('dungeons'); }}>{t('SAVE DUNGEON')} ({d.ex.length})</button>
      <div className="lbl">[ {t('EXERCISE LIBRARY')} ]</div>
      <input aria-label={t('Search exercises')} placeholder={t('Search exercises')} maxLength={30} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>{GROUPS.map((g) => <button key={g} className={'pill' + (grp === g ? ' on' : '')} onClick={() => setGrp(g)}>{t(g)}</button>)}</div>
      {rows.map((l) => <div key={l.n} className="row sep"><span>{t(l.n)} <span className="mono mute">{t(l.g)}</span></span><button className="btn2 inline" aria-label={`${t('Add')} ${t(l.n)}`} onClick={() => add(l)}>{t('ADD')}</button></div>)}
    </div>
  );
}

export function Photo({ s, dispatch, go }) {
  const t = useT(); const [busy, setBusy] = useState(false); const [items, setItems] = useState([]); const [msg, setMsg] = useState(''); const [meal, setMeal] = useState('Lunch');
  const pick = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const url = URL.createObjectURL(f); const img = new Image();
    img.onload = async () => {
      const sc = Math.min(1, 800 / Math.max(img.width, img.height)); const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(img.width * sc)); cv.height = Math.max(1, Math.round(img.height * sc));
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
      setBusy(true); setMsg(''); setItems([]);
      const r = await scanPhoto(cv.toDataURL('image/jpeg', 0.8)); setBusy(false);
      if (r.error === 'off') setMsg('Photo scan needs the coach server. See the README to turn it on.');
      else if (r.error) setMsg('The scan failed. Try again, or log the food by search or voice.');
      else if (!r.items.length) setMsg('No food found in that photo.');
      else setItems(r.items);
    };
    img.onerror = () => { URL.revokeObjectURL(url); setMsg('That image could not be used.'); };
    img.src = url; e.target.value = '';
  };
  return (
    <div className="scroll">
      <Header label="PHOTO SCAN" title="SNAP YOUR MEAL" back={() => go('fuel')} />
      <Pills cols={4} options={MEALS.map((m) => [m, m.toUpperCase()])} value={meal} onPick={setMeal} />
      <div style={{ position: 'relative' }}><input id="pm" type="file" accept="image/*" capture="environment" onChange={pick} style={{ position: 'absolute', inset: 0, opacity: 0, height: '100%', cursor: 'pointer' }} /><label htmlFor="pm" className="btn" style={{ pointerEvents: 'none' }}>{busy ? t('Estimating...') : t('TAKE OR CHOOSE A PHOTO')}</label></div>
      {msg && <div className="warn" role="status">{t(msg)}</div>}
      {items.length > 0 && <section className="panel"><div className="lbl">[ {t('ESTIMATE')} ]</div>
        {items.map((x, i) => <div key={i} className="row sep"><span>{x.name}</span><span className="mono">{x.kcal} kcal</span></div>)}
        <button className="btn" onClick={() => { dispatch({ type: 'foods', items, meal, xp: 10 }); go('fuel'); }}>{t('ADD ALL TO DIARY')}</button></section>}
      <div className="note">{t('AI estimates can be far off. Check them before you add. Photos are sent only for the scan and are not stored.')}</div>
    </div>
  );
}
