import type { PublicSiteData } from "@/lib/types";

const foodImages = [
  "speise(1).jpg",
  "speise(2).jpg",
  "speise(3).jpg",
  "speise(4).jpg",
  "speise(5).jpg",
  "speise(6).jpg",
  "speise(7).jpg",
  "speise(8).jpg",
  "speise(9).jpg",
  ...Array.from({ length: 23 }, (_, index) => `speise(${index + 1}).jpeg`),
];

const roomImages = [
  "room(1).jpg",
  "room(2).jpg",
  "room(3).jpg",
  "room(4).jpg",
  "room(5).jpg",
  "room(1).jpeg",
  "room(2).jpeg",
  "room(3).jpeg",
  "room(4).jpeg",
  "room(1).png",
];

export const defaultData: PublicSiteData = {
  settings: {
    restaurantName: "Mando's im Bürgerhaus Waldmohr",
    tagline: "Orientalische Spezialitäten, herzliche Gastfreundschaft und Raum für besondere Momente.",
    aboutTitle: "Ein Stück Orient in Waldmohr",
    aboutText:
      "Wir sind eine Familie, die Sie mit köstlichen Gerichten aus dem Orient verwöhnt - zubereitet mit viel Liebe und ausgewählten Zutaten. Unsere Küche verbindet traditionelle Rezepte mit modernen Einflüssen.\n\nOb ein gemütlicher Abend, eine Familienfeier oder ein besonderes Event: Unsere Räumlichkeiten stehen auch für Geburtstage, Trauerfeiern, Weihnachtsfeiern und individuelle Buffets zur Verfügung.",
    phonePrimary: "06373 8289507",
    phoneSecondary: "0151 27133942",
    email: "events.buergerhaus@outlook.de",
    street: "Saarpfalzstraße 12",
    postalCode: "66914",
    city: "Waldmohr",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Saarpfalzstra%C3%9Fe+12+66914+Waldmohr",
    instagramUrl: "https://www.instagram.com/buergerhaus.mandos",
    tiktokUrl: "https://www.tiktok.com/@buergerhaus.mandos",
    heroPath: "local:startseite.jpg",
    logoPath: "local:icon.jpg",
    seoTitle: "Mando's im Bürgerhaus Waldmohr | Orientalisches Restaurant",
    seoDescription:
      "Orientalische Spezialitäten, Restaurant, Catering und Eventlocation im Bürgerhaus Waldmohr. Speisekarte, Öffnungszeiten und aktuelle Angebote.",
  },
  openingHours: [
    { dayIndex: 1, label: "Montag", displayText: "Ruhetag", isClosed: true },
    { dayIndex: 2, label: "Dienstag", displayText: "Ruhetag", isClosed: true },
    { dayIndex: 3, label: "Mittwoch", displayText: "17:00 - 22:00 Uhr", isClosed: false },
    { dayIndex: 4, label: "Donnerstag", displayText: "17:00 - 22:00 Uhr", isClosed: false },
    { dayIndex: 5, label: "Freitag", displayText: "17:00 - 22:00 Uhr", isClosed: false },
    { dayIndex: 6, label: "Samstag", displayText: "17:00 - 22:00 Uhr", isClosed: false },
    { dayIndex: 7, label: "Sonntag", displayText: "12:00 - 14:30 Uhr & 17:00 - 22:00 Uhr", isClosed: false },
    { dayIndex: 8, label: "Feiertage", displayText: "Es gelten unsere regulären Öffnungszeiten.", isClosed: false },
  ],
  news: [],
  gallery: [
    ...foodImages.map((fileName, index) => ({
      id: `local-food-${index}`,
      category: "food" as const,
      imagePath: `local:Speisen/${fileName}`,
      altText: `Orientalische Spezialität bei Mando's ${index + 1}`,
      sortOrder: index,
      isVisible: true,
    })),
    ...roomImages.map((fileName, index) => ({
      id: `local-room-${index}`,
      category: "rooms" as const,
      imagePath: `local:Rooms/${fileName}`,
      altText: `Räumlichkeiten im Bürgerhaus Waldmohr ${index + 1}`,
      sortOrder: index,
      isVisible: true,
    })),
  ],
  legal: {
    imprint: `Angaben gemäß § 5 DDG

Bürgerhaus Waldmohr
Inhaber: Farid Mando
Saarpfalzstraße 12
66914 Waldmohr

Kontakt
Telefon: 06373 8289507
Mobil: 0151 27133942
E-Mail: events.buergerhaus@outlook.de

Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
74 136 095 887

Verantwortlich für den Inhalt
Farid Mando, Saarpfalzstraße 12, 66914 Waldmohr`,
    privacy: `Datenschutzerklärung

Beim Besuch dieser Webseite können technisch notwendige Verbindungsdaten durch den Hosting-Anbieter verarbeitet werden. Personenbezogene Daten werden nur verarbeitet, soweit dies für den sicheren Betrieb der Webseite erforderlich ist.

Bitte lassen Sie diesen Text vor der Veröffentlichung rechtlich prüfen und ergänzen Sie die Angaben zu Hosting, Supabase und Ihren tatsächlichen Verarbeitungsprozessen.`,
  },
  menu: {
    filePath: "local:spseisekarte.pdf",
    originalName: "Speisekarte Mando's.pdf",
    updatedAt: null,
  },
};
