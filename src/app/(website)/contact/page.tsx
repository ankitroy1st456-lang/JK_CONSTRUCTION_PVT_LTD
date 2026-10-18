import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { emails, mapEmbed, mapLink, phoneLink, socialLinks, whatsappLink } from "@/lib/site";
import { getPublicData } from "@/lib/store";

export const dynamic = "force-dynamic"; // uses ?type= and ?item= in the address, so it is built for each visit
export const metadata: Metadata = { title: "Contact & Request a Quote" };

// Links like /contact?type=Construction%20supplies&item=Cement pre-fill the form
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string; item?: string }> }) {
  const { type, item } = await searchParams;
  const { settings: site, lists } = await getPublicData();
  const social = socialLinks(site);

  return (
    <>
      <PageHero title="Contact us" crumb="Contact" text="Call us, message us on WhatsApp or send the form. The more you tell us, the faster we can help." />

      <section className="section">
        <div className="container contact-grid">
          <div>
            <p className="label">Get in touch</p>
            <h2>Talk to us</h2>

            <div className="contact-item">
              <span className="info-icon"><Icon name="phone" size={22} /></span>
              <div><small>Phone</small><a href={phoneLink(site)}><strong>{site.phone}</strong></a></div>
            </div>
            <div className="contact-item">
              <span className="info-icon"><Icon name="chat" size={22} /></span>
              <div><small>WhatsApp</small><a href={whatsappLink(site)} target="_blank" rel="noreferrer"><strong>Message us on WhatsApp</strong></a></div>
            </div>
            {emails(site).map((email) => (
              <div key={email} className="contact-item">
                <span className="info-icon"><Icon name="mail" size={22} /></span>
                <div><small>Email</small><a href={"mailto:" + email}><strong>{email}</strong></a></div>
              </div>
            ))}
            <div className="contact-item">
              <span className="info-icon"><Icon name="pin" size={22} /></span>
              <div><small>Address</small><a href={mapLink(site)} target="_blank" rel="noreferrer"><strong>{site.address}</strong></a></div>
            </div>
            {site.hours && (
              <div className="contact-item">
                <span className="info-icon"><Icon name="calendar" size={22} /></span>
                <div><small>Working hours</small><strong>{site.hours}</strong></div>
              </div>
            )}
            {social.length > 0 && (
              <div className="social social-dark">
                {social.map((link) => (
                  <a key={link.name} href={link.href} target="_blank" rel="noreferrer" aria-label={link.name}><Icon name={link.icon} size={20} /></a>
                ))}
              </div>
            )}
          </div>

          <div className="form-card">
            <h2 style={{ fontSize: 38 }}>Send an enquiry</h2>
            <p className="muted">Fill this in and we will get back to you.</p>
            <ContactForm defaultType={type} defaultMessage={item ? "I would like to ask about: " + item + "\n" : undefined} />
          </div>
        </div>

        <div className="container map">
          <iframe src={mapEmbed(site)} title="Map showing our location" loading="lazy" />
        </div>
      </section>

      {/* FAQs (only if any) */}
      {lists.faqs.length > 0 && (
        <section className="section section-grey">
          <div className="container faq">
            <p className="label">Questions</p>
            <h2>Frequently asked questions</h2>
            {lists.faqs.map((faq) => (
              <details key={faq.id}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
