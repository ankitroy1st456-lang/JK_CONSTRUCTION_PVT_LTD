import "server-only";
import { cache } from "react";
import { collections } from "./collections";
import { getDb } from "./db";
import { defaultLists, defaultSettings } from "./site";
import type { AppData, Enquiry, EnquiryStatus, Item, Settings } from "./types";

// ============================================================
//  Everything is saved in MongoDB (see db.ts).
//
//  Two MongoDB collections are used:
//    "content"    ONE document (its _id is "site") that holds the company settings
//                 and every list: projects, supplies, news, documents ...
//                 Photo / file links (from Supabase Storage) are saved inside it.
//    "enquiries"  one document per message sent from the contact form.
//
//  There is no fixed schema - add a field in collections.ts and it is simply saved.
// ============================================================

const CONTENT_ID = "site";

// What the "site" document looks like: the settings, plus one list per section (projects, news ...)
type SiteDocument = { _id: string; settings?: Settings; [list: string]: unknown };

async function contentCollection() {
  return (await getDb()).collection<SiteDocument>("content");
}

async function enquiryCollection() {
  return (await getDb()).collection<Enquiry>("enquiries");
}

// ----- Settings + lists -----

// The content shown before anything has been saved: starting text, and an empty list for every section
function startingData(): AppData {
  const lists: Record<string, Item[]> = {};
  for (const collection of collections) lists[collection.key] = defaultLists[collection.key] ?? [];
  return { settings: { ...defaultSettings }, lists, version: 0 };
}

// Loads everything for the admin. `cache` means that if several parts of one page ask for it,
// MongoDB is only asked once for that page.
export const getData = cache(async (): Promise<AppData> => {
  // While `next build` runs without a database configured (e.g. a quick test build), use the starting
  // content so the build still works. On Vercel the settings exist, so the real content is used.
  if (!process.env.MONGODB_URI && process.env.NEXT_PHASE === "phase-production-build") {
    return startingData();
  }

  const saved: Partial<SiteDocument> = (await (await contentCollection()).findOne({ _id: CONTENT_ID })) ?? {};

  const lists: Record<string, Item[]> = {};
  for (const collection of collections) {
    // the saved list if there is one, otherwise the starting list from site.ts, otherwise empty
    lists[collection.key] = (saved[collection.key] as Item[] | undefined) ?? defaultLists[collection.key] ?? [];
  }
  return { settings: { ...defaultSettings, ...(saved.settings ?? {}) }, lists, version: Number(saved.version ?? 0) };
});

// Saves everything (replaces the "site" document).
//
// Two admins might edit at the same time. Every save raises "version" by 1, and a save is only
// accepted if the version is still the one the admin loaded. Otherwise someone saved in between,
// and overwriting their work silently would be wrong.
// Returns the new version number, or null if somebody else saved first.
export async function saveData(data: AppData, loadedVersion: number): Promise<number | null> {
  const newVersion = loadedVersion + 1;
  const stillTheSame = loadedVersion === 0 ? { $or: [{ version: 0 }, { version: { $exists: false } }] } : { version: loadedVersion };

  try {
    const result = await (await contentCollection()).replaceOne(
      { _id: CONTENT_ID, ...stillTheSame },
      { settings: data.settings, ...data.lists, version: newVersion },
      { upsert: true }, // create it the first time
    );
    return result.matchedCount + result.upsertedCount > 0 ? newVersion : null;
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return null; // "already exists": a newer version is saved
    throw error;
  }
}

// Same as getData but only items marked "published" (used by the public pages)
export const getPublicData = cache(async (): Promise<AppData> => {
  const data = await getData();
  const lists: Record<string, Item[]> = {};
  for (const key of Object.keys(data.lists)) lists[key] = data.lists[key].filter((item) => item.published);
  return { settings: data.settings, lists };
});

export async function getSettings() {
  return (await getData()).settings;
}

// ----- Enquiries -----

// Newest first (the admin shows the latest 1000)
export async function getEnquiries(): Promise<Enquiry[]> {
  const enquiries = await enquiryCollection();
  return enquiries.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(1000).toArray();
}

export async function addEnquiry(enquiry: Enquiry) {
  await (await enquiryCollection()).insertOne({ ...enquiry });
}

export async function deleteEnquiry(id: string) {
  const result = await (await enquiryCollection()).deleteOne({ id });
  return result.deletedCount > 0;
}

// Returns false if there is no enquiry with that id
export async function setEnquiryStatus(id: string, status: EnquiryStatus) {
  const result = await (await enquiryCollection()).updateOne({ id }, { $set: { status } });
  return result.matchedCount > 0;
}
