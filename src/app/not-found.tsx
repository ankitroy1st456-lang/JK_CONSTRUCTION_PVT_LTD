import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="section center">
        <div className="container">
          <p className="label">Error 404</p>
          <h1>Page not found</h1>
          <p className="section-intro" style={{ marginInline: "auto" }}>
            We could not find that page. It may have moved, or there may be a typing mistake in the address.
          </p>
          <Link href="/" className="btn btn-red" style={{ marginTop: 24 }}>Back to home</Link>
        </div>
      </section>
    </SiteShell>
  );
}
