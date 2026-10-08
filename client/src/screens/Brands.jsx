import { useApp } from '../AppContext.jsx';
import { api } from '../api.js';
import { inr, pct, useFetch } from '../lib.js';
import { Screen, BrandLogo, Check, Icon } from '../components/ui.jsx';

export default function Brands() {
  const { me, brands, brandMap, selected, toggleBrand, nav } = useApp();
  const basket = useFetch(api.basket);
  const spends = [...me.spends].sort((a, b) => b.amount - a.amount);
  const spentOn = new Set(spends.map(s => s.brand));
  const others = brands.filter(b => !spentOn.has(b.slug));
  const n = selected.length;
  const live = basket.data;

  return (
    <Screen
      title="Own What You Love"
      cta={<button className="btn" disabled={!n} onClick={() => nav.go('build')}>{n ? `Build my basket (${n})` : 'Select brands to continue'}</button>}
    >
      <div className="card green">
        <div className="bold">Turn your spending into owning</div>
        <div className="small mt4">Pick up to 5 brands you already use. We'll build a basket and pair it with a Nifty 50 safety core.</div>
      </div>

      {live && (
        <div className="card click mt12" onClick={() => nav.setTab('portfolio')}>
          <div className="between">
            <div>
              <div className="bold">Your Love Basket is live</div>
              <div className="small sub">{live.brands.map(s => brandMap[s].name).join(', ')} · {inr(live.amount)}{live.mode === 'sip' ? '/month' : ''}</div>
            </div>
            {Icon.chev}
          </div>
        </div>
      )}

      <div className="h2">Based on your spends <span className="pill grey">Last 30 days · mock</span></div>
      <div className="card" style={{ padding: '4px 14px' }}>
        {spends.map(s => {
          const b = brandMap[s.brand];
          return (
            <div key={s.brand} className="list-item">
              <div className="row grow" style={{ cursor: 'pointer' }} onClick={() => nav.go('brand', { slug: s.brand })}>
                <BrandLogo brand={b} />
                <div className="grow"><div className="bold">{b.name}</div><div className="small sub">Spent {inr(s.amount)} · {s.count} {s.unit}</div></div>
              </div>
              <Check on={selected.includes(s.brand)} onClick={() => toggleBrand(s.brand)} label={`Select ${b.name}`} />
            </div>
          );
        })}
      </div>

      <div className="h2">Explore more brands</div>
      <div className="grid2">
        {others.map(b => {
          const on = selected.includes(b.slug);
          return (
            <div key={b.slug} className={'bcard' + (on ? ' on' : '')} onClick={() => nav.go('brand', { slug: b.slug })}>
              <Check on={on} onClick={e => { e.stopPropagation(); toggleBrand(b.slug); }} label={`Select ${b.name}`} />
              <BrandLogo brand={b} />
              <div className="bold mt8">{b.name}</div>
              <div className="tiny sub">{b.category}</div>
              <div className={'small mt4 ' + (b.r1y >= 0 ? 'pos' : 'neg')}>{pct(b.r1y)} 1Y</div>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
