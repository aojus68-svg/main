import { useT } from './i18n.jsx';

export const Icon = ({ d, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
export function Header({ label, title, back }) {
  const t = useT();
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {back && <button className="back" aria-label={t('Back')} onClick={back}><Icon size={20} d={<path d="M15 6l-6 6 6 6" />} /></button>}
      <div><div className="lbl">[ {t(label)} ]</div><h1 className="raj" style={{ fontSize: back ? 26 : 34 }}>{t(title)}</h1></div>
    </header>
  );
}
export function Stepper({ value, onMinus, onPlus, minusLabel, plusLabel }) {
  const t = useT();
  return (
    <div className="row" style={{ justifyContent: 'center', gap: 18 }}>
      <button className="step" aria-label={t(minusLabel)} onClick={onMinus}>−</button>
      <div className="raj" style={{ fontSize: 30, minWidth: 80, textAlign: 'center' }}>{value}</div>
      <button className="step" aria-label={t(plusLabel)} onClick={onPlus}>+</button>
    </div>
  );
}
export function Pills({ options, value, onPick, cols = 2 }) {
  const t = useT();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 8 }}>
      {options.map(([k, label]) => <button key={k} className={'pill' + (value === k ? ' on' : '')} onClick={() => onPick(k)}>{t(label)}</button>)}
    </div>
  );
}
export function Bars({ data, color, label }) {
  return (
    <div role="img" aria-label={label}>
      <div className="bars">{data.map((d, i) => <div key={i}><span className="mono mute" style={{ whiteSpace: 'nowrap' }}>{d.val}</span><b style={{ height: d.h, background: d.empty ? 'var(--track)' : d.color || color }} /></div>)}</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }} aria-hidden="true">{data.map((d, i) => <span key={i} className="mono mute" style={{ flex: 1, textAlign: 'center' }}>{d.label}</span>)}</div>
    </div>
  );
}
