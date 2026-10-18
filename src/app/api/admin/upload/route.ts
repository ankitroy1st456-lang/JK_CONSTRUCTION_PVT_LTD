import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { BUCKET, getSupabase } from "@/lib/supabase";

// ============================================================
//  HOW A FILE UPLOAD WORKS (admin panel -> Supabase Storage)
//
//  Vercel does not accept big requests (about 4.5 MB), so the file does NOT travel through
//  our server. Instead:
//    1. The browser tells this route the file's name and size.
//    2. This route checks the admin is signed in and the file is allowed, then asks Supabase
//       for a one-time upload address and works out the file's public web address.
//    3. The browser sends the file straight to Supabase using that upload address
//       (see uploadFile in src/app/admin/fields.tsx).
//    4. The public web address is saved in the project / document / news item, and goes into
//       MongoDB when the admin presses Save.
// ============================================================

// Allowed file endings, the folder they are kept in, and the biggest size allowed (in MB)
const allowed: Record<string, { folder: string; maxMB: number }> = {
  ".jpg": { folder: "images", maxMB: 8 },
  ".jpeg": { folder: "images", maxMB: 8 },
  ".png": { folder: "images", maxMB: 8 },
  ".webp": { folder: "images", maxMB: 8 },
  ".avif": { folder: "images", maxMB: 8 },
  ".pdf": { folder: "documents", maxMB: 20 },
  ".doc": { folder: "documents", maxMB: 20 },
  ".docx": { folder: "documents", maxMB: 20 },
  ".xls": { folder: "documents", maxMB: 20 },
  ".xlsx": { folder: "documents", maxMB: 20 },
  ".dwg": { folder: "documents", maxMB: 20 }, // CAD drawings / blueprints
  ".dxf": { folder: "documents", maxMB: 20 },
};

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { fileName, fileSize } = await request.json();
    if (typeof fileName !== "string" || typeof fileSize !== "number") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Work out the file ending (".pdf", ".jpg" ...) and check it is allowed
    const dot = fileName.lastIndexOf(".");
    const ending = dot === -1 ? "" : fileName.slice(dot).toLowerCase();
    const rule = allowed[ending];
    if (!rule) {
      return NextResponse.json({ error: "Allowed files: JPG, PNG, WebP, AVIF, PDF, Word, Excel, DWG and DXF." }, { status: 415 });
    }
    if (fileSize > rule.maxMB * 1024 * 1024) {
      return NextResponse.json({ error: `This file is too big. The limit is ${rule.maxMB} MB.` }, { status: 413 });
    }

    // A random name, so files never overwrite each other. e.g. "images/3f2a...c1.jpg"
    const path = `${rule.folder}/${randomUUID()}${ending}`;

    const storage = getSupabase().storage.from(BUCKET);
    const { data, error } = await storage.createSignedUploadUrl(path);
    if (error || !data) throw error ?? new Error("Supabase did not give an upload address.");

    return NextResponse.json({
      uploadUrl: data.signedUrl, // the browser sends the file here
      publicUrl: storage.getPublicUrl(path).data.publicUrl, // the address everyone can see it at
    });
  } catch (error) {
    console.error("Upload could not be prepared:", error); // visible in the Vercel logs
    return NextResponse.json({ error: "Could not prepare the upload. Check the Supabase settings." }, { status: 500 });
  }
}
