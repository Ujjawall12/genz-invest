import { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { api } from '../api.js';
import { inr, previewAllocation, useFetch, INDEX_CORE } from '../lib.js';
import { Screen, BrandLogo, Info, Icon, Loading, ErrorState } from '../components/ui.jsx';

const MIN_AMOUNT = 100;

function Steps({ step, of = 2 }) {
  return <div className="steps">{Array.from({ length: of }, (_, i) => <span key={i} className={i < step ? 'on' : ''} />)}</div>;
}

function NothingSelected() {
  const { nav } = useApp();
  return (
    <div className="empty">
      Pick at least one brand first.
      <div className="mt12"><button className="btn sm" onClick={() => nav.setTab('brands')}>Choose brands</button></div>
    </div>
  );
}

function AllocationCard({ items }) {
  return (
    <div className="card">
      <div className="bar" style={{ height: 10 }}>
        {items.map(it => <span key={it.slug} style={{ width: `${(it.share * 100).toFixed(1)}%`, background: it.color }} />)}
      </div>
      <div className="mt8">
        {items.map(it => (
          <div key={it.slug} className="alloc-row">
            <span className="sw" style={{ background: it.color }} />
            <span className="grow">{it.name}</span>
            <span className="sub" style={{ marginRight: 8 }}>{Math.round(it.share * 100)}%</span>
            <b>{inr(it.amount)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BuildBasket() {
  const { selected, brandMap, draft, setDraft, nav } = useApp();
  if (!selected.length) return <Screen title="Build your basket" hideTabs><NothingSelected /></Screen>;

  const chosen = selected.map(s => brandMap[s]);
  const valid = draft.amount >= MIN_AMOUNT;
  const set = patch => setDraft(d => ({ ...d, ...patch }));

  return (
    <Screen title="Build your basket" hideTabs cta={<button className="btn" disabled={!valid} onClick={() => nav.go('review')}>Review</button>}>
      <Steps step={1} />
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {chosen.map(b => (
          <span key={b.slug} className="pill grey" style={{ padding: '6px 10px', fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color }} />{b.name}
          </span>
        ))}
      </div>

      <div className="field mt20">
        <div className="seg">
          <button className={draft.mode === 'sip' ? 'on' : ''} onClick={() => set({ mode: 'sip' })}>Monthly SIP</button>
          <button className={draft.mode === 'once' ? 'on' : ''} onClick={() => set({ mode: 'once' })}>One-time</button>
        </div>
      </div>

      <div className="field mt20">
        <label htmlFor="amt">{draft.mode === 'sip' ? 'Amount every month' : 'Amount to invest'}</label>
        <div className="amount-input">₹
          <input id="amt" type="number" inputMode="numeric" min={MIN_AMOUNT} value={draft.amount || ''}
            onChange={e => set({ amount: Math.max(0, Math.round(+e.target.value || 0)) })} />
        </div>
        <div className="chips mt12">
          {[100, 500, 1000, 2000].map(a => (
            <button key={a} className={'chip' + (draft.amount === a ? ' on' : '')} onClick={() => set({ amount: a })}>{inr(a)}</button>
          ))}
        </div>
        {!valid && <div className="small neg mt8">Minimum is ₹{MIN_AMOUNT}</div>}
      </div>

      <div className="card mt20">
        <div className="row">
          <div className="grow">
            <div className="bold">Add a Nifty 50 safety core</div>
            <div className="small sub">Recommended · 50% goes to India's top 50 companies</div>
          </div>
          <button className={'toggle' + (draft.core ? ' on' : '')} onClick={() => set({ core: !draft.core })} aria-label="Toggle Nifty 50 core" aria-pressed={draft.core} />
        </div>
        {draft.core
          ? <Info kind="ok" icon={Icon.shield} className="mt12">Good call. If one of your brands has a bad year, the core keeps your basket steady.</Info>
          : <Info kind="warn" className="mt12">Without the core, 100% of your money depends on {chosen.length} compan{chosen.length > 1 ? 'ies' : 'y'}. Your basket could swing a lot more.</Info>}
      </div>

      <div className="h2">Where your money goes</div>
      <AllocationCard items={previewAllocation(draft, chosen)} />
    </Screen>
  );
}

export function ReviewBasket() {
  const { selected, setSelected, brandMap, draft, nav, toast } = useApp();
  const [busy, setBusy] = useState(false);
  if (!selected.length) return <Screen title="Review" hideTabs><NothingSelected /></Screen>;

  const items = previewAllocation(draft, selected.map(s => brandMap[s]));

  async function confirm() {
    setBusy(true);
    try {
      await api.saveBasket({ brands: selected, amount: draft.amount, mode: draft.mode, core: draft.core });
      setSelected([]);
      nav.reset('brands', [['brands'], ['basketDone']]);
    } catch (e) {
      toast(e.message);
      setBusy(false);
    }
  }

  return (
    <Screen title="Review" hideTabs cta={<button className="btn" disabled={busy} onClick={confirm}>{busy ? 'Investing…' : 'Confirm & invest (mock)'}</button>}>
      <Steps step={2} />
      <div className="card">
        <div className="sub small">{draft.mode === 'sip' ? 'Monthly SIP' : 'One-time investment'}</div>
        <div className="big mt4">{inr(draft.amount)}{draft.mode === 'sip' && <span className="sub" style={{ fontSize: 14, fontWeight: 500 }}> /month</span>}</div>
        {draft.mode === 'sip' && <div className="small sub mt4">Debits on the 5th of every month · pause or skip anytime</div>}
      </div>
      <div className="card mt12" style={{ padding: '6px 14px' }}>
        {items.map(it => (
          <div key={it.slug} className="alloc-row"><span className="sw" style={{ background: it.color }} /><span className="grow">{it.name}</span><b>{inr(it.amount)}</b></div>
        ))}
      </div>
      <Info className="mt12"><span className="small">You'll own fractional amounts in each company through your demat account. Values change daily. Investments are subject to market risk.</span></Info>
      <Info icon={Icon.shield} className="mt8"><span className="small"><b>No lock-in.</b> Sell anytime. Money reaches your bank in 1–2 working days.</span></Info>
    </Screen>
  );
}

export function BasketDone() {
  const { brandMap, nav } = useApp();
  const { data, error, reload } = useFetch(api.basket);

  return (
    <Screen hideTabs cta={<button className="btn" onClick={() => nav.setTab('portfolio')}>View portfolio</button>}>
      {error ? <ErrorState message={error} onRetry={reload} /> : !data ? <Loading /> : (
        <>
          <div className="success-ic">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
          </div>
          <div className="center mid">You're now an owner 🎉</div>
          <div className="center sub mt8">Next time you order on {brandMap[data.brands[0]].name}, a tiny part of it works for you.</div>
          <div className="card mt20">
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {data.brands.map(s => <BrandLogo key={s} brand={brandMap[s]} />)}
              {data.core && <div className="blogo" style={{ background: INDEX_CORE.color, fontSize: 11 }}>N50</div>}
            </div>
            <div className="small mt12">{inr(data.amount)}{data.mode === 'sip' ? ' every month' : ' invested'} across {data.items.length} holdings</div>
          </div>
          <div className="card soft mt12"><div className="bold small">Tip</div><div className="small mt4">Don't check prices every day. Owners think in years, not days.</div></div>
        </>
      )}
    </Screen>
  );
}
