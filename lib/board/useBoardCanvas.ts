import { useEffect, useRef } from "react";
import type { Canvas } from "fabric";
import type { PlacementDTO } from "@/lib/dal/boards";
import {
  createBoardCanvas,
  placementToFabric,
  isBoardObject,
} from "@/lib/board/fabric-board";

type UseBoardCanvasArgs = {
  initialPlacements: PlacementDTO[];
  setSelectedId: (id: string | null) => void;
  setDirty: (dirty: boolean) => void;
};

// Owns the Fabric canvas lifecycle: mounts the canvas once, loads the initial
// placements, wires selection/modified events back into React, keeps the canvas
// sized to its container, and disposes on unmount. Returns the refs the
// component renders against.
export function useBoardCanvas({
  initialPlacements,
  setSelectedId,
  setDirty,
}: UseBoardCanvasArgs) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  // Mount the Fabric canvas once, load the initial placements, and wire events.
  useEffect(() => {
    const el = canvasElRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    const canvas = createBoardCanvas(el, {
      width: container.clientWidth,
      height: container.clientHeight,
    });

    fabricRef.current = canvas;

    // Load initial tiles in z-order (initialPlacements arrives ordered by z asc).
    let cancelled = false;
    (async () => {
      for (const p of initialPlacements) {
        if (cancelled) break;
        await placementToFabric(canvas, p);
      }
      canvas.requestRenderAll();
    })();

    // Selection -> React (drives toolbar "Remove selected" + a11y focus sync).
    const syncSelection = () => {
      const active = canvas.getActiveObject();
      setSelectedId(isBoardObject(active) ? active.placementId : null);
    };

    canvas.on("selection:created", syncSelection);
    canvas.on("selection:updated", syncSelection);
    canvas.on("selection:cleared", () => setSelectedId(null));
    // Any drag/resize commit marks the layout dirty.
    canvas.on("object:modified", () => setDirty(true));

    // Keep the canvas sized to its container.
    const resize = () => {
      canvas.setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
      canvas.requestRenderAll();
    };

    window.addEventListener("resize", resize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      void canvas.dispose();
      fabricRef.current = null;
    };
    // Mount once: the canvas is created and disposed with the component. The
    // closed-over args (initial placements, setters) are stable for its life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { canvasElRef, containerRef, fabricRef };
}
