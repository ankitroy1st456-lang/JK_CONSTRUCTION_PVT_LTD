"use client";

import type { Field } from "@/lib/collections";

// ---------- Uploading ----------

// Big phone photos make a website slow, so shrink them in the browser before uploading.
async function shrinkImage(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return file;
  const picture = await createImageBitmap(file);
  const maxWidth = 1800;
  if (picture.width <= maxWidth && file.size < 1.5 * 1024 * 1024) return file; // already small

  const scale = Math.min(1, maxWidth / picture.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(picture.width * scale);
  canvas.height = Math.round(picture.height * scale);
  canvas.getContext("2d")!.drawImage(picture, 0, 0, canvas.width, canvas.height);

  const type = file.type === "image/png" ? "image/png" : "image/jpeg"; // keep PNG so logos stay transparent
  const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, type, 0.85));
  if (!blob || blob.size >= file.size) return file; // keep the original if we could not make it smaller
  const name = type === "image/jpeg" ? file.name.replace(/\.\w+$/, ".jpg") : file.name; // ending must match the type
  return new File([blob], name, { type });
}

// Uploads one file to Supabase Storage and returns its public web address.
// The file goes straight from the browser to Supabase (it never passes through our server),
// because Vercel does not accept big requests. See src/app/api/admin/upload/route.ts.
async function uploadFile(file: File, isImage: boolean): Promise<string> {
  const fileToSend = isImage ? await shrinkImage(file) : file;

  // Step 1: ask our server for permission and a one-time upload address
  const permission = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: fileToSend.name, fileSize: fileToSend.size }),
  });
  const answer = await permission.json();
  if (!permission.ok) throw new Error(answer.error || "Upload failed.");

  // Step 2: send the file straight to Supabase Storage
  const form = new FormData();
  form.append("cacheControl", "31536000"); // browsers may keep the file for a year (every file has its own unique name)
  form.append("", file === fileToSend ? file : fileToSend); // the file itself (Supabase expects an empty field name)
  const sent = await fetch(answer.uploadUrl, { method: "PUT", headers: { "x-upsert": "false" }, body: form });
  if (!sent.ok) throw new Error("The file could not be saved to storage. Please try again.");

  // Step 3: the public address. It is saved with the item (in MongoDB) when you press Save.
  return answer.publicUrl;
}

// ---------- One input, chosen by the field type ----------
type Props = {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  onError: (message: string) => void;
};

export function FieldInput({ field, value, onChange, onError }: Props) {
  const text = typeof value === "string" ? value : "";

  async function pickFile(files: FileList | null, many: boolean) {
    if (!files || files.length === 0) return;
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadFile(file, field.type !== "file"));
      if (many) onChange([...(Array.isArray(value) ? value : []), ...urls]);
      else onChange(urls[0]);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  let input;
  switch (field.type) {
    case "textarea":
      input = <textarea rows={field.key === "body" ? 12 : 4} value={text} onChange={(e) => onChange(e.target.value)} />;
      break;

    case "select":
      input = (
        <select value={text} onChange={(e) => onChange(e.target.value)}>
          <option value="">— choose —</option>
          {field.options?.map((option) => <option key={option}>{option}</option>)}
        </select>
      );
      break;

    case "date":
      input = <input type="date" value={text} onChange={(e) => onChange(e.target.value)} />;
      break;

    case "image":
      input = (
        <>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => { pickFile(e.target.files, false); e.target.value = ""; }} />
          {text && (
            <div className="admin-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={text} alt="" />
              <button type="button" className="admin-delete" onClick={() => onChange("")}>Remove photo</button>
            </div>
          )}
        </>
      );
      break;

    case "images": {
      const photos = Array.isArray(value) ? (value as string[]) : [];
      input = (
        <>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => { pickFile(e.target.files, true); e.target.value = ""; }} />
          <div className="admin-preview-row">
            {photos.map((photo, index) => (
              <div key={index + photo} className="admin-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="" />
                <button type="button" className="admin-delete" onClick={() => onChange(photos.filter((_, i) => i !== index))}>Remove</button>
              </div>
            ))}
          </div>
        </>
      );
      break;
    }

    case "file":
      input = (
        <>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf"
            onChange={(e) => { pickFile(e.target.files, false); e.target.value = ""; }}
          />
          {text && (
            <p className="admin-muted">
              Uploaded: <a href={text} target="_blank" rel="noreferrer">open file</a>{" · "}
              <button type="button" className="admin-delete" onClick={() => onChange("")}>Remove</button>
            </p>
          )}
        </>
      );
      break;

    default: // text, url
      input = <input type="text" value={text} onChange={(e) => onChange(e.target.value)} />;
  }

  return (
    <div className={field.wide ? "admin-field full" : "admin-field"}>
      <label>{field.label}</label>
      {input}
      {field.help && <span className="admin-muted">{field.help}</span>}
    </div>
  );
}
