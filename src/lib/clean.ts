import { allSettingsFields, collections, type Field } from "./collections";
import type { AppData, Item } from "./types";

// Everything the admin sends is checked here before it is saved.
// Text is cut to a sensible length. Photo and file links must be https:// links, or links
// to our own Supabase Storage (those are https:// on the real service; the SUPABASE_URL
// check also allows http:// when you test with Supabase on your own computer).

function cleanLink(value: unknown) {
  const text = String(value ?? "").trim();
  if (!/^\S{1,500}$/.test(text)) return ""; // no spaces, not too long

  const supabaseUrl = process.env.SUPABASE_URL;
  const isOurStorage = Boolean(supabaseUrl) && text.startsWith(supabaseUrl + "/");
  return text.startsWith("https://") || isOurStorage ? text : "";
}

function cleanValue(field: Field, value: unknown) {
  switch (field.type) {
    case "image":
    case "file":
      return cleanLink(value);
    case "url":
      return /^https:\/\/\S{1,500}$/.test(String(value ?? "").trim()) ? String(value).trim() : "";
    case "images":
      return (Array.isArray(value) ? value : []).map(cleanLink).filter(Boolean).slice(0, 40);
    case "select":
      return field.options?.includes(String(value)) ? String(value) : "";
    case "date":
      return /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? "")) ? String(value) : "";
    case "textarea":
      return String(value ?? "").trim().slice(0, 20000);
    default:
      return String(value ?? "").trim().slice(0, 300);
  }
}

export function cleanData(raw: Record<string, unknown>): AppData {
  const rawSettings = (raw.settings ?? {}) as Record<string, unknown>;
  const settings: Record<string, string> = {};
  for (const field of allSettingsFields) settings[field.key] = String(cleanValue(field, rawSettings[field.key]));

  const rawLists = (raw.lists ?? {}) as Record<string, unknown>;
  const lists: Record<string, Item[]> = {};
  for (const collection of collections) {
    const rows = Array.isArray(rawLists[collection.key]) ? (rawLists[collection.key] as Record<string, unknown>[]) : [];
    const used = new Set<string>();
    lists[collection.key] = rows.slice(0, 500).map((row) => {
      let id = String(row.id ?? "");
      if (!/^[a-zA-Z0-9-]{1,40}$/.test(id) || used.has(id)) id = crypto.randomUUID().slice(0, 8);
      used.add(id);
      const item: Item = { id, published: row.published === true };
      for (const field of collection.fields) item[field.key] = cleanValue(field, row[field.key]);
      return item;
    });
  }
  return { settings, lists };
}
