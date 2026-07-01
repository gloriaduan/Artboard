"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

// Site-wide "back to top" affordance. The page (window) owns the scroll across
// every route, so this listens to window scroll and appears once the user is a
// screenful or so down. Smooth scroll respects prefers-reduced-motion via the
// behavior fallback below.
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 ease-out bg-(--to-top-bg) text-(--to-top-fg) ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <ChevronUp className="size-6" aria-hidden="true" />
    </button>
  );
}
