import "server-only";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { Prisma } from "@/prisma/generated/client";
import { requireUser } from "./session";

// DTOs returned to render contexts — only the fields the UI needs, never the
// raw rows (no userId/timestamps leaked to the client).
export type BoardDTO = {
  id: string;
  name: string;
  placementCount: number;
};

export type PlacementDTO = {
  id: string;
  savedId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  // Joined from the saved artwork so the canvas can render the image directly.
  title: string;
  imageBase: string;
  sourceId: number;
};

export type BoardDetailDTO = BoardDTO & { placements: PlacementDTO[] };

export function boardsTag(userId: string) {
  return `boards:${userId}`;
}

export function boardDetailTag(boardId: string) {
  return `board:${boardId}`;
}

// Cached reads take ids resolved by the caller (outside the cache) because
// `headers()` can't run inside a `"use cache"` boundary.
async function getBoardsForUser(userId: string): Promise<BoardDTO[]> {
  "use cache";
  cacheTag(boardsTag(userId));

  const rows = await db.board.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { placements: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    placementCount: row._count.placements,
  }));
}

// Filtered by userId so a board that isn't the user's resolves to "not found"
// (findUniqueOrThrow can't take userId, so we use findFirstOrThrow scoped by both).
async function getBoardDetail(
  boardId: string,
  userId: string,
): Promise<BoardDetailDTO> {
  "use cache";
  cacheTag(boardDetailTag(boardId));

  const row = await db.board.findFirstOrThrow({
    where: { id: boardId, userId },
    include: {
      _count: { select: { placements: true } },
      placements: {
        orderBy: { z: "asc" },
        include: { saved: true },
      },
    },
  });

  return {
    id: row.id,
    name: row.name,
    placementCount: row._count.placements,
    placements: row.placements.map((p) => placementToDTO(p, p.saved)),
  };
}

export async function listBoards(): Promise<BoardDTO[]> {
  const user = await requireUser();
  return getBoardsForUser(user.id);
}

export async function getBoardWithPlacements(
  boardId: string,
): Promise<BoardDetailDTO> {
  const user = await requireUser();
  return getBoardDetail(boardId, user.id);
}

export async function createBoard(
  name: string,
): Promise<{ userId: string; board: BoardDTO }> {
  const user = await requireUser();
  const trimmed = String(name ?? "").trim();
  if (!trimmed) throw new Error("Board name is required");

  const row = await db.board.create({
    data: { userId: user.id, name: trimmed },
  });
  return {
    userId: user.id,
    board: { id: row.id, name: row.name, placementCount: 0 },
  };
}

export async function deleteBoard(
  boardId: string,
): Promise<{ userId: string }> {
  const user = await requireUser();
  // Scoped by userId so a user can only ever delete their own boards.
  await db.board.deleteMany({ where: { id: boardId, userId: user.id } });
  return { userId: user.id };
}

// Maps a placement row (with its joined saved artwork) to the client DTO.
function placementToDTO(
  p: {
    id: string;
    savedId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    z: number;
  },
  saved: { title: string; imageBase: string; sourceId: number },
): PlacementDTO {
  return {
    id: p.id,
    savedId: p.savedId,
    x: p.x,
    y: p.y,
    width: p.width,
    height: p.height,
    z: p.z,
    title: saved.title,
    imageBase: saved.imageBase,
    sourceId: saved.sourceId,
  };
}

// Adds a saved artwork to a board. The savedId must belong to the user and the
// board must belong to the user — both are verified before the create so a
// client can't pin into someone else's board or pin a stranger's saved row.
// Returns the created placement as a DTO so the canvas can insert it optimistically.
export async function addPlacement(
  boardId: string,
  savedId: string,
): Promise<{ boardId: string; placement: PlacementDTO }> {
  const user = await requireUser();

  const [board, saved] = await Promise.all([
    db.board.findFirst({ where: { id: boardId, userId: user.id } }),
    db.savedArtwork.findFirst({ where: { id: savedId, userId: user.id } }),
  ]);
  if (!board) throw new Error("Board not found");
  if (!saved) throw new Error("Saved artwork not found");

  // Stack new tiles on top. Float defaults (x/y 0, 240x240) come from the schema.
  const top = await db.boardPlacement.aggregate({
    where: { boardId },
    _max: { z: true },
  });
  const z = (top._max.z ?? 0) + 1;

  try {
    const row = await db.boardPlacement.create({ data: { boardId, savedId, z } });
    return { boardId, placement: placementToDTO(row, saved) };
  } catch (err) {
    // If a unique constraint is later added on (boardId, savedId), treat a
    // duplicate as a no-op — return the existing placement's DTO.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const existing = await db.boardPlacement.findFirstOrThrow({
        where: { boardId, savedId },
      });
      return { boardId, placement: placementToDTO(existing, saved) };
    }
    throw err;
  }
}

export async function removePlacement(
  placementId: string,
  boardId: string,
): Promise<{ boardId: string }> {
  const user = await requireUser();
  // Verify the placement belongs to a board this user owns, then delete by its
  // primary key. We use `delete` (single row) rather than `deleteMany` because
  // the Neon HTTP adapter can't run the implicit transaction Prisma opens for
  // batch writes on cascade-related models.
  const placement = await db.boardPlacement.findFirst({
    where: { id: placementId, boardId, board: { userId: user.id } },
    select: { id: true },
  });
  if (!placement) throw new Error("Placement not found");

  await db.boardPlacement.delete({ where: { id: placementId } });
  return { boardId };
}

export type LayoutUpdate = {
  id: string;
  x: number;
  y: number;
  z: number;
  width?: number;
  height?: number;
};

// Bulk-persist a whole board's positions in one call, used by the canvas Save
// button so dragging stays local until the user commits. Ownership is verified
// once for the board, and each placement is updated by primary key (single-row
// updates, no transaction — the Neon HTTP adapter can't run one). Only ids that
// actually belong to this board are touched, so a tampered client payload can't
// move placements it doesn't own.
export async function saveBoardLayout(
  boardId: string,
  updates: LayoutUpdate[],
): Promise<{ boardId: string }> {
  const user = await requireUser();

  const board = await db.board.findFirst({
    where: { id: boardId, userId: user.id },
    select: { id: true },
  });
  if (!board) throw new Error("Board not found");

  // Restrict to placements that genuinely belong to this board.
  const owned = await db.boardPlacement.findMany({
    where: { boardId },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((p) => p.id));

  await Promise.all(
    updates
      .filter((u) => ownedIds.has(u.id))
      .map((u) => {
        const data: Prisma.BoardPlacementUpdateInput = {
          x: u.x,
          y: u.y,
          z: u.z,
        };
        if (typeof u.width === "number") data.width = u.width;
        if (typeof u.height === "number") data.height = u.height;
        return db.boardPlacement.update({ where: { id: u.id }, data });
      }),
  );

  return { boardId };
}
