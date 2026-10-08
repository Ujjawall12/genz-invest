async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  me: () => request('/me'),
  brands: () => request('/brands'),
  fund: months => request(`/funds/recommend?months=${months}`),
  basket: () => request('/basket'),
  saveBasket: basket => request('/basket', { method: 'POST', body: basket }),
  squads: () => request('/squads'),
  squad: id => request(`/squads/${id}`),
  createSquad: squad => request('/squads', { method: 'POST', body: squad }),
  contribute: (id, amount) => request(`/squads/${id}/contributions`, { method: 'POST', body: { amount } }),
  nudge: id => request(`/squads/${id}/nudge`, { method: 'POST' }),
  portfolio: () => request('/portfolio'),
  resetDemo: () => request('/demo/reset', { method: 'POST' })
};
