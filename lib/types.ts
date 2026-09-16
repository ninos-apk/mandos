export type SiteSettings = {
  restaurantName: string;
  tagline: string;
  aboutTitle: string;
  aboutText: string;
  phonePrimary: string;
  phoneSecondary: string;
  email: string;
  street: string;
  postalCode: string;
  city: string;
  mapsUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  heroPath: string;
  logoPath: string;
  seoTitle: string;
  seoDescription: string;
};

export type OpeningHour = {
  dayIndex: number;
  label: string;
  displayText: string;
  isClosed: boolean;
};

export type NewsPost = {
  id: string;
  title: string;
  body: string;
  imagePath: string | null;
  imageAlt: string;
  isPinned: boolean;
  isPublished: boolean;
  publishFrom: string | null;
  publishUntil: string | null;
  createdAt: string;
};

export type GalleryImage = {
  id: string;
  category: "food" | "rooms";
  imagePath: string;
  altText: string;
  sortOrder: number;
  isVisible: boolean;
};

export type LegalContent = {
  imprint: string;
  privacy: string;
};

export type MenuDocument = {
  filePath: string;
  originalName: string;
  updatedAt: string | null;
};

export type PublicSiteData = {
  settings: SiteSettings;
  openingHours: OpeningHour[];
  news: NewsPost[];
  gallery: GalleryImage[];
  legal: LegalContent;
  menu: MenuDocument;
};
