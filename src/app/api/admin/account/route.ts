import { NextResponse } from "next/server";
import { changePassword, cleanEmail, createAdmin, deleteAdmin, findAdmin, listAdmins } from "@/lib/admins";
import { currentAdmin, startSession } from "@/lib/auth";
import { clearHits, isBlocked, recordHit, visitorAddress } from "@/lib/rate-limit";
import { passwordIsStrongEnough, passwordMatches } from "@/lib/password";

export const dynamic = "force-dynamic";

const TOO_WEAK = "The new password must be at least 12 characters long.";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

// Asks for the signed-in admin's current password again before important changes.
// Returns an error answer if something is wrong, or null if all is fine.
// Same rule as signing in: 5 wrong tries, then wait 15 minutes
const MAX_TRIES = 5;
const WAIT_MS = 15 * 60 * 1000;

async function checkCurrentPassword(request: Request, email: string, typed: unknown) {
  const who = "login:" + visitorAddress(request);
  if (await isBlocked(who, MAX_TRIES, WAIT_MS)) return fail("Too many wrong attempts. Please wait 15 minutes and try again.", 429);

  const admin = await findAdmin(email);
  if (!admin || typeof typed !== "string" || typed.length > 200 || !(await passwordMatches(typed, admin.passwordHash))) {
    await recordHit(who);
    return fail("Your current password is not correct.", 403);
  }
  await clearHits(who);
  return null;
}

// Who am I, and who are the admins?
export async function GET() {
  const me = await currentAdmin();
  if (!me) return fail("Unauthorized", 401);
  return NextResponse.json({ me, admins: await listAdmins() });
}

// Add another admin
export async function POST(request: Request) {
  const me = await currentAdmin();
  if (!me) return fail("Unauthorized", 401);

  const { email, password, currentPassword } = await request.json();
  const wrong = await checkCurrentPassword(request, me, currentPassword);
  if (wrong) return wrong;

  const newEmail = cleanEmail(email);
  if (!newEmail) return fail("Please enter a valid email address.", 400);
  if (!passwordIsStrongEnough(password)) return fail(TOO_WEAK, 400);
  if (!(await createAdmin(newEmail, password))) return fail("There is already an admin with that email.", 409);

  return NextResponse.json({ ok: true });
}

// Change my own password (this signs out every other login of mine)
export async function PATCH(request: Request) {
  const me = await currentAdmin();
  if (!me) return fail("Unauthorized", 401);

  const { currentPassword, newPassword } = await request.json();
  const wrong = await checkCurrentPassword(request, me, currentPassword);
  if (wrong) return wrong;

  if (!passwordIsStrongEnough(newPassword)) return fail(TOO_WEAK, 400);
  if (newPassword === currentPassword) return fail("Please choose a different password from the current one.", 400);

  const sessionVersion = await changePassword(me, newPassword);
  await startSession({ _id: me, sessionVersion }); // keep THIS browser signed in
  return NextResponse.json({ ok: true });
}

// Remove an admin
export async function DELETE(request: Request) {
  const me = await currentAdmin();
  if (!me) return fail("Unauthorized", 401);

  const email = cleanEmail((await request.json()).email);
  if (!email) return fail("Invalid email.", 400);
  if (email === me) return fail("You cannot remove your own account.", 400);
  if (!(await deleteAdmin(email))) return fail("No admin with that email.", 404);

  return NextResponse.json({ ok: true });
}
