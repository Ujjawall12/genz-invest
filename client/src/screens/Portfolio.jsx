import { useApp } from '../AppContext.jsx';
import { api } from '../api.js';
import { inr, pct, useFetch } from '../lib.js';
import { Screen, Info, Loading, ErrorState } from '../components/ui.jsx';

export default function Portfolio() {
  const { nav, toast } = useApp();
  const { data, error, reload } = useFetch(api.portfolio);

  if (error) return <Screen title="Portfolio"><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!data) return <Screen title="Portfolio"><Loading /></Screen>;

  const { basket, squads } = data;
  const parts = [
    { label: 'Love Basket', value: basket?.value ?? 0, color: '#00b386' },
    { label: 'Squad pots (your share)', value: data.squadsValue, color: '#5b5fc7' }
  ];
  const gain = data.value - data.invested;

  async function resetDemo() {
    if (!window.confirm('Reset all demo data to the starting state?')) return;
    try {
      await api.resetDemo();
      toast('Demo data reset');
      nav.setTab('home');
    } catch (e) { toast(e.message); }
  }

  return (
    <Screen title="Portfolio">
      <div className="card">
        <div className="sub small">Current value</div>
        <div className="big mt4">{inr(data.value)}</div>
        <div className="small mt4">Invested {inr(data.invested)} · <span className={'bold ' + (gain >= 0 ? 'pos' : 'neg')}>{gain >= 0 ? '+' : ''}{inr(gain)}</span></div>
        <div className="bar mt12" style={{ height: 10 }}>
          {parts.map(p => <span key={p.label} style={{ width: `${data.value ? (p.value / data.value * 100).toFixed(1) : 0}%`, background: p.color }} />)}
        </div>
        <div className="mt8">
          {parts.map(p => (
            <div key={p.label} className="alloc-row"><span className="sw" style={{ background: p.color }} /><span className="grow">{p.label}</span><b>{inr(p.value)}</b></div>
          ))}
        </div>
      </div>

      <div className="h2">Love Basket</div>
      {basket ? (
        <div className="card" style={{ padding: '4px 14px' }}>
          {basket.items.map(it => (
            <div key={it.slug} className="alloc-row" style={{ padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
              <span className="sw" style={{ background: it.color }} />
              <span className="grow">{it.name}</span>
              <span className={'small ' + (it.r1y >= 0 ? 'pos' : 'neg')} style={{ marginRight: 8 }}>{pct(it.r1y)} 1Y</span>
              <b>{inr(it.amount)}</b>
            </div>
          ))}
          <div className="small sub" style={{ padding: '10px 0' }}>
            {basket.mode === 'sip' ? `SIP of ${inr(basket.amount)}/month · next debit on the 5th` : 'One-time investment'}
          </div>
        </div>
      ) : (
        <div className="card empty">
          No Love Basket yet.
          <div className="mt12"><button className="btn sm" onClick={() => nav.setTab('brands')}>Own what you love</button></div>
        </div>
      )}

      <div className="h2">Squad pots</div>
      {squads.map(sq => (
        <div key={sq.id} className="card click" onClick={() => nav.go('squad', { id: sq.id })}>
          <div className="row">
            <div className="emoji">{sq.emoji}</div>
            <div className="grow"><div className="bold">{sq.name}</div><div className="small sub">{sq.fund.name}</div></div>
            <div style={{ textAlign: 'right' }}><div className="bold">{inr(sq.myShare)}</div><div className="tiny sub">your share</div></div>
          </div>
        </div>
      ))}

      <Info className="mt16"><span className="small">We show long-term returns by default. Daily ups and downs are normal and not a reason to panic-sell.</span></Info>
      <button className="reset-link" onClick={resetDemo}>Reset demo data</button>
    </Screen>
  );
}
