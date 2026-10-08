import express from 'express';
import mongoose from 'mongoose';
import { Brand, User, Basket, Squad } from './models.js';
import { fundFor, allocate, basketValue, squadValue } from './finance.js';
import { seed } from './seedData.js';

const router = express.Router();

const ah = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const fail = (status, message) => Object.assign(new Error(message), { status });
const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

// Auth is out of scope for the prototype: every request acts as the seeded demo user.
router.use(ah(async (req, res, next) => {
  req.user = await User.findOne();
  if (!req.user) throw fail(503, 'Demo data not seeded');
  next();
}));

async function brandMap() {
  const brands = await Brand.find().lean();
  return Object.fromEntries(brands.map(b => [b.slug, b]));
}

function squadView(sq) {
  const total = sq.members.reduce((sum, m) => sum + m.amount, 0);
  const left = Math.max(sq.target - total, 0);
  const mine = sq.members.find(m => m.isMe)?.amount ?? 0;
  return {
    id: sq._id, name: sq.name, emoji: sq.emoji, target: sq.target, months: sq.months,
    members: sq.members, feed: sq.feed,
    total, myShare: mine, progress: total / sq.target,
    perHeadMonthly: left / sq.members.length / sq.months,
    fund: fundFor(sq.months)
  };
}

async function findSquad(req) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw fail(404, 'Squad not found');
  const sq = await Squad.findOne({ _id: id, owner: req.user._id });
  if (!sq) throw fail(404, 'Squad not found');
  return sq;
}

async function basketView(basket, map) {
  if (!basket) return null;
  const items = allocate(basket, map ?? await brandMap());
  return {
    brands: basket.brands, amount: basket.amount, mode: basket.mode, core: basket.core,
    items, invested: basket.amount, value: basketValue(items), updatedAt: basket.updatedAt
  };
}

router.get('/me', (req, res) => {
  const { name, spends, contacts } = req.user;
  res.json({ name, spends, contacts });
});

router.get('/brands', ah(async (req, res) => {
  res.json(await Brand.find().lean());
}));

router.get('/brands/:slug', ah(async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug }).lean();
  if (!brand) throw fail(404, 'Brand not found');
  res.json(brand);
}));

router.get('/funds/recommend', (req, res) => {
  const months = Number(req.query.months);
  if (!isInt(months, 1, 60)) throw fail(400, 'months must be a whole number from 1 to 60');
  res.json(fundFor(months));
});

router.get('/basket', ah(async (req, res) => {
  const basket = await Basket.findOne({ user: req.user._id });
  res.json(await basketView(basket));
}));

router.post('/basket', ah(async (req, res) => {
  const { brands, amount, mode, core } = req.body ?? {};
  const map = await brandMap();
  if (!Array.isArray(brands) || brands.length < 1 || brands.length > 5) throw fail(400, 'Pick between 1 and 5 brands');
  if (new Set(brands).size !== brands.length) throw fail(400, 'Brands must be unique');
  if (brands.some(s => !map[s])) throw fail(400, 'Unknown brand');
  if (!isInt(amount, 100, 1000000)) throw fail(400, 'Amount must be between ₹100 and ₹10,00,000');
  if (!['sip', 'once'].includes(mode)) throw fail(400, 'mode must be "sip" or "once"');

  const basket = await Basket.findOneAndUpdate(
    { user: req.user._id },
    { brands, amount, mode, core: core !== false },
    { upsert: true, new: true, runValidators: true }
  );
  res.status(201).json(await basketView(basket, map));
}));

router.get('/squads', ah(async (req, res) => {
  const squads = await Squad.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json(squads.map(squadView));
}));

router.get('/squads/:id', ah(async (req, res) => {
  res.json(squadView(await findSquad(req)));
}));

router.post('/squads', ah(async (req, res) => {
  const { name, emoji, target, months, memberKeys } = req.body ?? {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  if (!cleanName || cleanName.length > 40) throw fail(400, 'Name must be 1 to 40 characters');
  if (!isInt(target, 500, 10000000)) throw fail(400, 'Target must be at least ₹500');
  if (!isInt(months, 1, 60)) throw fail(400, 'Timeline must be 1 to 60 months');
  if (!Array.isArray(memberKeys) || memberKeys.length < 1 || memberKeys.length > 10) throw fail(400, 'Invite 1 to 10 friends');

  const contacts = req.user.contacts.filter(c => memberKeys.includes(c.key));
  if (contacts.length !== new Set(memberKeys).size) throw fail(400, 'Unknown contact');

  const squad = await Squad.create({
    owner: req.user._id, name: cleanName, emoji: typeof emoji === 'string' ? emoji.slice(0, 8) : '🎯',
    target, months,
    members: [
      { key: 'me', name: 'You', color: '#5b5fc7', isMe: true, amount: 0 },
      ...contacts.map(c => ({ key: c.key, name: c.name, color: c.color, amount: 0 }))
    ],
    feed: [
      { text: `Invites sent to ${contacts.length} friend${contacts.length > 1 ? 's' : ''}` },
      { text: 'You created the squad' }
    ]
  });
  res.status(201).json(squadView(squad));
}));

router.post('/squads/:id/contributions', ah(async (req, res) => {
  const amount = req.body?.amount;
  if (!isInt(amount, 100, 1000000)) throw fail(400, 'Minimum is ₹100');
  const sq = await findSquad(req);
  sq.members.find(m => m.isMe).amount += amount;
  sq.feed.unshift({ text: `You added ₹${amount.toLocaleString('en-IN')}` });
  await sq.save();
  res.status(201).json(squadView(sq));
}));

router.post('/squads/:id/nudge', ah(async (req, res) => {
  const sq = await findSquad(req);
  const others = sq.members.filter(m => !m.isMe);
  if (!others.length) throw fail(400, 'Invite friends first');
  const lowest = others.reduce((a, b) => (a.amount <= b.amount ? a : b));
  res.json({ nudged: lowest.name });
}));

router.get('/portfolio', ah(async (req, res) => {
  const [basket, squads] = await Promise.all([
    Basket.findOne({ user: req.user._id }).then(b => basketView(b)),
    Squad.find({ owner: req.user._id }).sort({ createdAt: -1 })
  ]);
  const pots = squads.map(squadView).map(s => ({
    id: s.id, name: s.name, emoji: s.emoji, fund: s.fund, myShare: s.myShare, myValue: squadValue(s.myShare, s.months)
  }));
  const squadsInvested = pots.reduce((sum, p) => sum + p.myShare, 0);
  const squadsValue = pots.reduce((sum, p) => sum + p.myValue, 0);
  res.json({
    invested: (basket?.invested ?? 0) + squadsInvested,
    value: (basket?.value ?? 0) + squadsValue,
    basket, squads: pots, squadsInvested, squadsValue
  });
}));

// Lets evaluators restore the demo state from the app
router.post('/demo/reset', ah(async (req, res) => {
  await seed();
  res.json({ ok: true });
}));

router.use((req, res) => res.status(404).json({ error: 'Not found' }));

export default router;
