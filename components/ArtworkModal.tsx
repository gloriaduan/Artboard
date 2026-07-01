"use client";

import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { Check, X } from "lucide-react";
import { Artwork, ArtworkDetail, imageUrl } from "@/lib/museum-types";
import {
  saveArtworkAction,
  removeSavedArtworkAction,
} from "@/app/actions/saved-artworks";

type Props = {
  artwork: Artwork | null;
  onClose: () => void;
  initialSaved?: boolean;
};

export default function ArtworkModal({
  artwork,
  onClose,
  initialSaved = false,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Effect is used only for imperative DOM control of the native <dialog>.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (artwork) dialog.showModal();
    else dialog.close();
  }, [artwork]);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={onClose}
      aria-labelledby="artwork-modal-title"
    >
      <div className="modal-box w-11/12 max-w-5xl max-h-[85vh] p-0 overflow-hidden">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </form>

        {/* Keyed by id so detail/loading state initializes fresh per artwork. */}
        {artwork && (
          <ArtworkContent
            key={artwork.id}
            artwork={artwork}
            initialSaved={initialSaved}
          />
        )}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

function ArtworkContent({
  artwork,
  initialSaved,
}: {
  artwork: Artwork;
  initialSaved: boolean;
}) {
  const [detail, setDetail] = useState<ArtworkDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(initialSaved);
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);
  const [isPending, startTransition] = useTransition();

  const canSave = artwork.imageBase !== null;

  function toggleSave() {
    startTransition(async () => {
      if (optimisticSaved) {
        setOptimisticSaved(false);
        await removeSavedArtworkAction(artwork.id);
        setSaved(false);
      } else {
        if (!artwork.imageBase) return;
        setOptimisticSaved(true);
        await saveArtworkAction({
          sourceId: artwork.id,
          title: artwork.title,
          imageBase: artwork.imageBase,
        });
        setSaved(true);
      }
    });
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/artworks/${artwork.id}`)
      .then((res) => res.json() as Promise<{ data: ArtworkDetail }>)
      .then((json) => {
        if (!cancelled) setDetail(json.data);
      })
      .catch((err) => console.error("Failed to fetch artwork detail:", err))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [artwork.id]);

  return (
    // Horizontal layout (stacks on small screens) capped to the modal height so
    // the dialog stays landscape; each column scrolls independently for tall art.
    <div className="flex flex-col md:flex-row max-h-[85vh]">
      <div className="md:w-1/2 bg-base-200 flex items-center justify-center overflow-auto p-4">
        {artwork.imageBase ? (
          <img
            src={imageUrl(artwork.imageBase, 843)}
            alt={artwork.title}
            className="max-w-full w-auto h-auto object-contain rounded"
          />
        ) : (
          <div className="w-full aspect-3/4 flex items-center justify-center">
            <span className="text-sm text-base-content/40">
              No image available
            </span>
          </div>
        )}
      </div>

      <div className="md:w-1/2 flex flex-col gap-4 p-6 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <h3
            id="artwork-modal-title"
            className="font-display font-medium text-2xl tracking-[-0.01em] leading-[1.15] pr-8"
          >
            {artwork.title}
          </h3>
          {artwork.artist && (
            <p className="text-sm text-base-content/70 whitespace-pre-line">
              {artwork.artist}
            </p>
          )}
          {artwork.date && (
            <p className="font-mono text-sm text-base-content/50">{artwork.date}</p>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        ) : detail ? (
          <div className="flex flex-col gap-3 text-sm">
            {detail.description ? (
              <p className="text-base-content/80 whitespace-pre-line">
                {detail.description}
              </p>
            ) : (
              <p className="text-base-content/80">
                {[detail.medium, detail.date].filter(Boolean).join(" · ")}
              </p>
            )}

            {/* Museum-placard block: mono catalogue labels + values, evoking a
                wall label. Labels are uppercase-tracked; a grid keeps values
                aligned like a catalogue card. */}
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 font-mono text-xs">
              {detail.medium && (
                <>
                  <dt className="uppercase tracking-[0.06em] text-base-content/45">
                    Medium
                  </dt>
                  <dd className="text-base-content/70">{detail.medium}</dd>
                </>
              )}
              {detail.dimensions && (
                <>
                  <dt className="uppercase tracking-[0.06em] text-base-content/45">
                    Dimensions
                  </dt>
                  <dd className="text-base-content/70 tabular-nums">
                    {detail.dimensions}
                  </dd>
                </>
              )}
              {detail.culture && (
                <>
                  <dt className="uppercase tracking-[0.06em] text-base-content/45">
                    Culture
                  </dt>
                  <dd className="text-base-content/70">{detail.culture}</dd>
                </>
              )}
              {detail.creditLine && (
                <>
                  <dt className="uppercase tracking-[0.06em] text-base-content/45">
                    Credit
                  </dt>
                  <dd className="text-base-content/70">{detail.creditLine}</dd>
                </>
              )}
            </dl>
          </div>
        ) : null}

        <div className="modal-action mt-2">
          <button
            type="button"
            onClick={toggleSave}
            disabled={isPending || !canSave}
            className={`btn ${optimisticSaved ? "btn-outline" : "btn-primary"}`}
          >
            {isPending && (
              <span className="loading loading-spinner loading-xs" />
            )}
            {optimisticSaved ? (
              <span className="inline-flex items-center gap-1">
                Saved
                <Check className="size-4" />
              </span>
            ) : (
              "Save artwork"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
