"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collections } from "@/lib/collections";
import type { AppData, Enquiry, EnquiryStatus } from "@/lib/types";
import { AccountEditor } from "./account-editor";
import { EnquiryList } from "./enquiry-list";
import { ListEditor } from "./list-editor";
import { SettingsEditor } from "./settings-editor";

// "enquiries", "settings", "account", or the key of a section such as "projects" / "news"
export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState("enquiries");
  const [data, setData] = useState<AppData | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [unsaved, setUnsaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // ---- Load everything when the page opens ----
  useEffect(() => {
    async function load() {
      const [contentResponse, enquiryResponse] = await Promise.all([fetch("/api/admin/content"), fetch("/api/enquiries")]);
      if (contentResponse.status === 401 || enquiryResponse.status === 401) {
        router.replace("/admin/login"); // not signed in
        return;
      }
      setData(await contentResponse.json());
      setEnquiries(await enquiryResponse.json());
    }
    load().catch(() => setError("Could not load the admin data. Please refresh the page."));
  }, [router]);

  // Warn before closing the tab if there are changes that were not saved
  useEffect(() => {
    if (!unsaved) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  // Any change to settings or a list goes through here
  function change(newData: AppData) {
    setData(newData);
    setUnsaved(true);
    setNotice("");
  }

  async function save() {
    if (!data) return;
    setNotice("");
    setError("");
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      setData({ ...data, version: result.version }); // remember the new version for the next save
      setUnsaved(false);
      setNotice("Saved. Published items are now on the website.");
    } else {
      setError(result.error || "Could not save. Please try again.");
    }
  }

  async function changeStatus(id: string, status: EnquiryStatus) {
    const response = await fetch("/api/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (response.ok) setEnquiries((old) => old.map((item) => (item.id === id ? { ...item, status } : item)));
    else setError("Could not update the enquiry.");
  }

  async function removeEnquiry(id: string) {
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    const response = await fetch("/api/enquiries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (response.ok) setEnquiries((old) => old.filter((item) => item.id !== id));
    else setError("Could not delete the enquiry.");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  function openTab(name: string) {
    setTab(name);
    setError("");
    setNotice("");
  }

  if (!data) return <div className="admin-wrap"><p>{error || "Loading…"}</p></div>;

  const newCount = enquiries.filter((item) => item.status === "new").length;
  const collection = collections.find((item) => item.key === tab);

  return (
    <div className="admin-wrap">
      <div className="admin-bar">
        <h1>Website admin</h1>
        <div className="admin-bar-buttons">
          {tab !== "enquiries" && tab !== "account" && (
            <button className="btn btn-red" onClick={save}>{unsaved ? "Save changes ●" : "Save"}</button>
          )}
          <a className="btn btn-navy" href="/" target="_blank" rel="noreferrer">View website</a>
          <button className="btn btn-outline-dark" onClick={logout}>Sign out</button>
        </div>
      </div>

      {notice && <p className="admin-success" role="status">{notice}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      {unsaved && !notice && <p className="admin-warning">You have changes that are not saved yet. Press <b>Save</b> at the top.</p>}

      <div className="admin-layout">
        {/* Left menu */}
        <nav className="admin-side" aria-label="Admin sections">
          <button className={tab === "enquiries" ? "active" : ""} onClick={() => openTab("enquiries")}>
            Enquiries {newCount > 0 && <span className="admin-badge">{newCount}</span>}
          </button>
          <button className={tab === "settings" ? "active" : ""} onClick={() => openTab("settings")}>Company &amp; pages</button>
          {collections.map((item) => (
            <button key={item.key} className={tab === item.key ? "active" : ""} onClick={() => openTab(item.key)}>
              {item.label} <span className="admin-count">{data.lists[item.key].length}</span>
            </button>
          ))}
          <button className={tab === "account" ? "active" : ""} onClick={() => openTab("account")}>Admin accounts</button>
        </nav>

        {/* Main area */}
        <div>
          {tab === "enquiries" && <EnquiryList enquiries={enquiries} onStatus={changeStatus} onDelete={removeEnquiry} />}
          {tab === "account" && <AccountEditor />}
          {tab === "settings" && <SettingsEditor settings={data.settings} onChange={(settings) => change({ ...data, settings })} onError={setError} />}
          {collection && (
            <ListEditor
              key={collection.key}
              collection={collection}
              items={data.lists[collection.key]}
              onChange={(items) => change({ ...data, lists: { ...data.lists, [collection.key]: items } })}
              onError={setError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
