import { useEffect, useRef, useState } from 'react';
import base from './products.json';
import { MEALS } from './data.js';
import { Header, Pills, Stepper } from './ui.jsx';
import { useT } from './i18n.jsx';

export const lookup = (s, code) => (s.products && s.products[code]) || base[code] || null;
const cleanCode = (v) => String(v).replace(/\D/g, '').slice(0, 14);

export function Scan({ s, dispatch, go }) {
  const t = useT(); const video = useRef(null); const stream = useRef(null); const timer = useRef(0);
  const [cam, setCam] = useState(false); const [code, setCode] = useState(''); const [prod, setProd] = useState(null); const [missing, setMissing] = useState('');
  const [msg, setMsg] = useState(''); const [n, setN] = useState(1); const [meal, setMeal] = useState('Snack');
  const [f, setF] = useState({ name: '', kcal: '', p: '', serving: '' });
  const canCam = typeof window !== 'undefined' && 'BarcodeDetector' in window && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const stop = () => { clearInterval(timer.current); if (stream.current) stream.current.getTracks().forEach((x) => x.stop()); stream.current = null; setCam(false); };
  useEffect(() => stop, []); // eslint-disable-line react-hooks/exhaustive-deps
  const find = (raw) => {
    const c = cleanCode(raw); setMsg('');
    if (c.length < 6) { setMsg('A barcode has 6 to 14 digits.'); return; }
    dispatch({ type: 'scanned' });
    const p = lookup(s, c); setCode(c); setN(1);
    if (p) { setProd(p); setMissing(''); } else { setProd(null); setMissing(c); }
  };
  const start = async () => {
    setMsg('');
    try {
      const det = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setCam(true);
      setTimeout(() => { if (video.current && stream.current) { video.current.srcObject = stream.current; video.current.play().catch(() => {}); } }, 0);
      timer.current = setInterval(async () => {
        try { const r = await det.detect(video.current); if (r && r[0] && r[0].rawValue) { stop(); find(r[0].rawValue); } } catch { /* keep trying */ }
      }, 400);
    } catch { stop(); setMsg('The camera could not be opened. Type the barcode number instead.'); }
  };
  const mine = Object.entries(s.products || {});
  return (
    <div className="scroll">
      <Header label="BARCODE SCAN" title="SCAN A PRODUCT" back={() => { stop(); go('fuel'); }} />
      {cam && <section className="panel"><video ref={video} muted playsInline aria-label={t('Camera view')} style={{ width: '100%', borderRadius: 8, background: '#000' }} /><button className="btn2" onClick={stop}>{t('STOP CAMERA')}</button></section>}
      {!cam && canCam && <button className="btn" onClick={start}>{t('OPEN CAMERA')}</button>}
      {!canCam && <div className="note">{t('This browser cannot scan with the camera. Type the barcode number below.')}</div>}
      <form className="row" onSubmit={(e) => { e.preventDefault(); find(code); }}>
        <input aria-label={t('Barcode number')} inputMode="numeric" placeholder={t('Barcode number')} maxLength={14} value={code} onChange={(e) => setCode(cleanCode(e.target.value))} />
        <button className="btn inline">{t('LOOK UP')}</button></form>
      {msg && <div className="warn" role="status">{t(msg)}</div>}
      {prod && <section className="win"><div className="mono mute">{prod.brand}</div><div className="raj" style={{ fontSize: 22 }}>{prod.name}</div><div className="mute">{prod.serving}</div>
        <Stepper value={`${n}x`} minusLabel="Fewer servings" plusLabel="More servings" onMinus={() => setN(Math.max(0.5, n - 0.5))} onPlus={() => setN(Math.min(10, n + 0.5))} />
        <div className="mono" style={{ textAlign: 'center' }}>{Math.round(prod.kcal * n)} kcal · {Math.round(prod.p * n * 10) / 10} g {t('protein')}</div>
        <Pills cols={4} options={MEALS.map((m) => [m, m.toUpperCase()])} value={meal} onPick={setMeal} />
        <button className="btn" onClick={() => { dispatch({ type: 'food', meal, name: n === 1 ? prod.name : `${prod.name} x${n}`, kcal: prod.kcal * n, p: prod.p * n }); setProd(null); setCode(''); }}>{t('ADD TO DIARY (+10 XP)')}</button></section>}
      {missing && <section className="panel"><div className="lbl">[ {t('NOT IN THE DATABASE')} ]</div>
        <div className="note">{t('Add it once from the label and it will pop up every time you scan it.')} ({missing})</div>
        <label htmlFor="pn">{t('Product name')}</label><input id="pn" maxLength={60} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <label htmlFor="ps">{t('Serving (for example 1 bar, 40 g)')}</label><input id="ps" maxLength={30} value={f.serving} onChange={(e) => setF({ ...f, serving: e.target.value })} />
        <div className="grid2"><div><label htmlFor="pk">{t('Calories per serving')}</label><input id="pk" inputMode="decimal" maxLength={5} value={f.kcal} onChange={(e) => setF({ ...f, kcal: e.target.value })} /></div>
          <div><label htmlFor="pp">{t('Protein (g)')}</label><input id="pp" inputMode="decimal" maxLength={5} value={f.p} onChange={(e) => setF({ ...f, p: e.target.value })} /></div></div>
        <button className="btn" onClick={() => { const item = { name: f.name, kcal: parseFloat(f.kcal), p: parseFloat(f.p || '0'), serving: f.serving }; dispatch({ type: 'prodSave', code: missing, item });
          if (item.name.trim() && item.kcal >= 0 && item.kcal <= 3000 && item.p >= 0 && item.p <= 300) { setProd({ ...item, brand: 'MY PRODUCT', serving: item.serving || '1 serving' }); setMissing(''); setF({ name: '', kcal: '', p: '', serving: '' }); } }}>{t('SAVE TO MY DATABASE')}</button></section>}
      <div className="lbl">[ {t('MY PRODUCTS')} {mine.length} ]</div>
      {!mine.length && <div className="note">{t('Products you save appear here. They stay on this device.')}</div>}
      {mine.map(([c, p]) => <div key={c} className="row sep"><span>{p.name} <span className="mono mute">{c} · {p.kcal} kcal</span></span><button className="link danger" aria-label={`${t('Delete')} ${p.name}`} onClick={() => dispatch({ type: 'prodDel', code: c })}>{t('DELETE')}</button></div>)}
      <div className="note">{t('Built-in products are samples. Check calories against the pack. Nutrition values you save are your own entries.')}</div>
    </div>
  );
}
