import "server-only";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { Prisma, type SavedArtwork } from "@/prisma/generated/client";
import { requireUser } from "./session";

// DTO returned to render contexts — only the fields the UI needs, never the
// raw row (no userId/createdAt leaked to the client).
export type SavedArtworkDTO = {
  id: string;
  aicId: number;
  title: string;
  imageId: string;
};

function toDTO(row: SavedArtwork): SavedArtworkDTO {
  return {
    id: row.id,
    aicId: row.aicId,
    title: row.title,
    imageId: row.imageId,
  };
}

export function savedArtworksTag(userId: string) {
  return `saved-artworks:${userId}`;
}

// Cached read keyed by the per-user tag. Takes userId (resolved by the caller
// outside the cache) because `headers()` can't run inside `"use cache"`.
async function getSavedArtworks(userId: string): Promise<SavedArtworkDTO[]> {
  "use cache";
  cacheTag(savedArtworksTag(userId));

  const rows = await db.savedArtwork.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toDTO);
}

export async function listSavedArtworks(): Promise<SavedArtworkDTO[]> {
  const user = await requireUser();
  return getSavedArtworks(user.id);
}

export async function isArtworkSaved(aicId: number): Promise<boolean> {
  const user = await requireUser();
  const count = await db.savedArtwork.count({
    where: { userId: user.id, aicId },
  });
  return count > 0;
}

type SaveInput = { aicId: number; title: string; imageId: string };

function validateSaveInput(input: SaveInput): SaveInput {
  const aicId = Number(input.aicId);
  if (!Number.isInteger(aicId) || aicId <= 0) {
    throw new Error("Invalid artwork id");
  }
  const title = String(input.title ?? "").trim();
  const imageId = String(input.imageId ?? "").trim();
  if (!title || !imageId) {
    throw new Error("Missing artwork title or image");
  }
  return { aicId, title, imageId };
}

// Idempotent via the @@unique([userId, aicId]) constraint. Returns userId so the
// calling action can invalidate the per-user cache tag.
//
// Note: the Neon HTTP adapter does not support transactions, so we avoid
// `upsert` (which Prisma runs in a transaction). Instead we try to create and
// treat a unique-constraint violation (P2002) as "already saved".
export async function saveArtwork(
  input: SaveInput,
): Promise<{ userId: string; saved: SavedArtworkDTO }> {
  const user = await requireUser();
  const { aicId, title, imageId } = validateSaveInput(input);

  try {
    const row = await db.savedArtwork.create({
      data: { userId: user.id, aicId, title, imageId },
    });
    return { userId: user.id, saved: toDTO(row) };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const row = await db.savedArtwork.findUniqueOrThrow({
        where: { userId_aicId: { userId: user.id, aicId } },
      });
      return { userId: user.id, saved: toDTO(row) };
    }
    throw err;
  }
}

export async function removeSavedArtwork(
  aicId: number,
): Promise<{ userId: string }> {
  const user = await requireUser();
  // Scoped by userId so a user can only ever delete their own rows.
  await db.savedArtwork.deleteMany({ where: { userId: user.id, aicId } });
  return { userId: user.id };
}
