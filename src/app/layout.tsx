import type { Metadata, Viewport } from "next";
import { defaultSettings } from "@/lib/site";
import { getSettings } from "@/lib/store";
import "./globals.css";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  // If the database is unreachable the page itself will fail too; the starting values just keep this from crashing.
  const site = await getSettings().catch(() => defaultSettings);
  return {
    metadataBase: new URL(site.url || "https://example.com"),
    title: { default: site.name + " | Janakpurdham, Nepal", template: "%s | " + site.shortName },
    description: site.metaDescription,
    alternates: { canonical: "./" }, // each page names itself as the "main" address (helps Google)
    openGraph: {
      type: "website",
      locale: "en_NP",
      siteName: site.name,
      title: site.name,
      description: site.metaDescription,
      images: site.heroImage ? [site.heroImage] : ["/images/jk-logo.jpg"],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c1138",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
