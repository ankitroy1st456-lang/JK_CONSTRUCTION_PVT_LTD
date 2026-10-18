import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { cleanData } from "@/lib/clean";
import { getData, saveData } from "@/lib/store";

export const dynamic = "force-dynamic";

// Admin loads everything (settings + all lists)
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getData());
}

// Admin saves everything. cleanData() checks every field first (see lib/clean.ts).
export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    if (typeof body !== "object" || body === null || typeof body.settings !== "object" || typeof body.lists !== "object") {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }
    const newVersion = await saveData(cleanData(body), Number(body.version) || 0);
    if (newVersion === null) {
      return NextResponse.json({ error: "Somebody else saved changes while you were editing, so yours were NOT saved. Please reload this page, then make your changes again." }, { status: 409 });
    }

    // The public pages are kept ready-made for speed. Tell Next.js to rebuild them now.
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, version: newVersion });
  } catch {
    return NextResponse.json({ error: "Could not save." }, { status: 400 });
  }
}
