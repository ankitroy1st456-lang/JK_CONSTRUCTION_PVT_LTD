import "server-only";
import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { findAdmin } from "./admins";
import { sameText } from "./password";

// ============================================================
//  Staying signed in.
//
//  After a correct email + password we give the browser a cookie that says
//  "this is admin@example.com, valid until <time>", signed with ADMIN_SESSION_SECRET so
//  nobody can forge or change it. The cookie is httpOnly (page scripts cannot read it) and
//  is only sent to our own site.
//
//  On every admin request we also look the admin up in MongoDB. So deleting an admin, or
//  changing their password, signs them out straight away.
// ============================================================

const COOKIE_NAME = "jk_admin_session";
const EIGHT_HOURS = 60 * 60 * 8; // seconds

type Session = { email: string; version: number; expires: number };

function sessionSecret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set to a random text of at least 32 characters.");
  }
  return value;
}

function sign(text: string) {
  return createHmac("sha256", sessionSecret()).update(text).digest("hex");
}

// Signs the admin in: sets the cookie
export async function startSession(admin: { _id: string; sessionVersion: number }) {
  const session: Session = { email: admin._id, version: admin.sessionVersion, expires: Date.now() + EIGHT_HOURS * 1000 };
  const data = Buffer.from(JSON.stringify(session)).toString("base64url");

  (await cookies()).set(COOKIE_NAME, data + "." + sign(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // https only when live
    sameSite: "strict", // never sent along with requests that start on another website
    path: "/",
    maxAge: EIGHT_HOURS,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE_NAME);
}

// Who is signed in right now? Returns their email, or null if nobody valid.
export async function currentAdmin(): Promise<string | null> {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return null;

    const [data, signature] = token.split(".");
    if (!data || !signature || !sameText(signature, sign(data))) return null; // forged or changed

    const session = JSON.parse(Buffer.from(data, "base64url").toString()) as Session;
    if (typeof session.email !== "string" || session.expires < Date.now()) return null; // expired

    const admin = await findAdmin(session.email);
    if (!admin || admin.sessionVersion !== session.version) return null; // removed, or password changed
    return admin._id;
  } catch {
    return null;
  }
}

export async function isAdmin() {
  return (await currentAdmin()) !== null;
}
