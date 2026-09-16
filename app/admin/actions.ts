"use server";

import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const siteSchema = z.object({
  restaurant_name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(10).max(300),
  about_title: z.string().trim().min(2).max(160),
  about_text: z.string().trim().min(20).max(5000),
  phone_primary: z.string().trim().min(5).max(40),
  phone_secondary: z.string().trim().max(40),
  email: z.string().trim().email().max(160),
  street: z.string().trim().min(3).max(160),
  postal_code: z.string().trim().min(4).max(12),
  city: z.string().trim().min(2).max(100),
  maps_url: z.string().trim().url().max(1000),
  instagram_url: z.union([z.literal(""), z.string().trim().url().max(1000)]),
  tiktok_url: z.union([z.literal(""), z.string().trim().url().max(1000)]),
  seo_title: z.string().trim().min(10).max(70),
  seo_description: z.string().trim().min(50).max(170),
});

const newsSchema = z.object({
  title: z.string().trim().min(2).max(180),
  body: z.string().trim().max(5000),
  image_alt: z.string().trim().max(250),
  publish_from: z.string().trim().optional(),
  publish_until: z.string().trim().optional(),
});

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function optionalDate(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function fileExtension(file: File) {
  const byType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "application/pdf": "pdf",
  };
  return byType[file.type] ?? "bin";
}

async function uploadImage(file: File, folder: string, supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  if (!supabase) throw new Error("Supabase ist nicht konfiguriert.");
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowed.includes(file.type)) throw new Error("Erlaubt sind JPG, PNG, WebP und AVIF.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Das Bild darf maximal 10 MB groß sein.");

  const objectPath = `${folder}/${randomUUID()}.${fileExtension(file)}`;
  const { error } = await supabase.storage.from("media").upload(objectPath, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) throw error;
  return objectPath;
}

export async function loginAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login?error=config");

  const email = field(formData, "email").trim().toLowerCase();
  const password = field(formData, "password");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.status === 0) redirect("/admin/login?error=connection");
  if (error && error.code !== "invalid_credentials") redirect("/admin/login?error=auth");
  if (error || !data.user) redirect("/admin/login?error=credentials");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    redirect("/admin/login?error=forbidden");
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}

export async function updateSiteAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = siteSchema.parse(Object.fromEntries([...siteSchema.keyof().options.map((key) => [key, field(formData, key)])]));
  const { error } = await supabase.from("site_settings").update(parsed).eq("id", "main");
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateHoursAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const dayIndex = z.coerce.number().int().min(1).max(20).parse(field(formData, "day_index"));
  const label = z.string().trim().min(2).max(60).parse(field(formData, "label"));
  const displayText = z.string().trim().min(2).max(160).parse(field(formData, "display_text"));
  const isClosed = formData.get("is_closed") === "on";
  const { error } = await supabase.from("opening_hours").update({ label, display_text: displayText, is_closed: isClosed }).eq("day_index", dayIndex);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateLegalAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const imprint = z.string().trim().min(20).max(20000).parse(field(formData, "imprint"));
  const privacy = z.string().trim().min(20).max(30000).parse(field(formData, "privacy"));
  const { error } = await supabase.from("legal_content").update({ imprint, privacy }).eq("id", "main");
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createNewsAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const values = newsSchema.parse({
    title: field(formData, "title"),
    body: field(formData, "body"),
    image_alt: field(formData, "image_alt"),
    publish_from: field(formData, "publish_from"),
    publish_until: field(formData, "publish_until"),
  });
  const image = formData.get("image");
  const imagePath = image instanceof File && image.size ? await uploadImage(image, "news", supabase) : null;
  const { error } = await supabase.from("news_posts").insert({
    title: values.title,
    body: values.body,
    image_alt: values.image_alt,
    image_path: imagePath,
    publish_from: optionalDate(values.publish_from ?? ""),
    publish_until: optionalDate(values.publish_until ?? ""),
    is_pinned: formData.get("is_pinned") === "on",
    is_published: formData.get("is_published") === "on",
  });
  if (error) {
    if (imagePath) await supabase.storage.from("media").remove([imagePath]);
    throw error;
  }
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateNewsAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(field(formData, "id"));
  const values = newsSchema.parse({
    title: field(formData, "title"),
    body: field(formData, "body"),
    image_alt: field(formData, "image_alt"),
    publish_from: field(formData, "publish_from"),
    publish_until: field(formData, "publish_until"),
  });
  const image = formData.get("image");
  const { data: current } = await supabase.from("news_posts").select("image_path").eq("id", id).single();
  const newImagePath = image instanceof File && image.size ? await uploadImage(image, "news", supabase) : current?.image_path ?? null;
  const { error } = await supabase.from("news_posts").update({
    title: values.title,
    body: values.body,
    image_alt: values.image_alt,
    image_path: newImagePath,
    publish_from: optionalDate(values.publish_from ?? ""),
    publish_until: optionalDate(values.publish_until ?? ""),
    is_pinned: formData.get("is_pinned") === "on",
    is_published: formData.get("is_published") === "on",
  }).eq("id", id);
  if (error) throw error;
  if (newImagePath !== current?.image_path && current?.image_path) await supabase.storage.from("media").remove([current.image_path]);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteNewsAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(field(formData, "id"));
  const { data } = await supabase.from("news_posts").select("image_path").eq("id", id).single();
  const { error } = await supabase.from("news_posts").delete().eq("id", id);
  if (error) throw error;
  if (data?.image_path) await supabase.storage.from("media").remove([data.image_path]);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function uploadGalleryAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const category = z.enum(["food", "rooms"]).parse(field(formData, "category"));
  const altText = z.string().trim().max(250).parse(field(formData, "alt_text"));
  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  if (!files.length || files.length > 12) throw new Error("Bitte 1 bis 12 Bilder auswählen.");

  const { data: last } = await supabase.from("gallery_images").select("sort_order").eq("category", category).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  let order = (last?.sort_order ?? -1) + 1;
  for (const file of files) {
    const imagePath = await uploadImage(file, `gallery/${category}`, supabase);
    const { error } = await supabase.from("gallery_images").insert({
      category,
      image_path: imagePath,
      alt_text: altText || (category === "food" ? "Gericht bei Mando's" : "Räumlichkeiten im Bürgerhaus Waldmohr"),
      sort_order: order,
      is_visible: true,
    });
    if (error) {
      await supabase.storage.from("media").remove([imagePath]);
      throw error;
    }
    order += 1;
  }
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateGalleryAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(field(formData, "id"));
  const altText = z.string().trim().max(250).parse(field(formData, "alt_text"));
  const sortOrder = z.coerce.number().int().min(0).max(10000).parse(field(formData, "sort_order"));
  const { error } = await supabase.from("gallery_images").update({
    alt_text: altText,
    sort_order: sortOrder,
    is_visible: formData.get("is_visible") === "on",
  }).eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteGalleryAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(field(formData, "id"));
  const { data } = await supabase.from("gallery_images").select("image_path").eq("id", id).single();
  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) throw error;
  if (data?.image_path) await supabase.storage.from("media").remove([data.image_path]);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function uploadMenuAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const file = formData.get("menu");
  if (!(file instanceof File) || !file.size) throw new Error("Bitte eine PDF-Datei auswählen.");
  if (file.type !== "application/pdf") throw new Error("Die Speisekarte muss eine PDF-Datei sein.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Die PDF darf maximal 20 MB groß sein.");

  const objectPath = `documents/${randomUUID()}.pdf`;
  const { error: uploadError } = await supabase.storage.from("menu").upload(objectPath, file, { contentType: "application/pdf" });
  if (uploadError) throw uploadError;
  const { data: previous } = await supabase.from("menu_documents").select("file_path").eq("id", "main").maybeSingle();
  const { error } = await supabase.from("menu_documents").upsert({ id: "main", file_path: objectPath, original_name: file.name });
  if (error) {
    await supabase.storage.from("menu").remove([objectPath]);
    throw error;
  }
  if (previous?.file_path) await supabase.storage.from("menu").remove([previous.file_path]);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function uploadBrandingAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const kind = z.enum(["hero", "logo"]).parse(field(formData, "kind"));
  const file = formData.get("image");
  if (!(file instanceof File) || !file.size) throw new Error("Bitte ein Bild auswählen.");
  const objectPath = await uploadImage(file, "branding", supabase);
  const column = kind === "hero" ? "hero_path" : "logo_path";
  const { data: previous } = await supabase.from("site_settings").select("hero_path, logo_path").eq("id", "main").single();
  const { error } = await supabase.from("site_settings").update({ [column]: objectPath }).eq("id", "main");
  if (error) {
    await supabase.storage.from("media").remove([objectPath]);
    throw error;
  }
  const previousPath = previous?.[column];
  if (previousPath) await supabase.storage.from("media").remove([previousPath]);
  revalidatePath("/");
  revalidatePath("/admin");
}
