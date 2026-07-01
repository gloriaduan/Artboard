import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal/session";
import { listBoards } from "@/lib/dal/boards";
import AuthNavbar from "@/components/AuthNavbar";
import BoardList from "@/components/BoardList";

async function BoardsContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const boards = await listBoards();

  return (
    <>
      <AuthNavbar user={user} />
      <main className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display font-semibold text-3xl tracking-[-0.01em] leading-tight">
            My Boards
          </h1>
          <p className="text-base-content/70 text-sm mt-1">
            Arrange your saved artworks into collage boards
          </p>
        </div>
        <BoardList boards={boards} />
      </main>
    </>
  );
}

export default function BoardsPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-lg" />
            ))}
          </div>
        </main>
      }
    >
      <BoardsContent />
    </Suspense>
  );
}
