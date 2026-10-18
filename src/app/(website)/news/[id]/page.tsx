import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallToAction } from "@/components/cta";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { formatDate } from "@/lib/site";
import { getPublicData } from "@/lib/store";

export const revalidate = 300; // kept ready-made; rebuilt when you save in admin, and at least every 5 minutes

// No pages are pre-built; each one is built the first time somebody opens it, and then kept ready-made.
export function generateStaticParams() {
  return [];
}

async function findPost(id: string) {
  const { lists } = await getPublicData();
  return lists.news.find((p) => p.id === id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const post = await findPost((await params).id);
  return { title: post?.title ?? "News", description: post?.summary, openGraph: post?.image ? { images: [post.image] } : undefined };
}

export default async function NewsPostPage({ params }: { params: Promise<{ id: string }> }) {
  const post = await findPost((await params).id);
  if (!post) notFound();

  return (
    <>
      <PageHero title={post.title} crumb="News" text={formatDate(post.date)} />
      <section className="section">
        <div className="container article">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {post.image && <img src={post.image} alt="" className="article-photo" />}
          {post.summary && <p className="article-lead">{post.summary}</p>}
          {post.body && <div className="article-body">{post.body}</div>}
          <Link href="/news" className="arrow-link" style={{ marginTop: 32, flexDirection: "row-reverse" }}>All news <Icon name="arrow" size={18} /></Link>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
