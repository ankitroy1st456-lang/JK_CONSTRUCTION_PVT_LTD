import { MediaCard } from "@/components/media-card";
import type { Item } from "@/lib/types";

// One project in the gallery. Click it to open the project's own page.
export function ProjectCard({ project }: { project: Item }) {
  const kicker = [project.category, project.location, project.year].filter(Boolean).join(" · ");
  const text = project.description && project.description.length > 110 ? project.description.slice(0, 110) + "…" : project.description;

  return (
    <MediaCard
      href={"/projects/" + project.id}
      image={project.image}
      imageAlt={project.title}
      icon="building"
      badge={project.status ? { label: project.status, red: project.status === "Ongoing" } : undefined}
      kicker={kicker}
      title={project.title}
      text={text}
    />
  );
}
