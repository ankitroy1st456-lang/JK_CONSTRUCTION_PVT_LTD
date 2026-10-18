import type { Metadata } from "next";
import Link from "next/link";
import { CallToAction } from "@/components/cta";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getPublicData } from "@/lib/store";

export const revalidate = 300; // kept ready-made; rebuilt when you save in admin, and at least every 5 minutes
export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const { lists } = await getPublicData();

  return (
    <>
      <PageHero title="Our services" crumb="Services" text="Here is what we can do for you. Not sure which one you need? Just call and ask." />

      <section className="section">
        <div className="container service-list">
          {lists.services.map((service) => (
            <article key={service.id} className="service-wide">
              <span className="icon-box"><Icon name={service.icon} size={30} /></span>
              <div>
                <h2 style={{ fontSize: 34 }}>{service.title}</h2>
                <p>{service.more || service.text}</p>
                <Link href={"/contact?item=" + encodeURIComponent(service.title)} className="arrow-link">
                  Ask about this <Icon name="arrow" size={18} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-grey">
        <div className="container split">
          <div>
            <p className="label">Before you get in touch</p>
            <h2>Help us help you</h2>
            <p className="section-intro">A few details from you means a faster and clearer answer from us.</p>
          </div>
          <ol className="tell-list">
            <li>Where the work is, and what kind of work or materials you need.</li>
            <li>Sizes, quantities, drawings or photos, if you have them.</li>
            <li>When you would like it done.</li>
          </ol>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
