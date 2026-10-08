import { useApp } from '../AppContext.jsx';
import { inr, initials } from '../lib.js';

const svg = (children, size = 20, extra = {}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...extra}>{children}</svg>
);

export const Icon = {
  back: svg(<path d="M15 18l-6-6 6-6" />, 22),
  check: svg(<path d="M5 12l5 5L20 7" />, 14, { strokeWidth: 3 }),
  info: svg(<><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>, 16),
  shield: svg(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, 16),
  heart: svg(<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z" />, 16),
  plus: svg(<path d="M12 5v14M5 12h14" />, 18, { strokeWidth: 2.4 }),
  chev: svg(<path d="M9 18l6-6-6-6" />, 18, { stroke: '#a3a5b3' }),
  bell: svg(<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />),
  home: svg(<path d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" />, 22),
  heartTab: svg(<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z" />, 22),
  users: svg(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8" /></>, 22),
  pie: svg(<><path d="M21.2 15.9A10 10 0 118 2.8" /><path d="M22 12A10 10 0 0012 2v10z" /></>, 22)
};

const TABS = [
  ['home', 'Home', Icon.home], ['brands', 'Own It', Icon.heartTab],
  ['squads', 'Squads', Icon.users], ['portfolio', 'Portfolio', Icon.pie]
];

export function Screen({ title, action, home, hideTabs, cta, children }) {
  const { nav, me, toast } = useApp();
  return (
    <>
      <header className="topbar">
        {nav.depth > 1 ? (
          <><button className="iconbtn" onClick={nav.back} aria-label="Back">{Icon.back}</button><h1>{title}</h1>{action}</>
        ) : home ? (
          <>
            <div className="logo">g</div>
            <h1>Hi {me?.name} 👋</h1>
            <button className="iconbtn" onClick={() => toast('No new notifications')} aria-label="Notifications">{Icon.bell}</button>
            <div className="avatar-me">{me?.name?.[0]}</div>
          </>
        ) : (
          <><h1>{title}</h1>{action}</>
        )}
      </header>
      <main className={'view' + (cta ? ' has-cta' : '')}>{children}</main>
      {cta && <div className={'cta' + (hideTabs ? ' notab' : '')}>{cta}</div>}
      {!hideTabs && (
        <nav className="tabbar">
          {TABS.map(([id, label, ic]) => (
            <button key={id} className={'tab' + (nav.tab === id ? ' active' : '')} onClick={() => nav.setTab(id)}>
              {ic}<span>{label}</span>
            </button>
          ))}
        </nav>
      )}
    </>
  );
}

export const BrandLogo = ({ brand, large }) => (
  <div className={'blogo' + (large ? ' lg' : '')} style={{ background: brand.color }}>{initials(brand.name)}</div>
);

export const RiskPill = ({ risk }) => <span className={`pill ${risk.toLowerCase()}`}>{risk} risk</span>;

export const Check = ({ on, onClick, label }) => (
  <button className={'check' + (on ? ' on' : '')} onClick={onClick} aria-label={label} aria-pressed={on}>{on && Icon.check}</button>
);

export function Info({ kind = 'neutral', icon = Icon.info, children, className = '' }) {
  return <div className={`info ${kind} ${className}`}>{icon}<div>{children}</div></div>;
}

export function Spark({ seedKey, up }) {
  let seed = [...seedKey].reduce((a, c) => a + c.charCodeAt(0), 0) * 7 + 13;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  let v = 50;
  const pts = [];
  for (let i = 0; i < 40; i++) { v += (rnd() - 0.5) * 7 + (up ? 0.45 : -0.45); pts.push(v); }
  const min = Math.min(...pts), max = Math.max(...pts);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${(i / 39 * 300).toFixed(1)},${(72 - (p - min) / ((max - min) || 1) * 64).toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="spark" role="img" aria-label="Illustrative price chart">
      <path d={d} fill="none" stroke={up ? 'var(--green)' : 'var(--red)'} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Ring({ value, size = 104 }) {
  const r = (size - 14) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.min(value, 1)), h = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(value * 100)}% saved`}>
      <circle cx={h} cy={h} r={r} fill="none" stroke="#ebebf0" strokeWidth="10" />
      <circle cx={h} cy={h} r={r} fill="none" stroke="var(--green)" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={c.toFixed(1)} strokeDashoffset={off.toFixed(1)} transform={`rotate(-90 ${h} ${h})`} />
      <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize="22" fontWeight="700" fill="#2b2d3a">{Math.round(value * 100)}%</text>
    </svg>
  );
}

export const MembersStack = ({ members }) => (
  <div className="members">
    {members.slice(0, 4).map(m => <div key={m.key} className="m" style={{ background: m.color }}>{m.name[0]}</div>)}
    {members.length > 4 && <div className="m" style={{ background: '#a3a5b3' }}>+{members.length - 4}</div>}
  </div>
);

export function SquadCard({ squad }) {
  const { nav } = useApp();
  return (
    <div className="card click" onClick={() => nav.go('squad', { id: squad.id })}>
      <div className="row">
        <div className="emoji">{squad.emoji}</div>
        <div className="grow">
          <div className="between"><span className="bold">{squad.name}</span><MembersStack members={squad.members} /></div>
          <div className="small sub">{inr(squad.total)} of {inr(squad.target)} · {squad.months} mo left</div>
        </div>
      </div>
      <div className="bar mt12"><span style={{ width: `${Math.min(squad.progress * 100, 100).toFixed(0)}%`, background: 'var(--green)' }} /></div>
    </div>
  );
}

export const Loading = () => <div className="loading"><div className="spin" />Loading…</div>;

export const ErrorState = ({ message, onRetry }) => (
  <div className="err">
    <div className="bold">Couldn't load this</div>
    <div className="small sub mt4">{message}</div>
    {onRetry && <button className="btn sm mt12" onClick={onRetry}>Try again</button>}
  </div>
);
