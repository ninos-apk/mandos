import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://xn--brgerhaus-waldmohr-m6b.de";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Mando's im Bürgerhaus Waldmohr",
  description: "Orientalische Spezialitäten, Restaurant und Eventlocation in Waldmohr.",
  applicationName: "Mando's im Bürgerhaus Waldmohr",
  icons: { icon: "/api/assets/icon.jpg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#171813",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
