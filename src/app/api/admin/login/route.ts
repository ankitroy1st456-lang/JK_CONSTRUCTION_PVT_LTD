import { NextResponse } from "next/server";
import { cleanEmail, checkLogin, SetupError } from "@/lib/admins";
import { startSession } from "@/lib/auth";
import { clearHits, isBlocked, recordHit, visitorAddress } from "@/lib/rate-limit";

// The same answer for "no such email" and "wrong password", so nobody can find out which emails are admins
// 5 wrong tries from one address, then wait 15 minutes
const MAX_TRIES = 5;
const WAIT_MS = 15 * 60 * 1000;

const WRONG = { error: "Incorrect email or password." };

export async function POST(request: Request) {
  try {
    const who = "login:" + visitorAddress(request);

    if (await isBlocked(who, MAX_TRIES, WAIT_MS)) {
      return NextResponse.json({ error: "Too many wrong attempts. Please wait 15 minutes and try again." }, { status: 429 });
    }

    const { email, password } = await request.json();
    const cleanedEmail = cleanEmail(email);
    const admin = cleanedEmail && typeof password === "string" && password.length <= 200 ? await checkLogin(cleanedEmail, password) : null;

    if (!admin) {
      await recordHit(who);
      return NextResponse.json(WRONG, { status: 401 });
    }

    await clearHits(who);
    await startSession(admin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SetupError) return NextResponse.json({ error: error.message }, { status: 503 });
    // Usually a missing setting (ADMIN_SESSION_SECRET or MONGODB_URI)
    console.error("Admin login problem:", error); // visible in the Vercel logs
    return NextResponse.json({ error: "Sign-in is not available. Check the environment settings and the logs." }, { status: 503 });
  }
}
