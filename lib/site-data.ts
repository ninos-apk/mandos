import { defaultData } from "@/lib/default-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PublicSiteData } from "@/lib/types";

export async function getPublicSiteData(): Promise<PublicSiteData> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return defaultData;

  const [settingsResult, hoursResult, newsResult, galleryResult, legalResult, menuResult] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", "main").maybeSingle(),
    supabase.from("opening_hours").select("*").order("day_index"),
    supabase.from("news_posts").select("*").eq("is_published", true).order("is_pinned", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("gallery_images").select("*").eq("is_visible", true).order("category").order("sort_order"),
    supabase.from("legal_content").select("*").eq("id", "main").maybeSingle(),
    supabase.from("menu_documents").select("*").eq("id", "main").maybeSingle(),
  ]);

  const settingsRow = settingsResult.data;
  const legalRow = legalResult.data;
  const menuRow = menuResult.data;
  const now = Date.now();

  return {
    settings: settingsRow
      ? {
          restaurantName: settingsRow.restaurant_name,
          tagline: settingsRow.tagline,
          aboutTitle: settingsRow.about_title,
          aboutText: settingsRow.about_text,
          phonePrimary: settingsRow.phone_primary,
          phoneSecondary: settingsRow.phone_secondary,
          email: settingsRow.email,
          street: settingsRow.street,
          postalCode: settingsRow.postal_code,
          city: settingsRow.city,
          mapsUrl: settingsRow.maps_url,
          instagramUrl: settingsRow.instagram_url,
          tiktokUrl: settingsRow.tiktok_url,
          heroPath: settingsRow.hero_path,
          logoPath: settingsRow.logo_path,
          seoTitle: settingsRow.seo_title,
          seoDescription: settingsRow.seo_description,
        }
      : defaultData.settings,
    openingHours: hoursResult.data?.length
      ? hoursResult.data.map((row) => ({
          dayIndex: row.day_index,
          label: row.label,
          displayText: row.display_text,
          isClosed: row.is_closed,
        }))
      : defaultData.openingHours,
    news: (newsResult.data ?? [])
      .filter((row) => (!row.publish_from || new Date(row.publish_from).getTime() <= now) && (!row.publish_until || new Date(row.publish_until).getTime() >= now))
      .map((row) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        imagePath: row.image_path,
        imageAlt: row.image_alt,
        isPinned: row.is_pinned,
        isPublished: row.is_published,
        publishFrom: row.publish_from,
        publishUntil: row.publish_until,
        createdAt: row.created_at,
      })),
    gallery: galleryResult.data?.length
      ? galleryResult.data.map((row) => ({
          id: row.id,
          category: row.category,
          imagePath: row.image_path,
          altText: row.alt_text,
          sortOrder: row.sort_order,
          isVisible: row.is_visible,
        }))
      : defaultData.gallery,
    legal: legalRow ? { imprint: legalRow.imprint, privacy: legalRow.privacy } : defaultData.legal,
    menu: menuRow
      ? { filePath: menuRow.file_path, originalName: menuRow.original_name, updatedAt: menuRow.updated_at }
      : defaultData.menu,
  };
}
