import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/dal/session";
import { getBoardWithPlacements } from "@/lib/dal/boards";
import { listSavedArtworks } from "@/lib/dal/saved-artworks";
import AuthNavbar from "@/components/AuthNavbar";
import BoardCanvas from "@/components/BoardCanvas";

async function BoardDetailContent({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/");

  let board;
  try {
    board = await getBoardWithPlacements(boardId);
  } catch {
    notFound();
  }

  const savedArtworks = await listSavedArtworks();

  return (
    <>
      <AuthNavbar user={user} />
      <BoardCanvas
        boardId={board.id}
        boardName={board.name}
        initialPlacements={board.placements}
        savedArtworks={savedArtworks}
      />
    </>
  );
}

export default function BoardDetailPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="w-full max-w-6xl mx-auto px-4 py-8">
          <div className="skeleton h-[calc(100dvh-8rem)] rounded-lg" />
        </main>
      }
    >
      <BoardDetailContent params={params} />
    </Suspense>
  );
}
