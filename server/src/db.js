import mongoose from 'mongoose';

let memoryServer;
let connecting;

// Cached so serverless invocations reuse one connection instead of opening a new one per request
export function connectDB() {
  connecting ??= open().catch(err => {
    connecting = null;
    throw err;
  });
  return connecting;
}

async function open() {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw Object.assign(new Error('Database not configured: set MONGODB_URI'), { status: 503 });
    }
    // Dev fallback so the app runs without installing MongoDB
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log('No MONGODB_URI set: using in-memory MongoDB (data resets on restart)');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('MongoDB connected');
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
