"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PlacementDTO } from "@/lib/dal/boards";
import type { SavedArtworkDTO } from "@/lib/dal/saved-artworks";
import {
  saveBoardLayoutAction,
  removePlacementAction,
} from "@/app/actions/boards";
import {
  addImageObject,
  collectLayout,
  findById,
  nudgeActiveObject,
  setZoomCentered,
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_STEP,
  NUDGE,
} from "@/lib/board/fabric-board";
import { useBoardCanvas } from "@/lib/board/useBoardCanvas";
import BoardAddImagesModal from "./BoardAddImagesModal";
import UnsavedChangesModal from "./UnsavedChangesModal";

type Props = {
  boardId: string;
  boardName: string;
  initialPlacements: PlacementDTO[];
  savedArtworks: SavedArtworkDTO[];
};

type TileRef = { id: string; aicId: number; title: string };

export default function BoardCanvas({
  boardId,
  boardName,
  initialPlacements,
  savedArtworks,
}: Props) {
  const router = useRouter();
  const [zoom, setZoom] = useState(1);
  // Drags/resizes/nudges/restacks stay local until the user clicks Save.
  const [dirty, setDirty] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Destination of a pending in-app navigation held back by unsaved changes.
  // Non-null means the "leave?" confirm modal is open.
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  // Mirror of canvas contents for the a11y list + picker. Seeded from props.
  const [tiles, setTiles] = useState<TileRef[]>(() =>
    initialPlacements.map((p) => ({
      id: p.id,
      aicId: p.aicId,
      title: p.title,
    })),
  );

  // aicIds already on the board, so the picker can mark them "On board".
  const placedAicIds = new Set(tiles.map((t) => t.aicId));

  // Mount the Fabric canvas, load the initial placements, and wire events.
  const { canvasElRef, containerRef, fabricRef } = useBoardCanvas({
    initialPlacements,
    setSelectedId,
    setDirty,
  });

  // Insert a freshly-added placement as a Fabric object and mirror it.
  const handleAdded = useCallback((placement: PlacementDTO) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    setTiles((prev) =>
      prev.some((t) => t.id === placement.id)
        ? prev
        : [
            ...prev,
            {
              id: placement.id,
              aicId: placement.aicId,
              title: placement.title,
            },
          ],
    );
    void addImageObject(canvas, placement);
    setDirty(true);
  }, [fabricRef]);

  // Remove is a discrete, intentional action — persist immediately (a removed
  // tile has no layout to fold into the Save batch).
  const handleRemove = useCallback(
    (id: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = findById(canvas, id);
      if (obj) {
        canvas.remove(obj);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
      setTiles((prev) => prev.filter((t) => t.id !== id));
      setSelectedId((cur) => (cur === id ? null : cur));
      void removePlacementAction(id, boardId);
    },
    [boardId, fabricRef],
  );

  // Select a tile from the accessible list, mirroring Fabric selection.
  const selectTile = useCallback((id: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = findById(canvas, id);
    if (!obj) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    setSelectedId(id);
  }, [fabricRef]);

  function handleZoom(next: number) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    setZoomCentered(canvas, clamped);
    setZoom(clamped);
  }

  function handleSave() {
    const canvas = fabricRef.current;
    if (!canvas || !dirty || isSaving) return;
    const updates = collectLayout(canvas);
    startSaving(async () => {
      await saveBoardLayoutAction(boardId, updates);
      setDirty(false);
    });
  }

  // In-app navigation away from the board. With unsaved changes, hold the
  // destination and open the confirm modal; otherwise navigate straight away.
  function requestLeave(href: string) {
    if (dirty) {
      setPendingNav(href);
    } else {
      router.push(href);
    }
  }

  // Modal "Leave without saving": discard local changes and navigate.
  function confirmLeave() {
    const href = pendingNav;
    setPendingNav(null);
    if (href) router.push(href);
  }

  // Keyboard control over the active object: arrow keys nudge, Delete removes.
  function handleKeyDown(e: React.KeyboardEvent) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      if (selectedId) {
        e.preventDefault();
        handleRemove(selectedId);
      }
      return;
    }
    let dx = 0;
    let dy = 0;
    switch (e.key) {
      case "ArrowLeft":
        dx = -NUDGE;
        break;
      case "ArrowRight":
        dx = NUDGE;
        break;
      case "ArrowUp":
        dy = -NUDGE;
        break;
      case "ArrowDown":
        dy = NUDGE;
        break;
      default:
        return;
    }
    e.preventDefault();
    if (nudgeActiveObject(canvas, dx, dy)) setDirty(true);
  }

  // Warn before leaving with unsaved layout changes.
  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-base-content/10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => requestLeave("/boards")}
            className="btn btn-sm btn-ghost"
            aria-label="Back to all boards"
          >
            ←
          </button>
          <h1 className="text-lg font-bold truncate">{boardName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="btn btn-sm btn-primary btn-outline"
          >
            + Add images
          </button>
          {selectedId && (
            <button
              type="button"
              onClick={() => handleRemove(selectedId)}
              className="btn btn-sm btn-ghost"
            >
              Remove selected
            </button>
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleZoom(zoom - ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              className="btn btn-sm btn-ghost btn-square"
            >
              −
            </button>
            <span className="text-sm tabular-nums w-12 text-center text-base-content/70">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => handleZoom(zoom + ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              className="btn btn-sm btn-ghost btn-square"
            >
              +
            </button>
          </div>

          {dirty && !isSaving && (
            <span className="text-xs text-base-content/60" aria-live="polite">
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || isSaving}
            className="btn btn-sm btn-primary"
          >
            {isSaving && (
              <span className="loading loading-spinner loading-xs" />
            )}
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Canvas region. The container sizes the Fabric canvas; the keydown
          handler gives keyboard users arrow-nudge + delete over the active
          object. role/aria-label announce the surface and how to use it. */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-base-200 relative focus-visible:outline-none"
        role="application"
        aria-label="Board canvas. Select an artwork from the list below, then use arrow keys to move it and Delete to remove it."
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {tiles.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4 pointer-events-none">
            <p className="text-base-content/60">
              This board is empty. Click “+ Add images” to start arranging.
            </p>
          </div>
        )}
        <canvas ref={canvasElRef} />
      </div>

      {/* Visually-hidden but focusable list so keyboard/screen-reader users can
          target a specific tile, which then becomes the active canvas object.
          Kept in sync with the canvas via the `tiles` mirror. */}
      <ul className="sr-only">
        {tiles.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => selectTile(t.id)}
              onFocus={() => selectTile(t.id)}
            >
              Select {t.title}
            </button>
          </li>
        ))}
      </ul>

      <BoardAddImagesModal
        open={pickerOpen}
        boardId={boardId}
        savedArtworks={savedArtworks}
        placedAicIds={placedAicIds}
        onAdded={handleAdded}
        onClose={() => setPickerOpen(false)}
      />

      <UnsavedChangesModal
        open={pendingNav !== null}
        onConfirm={confirmLeave}
        onCancel={() => setPendingNav(null)}
      />
    </div>
  );
}
