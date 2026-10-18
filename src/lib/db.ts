import "server-only";
import { MongoClient, type Db } from "mongodb";

// ============================================================
//  MongoDB connection.
//  The address (with the password inside) is read from the
//  MONGODB_URI setting. It is never written in the code.
// ============================================================

// The database inside your MongoDB cluster. It is created automatically the first time we save.
const DATABASE_NAME = "jk_construction";

// On Vercel (and while running `npm run dev`) this file can be loaded many times.
// We keep the connection on `globalThis` so it is opened once and then reused.
const shared = globalThis as unknown as { mongoConnection?: Promise<MongoClient> };

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local (or to the Environment Variables in Vercel).");
  }

  if (!shared.mongoConnection) {
    // Give up after 3 seconds if the database cannot be reached (the driver's default is 30, longer than Vercel allows)
    const connecting = new MongoClient(uri, { serverSelectionTimeoutMS: 3000, connectTimeoutMS: 3000 }).connect();
    // If connecting fails, forget it so the next request tries again
    connecting.catch(() => {
      shared.mongoConnection = undefined;
    });
    shared.mongoConnection = connecting;
  }

  const client = await shared.mongoConnection;
  return client.db(DATABASE_NAME);
}
