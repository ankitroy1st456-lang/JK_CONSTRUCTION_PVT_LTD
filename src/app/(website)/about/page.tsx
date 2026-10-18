import type { Metadata } from "next";
import Image from "next/image";
import { CallToAction } from "@/components/cta";
import { Icon } from "@/components/icons";
import { MediaCard } from "@/components/media-card";
import { PageHero } from "@/components/page-hero";
import { values } from "@/lib/site";
import { getPublicData } from "@/lib/store";

export const revalidate = 300; // kept ready-made; rebuilt when you save in admin, and at least every 5 minutes
export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const { settings: site, lists } = await getPublicData();
  const certificates = lists.documents.filter((doc) => doc.category === "Certificate");

  return (
    <>
      <PageHero title="About us" crumb="About" text="Who we are, and how we like to work." />

      <section className="section">
        <div className="container about-row">
          {site.aboutImage ? (
            <div className="about-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={site.aboutImage} alt={site.name} />
            </div>
          ) : (
            <div className="seal-card">
              <Image src="/images/jk-logo.jpg" alt={site.name + " seal"} width={220} height={220} />
              <p>{site.slogan}</p>
            </div>
          )}
          <div>
            <p className="label">Who we are</p>
            <h2>Construction and supplies, one local team</h2>
            <p>{site.aboutIntro}</p>
            <p>{site.aboutSecond}</p>
            <div className="facts">
              <div><span>Company</span><strong>{site.name}</strong></div>
              <div><span>Location</span><strong>{site.address}</strong></div>
              <div><span>Registration no.</span><strong>{site.registrationNumber}</strong></div>
              {site.panNumber && <div><span>PAN / VAT no.</span><strong>{site.panNumber}</strong></div>}
              {site.established && <div><span>Established</span><strong>{site.established}</strong></div>}
            </div>
          </div>
        </div>
      </section>

      {/* Director's message (only if filled in) */}
      {site.directorMessage && (
        <section className="section section-dark">
          <div className="container director">
            {site.directorImage && /* eslint-disable-next-line @next/next/no-img-element */ <img src={site.directorImage} alt={site.directorName} />}
            <div>
              <p className="label label-light">Message from the director</p>
              <blockquote>{site.directorMessage}</blockquote>
              <p><strong>{site.directorName}</strong>{site.directorRole && <><br />{site.directorRole}</>}</p>
            </div>
          </div>
        </section>
      )}

      <section className="section section-grey">
        <div className="container two-col">
          <div className="box">
            <h3>Our mission</h3>
            <p>{site.mission}</p>
          </div>
          <div className="box">
            <h3>Our vision</h3>
            <p>{site.vision}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="label">Our way</p>
              <h2>How we like to work</h2>
            </div>
          </div>
          <div className="values">
            {values.map((value, index) => (
              <div key={value.title}>
                <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team (only if any) */}
      {lists.team.length > 0 && (
        <section className="section section-grey">
          <div className="container">
            <div className="section-head"><div><p className="label">Our people</p><h2>Meet the team</h2></div></div>
            <div className="team-grid">
              {lists.team.map((person) => (
                <div key={person.id} className="person">
                  <div className="person-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {person.image ? <img src={person.image} alt={person.name} loading="lazy" /> : <Icon name="users" size={48} />}
                  </div>
                  <h3>{person.name}</h3>
                  <span className="person-role">{person.position}</span>
                  {person.bio && <p>{person.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Equipment (only if any) */}
      {lists.equipment.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head"><div><p className="label">What we work with</p><h2>Equipment</h2></div></div>
            <div className="media-grid">
              {lists.equipment.map((item) => (
                <MediaCard key={item.id} image={item.image} imageAlt={item.title} icon="truck" kicker={item.quantity ? "Quantity: " + item.quantity : undefined} title={item.title} text={item.description} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certificates (only if any) */}
      {certificates.length > 0 && (
        <section className="section section-grey">
          <div className="container">
            <div className="section-head"><div><p className="label">Credentials</p><h2>Registrations &amp; certificates</h2></div></div>
            <div className="doc-list">
              {certificates.map((doc) => (
                <a key={doc.id} href={doc.file} target="_blank" rel="noreferrer" className="doc">
                  <span className="info-icon"><Icon name="badge" size={22} /></span>
                  <span><strong>{doc.title}</strong>{doc.description && <small>{doc.description}</small>}</span>
                  <Icon name="download" size={20} />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <CallToAction title="Let's talk about your project" />
    </>
  );
}
