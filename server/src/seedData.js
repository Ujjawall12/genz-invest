import { Brand, User, Basket, Squad } from './models.js';

// Prices and returns are illustrative mock values, not live market data.
export const BRANDS = [
  { slug: 'eternal', name: 'Zomato', company: 'Eternal Ltd', ticker: 'ETERNAL', color: '#e23744', category: 'Food delivery', price: 268.4, r1y: 18.2, risk: 'High',
    about: 'Owns Zomato, Blinkit and District. It earns a commission on every order you place and a fee from restaurants.',
    why: 'Moves with order volumes, quick-commerce growth and competition with Swiggy.' },
  { slug: 'trent', name: 'Zudio', company: 'Trent Ltd', ticker: 'TRENT', color: '#1f2937', category: 'Fashion', price: 5120, r1y: 22.6, risk: 'Medium',
    about: 'Tata group retailer behind Zudio and Westside. Makes money by selling affordable fashion through its own stores.',
    why: 'Moves with how fast new stores open and how much people spend on clothes.' },
  { slug: 'nykaa', name: 'Nykaa', company: 'FSN E-Commerce', ticker: 'NYKAA', color: '#fc2779', category: 'Beauty', price: 198.7, r1y: 9.8, risk: 'High',
    about: 'Online and offline beauty and fashion store. Earns a margin on every product sold.',
    why: 'Moves with beauty spending, competition and how profitable each order is.' },
  { slug: 'swiggy', name: 'Swiggy', company: 'Swiggy Ltd', ticker: 'SWIGGY', color: '#fc8019', category: 'Food delivery', price: 412.1, r1y: -6.4, risk: 'High',
    about: 'Food delivery plus Instamart for 10-minute groceries.',
    why: 'Still spending heavily to grow, so profits are uncertain and the price can swing a lot.' },
  { slug: 'airtel', name: 'Airtel', company: 'Bharti Airtel', ticker: 'BHARTIARTL', color: '#e40000', category: 'Telecom', price: 1840.5, r1y: 14.1, risk: 'Medium',
    about: 'Your mobile and broadband plan. Earns a monthly fee from hundreds of millions of users.',
    why: 'Moves with tariff hikes, number of users and 5G investment costs.' },
  { slug: 'pvr', name: 'PVR INOX', company: 'PVR INOX Ltd', ticker: 'PVRINOX', color: '#c99700', category: 'Movies', price: 1012.3, r1y: -11.2, risk: 'High',
    about: "India's largest cinema chain. Earns from tickets, popcorn and ads.",
    why: 'Moves with box-office hits, footfall and competition from OTT.' },
  { slug: 'jubl', name: "Domino's", company: 'Jubilant FoodWorks', ticker: 'JUBLFOOD', color: '#006491', category: 'Food', price: 655, r1y: 7.4, risk: 'Medium',
    about: "Runs Domino's and Popeyes in India. Earns from every pizza ordered.",
    why: 'Moves with order growth, ingredient costs and competition.' },
  { slug: 'titan', name: 'Fastrack', company: 'Titan Company', ticker: 'TITAN', color: '#7c3aed', category: 'Accessories', price: 3390, r1y: 5.2, risk: 'Medium',
    about: 'Tata company behind Fastrack, Titan watches, Tanishq and Titan Eye+.',
    why: 'Moves with jewellery demand, gold prices and wedding season.' },
  { slug: 'honasa', name: 'Mamaearth', company: 'Honasa Consumer', ticker: 'HONASA', color: '#10b981', category: 'Personal care', price: 288.9, r1y: -3.1, risk: 'High',
    about: 'D2C brand house behind Mamaearth and The Derma Co.',
    why: 'Moves with marketing spend, growth and competition from other D2C brands.' },
  { slug: 'nazara', name: 'Nazara', company: 'Nazara Technologies', ticker: 'NAZARA', color: '#6366f1', category: 'Gaming', price: 1150, r1y: 24.5, risk: 'High',
    about: 'Indian gaming and esports company with mobile games and gaming media.',
    why: 'Small company, so the price can move sharply on any news.' },
  { slug: 'irctc', name: 'IRCTC', company: 'IRCTC Ltd', ticker: 'IRCTC', color: '#1e3a8a', category: 'Travel', price: 780.2, r1y: -2.4, risk: 'Medium',
    about: 'The only official site for train tickets. Also runs catering and Rail Neer.',
    why: 'Moves with ticket bookings, convenience fees and government policy.' },
  { slug: 'paytm', name: 'Paytm', company: 'One97 Communications', ticker: 'PAYTM', color: '#00baf2', category: 'Payments', price: 890, r1y: 31, risk: 'High',
    about: 'Payments, soundbox devices for shops and lending.',
    why: 'Moves with regulation, lending growth and the path to profitability.' }
];

const CONTACTS = [
  { key: 'kabir', name: 'Kabir', color: '#f97316' }, { key: 'ananya', name: 'Ananya', color: '#ec4899' },
  { key: 'rohan', name: 'Rohan', color: '#3b82f6' }, { key: 'ishaan', name: 'Ishaan', color: '#8b5cf6' },
  { key: 'meera', name: 'Meera', color: '#14b8a6' }, { key: 'dev', name: 'Dev', color: '#eab308' },
  { key: 'sara', name: 'Sara', color: '#ef4444' }
];

const me = { key: 'me', name: 'You', color: '#5b5fc7', isMe: true };
const contact = (key, amount) => ({ ...CONTACTS.find(c => c.key === key), isMe: false, amount });
const daysAgo = d => new Date(Date.now() - d * 86400000);

export async function seed() {
  await Promise.all([Brand.deleteMany({}), User.deleteMany({}), Basket.deleteMany({}), Squad.deleteMany({})]);
  await Brand.insertMany(BRANDS);

  const user = await User.create({
    name: 'Aarav',
    spends: [
      { brand: 'eternal', amount: 2340, count: 9, unit: 'orders' },
      { brand: 'trent', amount: 1890, count: 2, unit: 'visits' },
      { brand: 'nykaa', amount: 1650, count: 3, unit: 'orders' },
      { brand: 'swiggy', amount: 1180, count: 5, unit: 'orders' },
      { brand: 'pvr', amount: 760, count: 2, unit: 'shows' },
      { brand: 'airtel', amount: 399, count: 1, unit: 'recharge' }
    ],
    contacts: CONTACTS
  });

  // Squads list newest first, so the headline example (Goa Trip) gets the latest createdAt
  await Squad.create({ owner: user._id, name: 'Flat Deposit', emoji: '🏠', target: 60000, months: 9,
    members: [{ ...me, amount: 14000 }, contact('ishaan', 12500)],
    feed: [{ text: 'Ishaan added ₹2,500', at: daysAgo(5) }, { text: 'You added ₹3,000', at: daysAgo(14) }],
    createdAt: daysAgo(30) });
  await Squad.create({ owner: user._id, name: 'Goa Trip', emoji: '🏖️', target: 80000, months: 5,
    members: [{ ...me, amount: 9000 }, contact('kabir', 11000), contact('ananya', 8000), contact('rohan', 10000)],
    feed: [
      { text: 'Kabir added ₹2,000', at: daysAgo(2) }, { text: 'Rohan added ₹1,500', at: daysAgo(4) },
      { text: 'You added ₹2,000', at: daysAgo(7) }, { text: 'Ananya joined the squad', at: daysAgo(21) }
    ],
    createdAt: daysAgo(21) });

  return user;
}

export async function seedIfEmpty() {
  if ((await User.countDocuments()) > 0) return;
  try {
    await seed();
    console.log('Seeded demo data');
  } catch (err) {
    // Two cold-started serverless instances can race to seed; the loser hits a duplicate key
    if (err.code !== 11000) throw err;
  }
}
