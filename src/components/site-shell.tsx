import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { emails, socialLinks } from "@/lib/site";
import { getPublicData } from "@/lib/store";

// The frame around every public page: header on top, footer at the bottom.
// The News / Downloads / Careers links appear in the menu only when they have something to show.
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const { settings, lists } = await getPublicData();

  const moreLinks = [];
  if (lists.news.length > 0) moreLinks.push({ href: "/news", label: "News" });
  if (lists.documents.length > 0) moreLinks.push({ href: "/documents", label: "Downloads" });
  if (lists.jobs.length > 0) moreLinks.push({ href: "/careers", label: "Careers" });

  // Helps Google show the business details in search results
  const businessInfo = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: settings.name,
    url: settings.url,
    logo: settings.url + "/images/jk-logo.jpg",
    telephone: settings.phone,
    email: emails(settings)[0],
    address: { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "NP" },
    sameAs: socialLinks(settings).map((link) => link.href),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessInfo) }} />
      <a href="#main" className="skip-link">Skip to main content</a>
      <Header
        settings={{ name: settings.name, shortName: settings.shortName, address: settings.address, phone: settings.phone, email1: settings.email1 }}
        moreLinks={moreLinks}
      />
      <main id="main">{children}</main>
      <Footer settings={settings} moreLinks={moreLinks} />
      <WhatsAppButton settings={settings} />
    </>
  );
}
