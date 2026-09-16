import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://xn--brgerhaus-waldmohr-m6b.de";
  return [{ url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
