export function assetUrl(path: string, bucket: "media" | "menu" = "media") {
  if (path.startsWith("local:")) {
    return `/api/assets/${path.slice("local:".length).split("/").map(encodeURIComponent).join("/")}`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return "";

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${baseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;
}
