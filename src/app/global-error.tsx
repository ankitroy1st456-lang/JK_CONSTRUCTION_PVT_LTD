"use client"; // last-resort error page, used only if the page frame itself fails

import { defaultSettings, phoneLink } from "@/lib/site";

// This replaces the whole page, so it carries its own tiny bit of styling.
export default function GlobalError() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", color: "#171c33", textAlign: "center", padding: "20vh 24px" }}>
        <h1 style={{ color: "#0c1138" }}>{defaultSettings.shortName}</h1>
        <p>Sorry, something went wrong on our side. Please try again in a moment, or call us on <a href={phoneLink(defaultSettings)}>{defaultSettings.phone}</a>.</p>
        <button onClick={() => window.location.reload()} style={{ padding: "12px 24px", background: "#d80808", color: "#fff", border: 0, borderRadius: 3, fontSize: 16, cursor: "pointer" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
