import type { Metadata } from "next";
import Link from "next/link";
import { CallToAction } from "@/components/cta";
import { MediaCard } from "@/components/media-card";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getPublicData } from "@/lib/store";

export const dynamic = "force-dynamic"; // uses the ?filter in the address, so it is built for each visit
export const metadata: Metadata = { title: "Construction Supplies" };

export default async function SuppliesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const { lists } = await getPublicData();

  const categories = [...new Set(lists.products.map((p) => p.category).filter(Boolean))];
  const products = category ? lists.products.filter((p) => p.category === category) : lists.products;

  return (
    <>
      <PageHero title="Construction supplies" crumb="Supplies" text="Tell us what you need, how much, and where it should go. We will come back with what is available and the price." />

      <section className="section">
        <div className="container">
          <h2 className="sr-only">All supplies</h2>
          {categories.length > 1 && (
            <div className="chips">
              <Link href="/supplies" className={!category ? "chip active" : "chip"}>All</Link>
              {categories.map((name) => (
                <Link key={name} href={"/supplies?category=" + encodeURIComponent(name)} className={category === name ? "chip active" : "chip"}>{name}</Link>
              ))}
            </div>
          )}

          {products.length > 0 ? (
            <div className="media-grid">
              {products.map((product) => (
                <MediaCard key={product.id} image={product.image} imageAlt={product.title} icon="truck" kicker={product.category} title={product.title} text={product.description}>
                  <p className="price">
                    {product.price ? product.price : "Price on request"}
                    {product.price && product.unit && <small> {product.unit}</small>}
                  </p>
                  <Link href={"/contact?type=Construction%20supplies&item=" + encodeURIComponent(product.title)} className="arrow-link">
                    Ask for a quote <Icon name="arrow" size={18} />
                  </Link>
                </MediaCard>
              ))}
            </div>
          ) : (
            <div className="empty-box">
              <span className="icon-box"><Icon name="truck" size={30} /></span>
              <h2 style={{ fontSize: 34 }}>Need building materials?</h2>
              <p>Tell us what you need, how much, and where it should go. We will reply with what is available and the price.</p>
              <Link href="/contact?type=Construction%20supplies" className="btn btn-red">Ask for a supply quote</Link>
            </div>
          )}
        </div>
      </section>

      <section className="section section-grey">
        <div className="container split">
          <div>
            <p className="label">Supply enquiries</p>
            <h2>What to tell us</h2>
            <p className="section-intro">Availability and prices can change, so we confirm them for each order.</p>
          </div>
          <ol className="tell-list">
            <li>Which materials you need.</li>
            <li>How much of each (quantity).</li>
            <li>Where they should be delivered.</li>
            <li>When you need them.</li>
          </ol>
        </div>
      </section>

      <CallToAction title="Ready to order?" text="Call or message us with your list and we will get back to you." />
    </>
  );
}
