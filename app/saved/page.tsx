import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal/session";
import { listSavedArtworks } from "@/lib/dal/saved-artworks";
import AuthNavbar from "@/components/AuthNavbar";
import SavedGallery from "@/components/SavedGallery";
import ArtworkSkeleton from "@/components/ArtworkSkeleton";

// Both the auth check and the saved-artworks read access request data
// (cookies/headers), so they must live inside the Suspense boundary under
// Cache Components — otherwise the whole route is blocked from prerendering.
async function SavedContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const saved = await listSavedArtworks();

  return (
    <>
      <AuthNavbar user={user} />
      <main className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Saved Artworks</h1>
          <p className="text-base-content/60 text-sm mt-1">
            Artworks you&apos;ve saved to add to your boards
          </p>
        </div>
        <SavedGallery items={saved} />
      </main>
    </>
  );
}

export default function SavedPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full max-w-6xl mx-auto px-4 py-8">
          <ArtworkSkeleton count={12} />
        </main>
      }
    >
      <SavedContent />
    </Suspense>
  );
}
