import { randomUUID } from "node:crypto";
import { after, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { emailNewEnquiry } from "@/lib/notify";
import { isBlocked, recordHit, visitorAddress } from "@/lib/rate-limit";
import { addEnquiry, deleteEnquiry, getEnquiries, getSettings, setEnquiryStatus } from "@/lib/store";
import type { Enquiry } from "@/lib/types";

export const dynamic = "force-dynamic";

// One address can send 20 messages per hour (real customers send 1 or 2; this stops floods of spam)
const MAX_PER_HOUR = 20;
const ONE_HOUR = 60 * 60 * 1000;

// Visitor sends the contact form (anyone can do this)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Spam bots fill in the hidden "website" field. Pretend it worked and ignore them.
    if (body.website) return NextResponse.json({ ok: true });

    const who = "enquiry:" + visitorAddress(request);
    if (await isBlocked(who, MAX_PER_HOUR, ONE_HOUR)) {
      return NextResponse.json({ error: "You have sent several messages already. Please call us instead, or try again later." }, { status: 429 });
    }
    await recordHit(who);

    // Take each field as text and cut it to a sensible length
    const name = String(body.name ?? "").trim().slice(0, 120);
    const phone = String(body.phone ?? "").trim().slice(0, 80);
    const email = String(body.email ?? "").trim().slice(0, 200);
    const type = String(body.type ?? "").trim().slice(0, 100) || "Other / not sure yet";
    const message = String(body.message ?? "").trim().slice(0, 5000);

    if (!name || !message || (!phone && !email)) {
      return NextResponse.json({ error: "Please give your name, your message, and a phone number or email." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const enquiry: Enquiry = { id: randomUUID(), createdAt: new Date().toISOString(), name, phone, email, type, message, status: "new" };
    await addEnquiry(enquiry);

    // Email the company (if that is switched on). `after` runs this once the visitor already has their answer.
    const { url } = await getSettings();
    after(() => emailNewEnquiry(enquiry, url));

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We could not save your enquiry. Please call us instead." }, { status: 500 });
  }
}

// Admin reads the list of enquiries
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getEnquiries());
}

// Admin changes an enquiry's status (new / in-progress / closed)
export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, status } = await request.json();
    if (typeof id !== "string" || !["new", "in-progress", "closed"].includes(status)) {
      return NextResponse.json({ error: "Invalid update." }, { status: 400 });
    }
    const found = await setEnquiryStatus(id, status);
    if (!found) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not update the enquiry." }, { status: 400 });
  }
}

// Admin deletes an enquiry (for example spam)
export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await request.json();
    if (typeof id !== "string" || !(await deleteEnquiry(id))) {
      return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete the enquiry." }, { status: 400 });
  }
}
