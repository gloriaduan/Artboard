"use client";

import Marquee from "./Marquee";
import SignUpModal, { openSignUpModal } from "./SignUpModal";

export default function LandingPage() {
  return (
    <section className="relative flex items-center justify-center min-h-[calc(100vh-64px)] overflow-hidden bg-base-100">
      {/* Background marquee */}
      <div
        className="absolute inset-0 flex flex-col justify-center gap-3 opacity-20 pointer-events-none"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <Marquee />
      </div>

      {/* Foreground text */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl font-bold tracking-tight text-base-content">
          Your personal art collection
        </h1>
        <p className="mt-4 text-lg text-base-content/70 max-w-md mx-auto">
          Save artworks from the world&apos;s greatest museums and arrange them
          into your own collage board.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <button className="btn btn-primary btn-lg" onClick={openSignUpModal}>
            Get started
          </button>
          <a className="btn btn-ghost btn-lg">Explore artworks</a>
        </div>
      </div>

      <SignUpModal />
    </section>
  );
}
