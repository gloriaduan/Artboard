"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Artwork } from "@/lib/museum-types";
import type { SavedArtworkDTO } from "@/lib/dal/saved-artworks";
import type { BoardDTO } from "@/lib/dal/boards";
import { addPlacementAction } from "@/app/actions/boards";
import ArtworkCard from "./ArtworkCard";
import ArtworkModal from "./ArtworkModal";

// Map a saved row to the Artwork shape ArtworkCard/ArtworkModal expect.
// Artist/date aren't stored; ArtworkCard already guards their absence, and the
// modal re-fetches full detail by id on open.
function toArtwork(item: SavedArtworkDTO): Artwork {
  return {
    id: item.sourceId,
    title: item.title,
    imageBase: item.imageBase,
    artist: "",
    date: "",
    medium: "",
  };
}

export default function SavedGallery({
  items,
  boards,
}: {
  items: SavedArtworkDTO[];
  boards: BoardDTO[];
}) {
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [targetBoard, setTargetBoard] = useState(boards[0]?.id ?? "");
  // savedId currently being added, so we can disable just that card's button.
  const [addingId, setAddingId] = useState<string | null>(null);
  // savedIds added in this session, for lightweight "Added ✓" feedback.
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function handleAdd(savedId: string) {
    if (!targetBoard) return;
    setAddingId(savedId);
    startTransition(async () => {
      await addPlacementAction(targetBoard, savedId);
      setAdded((prev) => new Set(prev).add(savedId));
      setAddingId(null);
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-base-content/70 py-16">
        No saved artworks yet.
      </p>
    );
  }

  return (
    <>
      {/* Board target selector. When the user has no boards yet, point them to
          create one rather than showing an empty, useless select. */}
      {boards.length === 0 ? (
        <div className="flex items-center gap-2 mb-4 text-sm text-base-content/70">
          <span>Create a board to start arranging these.</span>
          <Link href="/boards" className="btn btn-xs btn-primary">
            New board
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <label
            htmlFor="target-board"
            className="text-sm text-base-content/70"
          >
            Add to board:
          </label>
          <select
            id="target-board"
            className="select select-sm border border-base-content/20"
            value={targetBoard}
            onChange={(e) => setTargetBoard(e.target.value)}
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 list-none p-0 m-0">
        {items.map((item) => {
          const artwork = toArtwork(item);
          const isAdded = added.has(item.id);
          return (
            <li key={item.id} className="flex flex-col gap-2">
              <ArtworkCard
                artwork={artwork}
                onClick={() => setSelected(artwork)}
              />
              {boards.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleAdd(item.id)}
                  disabled={isPending && addingId === item.id}
                  className={`btn btn-xs ${isAdded ? "btn-ghost" : "btn-outline"}`}
                >
                  {isPending && addingId === item.id && (
                    <span className="loading loading-spinner loading-xs" />
                  )}
                  {isAdded ? (
                    <span className="inline-flex items-center gap-1">
                      Added
                      <Check className="size-3.5" />
                    </span>
                  ) : (
                    "Add to board"
                  )}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <ArtworkModal
        artwork={selected}
        onClose={() => setSelected(null)}
        initialSaved
      />
    </>
  );
}
