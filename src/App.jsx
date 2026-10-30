import { useState } from 'react';
import { askCoach } from './coach.js';
import { useGame } from './store.js';
import { DAILY, FOODS, GATES, GOALS, MEALS, RANKS, rankOf, xpNeed } from './data.js';

const Header = ({ label, title }) => <header><div className="lbl">[ {label} ]</div><h1 className="raj">{title}</h1></header>;

function Awaken({ dispatch }) {
  const [name, setName] = useState(''); const [goal, setGoal] = useState('muscle');
  return (
    <div className="scroll">
      <Header label="SYSTEM" title="AWAKEN" />
      <div className="mute">Register as a player. Your goal sets your daily calorie and protein targets.</div>
      <label className="lbl" htmlFor="nm">PLAYER NAME</label>
      <input id="nm" value={name} maxLength={16} onChange={(e) => setName(e.target.value)} />
      {Object.entries(GOALS).map(([k, g]) => (
        <button key={k} className={'panel pill' + (goal === k ? ' on' : '')} style={{ alignItems: 'flex-start', textAlign: 'left', padding: 14 }} onClick={() => setGoal(k)}>
          <span className="raj" style={{ fontSize: 18 }}>{g.label}</span><span className="mute">{g.sub} · {g.kcal} kcal</span>
        </button>
      ))}
      <button className="btn" onClick={() => dispatch({ type: 'start', name: name.trim(), goal })}>BEGIN</button>
    </div>
  );
}

function Home({ s }) {
  const need = xpNeed(s.level);
  return (
    <div className="scroll">
      <Header label="STATUS WINDOW" title={s.name.toUpperCase()} />
      <div className="mono mute">LEVEL {s.level} · RANK {RANKS[rankOf(s.level)]} · STREAK {s.streak}</div>
      <section className="win"><div className="row"><span className="lbl">XP</span><span className="mono">{s.xp} / {need}</span></div><div className="bar"><i style={{ width: `${(s.xp / need) * 100}%` }} /></div>
        <div className="row mute"><span>GOLD {s.gold}</span><span>GATES CLEARED {s.cleared}</span></div></section>
      <section className="panel"><div className="lbl">[ TODAY ]</div>
        {DAILY.map((q) => <div key={q.id} className="row sep"><span style={{ textDecoration: s.qDone[q.id] ? 'line-through' : 'none', color: s.qDone[q.id] ? 'var(--mute)' : 'inherit' }}>{q.name}</span><span className="mono mute">{s.qDone[q.id] ? 'DONE' : `+${q.xp} XP`}</span></div>)}
      </section>
    </div>
  );
}

function Quests({ s, dispatch }) {
  return (
    <div className="scroll">
      <Header label="QUEST BOARD" title="DAILY QUESTS" />
      {DAILY.map((q) => {
        const cur = q.id === 'protein' ? Math.round(s.qp.protein || 0) : s.qp[q.id] || 0; const tgt = q.id === 'protein' ? GOALS[s.goal].p : q.target;
        return (
          <section key={q.id} className="panel">
            <div className="row"><span style={{ fontWeight: 600 }}>{q.name}</span><span className="mono mute">+{q.xp} XP · +{q.gold} gold</span></div>
            <div className="bar"><i style={{ width: `${Math.min(100, (cur / tgt) * 100)}%` }} /></div>
            <div className="row"><span className="mono mute">{cur} / {tgt}</span>
              {q.auto ? <span className="mute">Updates from your Fuel diary</span> : <button className="btn2" style={{ width: 'auto', height: 44 }} disabled={s.qDone[q.id]} onClick={() => dispatch({ type: 'quest', id: q.id, target: q.target, step: q.step })}>+{q.step}</button>}</div>
          </section>
        );
      })}
    </div>
  );
}

function Fuel({ s, dispatch }) {
  const [meal, setMeal] = useState('Breakfast'); const [q, setQ] = useState('');
  const g = GOALS[s.goal]; const eaten = Math.round(s.food.reduce((a, f) => a + f.kcal, 0)); const left = g.kcal - eaten;
  const hits = FOODS.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="scroll">
      <Header label="FUEL" title="DIARY" />
      <section className="win"><div className="row"><div><div className="raj" style={{ fontSize: 34 }}>{left}</div><div className="mute">CALORIES LEFT</div></div><div className="mono mute" style={{ textAlign: 'right' }}>GOAL {g.kcal}<br />FOOD {eaten}</div></div></section>
      <section className="panel"><div className="row"><span className="lbl">[ WATER ]</span><span className="mono">{s.water} / 8 cups</span></div>
        <div className="row"><button className="step" aria-label="Less water" onClick={() => dispatch({ type: 'water', d: -1 })}>−</button><div className="bar" style={{ flex: 1 }}><i style={{ width: `${Math.min(100, s.water / 8 * 100)}%` }} /></div><button className="step" aria-label="More water" onClick={() => dispatch({ type: 'water', d: 1 })}>+</button></div></section>
      <div className="lbl">ADD TO</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{MEALS.map((m) => <button key={m} className={'pill' + (meal === m ? ' on' : '')} onClick={() => setMeal(m)}>{m.toUpperCase()}</button>)}</div>
      <input aria-label="Search foods" placeholder="Search foods" value={q} onChange={(e) => setQ(e.target.value)} />
      <section className="panel">{hits.map((f) => <div key={f.name} className="row sep"><div><div>{f.name}</div><div className="mono mute">{f.kcal} kcal · P {f.p} g</div></div><button className="btn2" style={{ width: 'auto', height: 44 }} onClick={() => dispatch({ type: 'food', meal, name: f.name, kcal: f.kcal, p: f.p })}>ADD</button></div>)}{!hits.length && <div className="mute">No matches.</div>}</section>
      {MEALS.map((m) => { const items = s.food.filter((f) => f.meal === m); return items.length ? (
        <section key={m} className="panel"><div className="raj" style={{ fontSize: 20 }}>{m}</div>{items.map((f) => <div key={f.id} className="row sep"><span>{f.name} <span className="mono mute">{f.kcal} kcal</span></span><button aria-label={`Remove ${f.name}`} onClick={() => dispatch({ type: 'unfood', id: f.id })} style={{ background: 'none', border: 0, color: 'var(--bad)', minHeight: 44 }}>REMOVE</button></div>)}</section>) : null; })}
    </div>
  );
}

function Dungeons({ s, dispatch }) {
  if (s.wk) {
    const g = GATES.find((x) => x.id === s.wk.gid);
    return (
      <div className="scroll">
        <Header label="ACTIVE DUNGEON" title={g.name.toUpperCase()} />
        {s.wk.ex.map((e, i) => <section key={e.n} className="panel"><div className="row"><b>{e.n}</b><span className="mono mute">{e.w} kg · {e.reps} reps</span></div>
          <div className="row"><span className="mono">{e.done} / {e.sets} sets</span><button className="btn" style={{ width: 'auto' }} disabled={e.done >= e.sets} onClick={() => dispatch({ type: 'set', i })}>LOG SET</button></div></section>)}
        <button className="btn2" onClick={() => dispatch({ type: 'leave' })}>{s.wk.done ? 'BACK TO GATES' : 'RETREAT'}</button>
      </div>
    );
  }
  return (
    <div className="scroll">
      <Header label="DUNGEON GATES" title="DUNGEONS" />
      {GATES.map((g) => { const lock = s.level < g.minLevel; return (
        <section key={g.id} className="panel" style={{ opacity: lock ? 0.7 : 1 }}>
          <div className="row"><span className="raj" style={{ fontSize: 20 }}>{g.rank} · {g.name}</span><span className="mono mute">+{g.xp} XP</span></div>
          <div className="mute">{g.sub}: {g.ex.map((e) => e.n).join(', ')}</div>
          {lock ? <div className="mute">LOCKED. Reach level {g.minLevel}.</div> : <button className="btn" onClick={() => dispatch({ type: 'enter', g })}>ENTER</button>}
        </section>); })}
    </div>
  );
}

function Profile({ s, dispatch }) {
  return (
    <div className="scroll">
      <Header label="PLAYER PROFILE" title={s.name.toUpperCase()} />
      <section className="win" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[['LEVEL', s.level], ['RANK', RANKS[rankOf(s.level)]], ['GOLD', s.gold], ['STREAK', s.streak], ['GATES', s.cleared], ['GOAL', GOALS[s.goal].label]].map(([k, v]) => <div key={k}><div className="mono mute">{k}</div><div className="raj" style={{ fontSize: 22 }}>{v}</div></div>)}
      </section>
      <button className="btn2" onClick={() => dispatch({ type: 'day' })}>ADVANCE TO NEXT DAY (DEMO)</button>
      <button className="btn2" style={{ color: 'var(--bad)' }} onClick={() => { if (confirm('Erase all progress?')) dispatch({ type: 'reset' }); }}>RESET PROGRESS</button>
    </div>
  );
}

function Coach({ s }) {
  const [turns, setTurns] = useState([]); const [q, setQ] = useState(''); const [busy, setBusy] = useState(false);
  const send = async (text) => {
    text = text.trim().slice(0, 500); if (!text || busy) return;
    const history = turns.map((t) => ({ role: t.role, content: t.text }));
    setTurns((t) => [...t, { role: 'user', text }]); setQ(''); setBusy(true);
    const a = await askCoach(text, s, history);
    setTurns((t) => [...t, { role: 'assistant', text: a.text, ai: a.ai }]); setBusy(false);
  };
  return (
    <div className="scroll">
      <Header label="AI COACH" title="ASK ME" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{['Review my day', 'What should I eat next?', 'Plan my next workout'].map((c) => <button key={c} className="pill" onClick={() => send(c)}>{c}</button>)}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-live="polite">
        {turns.map((t, i) => <div key={i} className="panel" style={{ alignSelf: t.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%', whiteSpace: 'pre-wrap' }}><span className="mono mute">{t.role === 'user' ? 'YOU' : t.ai ? 'COACH (AI)' : 'COACH'}</span>{t.text}</div>)}
        {busy && <div className="mute">Thinking...</div>}
      </div>
      <form className="row" onSubmit={(e) => { e.preventDefault(); send(q); }}>
        <input aria-label="Message" maxLength={500} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about food, training, sleep" />
        <button className="btn" style={{ width: 'auto' }} disabled={busy}>SEND</button>
      </form>
      <div className="mute">Replies are not medical advice. {import.meta.env.VITE_COACH_URL ? '' : 'Basic mode: answers use your diary numbers. See README to enable the AI coach.'}</div>
    </div>
  );
}

export default function App() {
  const [s, dispatch] = useGame(); const [tab, setTab] = useState('home');
  if (!s.started) return <div className="app"><Awaken dispatch={dispatch} /></div>;
  const View = { home: Home, quests: Quests, fuel: Fuel, dungeons: Dungeons, profile: Profile, coach: Coach }[tab];
  return (
    <div className="app">
      {s.toast && <div className={'toast ' + s.toast.k} role="status">{s.toast.t}</div>}
      <View s={s} dispatch={dispatch} />
      {tab !== 'coach' && <button className="btn ask" aria-label="Ask the AI coach" onClick={() => setTab('coach')}>ASK COACH</button>}
      <nav aria-label="Primary">{[['home', 'HOME'], ['quests', 'QUESTS'], ['fuel', 'FUEL'], ['dungeons', 'GATES'], ['profile', 'YOU']].map(([k, l]) => <button key={k} className={(tab === k ? 'on ' : '') + (k === 'fuel' ? 'fuel' : '')} onClick={() => setTab(k)}>{l}</button>)}</nav>
    </div>
  );
}
