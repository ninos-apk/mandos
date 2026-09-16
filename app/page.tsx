import { Gallery } from "@/components/gallery";
import { SiteHeader } from "@/components/site-header";
import { assetUrl } from "@/lib/assets";
import { getPublicSiteData } from "@/lib/site-data";
import { CalendarDays, Camera, Clock3, Download, MapPin, Phone, Sparkles, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPublicSiteData();
  const hero = assetUrl(settings.heroPath);
  return {
    title: settings.seoTitle,
    description: settings.seoDescription,
    alternates: { canonical: "/" },
    openGraph: {
      title: settings.seoTitle,
      description: settings.seoDescription,
      url: "/",
      siteName: settings.restaurantName,
      locale: "de_DE",
      type: "website",
      images: hero ? [{ url: hero, alt: settings.restaurantName }] : [],
    },
  };
}

export default async function HomePage() {
  const data = await getPublicSiteData();
  const { settings } = data;
  const foodImages = data.gallery.filter((image) => image.category === "food");
  const roomImages = data.gallery.filter((image) => image.category === "rooms");
  const menuUrl = assetUrl(data.menu.filePath, "menu");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://xn--brgerhaus-waldmohr-m6b.de";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings.restaurantName,
    image: assetUrl(settings.heroPath),
    url: siteUrl,
    telephone: settings.phonePrimary,
    email: settings.email,
    servesCuisine: ["Orientalisch", "Mediterran", "Deutsch"],
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.street,
      postalCode: settings.postalCode,
      addressLocality: settings.city,
      addressCountry: "DE",
    },
    sameAs: [settings.instagramUrl, settings.tiktokUrl].filter(Boolean),
  };

  return (
    <>
      <SiteHeader logoUrl={assetUrl(settings.logoPath)} phone={settings.phonePrimary} />
      <main>
        <section className="hero" id="home">
          <Image className="hero-image" src={assetUrl(settings.heroPath)} alt="Orientalische Spezialitäten bei Mando's" fill priority sizes="100vw" />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow light"><Sparkles size={15} /> Willkommen im Bürgerhaus Waldmohr</p>
            <h1>Orientalische Küche.<br /><em>Ehrlich serviert.</em></h1>
            <p className="hero-copy">{settings.tagline}</p>
            <div className="hero-actions">
              <a className="button primary" href="#menu"><UtensilsCrossed size={18} /> Speisekarte</a>
              <a className="button ghost" href={settings.mapsUrl} target="_blank" rel="noreferrer"><MapPin size={18} /> Route planen</a>
            </div>
          </div>
          <div className="hero-facts">
            <span><MapPin size={18} /> {settings.city}</span>
            <span><Clock3 size={18} /> Mi - So geöffnet</span>
            <a href={`tel:${settings.phonePrimary.replace(/\s/g, "")}`}><Phone size={18} /> {settings.phonePrimary}</a>
          </div>
        </section>

        <section className="section news-section" id="news">
          <div className="section-heading horizontal">
            <div><p className="eyebrow">Neuigkeiten</p><h2>Aktuell bei uns</h2></div>
            <p>Angebote, Veranstaltungen und Änderungen unserer Öffnungszeiten auf einen Blick.</p>
          </div>
          {data.news.length ? (
            <div className="news-grid">
              {data.news.map((post) => (
                <article className={post.isPinned ? "news-card featured" : "news-card"} key={post.id}>
                  {post.imagePath && <div className="news-image"><Image src={assetUrl(post.imagePath)} alt={post.imageAlt || post.title} fill sizes="(max-width: 800px) 100vw, 50vw" /></div>}
                  <div className="news-body">
                    <p className="news-date"><CalendarDays size={15} /> {new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(post.publishFrom ?? post.createdAt))}</p>
                    <h3>{post.title}</h3>
                    <p>{post.body}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-news"><span>Heute</span><p>Aktuell liegen keine besonderen Mitteilungen vor. Wir freuen uns auf Ihren Besuch.</p></div>
          )}
        </section>

        <section className="section about-section" id="about">
          <div className="about-copy">
            <p className="eyebrow">Über Mando&apos;s</p>
            <h2>{settings.aboutTitle}</h2>
            <div className="long-copy">{settings.aboutText}</div>
            <a className="arrow-link" href="#contact">Feier oder Tisch anfragen <span>→</span></a>
          </div>
          {roomImages[0] && (
            <div className="about-image">
              <Image src={assetUrl(roomImages[0].imagePath)} alt={roomImages[0].altText} fill sizes="(max-width: 800px) 100vw, 50vw" />
              <div className="image-note"><strong>Feiern im Bürgerhaus</strong><span>Persönlich. Großzügig. Unvergesslich.</span></div>
            </div>
          )}
        </section>

        <section className="menu-section" id="menu">
          <div className="menu-intro">
            <p className="eyebrow light">Unsere Küche</p>
            <h2>Eine Karte voller <em>Lieblingsgerichte.</em></h2>
            <p>Von hausgemachten Dips und Falafel bis zu Grilltellern, Steaks und ausgewählten Getränken.</p>
            <a className="button primary" href={menuUrl} target="_blank" rel="noreferrer"><Download size={18} /> Speisekarte öffnen</a>
          </div>
          <div className="menu-preview">
            <iframe src={`${menuUrl}#toolbar=0&navpanes=0&view=FitH`} title="Aktuelle Speisekarte" />
            <p>Aktualisiert: {data.menu.updatedAt ? new Intl.DateTimeFormat("de-DE").format(new Date(data.menu.updatedAt)) : "aktuelle Ausgabe"}</p>
          </div>
        </section>

        <section className="section hours-section" id="hours">
          <div className="hours-heading">
            <p className="eyebrow">Öffnungszeiten</p>
            <h2>Zeit für Genuss</h2>
            <p>Reservierungen nehmen wir gerne telefonisch oder per E-Mail entgegen.</p>
            <a className="button dark" href={`tel:${settings.phonePrimary.replace(/\s/g, "")}`}><Phone size={18} /> Jetzt anrufen</a>
          </div>
          <div className="hours-list">
            {data.openingHours.map((hour) => (
              <div className="hours-row" key={hour.dayIndex}>
                <strong>{hour.label}</strong>
                <span className={hour.isClosed ? "closed" : ""}>{hour.displayText}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section gallery-section" id="food-gallery">
          <div className="section-heading">
            <p className="eyebrow">Aus unserer Küche</p>
            <h2>Mit Liebe auf den Teller</h2>
          </div>
          <Gallery images={foodImages} />
        </section>

        <section className="section rooms-section" id="rooms">
          <div className="section-heading horizontal light-heading">
            <div><p className="eyebrow light">Ihre Veranstaltung</p><h2>Räume für gemeinsame Momente</h2></div>
            <p>Ob Geburtstag, Familienfeier, Trauerfeier oder Weihnachtsfeier: Wir planen mit Ihnen den passenden Rahmen und auf Wunsch ein individuelles Buffet.</p>
          </div>
          <Gallery images={roomImages} />
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-main">
            <p className="eyebrow">Kontakt & Reservierung</p>
            <h2>Wir freuen uns<br />auf Ihren Besuch.</h2>
            <a href={`tel:${settings.phonePrimary.replace(/\s/g, "")}`}>{settings.phonePrimary}</a>
            {settings.phoneSecondary && <a href={`tel:${settings.phoneSecondary.replace(/\s/g, "")}`}>{settings.phoneSecondary}</a>}
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </div>
          <div className="contact-details">
            <div><MapPin /><p><strong>{settings.restaurantName}</strong><br />{settings.street}<br />{settings.postalCode} {settings.city}</p></div>
            <a className="button dark" href={settings.mapsUrl} target="_blank" rel="noreferrer">In Google Maps öffnen</a>
            <div className="social-links">
              {settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer"><Camera /> Instagram</a>}
              {settings.tiktokUrl && <a href={settings.tiktokUrl} target="_blank" rel="noreferrer">TikTok</a>}
            </div>
          </div>
        </section>

        <section className="legal-section" id="legal">
          <details id="impressum"><summary>Impressum</summary><div>{data.legal.imprint}</div></details>
          <details id="datenschutz"><summary>Datenschutz</summary><div>{data.legal.privacy}</div></details>
        </section>
      </main>
      <footer>
        <p>© {new Date().getFullYear()} {settings.restaurantName}</p>
        <a href="/admin/login">Administration</a>
      </footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    </>
  );
}
