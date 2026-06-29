// Client-only Fabric.js wrapper for the artwork board canvas. All Fabric
// knowledge lives here so BoardCanvas stays a thin React shell. Fabric must
// only be touched in the browser (it reaches for `window`/`document`), so this
// module is imported and instantiated exclusively from a useEffect.
import { Canvas, FabricImage, Point, type FabricObject } from "fabric";
import { aicImageUrl } from "@/lib/aic-types";
import type { PlacementDTO, LayoutUpdate } from "@/lib/dal/boards";

// AIC IIIF sends CORS headers to browsers, so loading anonymously keeps the
// canvas untainted (verified against the live CDN). Required for clean
// rendering and any future export.
const IMAGE_CROSS_ORIGIN = "anonymous";

// The display width a freshly-added tile gets before the user resizes it. The
// height is derived from the image's natural aspect ratio at load.
const DEFAULT_DISPLAY_WIDTH = 240;

// Arrow-key nudge distance (canvas px) for keyboard users who can't drag.
export const NUDGE = 12;

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 2;
export const ZOOM_STEP = 0.25;

// The placement metadata we attach to each Fabric object so canvas events can
// map back to our DTOs. Fabric carries arbitrary own-properties on objects;
// we read them through this view rather than augmenting Fabric's types.
type BoardObjectData = {
  placementId: string;
  savedId: string;
  aicId: number;
  title: string;
};

// A FabricObject that carries our placement metadata.
export type BoardObject = FabricObject & BoardObjectData;

export function isBoardObject(obj: FabricObject | undefined): obj is BoardObject {
  return (
    !!obj &&
    typeof (obj as unknown as Partial<BoardObjectData>).placementId === "string"
  );
}

// Image objects shouldn't flip, rotate, or scale non-uniformly — a collage
// tile is a rectangle that keeps the artwork's aspect ratio. Rotation is out
// of scope for this pass, so the rotation control (`mtr`) is hidden and locked.
function applyTileControls(obj: FabricObject) {
  obj.set({
    lockRotation: true,
    lockScalingFlip: true,
    // Keep aspect ratio on corner-handle resize; middle handles would stretch.
    lockScalingX: false,
    lockScalingY: false,
    cornerStyle: "circle",
    transparentCorners: false,
    borderColor: "#570df8", // matches DaisyUI primary
    cornerColor: "#570df8",
  });
  obj.setControlsVisibility({
    mtr: false, // rotation handle
    ml: false,
    mr: false,
    mt: false,
    mb: false, // edge handles (would break aspect ratio); corners only
  });
}

function attachData(obj: FabricObject, p: PlacementDTO) {
  Object.assign(obj, {
    placementId: p.id,
    savedId: p.savedId,
    aicId: p.aicId,
    title: p.title,
  } satisfies BoardObjectData);
}

export type BoardCanvasOptions = {
  width: number;
  height: number;
};

export function createBoardCanvas(
  el: HTMLCanvasElement,
  { width, height }: BoardCanvasOptions,
): Canvas {
  const canvas = new Canvas(el, {
    width,
    height,
    backgroundColor: undefined, // CSS controls the surface color
    selection: true, // marquee multi-select
    preserveObjectStacking: true, // selecting a tile doesn't pop it to front
    uniformScaling: true, // corner resize keeps aspect ratio
  });
  return canvas;
}

// Loads an artwork image and places it on the canvas at the placement's saved
// geometry. Scale is derived so the rendered size matches the stored width/
// height regardless of the image's natural pixel size. Resolves to the created
// object (or null if the image failed to load).
export async function placementToFabric(
  canvas: Canvas,
  p: PlacementDTO,
): Promise<BoardObject | null> {
  let img: FabricImage;
  try {
    img = await FabricImage.fromURL(aicImageUrl(p.imageId, 400), {
      crossOrigin: IMAGE_CROSS_ORIGIN,
    });
  } catch {
    return null;
  }
  const natW = img.width || DEFAULT_DISPLAY_WIDTH;
  const natH = img.height || DEFAULT_DISPLAY_WIDTH;
  img.set({
    left: p.x,
    top: p.y,
    scaleX: p.width / natW,
    scaleY: p.height / natH,
  });
  applyTileControls(img);
  attachData(img, p);
  canvas.add(img);
  // attachData has set the placement metadata on the object at runtime.
  return img as unknown as BoardObject;
}

// Add flow: a newly-pinned placement arrives at the schema default size
// (240x240). Render it at a sensible display width with the image's true
// aspect ratio, stacked on top, and select it so the user sees it land.
export async function addImageObject(
  canvas: Canvas,
  p: PlacementDTO,
): Promise<BoardObject | null> {
  let img: FabricImage;
  try {
    img = await FabricImage.fromURL(aicImageUrl(p.imageId, 400), {
      crossOrigin: IMAGE_CROSS_ORIGIN,
    });
  } catch {
    return null;
  }
  const natW = img.width || DEFAULT_DISPLAY_WIDTH;
  // Uniform scale keeps the artwork's natural aspect ratio at a default width.
  const scale = DEFAULT_DISPLAY_WIDTH / natW;
  img.set({
    left: p.x,
    top: p.y,
    scaleX: scale,
    scaleY: scale,
  });
  applyTileControls(img);
  attachData(img, p);
  canvas.add(img);
  canvas.bringObjectToFront(img);
  canvas.setActiveObject(img);
  canvas.requestRenderAll();
  // attachData has set the placement metadata on the object at runtime.
  return img as unknown as BoardObject;
}

// Converts a board object's live Fabric geometry to the DB layout shape. `z`
// comes from the object's stacking index so Save persists the visual order.
export function fabricToLayoutUpdate(
  obj: BoardObject,
  z: number,
): LayoutUpdate {
  return {
    id: obj.placementId,
    x: Math.round(obj.left ?? 0),
    y: Math.round(obj.top ?? 0),
    z,
    width: Math.round(obj.getScaledWidth()),
    height: Math.round(obj.getScaledHeight()),
  };
}

// Reads every board object on the canvas in stacking order and produces the
// batch payload for saveBoardLayoutAction.
export function collectLayout(canvas: Canvas): LayoutUpdate[] {
  return canvas
    .getObjects()
    .filter(isBoardObject)
    .map((obj, index) => fabricToLayoutUpdate(obj, index));
}

export function findById(canvas: Canvas, id: string): BoardObject | undefined {
  return canvas.getObjects().filter(isBoardObject).find((o) => o.placementId === id);
}

// Moves the active object by (dx, dy) canvas px and brings it to front, for
// keyboard users. Returns true if something actually moved (to flag dirty).
export function nudgeActiveObject(
  canvas: Canvas,
  dx: number,
  dy: number,
): boolean {
  const obj = canvas.getActiveObject();
  if (!isBoardObject(obj)) return false;
  obj.set({ left: (obj.left ?? 0) + dx, top: (obj.top ?? 0) + dy });
  obj.setCoords();
  canvas.bringObjectToFront(obj);
  canvas.requestRenderAll();
  return true;
}

// Zoom around the canvas center, clamped to the allowed range.
export function setZoomCentered(canvas: Canvas, zoom: number) {
  const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
  const center = new Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
  canvas.zoomToPoint(center, clamped);
  canvas.requestRenderAll();
}
