import type { Metadata } from "next";
import { CallToAction } from "@/components/cta";
import { MediaCard } from "@/components/media-card";
import { PageHero } from "@/components/page-hero";
import { formatDate } from "@/lib/site";
import { getPublicData } from "@/lib/store";

export const revalidate = 300; // kept ready-made; rebuilt when you save in admin, and at least every 5 minutes
export const metadata: Metadata = { title: "News & Updates" };

export default async function NewsPage() {
  const { lists } = await getPublicData();
  // newest date first
  const posts = [...lists.news].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  return (
    <>
      <PageHero title="News & updates" crumb="News" text="What has been happening on our sites and in the company." />
      <section className="section">
        <div className="container">
          <h2 className="sr-only">All news</h2>
          {posts.length > 0 ? (
            <div className="media-grid">
              {posts.map((post) => (
                <MediaCard key={post.id} href={"/news/" + post.id} image={post.image} icon="file" kicker={formatDate(post.date)} title={post.title} text={post.summary} />
              ))}
            </div>
          ) : (
            <div className="empty-box"><h2 style={{ fontSize: 34 }}>No news yet</h2><p>Please check back soon.</p></div>
          )}
        </div>
      </section>
      <CallToAction />
    </>
  );
}
