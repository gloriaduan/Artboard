import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import LandingPage from "@/components/LandingPage";
import AuthNavbar from "@/components/AuthNavbar";
import Dashboard from "@/components/Dashboard";
import ArtworkSkeleton from "@/components/ArtworkSkeleton";

async function AuthenticatedApp() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    return (
      <>
        <AuthNavbar user={session.user} />
        <Dashboard />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <LandingPage />
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <main className="w-full max-w-6xl mx-auto px-4 py-8">
            <ArtworkSkeleton count={20} />
          </main>
        </>
      }
    >
      <AuthenticatedApp />
    </Suspense>
  );
}
