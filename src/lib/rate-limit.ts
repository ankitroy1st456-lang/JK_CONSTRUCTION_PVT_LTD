import "server-only";
import { getDb } from "./db";

// ============================================================
//  A simple "not too often" counter, used for:
//    - wrong sign-in attempts (5 wrong tries -> wait 15 minutes)
//    - contact-form messages (20 per hour from one address)
//
//  The counts are kept in MongoDB (collection "rateLimits"), not in memory, because on Vercel
//  every request can run on a different server and memory is not shared between them.
//
//  A "key" says what is being counted and for whom, e.g. "login:203.0.113.5".
//  The window starts at the first hit and ends after `windowMs`; then the count starts again.
// ============================================================

// Who is making the request (Vercel puts the visitor's address in this header)
export function visitorAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

async function counters() {
  return (await getDb()).collection<{ _id: string; count: number; since: number }>("rateLimits");
}

// Has this key already used up its allowance?
export async function isBlocked(key: string, max: number, windowMs: number) {
  const collection = await counters();
  const record = await collection.findOne({ _id: key });
  if (!record) return false;

  if (Date.now() - record.since > windowMs) {
    await collection.deleteOne({ _id: key }); // the window is over, start fresh
    return false;
  }
  return record.count >= max;
}

// Count one more hit
export async function recordHit(key: string) {
  // add 1 to the count; "since" is only set the first time
  await (await counters()).updateOne({ _id: key }, { $inc: { count: 1 }, $setOnInsert: { since: Date.now() } }, { upsert: true });
}

export async function clearHits(key: string) {
  await (await counters()).deleteOne({ _id: key });
}
