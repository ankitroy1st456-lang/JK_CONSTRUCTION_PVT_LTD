import "server-only";
import type { Enquiry } from "./types";

// ============================================================
//  Optional: email a copy of every new enquiry to the company.
//
//  It uses Resend (https://resend.com, the free plan is enough). To turn it on, set:
//    RESEND_API_KEY   your Resend API key
//    NOTIFY_EMAIL     who receives the emails (several: separate with commas)
//    NOTIFY_FROM      optional, e.g. "J.K. Construction <website@yourdomain.com>" once you have
//                     verified your domain in Resend. Until then the free test sender is used,
//                     which can only deliver to the email address of your own Resend account.
//
//  If these are not set, nothing is sent. The enquiry is always saved and shown in the admin either way.
// ============================================================

export async function emailNewEnquiry(enquiry: Enquiry, siteUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipients = (process.env.NOTIFY_EMAIL ?? "").split(",").map((email) => email.trim()).filter(Boolean);
  if (!apiKey || recipients.length === 0) return;

  const received = new Date(enquiry.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Kathmandu", dateStyle: "medium", timeStyle: "short" });
  const text = [
    "A new enquiry came in on the website.",
    "",
    `Name:     ${enquiry.name}`,
    `Phone:    ${enquiry.phone || "-"}`,
    `Email:    ${enquiry.email || "-"}`,
    `About:    ${enquiry.type}`,
    `Received: ${received} (Nepal time)`,
    "",
    "Message:",
    enquiry.message,
    "",
    `Open the admin to follow up: ${siteUrl}/admin`,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || "J.K. Construction Website <onboarding@resend.dev>",
        to: recipients,
        subject: `New enquiry from ${enquiry.name.replace(/\s+/g, " ")} (${enquiry.type})`,
        text,
        // so that pressing "Reply" writes to the customer
        ...(enquiry.email ? { reply_to: enquiry.email } : {}),
      }),
      signal: AbortSignal.timeout(8000), // never wait more than 8 seconds
    });
    if (!response.ok) console.error("The enquiry email was refused:", response.status, await response.text());
  } catch (error) {
    // Not being able to email must never lose the enquiry, which is already saved
    console.error("The enquiry email could not be sent:", error);
  }
}
