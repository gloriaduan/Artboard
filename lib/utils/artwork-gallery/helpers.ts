// Build a compact page range like [1, "…", 4, 5, 6, "…", 142] so the control
// stays small even across 100+ pages. Always shows first, last, and a window
// around the current page.
export default function pageRange(
  current: number,
  total: number,
): (number | "…")[] {
  const span = 1; // pages shown on each side of the current page
  const pages = new Set<number>([1, total]);
  for (let p = current - span; p <= current + span; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  console.log(sorted);

  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}
