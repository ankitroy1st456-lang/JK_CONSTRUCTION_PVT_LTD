import type { Metadata } from "next";
import { CallToAction } from "@/components/cta";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getPublicData } from "@/lib/store";

export const revalidate = 300; // kept ready-made; rebuilt when you save in admin, and at least every 5 minutes
export const metadata: Metadata = { title: "Downloads" };

export default async function DocumentsPage() {
  const { lists } = await getPublicData();
  const docs = lists.documents.filter((doc) => doc.file);
  // group by type: Certificate, Company profile ...
  const groups = [...new Set(docs.map((doc) => doc.category || "Other"))];

  return (
    <>
      <PageHero title="Downloads" crumb="Downloads" text="Our company papers, certificates and brochures. Open them or download them." />
      <section className="section">
        <div className="container">
          {groups.map((group) => (
            <div key={group} style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 32 }}>{group}</h2>
              <div className="doc-list">
                {docs.filter((doc) => (doc.category || "Other") === group).map((doc) => (
                  <a key={doc.id} href={doc.file} target="_blank" rel="noreferrer" className="doc">
                    <span className="info-icon"><Icon name="file" size={22} /></span>
                    <span>
                      <strong>{doc.title}</strong>
                      {doc.description && <small>{doc.description}</small>}
                      <small>{doc.file.split(".").pop().toUpperCase()}</small>
                    </span>
                    <Icon name="download" size={20} />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <CallToAction />
    </>
  );
}
