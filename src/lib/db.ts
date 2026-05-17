// lib/db.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Augment the global type to include _mongooseCache
declare global {
  var _mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}


// Use a module-scoped variable for caching
let cached = global._mongooseCache;
if (!cached) {
  cached = { conn: null, promise: null };
  global._mongooseCache = cached;
}

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI as string, opts)
      .then((mongoose) => {
        console.log("MongoDB Connected");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        cached.promise = null; // Reset promise to allow retry
        throw error;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;