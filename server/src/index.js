// Long-running server for local development: `npm run dev`
import 'dotenv/config';
import app, { ready } from './app.js';

const PORT = process.env.PORT || 5000;

try {
  await ready();
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
} catch (err) {
  console.error('Failed to start:', err.message);
  process.exit(1);
}
