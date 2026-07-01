"use client";

import { Artwork, imageUrl } from "@/lib/museum-types";

export default function ArtworkCard({
  artwork,
  onClick,
}: {
  artwork: Artwork;
  onClick?: () => void;
}) {
  // The card is the primary action (opens the detail modal), so it's a real
  // <button>: focusable, Enter/Space-activated, and announced to screen readers.
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100";

  // Size each card to the artwork's true proportions so the masonry staggers.
  // Reserving the ratio up front keeps the layout stable as the image loads.
  const { width, height } = artwork.thumbnail ?? {};
  const aspectRatio = width && height ? `${width} / ${height}` : "3 / 4";

  if (!artwork.imageBase) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`View details for ${artwork.title}`}
        style={{ aspectRatio }}
        className={`relative w-full bg-base-200 rounded-md flex items-center justify-center cursor-pointer ${focusRing}`}
      >
        <span className="text-xs text-base-content/40 px-2 text-center">
          No image available
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View details for ${artwork.title}`}
      style={{ aspectRatio }}
      className={`group relative w-full rounded-md overflow-hidden bg-base-200 cursor-pointer text-left ${focusRing}`}
    >
      {/* Plain <img> hotlinking the museum's image host directly (permitted, CORS *).
          Not next/image — see AGENTS.md. */}
      <img
        src={imageUrl(artwork.imageBase, 400)}
        alt={artwork.thumbnail?.alt ?? artwork.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      {/* Metadata overlay: revealed on hover *and* on keyboard focus so the
          information isn't pointer-only. */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 motion-reduce:transition-none flex flex-col justify-end p-3">
        <p className="text-white text-sm font-semibold line-clamp-2 leading-tight">
          {artwork.title}
        </p>
        {artwork.artist && (
          <p className="text-white/70 text-xs mt-1 line-clamp-1">
            {artwork.artist}
          </p>
        )}
        {artwork.date && (
          <p className="font-mono text-white/50 text-xs">{artwork.date}</p>
        )}
      </div>
    </button>
  );
}
