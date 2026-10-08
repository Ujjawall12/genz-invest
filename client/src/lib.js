import { useCallback, useEffect, useState } from 'react';

export const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
export const pct = n => (n > 0 ? '+' : '') + n.toFixed(1) + '%';
export const initials = s => s.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

export const INDEX_CORE = { slug: 'nifty50', name: 'Nifty 50 Index Fund', color: '#94a3b8' };

// Preview only; the server recomputes the allocation when the basket is saved
export function previewAllocation({ amount, core }, brands) {
  const coreShare = core ? 0.5 : 0;
  const items = core ? [{ ...INDEX_CORE, share: coreShare, amount: amount * coreShare }] : [];
  const each = (1 - coreShare) / brands.length;
  brands.forEach(b => items.push({ slug: b.slug, name: b.name, color: b.color, share: each, amount: amount * each }));
  return items;
}

export function timeAgo(date) {
  const s = (Date.now() - new Date(date)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  return d < 7 ? `${d}d ago` : `${Math.floor(d / 7)}w ago`;
}

export function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => {
    setState(s => ({ ...s, loading: true, error: null }));
    return fn()
      .then(data => setState({ data, loading: false, error: null }))
      .catch(e => setState({ data: null, loading: false, error: e.message }));
  }, deps);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
