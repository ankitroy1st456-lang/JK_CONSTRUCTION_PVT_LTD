import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { emails } from "@/lib/site";
import { getSettings } from "@/lib/store";

export const revalidate = 300;
export const metadata: Metadata = { title: "Privacy Policy" };

// A plain-language privacy page. It uses the company details from Admin → Company & pages.
// Have the company read it once and change anything that does not match how they really work.
export default async function PrivacyPage() {
  const site = await getSettings();

  return (
    <>
      <PageHero title="Privacy policy" crumb="Privacy" text="What we do with the details you send us, in plain words." />

      <section className="section">
        <div className="container article">
          <h2 style={{ fontSize: 30 }}>What we collect</h2>
          <p>
            When you send an enquiry through our contact form we receive the things you type: your name, your phone number
            and/or email, what your enquiry is about, and your message. We do not ask for anything else, and we do not use
            advertising or tracking cookies on this website.
          </p>

          <h2 style={{ fontSize: 30 }}>How we use it</h2>
          <p>
            We use your details only to reply to your enquiry and to talk with you about your project or order. We do not
            sell your details or give them to other companies for their own use.
          </p>

          <h2 style={{ fontSize: 30 }}>Who else handles it</h2>
          <p>
            The website and its database are run by online services that store the information for us (hosting, database
            and, if switched on, email delivery). They only handle it on our behalf. The Contact page shows a Google Map and
            the pages load Google Fonts, so Google may see your internet address when you open them.
          </p>

          <h2 style={{ fontSize: 30 }}>How long we keep it</h2>
          <p>We keep an enquiry for as long as we need it to deal with it, and then delete it.</p>

          <h2 style={{ fontSize: 30 }}>Your choices</h2>
          <p>
            You can ask us to show you, correct or delete the details we hold about you. Just contact us using the details
            below and tell us which enquiry it is.
          </p>

          <h2 style={{ fontSize: 30 }}>Contact</h2>
          <p>
            {site.name}<br />
            {site.address}<br />
            Phone: {site.phone}
            {emails(site).length > 0 && <><br />Email: {emails(site).join(" or ")}</>}
          </p>

          <p className="muted">We may update this page from time to time. The version on this page is the one that applies.</p>
        </div>
      </section>
    </>
  );
}
