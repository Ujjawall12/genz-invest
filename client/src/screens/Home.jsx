import { useApp } from '../AppContext.jsx';
import { api } from '../api.js';
import { inr, useFetch } from '../lib.js';
import { Screen, BrandLogo, SquadCard, Loading, ErrorState } from '../components/ui.jsx';

export default function Home() {
  const { me, brandMap, nav } = useApp();
  const portfolio = useFetch(api.portfolio);
  const squads = useFetch(api.squads);
  const topSpends = [...me.spends].sort((a, b) => b.amount - a.amount).slice(0, 4);

  return (
    <Screen home title="Home">
      {portfolio.error ? <ErrorState message={portfolio.error} onRetry={portfolio.reload} />
        : !portfolio.data ? <Loading />
        : (
          <div className="hero">
            <div className="sub small">Total invested</div>
            <div className="big mt4">{inr(portfolio.data.invested)}</div>
            <div className="between mt12 small">
              <span>Current value <b>{inr(portfolio.data.value)}</b></span>
              <span style={{ background: 'rgba(255,255,255,.18)', padding: '3px 8px', borderRadius: 12 }}>
                {portfolio.data.value >= portfolio.data.invested ? '+' : ''}{inr(portfolio.data.value - portfolio.data.invested)}
              </span>
            </div>
          </div>
        )}

      <div className="h2">You spend on them. Own them. <a onClick={() => nav.setTab('brands')}>See all</a></div>
      <div className="hscroll">
        {topSpends.map(s => {
          const b = brandMap[s.brand];
          return (
            <div key={s.brand} className="card nudge click" onClick={() => nav.go('brand', { slug: s.brand })}>
              <div className="row"><BrandLogo brand={b} /><div className="grow"><div className="bold">{b.name}</div><div className="tiny sub">{b.company}</div></div></div>
              <div className="mt12 small">You spent <b>{inr(s.amount)}</b> on {s.count} {s.unit} this month.</div>
              <div className="mt8 small pos bold">Own a piece from ₹100 →</div>
            </div>
          );
        })}
      </div>

      <div className="h2">Your squads <a onClick={() => nav.setTab('squads')}>View all</a></div>
      {squads.error ? <ErrorState message={squads.error} onRetry={squads.reload} />
        : !squads.data ? <Loading />
        : squads.data.slice(0, 2).map(sq => <SquadCard key={sq.id} squad={sq} />)}

      <div className="h2">60-second lesson</div>
      <div className="card soft">
        <div className="bold">Owning a share = owning a tiny slice of the company</div>
        <div className="small mt4">If you own 1 share of Zomato, a tiny part of every order placed on the app is technically working for you. When the company grows, your slice grows too. When it struggles, it shrinks.</div>
      </div>
    </Screen>
  );
}
