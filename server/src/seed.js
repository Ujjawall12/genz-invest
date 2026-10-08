// Resets the database to the demo state: `npm run seed`
import 'dotenv/config';
import { connectDB, disconnectDB } from './db.js';
import { seed } from './seedData.js';

try {
  await connectDB();
  await seed();
  console.log('Database reset to demo data');
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
