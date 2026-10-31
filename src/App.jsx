import { useEffect, useState } from 'react';
import { useGame } from './store.js';
import { LangContext, initialLang, useT } from './i18n.jsx';
import { Awaken, Dungeons, Fuel, Home, Quests, Voice } from './screens1.jsx';
import { Scan } from './screens4.jsx';
import { Photo, Builder, Guild, Log, Shop } from './screens3.jsx';
import { Body, Coach, Profile, Programs, Recipes, Settings, Sleep, Sync } from './screens2.jsx';

const TAB = { home: 'home', quests: 'quests', fuel: 'fuel', voice: 'fuel', recipes: 'fuel', dungeons: 'dungeons', profile: 'profile', sleep: 'profile', body: 'profile', programs: 'profile', sync: 'profile', settings: 'profile', coach: null, log: 'profile', guild: 'profile', shop: 'profile', builder: 'dungeons', photo: 'fuel', scan: 'fuel' };
const NAV = [['home', 'HOME'], ['quests', 'QUESTS'], ['fuel', 'FUEL'], ['dungeons', 'GATES'], ['profile', 'YOU']];

function Shell() {
  const t = useT();
  const [s, dispatch] = useGame(); const [view, setView] = useState('home'); const [from, setFrom] = useState('fuel');
  const [lang, setLangState] = useState(initialLang); const [theme, setThemeState] = useState(() => { try { return localStorage.getItem('ascend-theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; } });
  useEffect(() => { document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'; }, [lang]);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const setLang = (l) => { try { localStorage.setItem('ascend-lang', l); } catch { /* ignore */ } setLangState(l); };
  const setTheme = (v) => { try { localStorage.setItem('ascend-theme', v); } catch { /* ignore */ } setThemeState(v); };
  const go = (v) => setView(v);
  const ask = () => { setFrom(view); setView('coach'); };
  const props = { s, dispatch, go, lang, from, setLang, theme, setTheme };
  const screens = { home: Home, quests: Quests, fuel: Fuel, voice: Voice, recipes: Recipes, dungeons: Dungeons, profile: Profile, sleep: Sleep, body: Body, programs: Programs, sync: Sync, settings: Settings, coach: Coach, log: Log, guild: Guild, shop: Shop, builder: Builder, photo: Photo, scan: Scan };
  const View = screens[view] || Home;
  return (
    <LangContext.Provider value={lang}>
      <div className="app">
        {!s.started ? <Awaken dispatch={dispatch} lang={lang} setLang={setLang} /> : <>
          {s.toast && <div className={'toast ' + s.toast.k} role="status">{t(s.toast.t)}</div>}
          <View {...props} />
          {view !== 'coach' && <button className="btn ask" aria-label={t('Ask the AI coach a question')} onClick={ask}>{t('ASK COACH')}</button>}
          <nav aria-label={t('Primary')}>{NAV.map(([k, l]) => <button key={k} className={(TAB[view] === k ? 'on ' : '') + (k === 'fuel' ? 'fuel' : '')} onClick={() => go(k)}>{t(l)}</button>)}</nav>
        </>}
      </div>
    </LangContext.Provider>
  );
}
export default function App() { return <Shell />; }
