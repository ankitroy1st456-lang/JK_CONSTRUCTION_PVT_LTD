import Image from "next/image";
import Link from "next/link";
import { CallToAction } from "@/components/cta";
import { MediaCard } from "@/components/media-card";
import { Icon } from "@/components/icons";
import { ProjectCard } from "@/components/project-card";
import { formatDate, highlights, phoneLink, steps } from "@/lib/site";
import { getPublicData } from "@/lib/store";

export const revalidate = 300; // kept ready-made; rebuilt when you save in admin, and at least every 5 minutes

export default async function HomePage() {
  const { settings: site, lists } = await getPublicData();

  const projects = lists.projects.slice(0, 3);
  const news = lists.news.slice(0, 3);
  // Show a number only if both the number and its label were filled in (in admin → Settings)
  const stats = [1, 2, 3, 4]
    .map((n) => ({ number: site["stat" + n + "Number"], label: site["stat" + n + "Label"] }))
    .filter((stat) => stat.number && stat.label);

  return (
    <>
      {/* ===== Big banner. If a banner photo is set in admin, it is used instead of the drawing ===== */}
      <section
        className={site.heroImage ? "hero hero-photo" : "hero"}
        style={site.heroImage ? { backgroundImage: `linear-gradient(rgba(12,17,56,.82), rgba(12,17,56,.82)), url("${site.heroImage}")` } : undefined}
      >
        <div className="container hero-row">
          <div>
            <p className="label label-light">{site.heroLabel}</p>
            <h1>
              {site.heroTitleTop}
              <span>{site.heroTitleAccent}</span>
            </h1>
            <p className="hero-lead">{site.heroText}</p>
            <div className="hero-buttons">
              <Link href="/contact" className="btn btn-red">Request a Quote <Icon name="arrow" size={18} /></Link>
              <Link href="/services" className="btn btn-outline">Our Services</Link>
            </div>
          </div>
          {!site.heroImage && (
            <div className="hero-art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/hero-site.svg" alt="Building under construction with a tower crane" />
            </div>
          )}
        </div>
      </section>

      {/* ===== White box overlapping the banner ===== */}
      <section className="info-strip">
        <div className="container info-row">
          <a href={phoneLink(site)} className="info-item">
            <span className="info-icon"><Icon name="phone" size={24} /></span>
            <span><small>Call us</small><strong>{site.phone}</strong></span>
          </a>
          <div className="info-item">
            <span className="info-icon"><Icon name="pin" size={24} /></span>
            <span><small>Visit us</small><strong>{site.address}</strong></span>
          </div>
          <div className="info-item">
            <span className="info-icon"><Icon name="badge" size={24} /></span>
            <span><small>Registered company</small><strong>Regd. No. {site.registrationNumber}</strong></span>
          </div>
        </div>
      </section>

      {/* ===== Numbers (only if filled in) ===== */}
      {stats.length > 0 && (
        <section className="stats">
          <div className="container stats-row">
            {stats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.number}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== Services ===== */}
      {lists.services.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="label">What we do</p>
                <h2>Our services</h2>
              </div>
              <Link href="/services" className="arrow-link">All services <Icon name="arrow" size={18} /></Link>
            </div>
            <div className="cards">
              {lists.services.map((service) => (
                <Link key={service.id} href="/services" className="card">
                  <span className="icon-box"><Icon name={service.icon} size={30} /></span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== About (short) ===== */}
      <section className="section section-grey">
        <div className="container about-row">
          <div className="seal-card">
            <Image src="/images/jk-logo.jpg" alt={site.name + " seal"} width={220} height={220} />
            <p>{site.slogan}</p>
          </div>
          <div>
            <p className="label">About us</p>
            <h2>A local company you can talk to</h2>
            <p>{site.shortName} is based in {site.address}. Whether you are building, renovating or only need materials, you can start with one simple phone call.</p>
            <ul className="check-list">
              {highlights.map((text) => (
                <li key={text}><span className="tick"><Icon name="check" size={16} /></span>{text}</li>
              ))}
            </ul>
            <Link href="/about" className="arrow-link">More about us <Icon name="arrow" size={18} /></Link>
          </div>
        </div>
      </section>

      {/* ===== Projects (only if you have published some) ===== */}
      {projects.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="label">Our work</p>
                <h2>Recent projects</h2>
              </div>
              <Link href="/projects" className="arrow-link">All projects <Icon name="arrow" size={18} /></Link>
            </div>
            <div className="media-grid">
              {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          </div>
        </section>
      )}

      {/* ===== 3 steps ===== */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="label label-light">How it works</p>
              <h2>From first call to next steps</h2>
            </div>
          </div>
          <div className="steps">
            {steps.map((step, index) => (
              <div key={step.title} className="step">
                <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials (only if any) ===== */}
      {lists.testimonials.length > 0 && (
        <section className="section section-grey">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="label">Client feedback</p>
                <h2>What our clients say</h2>
              </div>
            </div>
            <div className="quotes">
              {lists.testimonials.slice(0, 6).map((item) => (
                <figure key={item.id} className="quote">
                  <Icon name="quote" size={32} />
                  <blockquote>{item.quote}</blockquote>
                  <figcaption>
                    {item.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={item.image} alt="" loading="lazy" />}
                    <span><strong>{item.name}</strong>{item.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Clients & partners logos (only if any) ===== */}
      {lists.partners.length > 0 && (
        <section className="section partners">
          <div className="container center">
            <p className="label">Trusted by</p>
            <div className="partner-row">
              {lists.partners.map((item) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={item.id} src={item.image} alt={item.name} title={item.name} loading="lazy" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Latest news (only if any) ===== */}
      {news.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="label">Latest updates</p>
                <h2>News</h2>
              </div>
              <Link href="/news" className="arrow-link">All news <Icon name="arrow" size={18} /></Link>
            </div>
            <div className="media-grid">
              {news.map((post) => (
                <MediaCard key={post.id} href={"/news/" + post.id} image={post.image} icon="file" kicker={formatDate(post.date)} title={post.title} text={post.summary} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CallToAction />
    </>
  );
}
