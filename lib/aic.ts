import "server-only";
import { cacheLife } from "next/cache";
import type { AICResponse, AICArtworkResponse } from "./aic-types";

export type {
  AICArtwork,
  AICResponse,
  AICArtworkDetail,
  AICArtworkResponse,
} from "./aic-types";
export { aicImageUrl } from "./aic-types";

const AIC_BASE = "https://api.artic.edu/api/v1";
const FIELDS =
  "id,title,artist_display,image_id,date_display,medium_display,is_boosted,is_on_view,thumbnail";
const DETAIL_FIELDS =
  "id,title,artist_display,image_id,date_display,medium_display,dimensions,place_of_origin,credit_line,description";

export async function fetchArtworks(
  page = 1,
  limit = 20,
  query?: string,
): Promise<AICResponse> {
  "use cache";
  cacheLife("hours");

  const from = (page - 1) * limit;

  const params = new URLSearchParams({
    ...(query
      ? { q: query }
      : {
          // Default feed: AIC's curated/boosted works, surfaced most-popular-first.
          // boost_rank ascending puts the highest-boosted (most popular) works first.
          "query[term][is_boosted]": "true",
          sort: "boost_rank",
        }),
    from: String(from),
    size: String(limit),
    fields: FIELDS,
  });

  const res = await fetch(`${AIC_BASE}/artworks/search?${params}`);
  if (!res.ok) throw new Error(`AIC fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchArtwork(id: number): Promise<AICArtworkResponse> {
  "use cache";
  cacheLife("hours");

  const res = await fetch(`${AIC_BASE}/artworks/${id}?fields=${DETAIL_FIELDS}`);
  if (!res.ok) throw new Error(`AIC fetch failed: ${res.status}`);
  return res.json();
}
