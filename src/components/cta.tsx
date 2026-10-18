import Link from "next/link";
import { Icon } from "@/components/icons";
import { phoneLink } from "@/lib/site";
import { getSettings } from "@/lib/store";

// The red "Have a project in mind?" strip shown near the bottom of pages.
export async function CallToAction({
  title = "Have a project in mind?",
  text = "Tell us what you are planning. We will start with a simple chat about what you need.",
}: {
  title?: string;
  text?: string;
}) {
  const settings = await getSettings();
  return (
    <section className="cta">
      <div className="container cta-row">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="cta-buttons">
          <Link href="/contact" className="btn btn-white">Request a Quote <Icon name="arrow" size={18} /></Link>
          <a href={phoneLink(settings)} className="btn btn-outline"><Icon name="phone" size={18} /> {settings.phone}</a>
        </div>
      </div>
    </section>
  );
}
