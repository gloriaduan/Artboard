"use server";

import { updateTag } from "next/cache";
import {
  createBoard,
  deleteBoard,
  addPlacement,
  removePlacement,
  saveBoardLayout,
  boardsTag,
  boardDetailTag,
  type LayoutUpdate,
} from "@/lib/dal/boards";

// Thin wrappers over the DAL. Auth + authorization + input validation happen
// inside the DAL; here we just invalidate the relevant cache tags.
export async function createBoardAction(name: string) {
  const { userId, board } = await createBoard(name);
  updateTag(boardsTag(userId));
  return { success: true as const, board };
}

export async function deleteBoardAction(boardId: string) {
  const { userId } = await deleteBoard(boardId);
  updateTag(boardsTag(userId));
  updateTag(boardDetailTag(boardId));
  return { success: true as const };
}

export async function addPlacementAction(boardId: string, savedId: string) {
  const { placement } = await addPlacement(boardId, savedId);
  updateTag(boardDetailTag(boardId));
  return { success: true as const, placement };
}

export async function removePlacementAction(
  placementId: string,
  boardId: string,
) {
  await removePlacement(placementId, boardId);
  updateTag(boardDetailTag(boardId));
  return { success: true as const };
}

// Commits the whole board layout at once (the canvas Save button). Dragging
// stays local on the client until the user saves, so this is the single write.
// We invalidate the board-detail cache so a later page load re-reads the saved
// positions: under Cache Components the cached read otherwise survives reloads
// and would serve the pre-save snapshot. There's no in-session flash because
// the client canvas already holds the saved state.
export async function saveBoardLayoutAction(
  boardId: string,
  updates: LayoutUpdate[],
) {
  await saveBoardLayout(boardId, updates);
  updateTag(boardDetailTag(boardId));
  return { success: true as const };
}
