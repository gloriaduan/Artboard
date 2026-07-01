"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { BoardDTO } from "@/lib/dal/boards";
import { createBoardAction } from "@/app/actions/boards";

export default function BoardList({ boards }: { boards: BoardDTO[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const { board } = await createBoardAction(trimmed);
      setName("");
      setCreating(false);
      // Drop the user straight into the new board's editing canvas so they can
      // start adding images immediately.
      router.push(`/boards/${board.id}`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {creating ? (
        <form
          onSubmit={handleCreate}
          className="flex gap-2 items-center flex-wrap"
        >
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Board name…"
            aria-label="New board name"
            className="input input-sm border border-base-content/20 flex-1 min-w-48"
          />
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="btn btn-sm btn-primary"
          >
            {isPending && (
              <span className="loading loading-spinner loading-xs" />
            )}
            Create
          </button>
          <button
            type="button"
            onClick={() => {
              setCreating(false);
              setName("");
            }}
            className="btn btn-sm btn-ghost"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="btn btn-sm btn-primary self-start"
        >
          <Plus className="size-4" />
          New board
        </button>
      )}

      {boards.length === 0 ? (
        <p className="text-center text-base-content/70 py-16">
          No boards yet. Create one, then add saved artworks to it.
        </p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 list-none p-0 m-0">
          {boards.map((board) => (
            <li key={board.id}>
              <Link
                href={`/boards/${board.id}`}
                className="flex flex-col justify-between h-32 p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
              >
                <span className="font-semibold truncate">{board.name}</span>
                <span className="text-sm text-base-content/70">
                  {board.placementCount}{" "}
                  {board.placementCount === 1 ? "artwork" : "artworks"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
