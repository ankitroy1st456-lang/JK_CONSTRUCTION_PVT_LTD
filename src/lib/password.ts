import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// ============================================================
//  Passwords are NEVER saved as they are typed.
//  We save a "hash": a scrambled version that cannot be turned back into the password.
//  scrypt is built into Node and is slow on purpose, which makes guessing very expensive.
//  Each password also gets its own random "salt", so two people with the same password
//  have different hashes.
// ============================================================

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, length: number) => Promise<Buffer>;
const HASH_LENGTH = 64;

// "a1b2...:9f8e..."  (salt, then hash, both as hex text)
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, HASH_LENGTH);
  return salt.toString("hex") + ":" + hash.toString("hex");
}

// Is the typed password the one that produced this saved hash?
export async function passwordMatches(password: string, savedHash: string) {
  const [saltHex, hashHex] = savedHash.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

// New passwords must be at least 12 characters (and not absurdly long)
export function passwordIsStrongEnough(password: unknown): password is string {
  return typeof password === "string" && password.length >= 12 && password.length <= 200;
}

// Compares two texts without leaking (through timing) how many characters matched
export function sameText(a: string, b: string) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);
  return first.length === second.length && timingSafeEqual(first, second);
}
