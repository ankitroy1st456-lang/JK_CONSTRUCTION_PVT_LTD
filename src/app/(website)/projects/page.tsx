import type { Metadata } from "next";
import Link from "next/link";
import { CallToAction } from "@/components/cta";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { getPublicData } from "@/lib/store";

export const dynamic = "force-dynamic"; // uses the ?filter in the address, so it is built for each visit
export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams; // e.g. /projects?category=Residential
  const { lists } = await getPublicData();

  const categories = [...new Set(lists.projects.map((p) => p.category).filter(Boolean))];
  const projects = category ? lists.projects.filter((p) => p.category === category) : lists.projects;

  return (
    <>
      <PageHero title="Our projects" crumb="Projects" text="Some of the buildings we have worked on." />

      <section className="section">
        <div className="container">
          <h2 className="sr-only">All projects</h2>
          {categories.length > 1 && (
            <div className="chips">
              <Link href="/projects" className={!category ? "chip active" : "chip"}>All</Link>
              {categories.map((name) => (
                <Link key={name} href={"/projects?category=" + encodeURIComponent(name)} className={category === name ? "chip active" : "chip"}>{name}</Link>
              ))}
            </div>
          )}

          {projects.length > 0 ? (
            <div className="media-grid">
              {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          ) : (
            <div className="empty-box">
              <span className="icon-box"><Icon name="building" size={30} /></span>
              <h2 style={{ fontSize: 34 }}>Photos coming soon</h2>
              <p>We are still putting our project photos together. If you would like to talk about a project like yours, call us or send a message.</p>
              <Link href="/contact" className="btn btn-red">Contact us</Link>
            </div>
          )}
        </div>
      </section>

      <CallToAction title="Your project could be next" />
    </>
  );
}
