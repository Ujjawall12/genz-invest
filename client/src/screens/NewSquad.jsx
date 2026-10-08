import { useEffect, useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { api } from '../api.js';
import { inr } from '../lib.js';
import { Screen, RiskPill, MembersStack, Icon } from '../components/ui.jsx';

const EMOJIS = ['🏖️', '🏠', '🎸', '💻', '🚗', '🎂', '✈️', '🏔️', '💍', '🎮'];
const ME = { key: 'me', name: 'You', color: '#5b5fc7' };

function Steps({ step }) {
  return <div className="steps">{[1, 2, 3].map(i => <span key={i} className={i <= step ? 'on' : ''} />)}</div>;
}

export default function NewSquad() {
  const { me, nav, toast } = useApp();
  const [f, setF] = useState({ step: 1, name: '', emoji: EMOJIS[0], target: 0, months: 6, members: [] });
  const [fund, setFund] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = patch => setF(s => ({ ...s, ...patch }));

  // Live fund recommendation from the API as the timeline slider moves
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      api.fund(f.months).then(r => !cancelled && setFund(r)).catch(() => {});
    }, 150);
    return () => { cancelled = true; clearTimeout(t); };
  }, [f.months]);

  const toggleMember = key => set({ members: f.members.includes(key) ? f.members.filter(k => k !== key) : [...f.members, key] });

  async function create() {
    setBusy(true);
    try {
      const sq = await api.createSquad({ name: f.name, emoji: f.emoji, target: f.target, months: f.months, memberKeys: f.members });
      toast('Squad created · invites sent');
      nav.reset('squads', [['squads'], ['squad', { id: sq.id }]]);
    } catch (e) {
      toast(e.message);
      setBusy(false);
    }
  }

  if (f.step === 1) {
    const valid = f.name.trim() && f.target >= 500;
    return (
      <Screen title="New squad" hideTabs cta={<button className="btn" disabled={!valid} onClick={() => set({ step: 2 })}>Next: invite friends</button>}>
        <Steps step={1} />
        <div className="mid">What are you saving for?</div>
        <div className="field"><label>Pick an icon</label>
          <div className="chips">
            {EMOJIS.map(e => (
              <button key={e} className={'chip' + (f.emoji === e ? ' on' : '')} style={{ fontSize: 20, padding: '6px 10px' }} onClick={() => set({ emoji: e })}>{e}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="sqName">Squad name</label>
          <input id="sqName" type="text" maxLength={40} placeholder="e.g. Manali Trip" value={f.name} onChange={e => set({ name: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="sqTarget">Target amount (₹, min 500)</label>
          <input id="sqTarget" type="number" inputMode="numeric" placeholder="e.g. 50000" value={f.target || ''}
            onChange={e => set({ target: Math.max(0, Math.round(+e.target.value || 0)) })} />
        </div>
        <div className="field">
          <label htmlFor="sqMonths">When do you need it? <b className="bold">· in {f.months} month{f.months > 1 ? 's' : ''}</b></label>
          <input id="sqMonths" type="range" min="1" max="60" value={f.months} onChange={e => set({ months: +e.target.value })} />
          <div className="between tiny sub"><span>1 month</span><span>5 years</span></div>
        </div>
        <div className="h2">We'll invest it in</div>
        {fund && (
          <div className="card">
            <div className="between"><span className="bold">{fund.name}</span><RiskPill risk={fund.risk} /></div>
            <div className="small mt8">{fund.why}</div>
          </div>
        )}
      </Screen>
    );
  }

  if (f.step === 2) {
    const n = f.members.length;
    return (
      <Screen title="Invite friends" hideTabs cta={<button className="btn" disabled={!n} onClick={() => set({ step: 3 })}>{n ? `Next (${n} invited)` : 'Invite at least 1 friend'}</button>}>
        <Steps step={2} />
        <div className="mid">Who's in?</div>
        <div className="small sub mt4">They'll get an invite link. Each person invests from their own account.</div>
        <div className="card mt16" style={{ padding: '4px 14px' }}>
          {me.contacts.map(c => {
            const on = f.members.includes(c.key);
            return (
              <div key={c.key} className="contact" onClick={() => toggleMember(c.key)} role="checkbox" aria-checked={on}>
                <div className="cav" style={{ background: c.color }}>{c.name[0]}</div>
                <div className="grow bold">{c.name}</div>
                <span className={'check' + (on ? ' on' : '')}>{on && Icon.check}</span>
              </div>
            );
          })}
        </div>
      </Screen>
    );
  }

  const size = f.members.length + 1;
  const members = [ME, ...me.contacts.filter(c => f.members.includes(c.key))];
  return (
    <Screen title="Review squad" hideTabs cta={<button className="btn" disabled={busy} onClick={create}>{busy ? 'Creating…' : 'Create squad & send invites'}</button>}>
      <Steps step={3} />
      <div className="center"><div className="emoji lg" style={{ margin: '0 auto' }}>{f.emoji}</div><div className="mid mt8">{f.name}</div></div>
      <div className="card mt16">
        <div className="between small"><span className="sub">Target</span><b>{inr(f.target)}</b></div>
        <div className="between small mt8"><span className="sub">Timeline</span><b>{f.months} months</b></div>
        <div className="between small mt8"><span className="sub">Members</span><MembersStack members={members} /></div>
        <div className="between small mt8"><span className="sub">Invested in</span><b>{fund?.name}</b></div>
      </div>
      <div className="card green mt12">
        <div className="small">Each person saves about</div>
        <div className="mid">{inr(f.target / size / f.months)}/month</div>
        <div className="small mt4">Split equally between {size} people. Anyone can add more anytime.</div>
      </div>
      <button className="link mt16" onClick={() => set({ step: 1 })}>Edit details</button>
    </Screen>
  );
}
