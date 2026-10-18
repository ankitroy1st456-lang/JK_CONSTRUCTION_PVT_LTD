import type { Metadata } from "next";
import Link from "next/link";
import { CallToAction } from "@/components/cta";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { formatDate } from "@/lib/site";
import { getPublicData } from "@/lib/store";

export const revalidate = 300; // kept ready-made; rebuilt when you save in admin, and at least every 5 minutes
export const metadata: Metadata = { title: "Careers" };

export default async function CareersPage() {
  const { lists } = await getPublicData();
  const today = new Date().toISOString().slice(0, 10);
  // hide jobs whose "apply by" date has passed
  const jobs = lists.jobs.filter((job) => !job.deadline || job.deadline >= today);

  return (
    <>
      <PageHero title="Careers" crumb="Careers" text="Want to work with us? Here is what is open right now." />
      <section className="section">
        <div className="container">
          <h2 className="sr-only">Open positions</h2>
          {jobs.length > 0 ? (
            <div className="job-list">
              {jobs.map((job) => (
                <article key={job.id} className="job">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="job-meta">
                      {job.jobType && <span><Icon name="briefcase" size={14} /> {job.jobType}</span>}
                      {job.location && <span><Icon name="pin" size={14} /> {job.location}</span>}
                      {job.deadline && <span><Icon name="calendar" size={14} /> Apply by {formatDate(job.deadline)}</span>}
                    </p>
                    {job.description && <p style={{ whiteSpace: "pre-line" }}>{job.description}</p>}
                  </div>
                  <Link href={"/contact?type=Job%20application&item=" + encodeURIComponent(job.title)} className="btn btn-red">Apply now</Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-box"><h2 style={{ fontSize: 34 }}>No vacancies right now</h2><p>You are welcome to send us your details anyway, and we will keep them in mind.</p></div>
          )}
        </div>
      </section>
      <CallToAction title="Want to work with us?" text="Send us your details and tell us what you are good at." />
    </>
  );
}
