import "server-only";
import { cacheLife } from "next/cache";
import type { AICResponse } from "./aic-types";

export type { AICArtwork, AICResponse } from "./aic-types";
export { aicImageUrl } from "./aic-types";

const AIC_BASE = "https://api.artic.edu/api/v1";
const FIELDS = "id,title,artist_display,image_id,date_display,medium_display";

export async function fetchArtworks(
  page = 1,
  limit = 20,
  query?: string,
): Promise<AICResponse> {
  "use cache";
  cacheLife("hours");

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    fields: FIELDS,
    ...(query ? { q: query } : {}),
  });

  const endpoint = query
    ? `${AIC_BASE}/artworks/search?${params}`
    : `${AIC_BASE}/artworks?${params}`;

  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`AIC fetch failed: ${res.status}`);
  return res.json();
}
