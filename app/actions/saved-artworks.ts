"use server";

import { updateTag } from "next/cache";
import {
  saveArtwork,
  removeSavedArtwork,
  savedArtworksTag,
} from "@/lib/dal/saved-artworks";

// Thin wrappers over the DAL. Auth + authorization + input validation happen
// inside the DAL; here we just invalidate the per-user cache tag. updateTag
// (read-your-own-writes) expires the tag immediately so the user sees their
// change on the next visit to the saved page.
export async function saveArtworkAction(input: {
  aicId: number;
  title: string;
  imageId: string;
}) {
  const { userId } = await saveArtwork(input);
  updateTag(savedArtworksTag(userId));
  return { success: true };
}

export async function removeSavedArtworkAction(aicId: number) {
  const { userId } = await removeSavedArtwork(aicId);
  updateTag(savedArtworksTag(userId));
  return { success: true };
}
