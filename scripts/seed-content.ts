import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { defaultData } from "../lib/default-data";
import { createSupabaseAdminClient } from "../lib/supabase/admin";

const force = process.argv.includes("--force");
const supabase = createSupabaseAdminClient();
const root = process.cwd();

const { data: previousRun, error: runCheckError } = await supabase
  .from("seed_runs")
  .select("id")
  .eq("id", "initial-content-v1")
  .maybeSingle();
if (runCheckError) throw runCheckError;

if (previousRun && !force) {
  console.log("Die initialen Inhalte wurden bereits importiert. Für einen bewussten Neuimport --force verwenden.");
  process.exit(0);
}

function safeName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
}

function mimeType(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".pdf") return "application/pdf";
  return "image/jpeg";
}

async function uploadFile(bucket: "media" | "menu", localPath: string, targetFolder: string) {
  const content = await readFile(localPath);
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 12);
  const objectPath = `${targetFolder}/${hash}-${safeName(path.basename(localPath))}`;
  const { error } = await supabase.storage.from(bucket).upload(objectPath, content, {
    contentType: mimeType(localPath),
    upsert: force,
  });
  if (error && !error.message.toLowerCase().includes("already exists")) throw error;
  return objectPath;
}

const heroPath = await uploadFile("media", path.join(root, "assets", "startseite.jpg"), "branding");
const logoPath = await uploadFile("media", path.join(root, "assets", "icon.jpg"), "branding");

const settings = defaultData.settings;
const { error: settingsError } = await supabase.from("site_settings").upsert({
  id: "main",
  restaurant_name: settings.restaurantName,
  tagline: settings.tagline,
  about_title: settings.aboutTitle,
  about_text: settings.aboutText,
  phone_primary: settings.phonePrimary,
  phone_secondary: settings.phoneSecondary,
  email: settings.email,
  street: settings.street,
  postal_code: settings.postalCode,
  city: settings.city,
  maps_url: settings.mapsUrl,
  instagram_url: settings.instagramUrl,
  tiktok_url: settings.tiktokUrl,
  hero_path: heroPath,
  logo_path: logoPath,
  seo_title: settings.seoTitle,
  seo_description: settings.seoDescription,
});
if (settingsError) throw settingsError;

const { error: hoursError } = await supabase.from("opening_hours").upsert(
  defaultData.openingHours.map((hour) => ({
    day_index: hour.dayIndex,
    label: hour.label,
    display_text: hour.displayText,
    is_closed: hour.isClosed,
  })),
  { onConflict: "day_index" },
);
if (hoursError) throw hoursError;

const { error: legalError } = await supabase.from("legal_content").upsert({
  id: "main",
  imprint: defaultData.legal.imprint,
  privacy: defaultData.legal.privacy,
});
if (legalError) throw legalError;

let importedImages = 0;
for (const [directory, category] of [["Speisen", "food"], ["Rooms", "rooms"]] as const) {
  const files = (await readdir(path.join(root, "assets", directory))).sort((a, b) => a.localeCompare(b, "de", { numeric: true }));
  for (const [index, fileName] of files.entries()) {
    if (!/\.(jpe?g|png|webp|avif)$/i.test(fileName)) continue;
    const objectPath = await uploadFile("media", path.join(root, "assets", directory, fileName), `gallery/${category}`);
    const seedKey = `${category}:${fileName}`;
    const { error } = await supabase.from("gallery_images").upsert(
      {
        category,
        image_path: objectPath,
        alt_text: category === "food" ? `Orientalische Spezialität bei Mando's ${index + 1}` : `Räumlichkeiten im Bürgerhaus Waldmohr ${index + 1}`,
        sort_order: index,
        is_visible: true,
        seed_key: seedKey,
      },
      { onConflict: "seed_key" },
    );
    if (error) throw error;
    importedImages += 1;
  }
}

const menuFile = path.join(root, "assets", "spseisekarte.pdf");
const menuPath = await uploadFile("menu", menuFile, "documents");
const { error: menuError } = await supabase.from("menu_documents").upsert({
  id: "main",
  file_path: menuPath,
  original_name: "Speisekarte Mando's.pdf",
});
if (menuError) throw menuError;

const { error: runError } = await supabase.from("seed_runs").upsert({
  id: "initial-content-v1",
  completed_at: new Date().toISOString(),
  details: { importedImages },
});
if (runError) throw runError;

console.log(`${importedImages} Galeriebilder und die initialen Restaurantinhalte wurden importiert.`);
