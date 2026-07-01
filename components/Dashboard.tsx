import { Suspense } from "react";
import { fetchArtworks, fetchCenturies } from "@/lib/museum";
import ArtworkGallery from "./ArtworkGallery";
import ArtworkSkeleton from "./ArtworkSkeleton";

async function GalleryLoader() {
  const [result, centuries] = await Promise.all([
    fetchArtworks(1, 20),
    fetchCenturies(),
  ]);
  return (
    <ArtworkGallery
      initialData={result.data}
      totalPages={result.pagination.total_pages}
      centuries={centuries}
    />
  );
}

export default function Dashboard() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display font-semibold text-3xl tracking-[-0.01em] leading-tight">
          Explore Art
        </h1>
        <p className="text-base-content/70 text-sm mt-1">
          Browse the Harvard Art Museums collection
        </p>
      </div>

      <Suspense fallback={<ArtworkSkeleton count={20} />}>
        <GalleryLoader />
      </Suspense>
    </main>
  );
}
