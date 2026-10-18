"use client"; // error pages must run in the browser (they have a "Try again" button)

import Image from "next/image";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { defaultSettings, phoneLink } from "@/lib/site";

// Shown when a page fails (for example the database is unreachable for a moment).
// The phone number is the starting one from site.ts, because we cannot read the database here.
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  // The failure happened on the server, so just redrawing is not enough: ask the server for the page again first.
  function tryAgain() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <section className="section center">
      <div className="container">
        <Image src="/images/jk-logo.jpg" alt="" width={96} height={96} style={{ borderRadius: "50%", marginBottom: 16 }} />
        <p className="label">Sorry</p>
        <h1>Something went wrong</h1>
        <p className="section-intro" style={{ marginInline: "auto" }}>
          This is a problem on our side, not yours. Please try again in a moment. If it keeps happening, call us on{" "}
          <a href={phoneLink(defaultSettings)}><strong>{defaultSettings.phone}</strong></a> and we will help you directly.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
          <button className="btn btn-red" onClick={tryAgain}>Try again</button>
          <a className="btn btn-navy" href={phoneLink(defaultSettings)}>Call us</a>
        </div>
      </div>
    </section>
  );
}
