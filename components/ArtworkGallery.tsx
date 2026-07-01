"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Form from "next/form";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { Artwork, ArtworkResponse, Century } from "@/lib/museum-types";
import ArtworkCard from "./ArtworkCard";
import ArtworkSkeleton from "./ArtworkSkeleton";
import ArtworkModal from "./ArtworkModal";
import styles from "./ArtworkGallery.module.css";
import pageRange from "@/lib/utils/artwork-gallery/helpers";

type Props = {
  initialData: Artwork[];
  totalPages: number;
  centuries: Century[];
};

type Filters = { q: string; century: string };

async function fetchArtworks(
  page: number,
  { q, century }: Filters,
): Promise<ArtworkResponse> {
  const params = new URLSearchParams({ limit: "20", page: String(page) });
  if (q) params.set("q", q);
  if (century) params.set("century", century);
  const res = await fetch(`/api/artworks?${params}`);
  if (!res.ok) throw new Error("Failed to load artworks");
  return res.json();
}

export default function ArtworkGallery({
  initialData,
  totalPages,
  centuries,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const century = searchParams.get("century") ?? "";
  const hasFilters = Boolean(q || century);

  const [page, setPage] = useState(1);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const filterKey = `${q} ${century}`;
  const [activeFilterKey, setActiveFilterKey] = useState(filterKey);
  if (filterKey !== activeFilterKey) {
    setActiveFilterKey(filterKey);
    setPage(1);
  }

  const { data, isError, isFetching, refetch } = useQuery({
    queryKey: ["artworks", page, q, century],
    queryFn: () => fetchArtworks(page, { q, century }),
    // The SSR seed is only valid for the unfiltered first page.
    initialData:
      page === 1 && !hasFilters
        ? {
            data: initialData,
            pagination: { total: 0, total_pages: totalPages, current_page: 1 },
          }
        : undefined,
    placeholderData: keepPreviousData,
  });

  const artworks = data?.data ?? [];
  // Page count comes from the (possibly filtered) response so the pager never
  // outlives its result set. Fall back to the SSR prop before the first fetch.
  const pageCount = data?.pagination.total_pages ?? totalPages;

  function goToPage(next: number) {
    if (next < 1 || next > pageCount || next === page) return;
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onCenturyChange(next: string) {
    const params = new URLSearchParams(searchParams);
    if (next) params.set("century", next);
    else params.delete("century");
    router.push(params.size ? `${pathname}?${params}` : pathname);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          className="select select-sm border border-base-content/20"
          aria-label="Filter by period"
          value={century}
          onChange={(e) => onCenturyChange(e.target.value)}
        >
          <option value="">Select a period</option>
          {centuries.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        {/* Search — submitting navigates to ?q=… on the same route. It omits the
            century param, so running a search clears the period filter. */}
        <Form action="" role="search" className={styles.search}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            name="q"
            defaultValue={q}
            key={q}
            className={styles.searchInput}
            type="search"
            placeholder="Search artworks, artists…"
            aria-label="Search artworks and artists"
          />
        </Form>
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
      ) : data === undefined ? (
        <ArtworkSkeleton count={20} />
      ) : artworks.length === 0 ? (
        <div className="py-16 text-center text-base-content/70">
          <p>No artworks found. Try a different search or period.</p>
        </div>
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
          {pageCount > 1 && (
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
                {pageRange(page, pageCount).map((p, i) =>
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
                      className={`join-item btn ${p === page ? "btn-primary" : ""}`}
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
                  disabled={page === pageCount || isFetching}
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
