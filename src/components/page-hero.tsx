import Link from "next/link";

// The dark banner at the top of every page except Home.
export function PageHero({ title, text, crumb }: { title: string; text: string; crumb: string }) {
  return (
    <section className="page-hero">
      <div className="container">
        <p className="crumbs"><Link href="/">Home</Link> / {crumb}</p>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}
