"use client"; // the form sends its data from the browser

import Link from "next/link";
import { FormEvent, useState } from "react";
import { enquiryTypes } from "@/lib/site";

export function ContactForm({ defaultType, defaultMessage }: { defaultType?: string; defaultMessage?: string }) {
  const [message, setMessage] = useState(""); // the "thank you" or error text
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  // Pre-select the drop-down if we came from a service page (/contact?type=...)
  const startType = defaultType && enquiryTypes.includes(defaultType) ? defaultType : enquiryTypes[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)); // { name, phone, email, type, message, website }

    setSending(true);
    setMessage("");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send your enquiry.");

      setSuccess(true);
      setMessage("Thank you, we have got your message. We will contact you soon.");
      form.reset();
      (form.elements.namedItem("message") as HTMLTextAreaElement).value = ""; // reset() would bring back the pre-filled text
    } catch (error) {
      setSuccess(false);
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please call us instead.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {/* Hidden trap for spam bots. Real people never see or fill this. */}
      <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="form-grid">
        <label>
          Your name *
          <input name="name" autoComplete="name" placeholder="Full name" required />
        </label>
        <label>
          Phone number
          <input name="phone" type="tel" autoComplete="tel" placeholder="+977 ..." />
        </label>
        <label>
          Email address
          <input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
        </label>
        <label>
          What is it about?
          <select name="type" defaultValue={startType}>
            {enquiryTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label className="full">
          Your requirement *
          <textarea name="message" rows={5} defaultValue={defaultMessage} placeholder="Location, type of work or materials, quantities, timing…" required />
        </label>
      </div>

      <p className="form-note">Please give a phone number or an email so we can reply. We only use your details to answer your enquiry (see our <Link href="/privacy">privacy policy</Link>).</p>
      <button className="btn btn-red" type="submit" disabled={sending}>
        {sending ? "Sending…" : "Send Enquiry"}
      </button>
      {message && <p className={success ? "form-message ok" : "form-message error"} role="status">{message}</p>}
    </form>
  );
}
