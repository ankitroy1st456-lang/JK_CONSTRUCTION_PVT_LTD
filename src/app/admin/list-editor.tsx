"use client";

import { useState } from "react";
import type { Collection } from "@/lib/collections";
import type { Item } from "@/lib/types";
import { FieldInput } from "./fields";

type Props = {
  collection: Collection;
  items: Item[];
  onChange: (items: Item[]) => void;
  onError: (message: string) => void;
};

// Edits one section: the list of projects, or news, or documents ...
export function ListEditor({ collection, items, onChange, onError }: Props) {
  const [openId, setOpenId] = useState(""); // the item that is expanded

  function add() {
    const item: Item = { id: crypto.randomUUID().slice(0, 8), published: false };
    for (const field of collection.fields) {
      item[field.key] = field.type === "images" ? [] : field.type === "select" ? field.options?.[0] ?? "" : "";
    }
    onChange([item, ...items]); // new items go to the top
    setOpenId(item.id);
  }

  function update(id: string, changes: Partial<Item>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }

  function remove(id: string) {
    if (confirm("Delete this " + collection.singular + "? This cannot be undone.")) onChange(items.filter((item) => item.id !== id));
  }

  function move(index: number, direction: -1 | 1) {
    const copy = [...items];
    [copy[index], copy[index + direction]] = [copy[index + direction], copy[index]];
    onChange(copy);
  }

  return (
    <>
      <div className="admin-row">
        <p className="admin-muted" style={{ margin: 0 }}>{collection.help} Tick <b>Published</b> to show an item on the website.</p>
        <button className="btn btn-navy" onClick={add}>+ Add {collection.singular}</button>
      </div>

      {items.length === 0 && <div className="admin-card">Nothing here yet. Press “+ Add {collection.singular}”.</div>}

      {items.map((item, index) => (
        <div className="admin-card" key={item.id}>
          {/* Closed view: one line per item */}
          <div className="admin-row" style={{ marginBottom: openId === item.id ? 18 : 0 }}>
            <button className="admin-title" onClick={() => setOpenId(openId === item.id ? "" : item.id)}>
              {openId === item.id ? "▾" : "▸"} {item[collection.titleKey] || "New " + collection.singular}
              <span className={item.published ? "admin-pill on" : "admin-pill"}>{item.published ? "Published" : "Draft"}</span>
            </button>
            {collection.sortable && (
              <span className="admin-arrows">
                <button disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up">↑</button>
                <button disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label="Move down">↓</button>
              </span>
            )}
          </div>

          {/* Open view: the form */}
          {openId === item.id && (
            <>
              <div className="admin-fields">
                {collection.fields.map((field) => (
                  <FieldInput key={field.key} field={field} value={item[field.key]} onChange={(value) => update(item.id, { [field.key]: value })} onError={onError} />
                ))}
              </div>
              <div className="admin-row" style={{ marginTop: 18, marginBottom: 0 }}>
                <label className="admin-check">
                  <input type="checkbox" checked={item.published} onChange={(e) => update(item.id, { published: e.target.checked })} />
                  Published (show on the website)
                </label>
                <button className="admin-delete" onClick={() => remove(item.id)}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </>
  );
}
