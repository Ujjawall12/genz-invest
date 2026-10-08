import { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { api } from '../api.js';
import { inr, timeAgo, useFetch } from '../lib.js';
import { Screen, Ring, RiskPill, Info, Icon, Loading, ErrorState } from '../components/ui.jsx';

function AddMoneySheet({ squad, onDone }) {
  const { closeSheet, toast } = useApp();
  const [amount, setAmount] = useState(1000);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (amount < 100) { toast('Minimum is ₹100'); return; }
    setBusy(true);
    try {
      await api.contribute(squad.id, amount);
      closeSheet();
      toast(`${inr(amount)} added to ${squad.name}`);
      onDone();
    } catch (e) {
      toast(e.message);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mid">Add money to {squad.name}</div>
      <div className="small sub mt4">Goes into {squad.fund.name} in your name</div>
      <div className="amount-input mt16">₹
        <input type="number" inputMode="numeric" autoFocus value={amount || ''} onChange={e => setAmount(Math.max(0, Math.round(+e.target.value || 0)))} aria-label="Amount" />
      </div>
      <div className="chips mt12">
        {[500, 1000, 2000, 5000].map(a => <button key={a} className={'chip' + (amount === a ? ' on' : '')} onClick={() => setAmount(a)}>{inr(a)}</button>)}
      </div>
      <button className="btn mt20" disabled={busy} onClick={submit}>{busy ? 'Adding…' : 'Add (mock)'}</button>
    </>
  );
}

export default function SquadDetail({ id }) {
  const { openSheet, toast } = useApp();
  const { data: sq, error, reload } = useFetch(() => api.squad(id), [id]);

  if (error) return <Screen title="Squad"><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!sq) return <Screen title="Squad"><Loading /></Screen>;

  const maxAmt = Math.max(...sq.members.map(m => m.amount), 1);
  const left = sq.target - sq.total;

  async function nudge() {
    try {
      const { nudged } = await api.nudge(sq.id);
      toast(`Friendly nudge sent to ${nudged} 👋`);
    } catch (e) { toast(e.message); }
  }

  return (
    <Screen
      title={sq.name}
      cta={
        <div className="row">
          <button className="btn ghost" onClick={nudge}>Nudge squad</button>
          <button className="btn" onClick={() => openSheet(<AddMoneySheet squad={sq} onDone={reload} />)}>Add money</button>
        </div>
      }
    >
      <div className="center">
        <div className="emoji lg" style={{ margin: '0 auto' }}>{sq.emoji}</div>
        <div className="mid mt8">{sq.name}</div>
        <div className="small sub">{sq.members.length} members · {sq.months} months to go</div>
      </div>

      <div className="card mt16">
        <div className="row">
          <Ring value={sq.progress} />
          <div className="grow">
            <div className="small sub">Saved together</div>
            <div className="mid">{inr(sq.total)}</div>
            <div className="small sub">of {inr(sq.target)}</div>
            {left > 0
              ? <div className="small mt8">Each person needs <b>{inr(sq.perHeadMonthly)}/month</b> to make it</div>
              : <div className="small pos bold mt8">Goal reached! 🎉</div>}
          </div>
        </div>
      </div>

      <div className="h2">Where the pot is invested</div>
      <div className="card">
        <div className="between"><div className="bold">{sq.fund.name}</div><RiskPill risk={sq.fund.risk} /></div>
        <div className="small mt8">{sq.fund.why}</div>
        <div className="small sub mt8">Expected ~{sq.fund.ret}% a year (illustrative, not guaranteed)</div>
      </div>

      <div className="h2">Contributions</div>
      <div className="card" style={{ padding: '4px 14px' }}>
        {sq.members.map(m => (
          <div key={m.key} className="list-item">
            <div className="cav" style={{ background: m.color }}>{m.name[0]}</div>
            <div className="grow">
              <div className="between"><span className="bold">{m.name}</span><span className="small">{inr(m.amount)}</span></div>
              <div className="bar mt4"><span style={{ width: `${(m.amount / maxAmt * 100).toFixed(0)}%`, background: m.color }} /></div>
            </div>
          </div>
        ))}
      </div>
      <Info icon={Icon.shield} className="mt8">
        <span className="small">Each member owns their own units. If someone leaves, their money goes back to them. Nobody can withdraw yours.</span>
      </Info>

      <div className="h2">Activity</div>
      <div className="feed">
        {sq.feed.map((f, i) => <div key={i} className="f"><span className="dot" /><span>{f.text} · {timeAgo(f.at)}</span></div>)}
      </div>
    </Screen>
  );
}
