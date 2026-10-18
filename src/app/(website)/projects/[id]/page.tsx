import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallToAction } from "@/components/cta";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getPublicData } from "@/lib/store";

export const revalidate = 300; // kept ready-made; rebuilt when you save in admin, and at least every 5 minutes

// No pages are pre-built; each one is built the first time somebody opens it, and then kept ready-made.
export function generateStaticParams() {
  return [];
}

async function findProject(id: string) {
  const { lists } = await getPublicData();
  return lists.projects.find((p) => p.id === id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const project = await findProject((await params).id);
  return { title: project?.title ?? "Project", description: project?.description?.slice(0, 160), openGraph: project?.image ? { images: [project.image] } : undefined };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const project = await findProject((await params).id);
  if (!project) notFound();

  const photos: string[] = [project.image, ...(project.images ?? [])].filter(Boolean);
  const details = [
    ["Type", project.category], ["Status", project.status], ["Location", project.location], ["Year", project.year],
  ].filter(([, value]) => value);

  return (
    <>
      <PageHero title={project.title} crumb="Projects" text={[project.category, project.location].filter(Boolean).join(" · ")} />

      <section className="section">
        <div className="container project-detail">
          <div>
            {photos.length > 0 ? (
              <div className="gallery">
                {photos.map((photo, index) => (
                  <a key={index + photo} href={photo} target="_blank" rel="noreferrer" className={index === 0 ? "gallery-main" : ""}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={project.title + " photo " + (index + 1)} loading={index === 0 ? "eager" : "lazy"} />
                  </a>
                ))}
              </div>
            ) : (
              <div className="media-photo"><Icon name="building" size={64} /></div>
            )}
          </div>
          <aside>
            <h2 style={{ fontSize: 30 }}>Project details</h2>
            <div className="facts">
              {details.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
            </div>
            {project.description && <p style={{ marginTop: 24, whiteSpace: "pre-line" }}>{project.description}</p>}
            <Link href={"/contact?item=" + encodeURIComponent("a project like " + project.title)} className="btn btn-red" style={{ marginTop: 12 }}>
              Start a similar project
            </Link>
          </aside>
        </div>
        <div className="container" style={{ marginTop: 32 }}>
          <Link href="/projects" className="arrow-link" style={{ flexDirection: "row-reverse" }}>All projects <Icon name="arrow" size={18} /></Link>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
