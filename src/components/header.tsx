"use client"; // needed because of the mobile menu button

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { phoneLink } from "@/lib/site";

// Only these few company details are sent to the header (it runs in the browser)
export type HeaderInfo = { name: string; shortName: string; address: string; phone: string; email1: string };

// The always-visible menu
const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/supplies", label: "Supplies" },
  { href: "/contact", label: "Contact" },
];

// moreLinks = News / Downloads / Careers. site-shell.tsx only passes the ones that have content.
export function Header({ settings, moreLinks }: { settings: HeaderInfo; moreLinks: { href: string; label: string }[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setMenuOpen(false);

  // "J.K. Construction" big, and the rest of the name ("& Suppliers Pvt. Ltd.") small
  const restOfName = settings.name.replace(settings.shortName, "").trim().replace(/^and\s+/i, "& ");

  function linkClass(href: string) {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return active ? "active" : "";
  }

  return (
    <>
      {/* Thin bar at the very top */}
      <aside className="topbar" aria-label="Contact details">
        <div className="container topbar-row">
          <span><Icon name="pin" size={14} /> {settings.address}</span>
          <span className="topbar-links">
            <a href={phoneLink(settings)}><Icon name="phone" size={14} /> {settings.phone}</a>
            {settings.email1 && <a href={"mailto:" + settings.email1}><Icon name="mail" size={14} /> {settings.email1}</a>}
          </span>
        </div>
      </aside>

      {/* Logo + menu */}
      <header className="header">
        <div className="container header-row">
          <Link href="/" className="logo" onClick={close}>
            <Image src="/images/jk-logo.jpg" alt={settings.shortName + " logo"} width={56} height={56} priority />
            <span>
              <strong>{settings.shortName}</strong>
              <small>{restOfName}</small>
            </span>
          </Link>

          <nav className={menuOpen ? "nav open" : "nav"} aria-label="Main menu">
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)} aria-current={linkClass(link.href) ? "page" : undefined} onClick={close}>
                {link.label}
              </Link>
            ))}

            {moreLinks.length > 0 && (
              <div className="dropdown">
                <button type="button" className="dropdown-title" aria-haspopup="true">More ▾</button>
                <div className="dropdown-menu">
                  {moreLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={linkClass(link.href)} onClick={close}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* This button only shows inside the mobile menu */}
            <Link href="/contact" className="btn btn-red nav-quote" onClick={close}>Get a Quote</Link>
          </nav>

          <Link href="/contact" className="btn btn-red header-quote">Get a Quote</Link>

          <button
            className="menu-button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>
    </>
  );
}
