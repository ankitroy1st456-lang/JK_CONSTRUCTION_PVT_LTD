"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type AdminInfo = { email: string; createdAt: string };

// The "Admin accounts" tab: change my password, add or remove admins.
export function AccountEditor() {
  const [me, setMe] = useState("");
  const [admins, setAdmins] = useState<AdminInfo[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/account");
    if (!response.ok) return setError("Could not load the admin accounts.");
    const result = await response.json();
    setMe(result.me);
    setAdmins(result.admins);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Sends a change to the server and shows the result. Returns true if it worked.
  async function send(method: string, body: object, success: string) {
    setNotice("");
    setError("");
    const response = await fetch("/api/admin/account", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Something went wrong.");
      return false;
    }
    setNotice(success);
    await load();
    return true;
  }

  async function changeMyPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (data.newPassword !== data.confirmPassword) return setError("The two new passwords are not the same.");
    if (await send("PATCH", { currentPassword: data.currentPassword, newPassword: data.newPassword }, "Password changed. Other devices were signed out.")) form.reset();
  }

  async function addAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (await send("POST", data, "Admin added. They can sign in with that email and password.")) form.reset();
  }

  async function removeAdmin(email: string) {
    if (confirm("Remove the admin " + email + "? They will be signed out straight away.")) await send("DELETE", { email }, email + " was removed.");
  }

  return (
    <>
      {notice && <p className="admin-success" role="status">{notice}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}

      <div className="admin-card">
        <h2>Admins</h2>
        <p className="admin-muted">Signed in as <b>{me}</b>. Every admin can manage the whole website.</p>
        {admins.map((admin) => (
          <div className="admin-row" key={admin.email}>
            <span>{admin.email}{admin.email === me && " (you)"}</span>
            {admin.email !== me && <button className="admin-delete" onClick={() => removeAdmin(admin.email)}>Remove</button>}
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h2>Change my password</h2>
        <form onSubmit={changeMyPassword} className="admin-fields">
          <div className="admin-field full"><label>Current password</label><input name="currentPassword" type="password" autoComplete="current-password" required /></div>
          <div className="admin-field"><label>New password</label><input name="newPassword" type="password" autoComplete="new-password" minLength={12} required /></div>
          <div className="admin-field"><label>New password again</label><input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required /></div>
          <div className="admin-field full"><span className="admin-muted">At least 12 characters. Changing it signs you out on all other devices.</span></div>
          <div className="admin-field full"><button className="btn btn-red">Change password</button></div>
        </form>
      </div>

      <div className="admin-card">
        <h2>Add another admin</h2>
        <form onSubmit={addAdmin} className="admin-fields">
          <div className="admin-field"><label>Their email</label><input name="email" type="email" autoComplete="off" required /></div>
          <div className="admin-field"><label>Their password (12+ characters)</label><input name="password" type="password" autoComplete="new-password" minLength={12} required /></div>
          <div className="admin-field full"><label>Your current password (to confirm it is you)</label><input name="currentPassword" type="password" autoComplete="current-password" required /></div>
          <div className="admin-field full"><button className="btn btn-navy">Add admin</button></div>
        </form>
      </div>
    </>
  );
}
