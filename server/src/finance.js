// Product rules shared by the API. Returns are illustrative, not real market data.

export const INDEX_CORE = {
  slug: 'nifty50', name: 'Nifty 50 Index Fund', company: 'Index fund', color: '#94a3b8', r1y: 11.8, risk: 'Medium'
};

// Short-term goals must not sit in equity: the timeline picks the fund, not the user's excitement.
export function fundFor(months) {
  if (months <= 12) {
    return {
      type: 'liquid', name: 'Liquid Fund', risk: 'Low', ret: 6.5,
      why: `Your goal is ${months} month${months > 1 ? 's' : ''} away. Money you need soon shouldn't be in stocks, which can fall right before your plan. A liquid fund stays steady and can be withdrawn in 1 day.`
    };
  }
  if (months <= 36) {
    return {
      type: 'debt', name: 'Short Duration Debt Fund', risk: 'Low', ret: 7.2,
      why: `Your goal is ${months} months away. A short duration debt fund earns more than a savings account with low ups and downs.`
    };
  }
  return {
    type: 'equity', name: 'Nifty 50 Index Fund', risk: 'Medium', ret: 11.8,
    why: `Your goal is ${Math.round(months / 12)}+ years away, long enough to ride out market dips. An index fund owns India's top 50 companies.`
  };
}

// Half goes to a Nifty 50 core when enabled; the rest is split equally across chosen brands.
export function allocate({ brands, amount, core }, brandMap) {
  const coreShare = core ? 0.5 : 0;
  const items = [];
  if (core) items.push({ ...INDEX_CORE, share: coreShare, amount: amount * coreShare });
  const each = (1 - coreShare) / brands.length;
  for (const slug of brands) {
    const b = brandMap[slug];
    items.push({
      slug: b.slug, name: b.name, company: b.company, color: b.color,
      r1y: b.r1y, risk: b.risk, share: each, amount: amount * each
    });
  }
  return items;
}

// ~1 week of illustrative movement so the portfolio isn't flat in a demo
export const basketValue = items => items.reduce((sum, it) => sum + it.amount * (1 + it.r1y / 100 / 52), 0);
export const squadValue = (amount, months) => amount * (1 + fundFor(months).ret / 100 / 12);
