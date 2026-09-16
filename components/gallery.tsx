"use client";

import type { GalleryImage } from "@/lib/types";
import { assetUrl } from "@/lib/assets";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type Props = {
  images: GalleryImage[];
};

export function Gallery({ images }: Props) {
  const [visibleCount, setVisibleCount] = useState(8);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : images[activeIndex];

  function move(direction: number) {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + direction + images.length) % images.length);
  }

  return (
    <>
      <div className="gallery-grid">
        {images.slice(0, visibleCount).map((image, index) => (
          <button className="gallery-card" type="button" key={image.id} onClick={() => setActiveIndex(index)}>
            <Image src={assetUrl(image.imagePath)} alt={image.altText} fill sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" />
            <span><Expand size={17} /> Vergrößern</span>
          </button>
        ))}
      </div>
      {visibleCount < images.length && (
        <button className="text-button" type="button" onClick={() => setVisibleCount(images.length)}>
          Alle {images.length} Bilder anzeigen
        </button>
      )}
      {active && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={active.altText} onClick={() => setActiveIndex(null)}>
          <button className="lightbox-close" type="button" onClick={() => setActiveIndex(null)} aria-label="Schließen"><X /></button>
          <button className="lightbox-prev" type="button" onClick={(event) => { event.stopPropagation(); move(-1); }} aria-label="Vorheriges Bild"><ChevronLeft /></button>
          <div className="lightbox-image" onClick={(event) => event.stopPropagation()}>
            <Image src={assetUrl(active.imagePath)} alt={active.altText} fill sizes="90vw" />
          </div>
          <button className="lightbox-next" type="button" onClick={(event) => { event.stopPropagation(); move(1); }} aria-label="Nächstes Bild"><ChevronRight /></button>
        </div>
      )}
    </>
  );
}
