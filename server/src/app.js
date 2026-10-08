import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import { seedIfEmpty } from './seedData.js';
import api from './routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Connect and seed once per process. On Vercel a warm function reuses this across requests.
let readyPromise;
export function ready() {
  readyPromise ??= connectDB().then(seedIfEmpty).catch(err => {
    readyPromise = null;
    throw err;
  });
  return readyPromise;
}

app.use(cors());
app.use(express.json({ limit: '50kb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', (req, res, next) => ready().then(() => next(), next));
app.use('/api', api);

// When run as a single server (locally or on a VM), also serve the built React app.
// On Vercel the frontend is served as static files instead.
const dist = path.resolve(__dirname, '../../client/dist');
if (!process.env.VERCEL && fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Something went wrong' : err.message });
});

export default app;
