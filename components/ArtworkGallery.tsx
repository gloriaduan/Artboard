"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AICArtwork, AICResponse } from "@/lib/aic-types";
import ArtworkCard from "./ArtworkCard";
import ArtworkSkeleton from "./ArtworkSkeleton";

const COLS = 4;
const CARD_HEIGHT = 320; // px estimate per row — virtualizer needs a fixed estimate
const OVERSCAN = 3;

type Props = {
  initialData: AICArtwork[];
  totalPages: number;
};

function chunkIntoRows(items: AICArtwork[], cols: number): AICArtwork[][] {
  const rows: AICArtwork[][] = [];
  for (let i = 0; i < items.length; i += cols) {
    rows.push(items.slice(i, i + cols));
  }
  return rows;
}

export default function ArtworkGallery({ initialData, totalPages }: Props) {
  const [allArtworks, setAllArtworks] = useState<AICArtwork[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("");

  const parentRef = useRef<HTMLDivElement>(null);

  const rows = chunkIntoRows(allArtworks, COLS);
  const hasMore = currentPage < totalPages;

  const virtualizer = useVirtualizer({
    count: hasMore ? rows.length + 1 : rows.length, // +1 for loader row
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT,
    overscan: OVERSCAN,
  });

  const fetchNextPage = useCallback(async () => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    const nextPage = currentPage + 1;
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: "20",
      });
      if (query) params.set("q", query);
      const res = await fetch(`/api/artworks?${params}`);
      const json: AICResponse = await res.json();
      setAllArtworks((prev) => [...prev, ...json.data]);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error("Failed to fetch next page:", err);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, hasMore, currentPage, query]);

  // Trigger fetch when last virtual row comes into view
  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;
    if (lastItem.index >= rows.length - 1 && hasMore && !isFetching) {
      fetchNextPage();
    }
  }, [virtualItems, rows.length, hasMore, isFetching, fetchNextPage]);

  // Reset when filters change
  const applyFilters = useCallback(async (newQuery: string) => {
    setIsFetching(true);
    setAllArtworks([]);
    setCurrentPage(0);
    try {
      const params = new URLSearchParams({ page: "1", limit: "20" });
      if (newQuery) params.set("q", newQuery);
      const res = await fetch(`/api/artworks?${params}`);
      const json: AICResponse = await res.json();
      setAllArtworks(json.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Filter fetch failed:", err);
    } finally {
      setIsFetching(false);
    }
  }, []);

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    const q = value ? `${value} ${query}`.trim() : query;
    applyFilters(q);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    const q = period ? `${period} ${value}`.trim() : value;
    applyFilters(q);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          className="select select-sm border border-base-content/20"
          value={period}
          onChange={(e) => handlePeriodChange(e.target.value)}
        >
          <option value="">Period</option>
          <option value="ancient">Ancient</option>
          <option value="medieval">Medieval</option>
          <option value="renaissance">Renaissance</option>
          <option value="modern">Modern</option>
          <option value="contemporary">Contemporary</option>
        </select>

        <input
          type="search"
          placeholder="Search artworks..."
          className="input input-sm border border-base-content/20 flex-1 min-w-40"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
      </div>

      {/* Virtualized scroll container */}
      <div ref={parentRef} className="h-[calc(100vh-200px)] overflow-auto">
        <div
          style={{ height: virtualizer.getTotalSize(), position: "relative" }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const isLoaderRow = virtualRow.index >= rows.length;
            const row = rows[virtualRow.index];

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="pb-4"
              >
                {isLoaderRow ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: COLS }).map((_, i) => (
                      <div
                        key={i}
                        className="skeleton w-full aspect-[3/4] rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {row.map((artwork) => (
                      <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!isFetching && allArtworks.length === 0 && (
        <p className="text-center text-base-content/50 py-16">
          No artworks found.
        </p>
      )}

      {isFetching && allArtworks.length === 0 && <ArtworkSkeleton count={20} />}
    </div>
  );
}
