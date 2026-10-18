import "server-only";
import { getDb } from "./db";
import { hashPassword, passwordIsStrongEnough, passwordMatches, sameText } from "./password";

// ============================================================
//  Admin accounts, saved in the MongoDB collection "admins".
//  One document per admin:
//    _id             the admin's email (lowercase), so an email can only exist once
//    passwordHash    the scrambled password (see password.ts)
//    sessionVersion  goes up when the password changes, which signs out all older logins
//    createdAt       when the account was made
// ============================================================

type Admin = { _id: string; passwordHash: string; sessionVersion: number; createdAt: string };

// Thrown when nobody can sign in yet because the first admin was never set up
export class SetupError extends Error {}

async function adminCollection() {
  return (await getDb()).collection<Admin>("admins");
}

// Returns the cleaned email (lowercase, no spaces), or null if it does not look like an email
export function cleanEmail(value: unknown): string | null {
  const email = String(value ?? "").trim().toLowerCase();
  return email.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function findAdmin(email: string) {
  return (await adminCollection()).findOne({ _id: email });
}

export async function listAdmins() {
  const admins = await (await adminCollection()).find().sort({ createdAt: 1 }).toArray();
  return admins.map((admin) => ({ email: admin._id, createdAt: admin.createdAt }));
}

export async function countAdmins() {
  return (await adminCollection()).countDocuments({});
}

// Returns false if an admin with that email already exists
export async function createAdmin(email: string, password: string) {
  try {
    await (await adminCollection()).insertOne({
      _id: email,
      passwordHash: await hashPassword(password),
      sessionVersion: 1,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return false; // 11000 = "already exists"
    throw error;
  }
}

// Saves a new password and returns the new sessionVersion (older logins stop working)
export async function changePassword(email: string, newPassword: string) {
  const admins = await adminCollection();
  await admins.updateOne({ _id: email }, { $set: { passwordHash: await hashPassword(newPassword) }, $inc: { sessionVersion: 1 } });
  return (await admins.findOne({ _id: email }))?.sessionVersion ?? 1;
}

export async function deleteAdmin(email: string) {
  const result = await (await adminCollection()).deleteOne({ _id: email });
  return result.deletedCount > 0;
}

// A made-up hash, used so that a wrong email takes as long to answer as a wrong password
let decoyHash: Promise<string> | undefined;

// Checks an email + password. Returns the admin if they are right, otherwise null.
export async function checkLogin(email: string, password: string): Promise<Admin | null> {
  const admins = await adminCollection();
  const admin = await admins.findOne({ _id: email });

  if (admin) return (await passwordMatches(password, admin.passwordHash)) ? admin : null;

  // No such admin. If there are no admins at all yet, the ADMIN_EMAIL + ADMIN_PASSWORD settings
  // create the very first one (see README). After that, those settings are ignored.
  if ((await admins.countDocuments({}, { limit: 1 })) === 0) {
    const firstEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const firstPassword = process.env.ADMIN_PASSWORD;
    if (!firstEmail || !passwordIsStrongEnough(firstPassword)) {
      throw new SetupError("No admin account exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters), then sign in again.");
    }
    if (sameText(email, firstEmail) && sameText(password, firstPassword)) {
      await createAdmin(email, password);
      return findAdmin(email);
    }
  }

  decoyHash ??= hashPassword("decoy-password-for-timing");
  await passwordMatches(password, await decoyHash);
  return null;
}
