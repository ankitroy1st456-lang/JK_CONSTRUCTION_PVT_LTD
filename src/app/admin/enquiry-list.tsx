"use client";

import type { Enquiry, EnquiryStatus } from "@/lib/types";

// The messages sent from the website's contact form
export function EnquiryList({ enquiries, onStatus, onDelete }: { enquiries: Enquiry[]; onStatus: (id: string, status: EnquiryStatus) => void; onDelete: (id: string) => void }) {
  if (enquiries.length === 0) return <div className="admin-card">No enquiries yet.</div>;

  return (
    <>
      {enquiries.map((enquiry) => (
        <div className="admin-card" key={enquiry.id}>
          <div className="admin-row">
            <div>
              <strong>{enquiry.name}</strong>
              <div className="admin-muted">{new Date(enquiry.createdAt).toLocaleString()} · {enquiry.type}</div>
            </div>
            <select value={enquiry.status} onChange={(e) => onStatus(enquiry.id, e.target.value as EnquiryStatus)} style={{ width: "auto" }}>
              <option value="new">New</option>
              <option value="in-progress">In progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          {enquiry.phone && <div>Phone: <a href={"tel:" + enquiry.phone}>{enquiry.phone}</a></div>}
          {enquiry.email && <div>Email: <a href={"mailto:" + enquiry.email}>{enquiry.email}</a></div>}
          <p className="admin-message">{enquiry.message}</p>
          <button className="admin-delete" onClick={() => onDelete(enquiry.id)}>Delete this enquiry</button>
        </div>
      ))}
    </>
  );
}
