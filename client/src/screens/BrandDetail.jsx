import { useApp } from '../AppContext.jsx';
import { inr, pct } from '../lib.js';
import { Screen, BrandLogo, RiskPill, Spark, Info, Icon, ErrorState } from '../components/ui.jsx';

export default function BrandDetail({ slug }) {
  const { me, brandMap, selected, toggleBrand } = useApp();
  const b = brandMap[slug];
  if (!b) return <Screen title="Brand"><ErrorState message="Brand not found" /></Screen>;
  const spend = me.spends.find(s => s.brand === slug);
  const on = selected.includes(slug);

  return (
    <Screen
      title={b.name}
      cta={<button className={'btn' + (on ? ' ghost' : '')} onClick={() => toggleBrand(slug, true)}>{on ? 'Remove from basket' : 'Add to my basket'}</button>}
    >
      <div className="row">
        <BrandLogo brand={b} large />
        <div className="grow"><div className="mid">{b.company}</div><div className="small sub">NSE: {b.ticker} · {b.category}</div></div>
      </div>
      <div className="between mt16">
        <div>
          <div className="big">{inr(b.price)}</div>
          <div className={'small bold ' + (b.r1y >= 0 ? 'pos' : 'neg')}>{pct(b.r1y)} past 1 year</div>
        </div>
        <RiskPill risk={b.risk} />
      </div>
      <div className="mt12"><Spark seedKey={slug} up={b.r1y >= 0} /></div>
      <div className="tiny sub center">Illustrative 1-year chart</div>

      {spend && (
        <Info kind="ok" icon={Icon.heart} className="mt16">
          You spent <b>{inr(spend.amount)}</b> here across {spend.count} {spend.unit} in the last 30 days. Investing just 10% of that is <b>{inr(spend.amount * 0.1)}</b>.
        </Info>
      )}

      <div className="h2">What this company does</div>
      <div className="card soft small">{b.about}</div>
      <div className="h2">Why the price moves</div>
      <div className="card soft small">{b.why}</div>

      <Info kind="warn" className="mt16">
        Loving a brand doesn't mean its stock will go up. Single stocks can fall 30–50% in a bad year. That's why baskets include a Nifty 50 core.
      </Info>
    </Screen>
  );
}
