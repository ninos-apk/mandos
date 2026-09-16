"use client";

import { Menu, Phone, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type Props = {
  logoUrl: string;
  phone: string;
};

const links = [
  ["Aktuelles", "news"],
  ["Über uns", "about"],
  ["Speisekarte", "menu"],
  ["Öffnungszeiten", "hours"],
  ["Galerie", "food-gallery"],
  ["Räumlichkeiten", "rooms"],
  ["Kontakt", "contact"],
];

export function SiteHeader({ logoUrl, phone }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Zur Startseite">
        <Image src={logoUrl} width={76} height={58} alt="Mando's Logo" priority />
        <span>Mando&apos;s</span>
      </a>
      <button className="nav-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Navigation öffnen" aria-expanded={open}>
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Hauptnavigation">
        {links.map(([label, target]) => (
          <a key={target} href={`#${target}`} onClick={() => setOpen(false)}>{label}</a>
        ))}
      </nav>
      <a className="header-phone" href={`tel:${phone.replace(/\s/g, "")}`}>
        <Phone size={17} /> Reservieren
      </a>
    </header>
  );
}
