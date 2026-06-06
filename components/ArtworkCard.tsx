"use client";

import { AICArtwork, aicImageUrl } from "@/lib/aic-types";

export default function ArtworkCard({ artwork }: { artwork: AICArtwork }) {
  if (!artwork.image_id) {
    return (
      <div className="relative w-full bg-base-200 rounded-lg aspect-3/4 flex items-center justify-center">
        <span className="text-xs text-base-content/40 px-2 text-center">
          No image available
        </span>
      </div>
    );
  }

  return (
    <div className="group relative w-full rounded-lg overflow-hidden bg-base-200 aspect-3/4">
      {/* Plain img so the browser fetches directly from AIC — next/image proxies through
          the server which AIC's IIIF CDN blocks with a 403. */}
      <img
        src={aicImageUrl(artwork.image_id, 400)}
        alt={artwork.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <p className="text-white text-sm font-semibold line-clamp-2 leading-tight">
          {artwork.title}
        </p>
        {artwork.artist_display && (
          <p className="text-white/70 text-xs mt-1 line-clamp-1">
            {artwork.artist_display.split("\n")[0]}
          </p>
        )}
        {artwork.date_display && (
          <p className="text-white/50 text-xs">{artwork.date_display}</p>
        )}
      </div>
    </div>
  );
}
