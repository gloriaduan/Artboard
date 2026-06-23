"use client";

import { useState } from "react";
import type { AICArtwork } from "@/lib/aic-types";
import type { SavedArtworkDTO } from "@/lib/dal/saved-artworks";
import ArtworkCard from "./ArtworkCard";
import ArtworkModal from "./ArtworkModal";

// Map a saved row to the AICArtwork shape ArtworkCard/ArtworkModal expect.
// Artist/date aren't stored; ArtworkCard already guards their absence, and the
// modal re-fetches full detail by id on open.
function toAICArtwork(item: SavedArtworkDTO): AICArtwork {
  return {
    id: item.aicId,
    title: item.title,
    image_id: item.imageId,
    artist_display: "",
    date_display: "",
    medium_display: "",
  };
}

export default function SavedGallery({ items }: { items: SavedArtworkDTO[] }) {
  const [selected, setSelected] = useState<AICArtwork | null>(null);

  if (items.length === 0) {
    return (
      <p className="text-center text-base-content/50 py-16">
        No saved artworks yet.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const artwork = toAICArtwork(item);
          return (
            <ArtworkCard
              key={item.id}
              artwork={artwork}
              onClick={() => setSelected(artwork)}
            />
          );
        })}
      </div>

      <ArtworkModal
        artwork={selected}
        onClose={() => setSelected(null)}
        initialSaved
      />
    </>
  );
}
