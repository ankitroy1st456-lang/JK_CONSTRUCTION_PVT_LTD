import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { emails, phoneLink, socialLinks, whatsappLink } from "@/lib/site";
import type { Settings } from "@/lib/types";

export function Footer({ settings, moreLinks }: { settings: Settings; moreLinks: { href: string; label: string }[] }) {
  const social = socialLinks(settings);

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="footer-logo">
            <Image src="/images/jk-logo.jpg" alt="" width={64} height={64} />
            <strong>{settings.name}</strong>
          </Link>
          <p>{settings.slogan}</p>
          <p className="footer-small">Regd. No. {settings.registrationNumber}{settings.panNumber && " · PAN/VAT " + settings.panNumber}</p>
          {social.length > 0 && (
            <div className="social">
              {social.map((link) => (
                <a key={link.name} href={link.href} target="_blank" rel="noreferrer" aria-label={link.name}>
                  <Icon name={link.icon} size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2>Quick links</h2>
          <Link href="/about">About us</Link>
          <Link href="/services">Services</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/supplies">Supplies</Link>
          {moreLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          <Link href="/contact">Contact</Link>
        </div>

        <div>
          <h2>Contact us</h2>
          <p><Icon name="pin" size={16} /> {settings.address}</p>
          <a href={phoneLink(settings)}><Icon name="phone" size={16} /> {settings.phone}</a>
          {emails(settings).map((email) => (
            <a key={email} href={"mailto:" + email}><Icon name="mail" size={16} /> {email}</a>
          ))}
          <a href={whatsappLink(settings)} target="_blank" rel="noreferrer"><Icon name="chat" size={16} /> Message on WhatsApp</a>
          {settings.hours && <p><Icon name="calendar" size={16} /> {settings.hours}</p>}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-row">
          <span>© {new Date().getFullYear()} {settings.name} All rights reserved.</span>
          <Link href="/privacy">Privacy policy</Link>
        </div>
      </div>
    </footer>
  );
}
