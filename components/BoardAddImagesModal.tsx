"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import type { Artwork } from "@/lib/museum-types";
import type { SavedArtworkDTO } from "@/lib/dal/saved-artworks";
import type { PlacementDTO } from "@/lib/dal/boards";
import { addPlacementAction } from "@/app/actions/boards";
import ArtworkCard from "./ArtworkCard";

// Map a saved row to the Artwork shape ArtworkCard expects. Artist/date
// aren't stored; ArtworkCard already guards their absence.
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

type Props = {
  open: boolean;
  boardId: string;
  savedArtworks: SavedArtworkDTO[];
  // source ids already placed on the board, so we can mark them "On board".
  placedSourceIds: Set<number>;
  onAdded: (placement: PlacementDTO) => void;
  onClose: () => void;
};

export default function BoardAddImagesModal({
  open,
  boardId,
  savedArtworks,
  placedSourceIds,
  onAdded,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Imperatively drive the native <dialog> from the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={onClose}
      aria-labelledby="add-images-title"
    >
      <div className="modal-box w-11/12 max-w-5xl max-h-[85vh] flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="add-images-title" className="font-bold text-lg">
            Add images
          </h2>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost" aria-label="Close">
              <X className="size-4" />
            </button>
          </form>
        </div>

        {savedArtworks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 text-center py-12">
            <p className="text-base-content/70">
              You haven&apos;t saved any artworks yet.
            </p>
            <Link href="/" className="btn btn-sm btn-primary">
              Browse artworks
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 list-none p-0 m-0 overflow-y-auto">
            {savedArtworks.map((item) => (
              <PickerCard
                key={item.id}
                item={item}
                boardId={boardId}
                alreadyOnBoard={placedSourceIds.has(item.sourceId)}
                onAdded={onAdded}
              />
            ))}
          </ul>
        )}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

function PickerCard({
  item,
  boardId,
  alreadyOnBoard,
  onAdded,
}: {
  item: SavedArtworkDTO;
  boardId: string;
  alreadyOnBoard: boolean;
  onAdded: (placement: PlacementDTO) => void;
}) {
  const [isPending, startTransition] = useTransition();
  // Locally-added this session, so the button reflects the add without needing
  // the parent's placed-set to update.
  const [justAdded, setJustAdded] = useState(false);
  const artwork = toArtwork(item);
  const onBoard = alreadyOnBoard || justAdded;

  function handleAdd() {
    if (onBoard) return;
    startTransition(async () => {
      const { placement } = await addPlacementAction(boardId, item.id);
      onAdded(placement);
      setJustAdded(true);
    });
  }

  return (
    <li className="flex flex-col gap-2">
      <ArtworkCard artwork={artwork} onClick={handleAdd} />
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending || onBoard}
        className={`btn btn-xs ${onBoard ? "btn-ghost" : "btn-outline"}`}
      >
        {isPending && <span className="loading loading-spinner loading-xs" />}
        {onBoard ? (
          <span className="inline-flex items-center gap-1">
            On board
            <Check className="size-3.5" />
          </span>
        ) : (
          "Add"
        )}
      </button>
    </li>
  );
}
