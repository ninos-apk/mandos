import {
  createNewsAction,
  deleteGalleryAction,
  deleteNewsAction,
  logoutAction,
  updateGalleryAction,
  updateHoursAction,
  updateLegalAction,
  updateNewsAction,
  updateSiteAction,
  uploadBrandingAction,
  uploadGalleryAction,
  uploadMenuAction,
} from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { assetUrl } from "@/lib/assets";
import { requireAdmin } from "@/lib/auth";
import { ExternalLink, ImagePlus, LogOut, Newspaper, Settings, Upload, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

function localDateTime(value: string | null) {
  return value ? value.slice(0, 16) : "";
}

export default async function AdminPage() {
  const { supabase, user, profile } = await requireAdmin();
  const [settingsResult, hoursResult, newsResult, galleryResult, legalResult, menuResult] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", "main").single(),
    supabase.from("opening_hours").select("*").order("day_index"),
    supabase.from("news_posts").select("*").order("created_at", { ascending: false }),
    supabase.from("gallery_images").select("*").order("category").order("sort_order"),
    supabase.from("legal_content").select("*").eq("id", "main").single(),
    supabase.from("menu_documents").select("*").eq("id", "main").single(),
  ]);
  const settings = settingsResult.data;
  const legal = legalResult.data;
  const menu = menuResult.data;
  if (!settings || !legal || !menu) {
    return <main className="admin-missing"><h1>Initialisierung erforderlich</h1><p>Führen Sie zuerst die SQL-Migration und anschließend <code>npm run seed:content</code> aus.</p></main>;
  }

  return (
    <>
      <header className="admin-header">
        <div><span className="admin-mark">M</span><div><strong>Mando&apos;s Verwaltung</strong><small>{profile.display_name || user.email}</small></div></div>
        <div className="admin-header-actions">
          <Link href="/" target="_blank">Webseite <ExternalLink size={15} /></Link>
          <form action={logoutAction}><button type="submit">Abmelden <LogOut size={15} /></button></form>
        </div>
      </header>
      <aside className="admin-nav">
        <a href="#general"><Settings /> Allgemeines</a>
        <a href="#news"><Newspaper /> News</a>
        <a href="#gallery"><ImagePlus /> Galerien</a>
        <a href="#menu-admin"><UtensilsCrossed /> Speisekarte</a>
        <a href="#legal-admin">§ Rechtliches</a>
      </aside>
      <main className="admin-main">
        <div className="admin-title"><p className="admin-kicker">Inhaltsverwaltung</p><h1>Guten Tag, {profile.display_name || "Admin"}</h1><p>Änderungen werden nach dem Speichern direkt auf der Webseite veröffentlicht.</p></div>

        <section className="admin-section" id="general">
          <div className="admin-section-heading"><span>01</span><div><h2>Allgemeine Informationen</h2><p>Kontaktdaten, Beschreibung und Suchmaschinen-Texte.</p></div></div>
          <form action={updateSiteAction} className="admin-card admin-form form-grid">
            <label className="wide">Restaurantname<input name="restaurant_name" defaultValue={settings.restaurant_name} required /></label>
            <label className="wide">Unterzeile<textarea name="tagline" defaultValue={settings.tagline} rows={2} required /></label>
            <label className="wide">Überschrift „Über uns“<input name="about_title" defaultValue={settings.about_title} required /></label>
            <label className="wide">Über uns<textarea name="about_text" defaultValue={settings.about_text} rows={8} required /></label>
            <label>Telefon<input name="phone_primary" defaultValue={settings.phone_primary} required /></label>
            <label>Zweites Telefon<input name="phone_secondary" defaultValue={settings.phone_secondary} /></label>
            <label className="wide">E-Mail<input type="email" name="email" defaultValue={settings.email} required /></label>
            <label>Straße<input name="street" defaultValue={settings.street} required /></label>
            <label>Postleitzahl<input name="postal_code" defaultValue={settings.postal_code} required /></label>
            <label>Ort<input name="city" defaultValue={settings.city} required /></label>
            <label className="wide">Google-Maps-Link<input type="url" name="maps_url" defaultValue={settings.maps_url} required /></label>
            <label>Instagram<input type="url" name="instagram_url" defaultValue={settings.instagram_url} /></label>
            <label>TikTok<input type="url" name="tiktok_url" defaultValue={settings.tiktok_url} /></label>
            <label className="wide">SEO-Titel <small>maximal 70 Zeichen</small><input name="seo_title" defaultValue={settings.seo_title} maxLength={70} required /></label>
            <label className="wide">SEO-Beschreibung <small>50 bis 170 Zeichen</small><textarea name="seo_description" defaultValue={settings.seo_description} minLength={50} maxLength={170} rows={3} required /></label>
            <div className="wide form-actions"><button className="admin-button primary" type="submit">Informationen speichern</button></div>
          </form>

          <div className="admin-card-grid branding-grid">
            <form action={uploadBrandingAction} className="admin-card admin-form">
              <input type="hidden" name="kind" value="hero" />
              <h3>Titelbild ersetzen</h3>
              <div className="branding-preview"><Image src={assetUrl(settings.hero_path)} alt="Aktuelles Titelbild" fill sizes="420px" /></div>
              <label>Neues Bild<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" required /></label>
              <button className="admin-button secondary" type="submit"><Upload size={16} /> Titelbild hochladen</button>
            </form>
            <form action={uploadBrandingAction} className="admin-card admin-form">
              <input type="hidden" name="kind" value="logo" />
              <h3>Logo ersetzen</h3>
              <div className="branding-preview contain"><Image src={assetUrl(settings.logo_path)} alt="Aktuelles Logo" fill sizes="420px" /></div>
              <label>Neues Logo<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" required /></label>
              <button className="admin-button secondary" type="submit"><Upload size={16} /> Logo hochladen</button>
            </form>
          </div>

          <div className="admin-card hours-admin">
            <h3>Öffnungszeiten</h3>
            {hoursResult.data?.map((hour) => (
              <form action={updateHoursAction} className="hour-form" key={hour.day_index}>
                <input type="hidden" name="day_index" value={hour.day_index} />
                <input name="label" defaultValue={hour.label} aria-label="Tag" required />
                <input name="display_text" defaultValue={hour.display_text} aria-label="Öffnungszeit" required />
                <label className="check"><input type="checkbox" name="is_closed" defaultChecked={hour.is_closed} /> Ruhetag</label>
                <button className="admin-button small" type="submit">Speichern</button>
              </form>
            ))}
          </div>
        </section>

        <section className="admin-section" id="news">
          <div className="admin-section-heading"><span>02</span><div><h2>News & Mitteilungen</h2><p>Angebote, Events, Urlaub und geänderte Öffnungszeiten.</p></div></div>
          <form action={createNewsAction} className="admin-card admin-form form-grid">
            <h3 className="wide">Neue Mitteilung</h3>
            <label className="wide">Titel<input name="title" required /></label>
            <label className="wide">Beschreibung<textarea name="body" rows={4} /></label>
            <label>Bild<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
            <label>Bildbeschreibung<input name="image_alt" placeholder="Was ist auf dem Bild zu sehen?" /></label>
            <label>Gültig ab<input type="datetime-local" name="publish_from" /></label>
            <label>Gültig bis<input type="datetime-local" name="publish_until" /></label>
            <label className="check"><input type="checkbox" name="is_pinned" /> Hervorheben</label>
            <label className="check"><input type="checkbox" name="is_published" defaultChecked /> Sofort veröffentlichen</label>
            <div className="wide form-actions"><button className="admin-button primary" type="submit">Mitteilung anlegen</button></div>
          </form>
          <div className="admin-stack">
            {newsResult.data?.map((post) => (
              <article className="admin-card news-admin-card" key={post.id}>
                {post.image_path && <div className="admin-thumb"><Image src={assetUrl(post.image_path)} alt={post.image_alt || post.title} fill sizes="220px" /></div>}
                <form action={updateNewsAction} className="admin-form form-grid">
                  <input type="hidden" name="id" value={post.id} />
                  <label className="wide">Titel<input name="title" defaultValue={post.title} required /></label>
                  <label className="wide">Beschreibung<textarea name="body" defaultValue={post.body} rows={4} /></label>
                  <label>Neues Bild<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
                  <label>Bildbeschreibung<input name="image_alt" defaultValue={post.image_alt} /></label>
                  <label>Gültig ab<input type="datetime-local" name="publish_from" defaultValue={localDateTime(post.publish_from)} /></label>
                  <label>Gültig bis<input type="datetime-local" name="publish_until" defaultValue={localDateTime(post.publish_until)} /></label>
                  <label className="check"><input type="checkbox" name="is_pinned" defaultChecked={post.is_pinned} /> Hervorheben</label>
                  <label className="check"><input type="checkbox" name="is_published" defaultChecked={post.is_published} /> Veröffentlicht</label>
                  <div className="wide form-actions"><button className="admin-button secondary" type="submit">Änderungen speichern</button></div>
                </form>
                <form action={deleteNewsAction}><input type="hidden" name="id" value={post.id} /><ConfirmSubmit>Mitteilung löschen</ConfirmSubmit></form>
              </article>
            ))}
            {!newsResult.data?.length && <div className="admin-empty">Noch keine Mitteilungen angelegt.</div>}
          </div>
        </section>

        <section className="admin-section" id="gallery">
          <div className="admin-section-heading"><span>03</span><div><h2>Galerien</h2><p>Bilder hochladen, beschriften, sortieren oder entfernen.</p></div></div>
          <form action={uploadGalleryAction} className="admin-card admin-form form-grid">
            <label>Galerie<select name="category"><option value="food">Speisen</option><option value="rooms">Räumlichkeiten</option></select></label>
            <label>Allgemeine Bildbeschreibung<input name="alt_text" placeholder="Optional" /></label>
            <label className="wide">Bilder auswählen <small>maximal 12 Bilder pro Upload</small><input type="file" name="images" accept="image/jpeg,image/png,image/webp,image/avif" multiple required /></label>
            <div className="wide form-actions"><button className="admin-button primary" type="submit"><Upload size={16} /> Bilder hochladen</button></div>
          </form>
          {(["food", "rooms"] as const).map((category) => (
            <div className="gallery-admin-group" key={category}>
              <h3>{category === "food" ? "Speisen" : "Räumlichkeiten"}</h3>
              <div className="gallery-admin-grid">
                {galleryResult.data?.filter((image) => image.category === category).map((image) => (
                  <article className="gallery-admin-card" key={image.id}>
                    <div className="gallery-admin-image"><Image src={assetUrl(image.image_path)} alt={image.alt_text} fill sizes="240px" /></div>
                    <form action={updateGalleryAction} className="admin-form compact">
                      <input type="hidden" name="id" value={image.id} />
                      <label>Bildbeschreibung<input name="alt_text" defaultValue={image.alt_text} /></label>
                      <label>Reihenfolge<input type="number" name="sort_order" min="0" defaultValue={image.sort_order} /></label>
                      <label className="check"><input type="checkbox" name="is_visible" defaultChecked={image.is_visible} /> Sichtbar</label>
                      <button className="admin-button small" type="submit">Speichern</button>
                    </form>
                    <form action={deleteGalleryAction}><input type="hidden" name="id" value={image.id} /><ConfirmSubmit>Bild löschen</ConfirmSubmit></form>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="admin-section" id="menu-admin">
          <div className="admin-section-heading"><span>04</span><div><h2>Speisekarte</h2><p>Die aktuell angezeigte PDF durch eine neue Ausgabe ersetzen.</p></div></div>
          <form action={uploadMenuAction} className="admin-card admin-form">
            <p>Aktuelle Datei: <a href={assetUrl(menu.file_path, "menu")} target="_blank" rel="noreferrer"><strong>{menu.original_name}</strong> <ExternalLink size={14} /></a></p>
            <label>Neue Speisekarte als PDF<input type="file" name="menu" accept="application/pdf" required /></label>
            <div className="form-actions"><button className="admin-button primary" type="submit"><Upload size={16} /> PDF ersetzen</button></div>
          </form>
        </section>

        <section className="admin-section" id="legal-admin">
          <div className="admin-section-heading"><span>05</span><div><h2>Rechtliche Texte</h2><p>Impressum und Datenschutzerklärung. Änderungen sollten rechtlich geprüft werden.</p></div></div>
          <form action={updateLegalAction} className="admin-card admin-form">
            <label>Impressum<textarea name="imprint" defaultValue={legal.imprint} rows={16} required /></label>
            <label>Datenschutzerklärung<textarea name="privacy" defaultValue={legal.privacy} rows={18} required /></label>
            <div className="form-actions"><button className="admin-button primary" type="submit">Rechtliche Texte speichern</button></div>
          </form>
        </section>
      </main>
    </>
  );
}
