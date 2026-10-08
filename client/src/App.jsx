import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppContext } from './AppContext.jsx';
import { api } from './api.js';
import { Loading, ErrorState } from './components/ui.jsx';
import Home from './screens/Home.jsx';
import Brands from './screens/Brands.jsx';
import BrandDetail from './screens/BrandDetail.jsx';
import { BuildBasket, ReviewBasket, BasketDone } from './screens/Basket.jsx';
import Squads from './screens/Squads.jsx';
import SquadDetail from './screens/SquadDetail.jsx';
import NewSquad from './screens/NewSquad.jsx';
import Portfolio from './screens/Portfolio.jsx';

const SCREENS = {
  home: Home, brands: Brands, brand: BrandDetail,
  build: BuildBasket, review: ReviewBasket, basketDone: BasketDone,
  squads: Squads, squad: SquadDetail, newSquad: NewSquad, portfolio: Portfolio
};
const MAX_BRANDS = 5;

export default function App() {
  const [boot, setBoot] = useState({ me: null, brands: null, error: null });
  const [stack, setStack] = useState([{ r: 'home', p: {} }]);
  const [tab, setTabState] = useState('home');
  const [selected, setSelected] = useState([]);
  const [draft, setDraft] = useState({ amount: 500, mode: 'sip', core: true });
  const [toastMsg, setToastMsg] = useState({ text: '', show: false });
  const [sheet, setSheet] = useState(null);
  const toastTimer = useRef();

  const loadBoot = useCallback(() => {
    setBoot(b => ({ ...b, error: null }));
    Promise.all([api.me(), api.brands()])
      .then(([me, brands]) => setBoot({ me, brands, error: null }))
      .catch(e => setBoot({ me: null, brands: null, error: e.message }));
  }, []);
  useEffect(loadBoot, [loadBoot]);

  const toast = useCallback(msg => {
    setToastMsg({ text: msg, show: true });
    clearTimeout(toastTimer.current);
    // Keep the text while it fades out
    toastTimer.current = setTimeout(() => setToastMsg(t => ({ ...t, show: false })), 2200);
  }, []);

  const nav = useMemo(() => ({
    tab,
    depth: stack.length,
    go: (r, p = {}) => setStack(s => [...s, { r, p }]),
    back: () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s)),
    setTab: t => { setTabState(t); setStack([{ r: t, p: {} }]); },
    reset: (t, entries) => { setTabState(t); setStack(entries.map(([r, p = {}]) => ({ r, p }))); }
  }), [tab, stack.length]);

  const brandMap = useMemo(
    () => Object.fromEntries((boot.brands ?? []).map(b => [b.slug, b])),
    [boot.brands]
  );

  const toggleBrand = useCallback((slug, announce) => {
    const name = brandMap[slug]?.name;
    if (selected.includes(slug)) {
      setSelected(s => s.filter(x => x !== slug));
      if (announce) toast(`${name} removed`);
    } else if (selected.length >= MAX_BRANDS) {
      toast('Max 5 brands keeps your basket focused');
    } else {
      setSelected(s => [...s, slug]);
      if (announce) toast(`${name} added to basket`);
    }
  }, [selected, brandMap, toast]);

  const ctx = {
    me: boot.me, brands: boot.brands, brandMap, nav,
    selected, setSelected, toggleBrand, draft, setDraft,
    toast, openSheet: setSheet, closeSheet: () => setSheet(null)
  };

  const cur = stack[stack.length - 1];
  const Current = SCREENS[cur.r];

  return (
    <AppContext.Provider value={ctx}>
      <div className="stage">
        <div className="caption"><b>Case study prototype</b>: a GenZ investing concept built for Groww's product intern round. Not an official Groww product. All data is mock.</div>
        <div className="phone">
          <div className="disclaimer">Concept prototype · mock data · not investment advice</div>
          {boot.error ? <ErrorState message={boot.error} onRetry={loadBoot} />
            : !boot.me ? <Loading />
            : <Current key={`${stack.length}-${cur.r}`} {...cur.p} />}
          <div className={'sheet-bg' + (sheet ? ' show' : '')} onClick={e => e.target === e.currentTarget && setSheet(null)}>
            {sheet && <div className="sheet">{sheet}</div>}
          </div>
          <div className={'toast' + (toastMsg.show ? ' show' : '')} role="status">{toastMsg.text}</div>
        </div>
      </div>
    </AppContext.Provider>
  );
}
