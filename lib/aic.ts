import "server-only";
import { cacheLife } from "next/cache";
import type { AICResponse } from "./aic-types";

export type { AICArtwork, AICResponse } from "./aic-types";
export { aicImageUrl } from "./aic-types";

const AIC_BASE = "https://api.artic.edu/api/v1";
const FIELDS =
  "id,title,artist_display,image_id,date_display,medium_display,is_boosted,is_on_view";

export async function fetchArtworks(
  page = 1,
  limit = 20,
  query?: string,
): Promise<AICResponse> {
  "use cache";
  cacheLife("hours");

  const from = (page - 1) * limit;

  const params = new URLSearchParams({
    ...(query ? { q: query } : { "query[term][is_boosted]": "true" }),
    from: String(from),
    size: String(limit),
    fields: FIELDS,
  });

  const res = await fetch(`${AIC_BASE}/artworks/search?${params}`);
  if (!res.ok) throw new Error(`AIC fetch failed: ${res.status}`);
  return res.json();
}
