import { Suspense } from "react";
import { fetchArtworks } from "@/lib/aic";
import ArtworkGallery from "./ArtworkGallery";
import ArtworkSkeleton from "./ArtworkSkeleton";

async function GalleryLoader() {
  const result = await fetchArtworks(1, 20);
  return (
    <ArtworkGallery
      initialData={result.data}
      totalPages={result.pagination.total_pages}
    />
  );
}

export default function Dashboard() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Explore Art</h1>
        <p className="text-base-content/70 text-sm mt-1">
          Browse the Art Institute of Chicago collection
        </p>
      </div>

      <Suspense fallback={<ArtworkSkeleton count={20} />}>
        <GalleryLoader />
      </Suspense>
    </main>
  );
}
