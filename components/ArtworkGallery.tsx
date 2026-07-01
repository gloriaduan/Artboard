"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { Artwork, ArtworkResponse } from "@/lib/museum-types";
import ArtworkCard from "./ArtworkCard";
import ArtworkSkeleton from "./ArtworkSkeleton";
import ArtworkModal from "./ArtworkModal";
import styles from "./ArtworkGallery.module.css";
import pageRange from "@/lib/utils/artwork-gallery/helpers";

type Props = {
  initialData: Artwork[];
  totalPages: number;
};

async function fetchArtworks(page: number): Promise<Artwork[]> {
  const res = await fetch(`/api/artworks?limit=20&page=${page}`);
  if (!res.ok) throw new Error("Failed to load artworks");
  const data: ArtworkResponse = await res.json();
  return data.data;
}

export default function ArtworkGallery({ initialData, totalPages }: Props) {
  const [page, setPage] = useState(1);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const { data, isError, isFetching, refetch } = useQuery({
    queryKey: ["artworks", page],
    queryFn: () => fetchArtworks(page),
    initialData: page === 1 ? initialData : undefined,
    placeholderData: keepPreviousData,
  });

  const artworks = data ?? [];

  function goToPage(next: number) {
    if (next < 1 || next > totalPages || next === page) return;
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          className="select select-sm border border-base-content/20"
          aria-label="Filter by period"
        >
          <option value="">Select a period</option>
          <option value="ancient">Ancient</option>
          <option value="medieval">Medieval</option>
          <option value="renaissance">Renaissance</option>
          <option value="modern">Modern</option>
          <option value="contemporary">Contemporary</option>
        </select>
        {/* Search */}
        <form role="search" className={styles.search}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search artworks, artists…"
            aria-label="Search artworks and artists"
          />
        </form>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-base-content/70">
            We couldn’t load these artworks. Check your connection and try
            again.
          </p>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => refetch()}
          >
            Try again
          </button>
        </div>
      ) : artworks.length === 0 ? (
        <ArtworkSkeleton count={20} />
      ) : (
        <>
          {/* CSS-columns masonry: cards flow into 2/3/4 columns by breakpoint and
              keep their natural (variable) heights for the staggered collage look. */}
          <div
            aria-busy={isFetching}
            className="columns-2 md:columns-3 lg:columns-4 gap-4 *:mb-4"
          >
            {artworks.map((artwork) => (
              <div key={artwork.id} className="break-inside-avoid">
                <ArtworkCard
                  artwork={artwork}
                  onClick={() => setSelectedArtwork(artwork)}
                />
              </div>
            ))}
          </div>

          {/* DaisyUI numbered pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Gallery pages"
              className="flex justify-center pt-2 pb-8"
            >
              <div className="join">
                <button
                  type="button"
                  className="join-item btn"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1 || isFetching}
                  aria-label="Previous page"
                >
                  <ChevronsLeft className="size-4" />
                </button>
                {pageRange(page, totalPages).map((p, i) =>
                  p === "…" ? (
                    <button
                      key={`ellipsis-${i}`}
                      type="button"
                      className="join-item btn btn-disabled"
                      aria-hidden="true"
                      tabIndex={-1}
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`join-item btn ${p === page ? "btn-active" : ""}`}
                      onClick={() => goToPage(p)}
                      disabled={isFetching}
                      aria-current={p === page ? "page" : undefined}
                      aria-label={`Page ${p}`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  className="join-item btn"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages || isFetching}
                  aria-label="Next page"
                >
                  <ChevronsRight className="size-4" />
                </button>
              </div>
            </nav>
          )}
        </>
      )}
      <ArtworkModal
        artwork={selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
      />
    </div>
  );
}
