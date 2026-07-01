import "server-only";
import { cacheLife } from "next/cache";
import {
  type Artwork,
  type ArtworkDetail,
  type ArtworkResponse,
  type Century,
  type HarvardResponse,
  type HarvardCenturyResponse,
  normalizeArtwork,
  normalizeArtworkDetail,
  normalizeCentury,
} from "./museum-types";

export type {
  Artwork,
  ArtworkDetail,
  ArtworkResponse,
  ArtworkThumbnail,
  Century,
} from "./museum-types";
export { imageUrl } from "./museum-types";

const HARVARD_BASE = "https://api.harvardartmuseums.org";
// Fields requested for the gallery list view.
const LIST_FIELDS =
  "objectid,title,people,dated,medium,images,primaryimageurl";
// Detail view adds description/dimensions/culture/credit line for the modal.
const DETAIL_FIELDS =
  "objectid,title,people,dated,medium,culture,description,dimensions,creditline,images,primaryimageurl";

function apiKey(): string {
  const key = process.env.HARVARD_API_KEY;
  if (!key) throw new Error("HARVARD_API_KEY is not set");
  return key;
}

export async function fetchArtworks(
  page = 1,
  limit = 20,
  query?: string,
  century?: string,
): Promise<ArtworkResponse> {
  "use cache";
  cacheLife("hours");

  const params = new URLSearchParams({
    apikey: apiKey(),
    hasimage: "1",
    classification: "Paintings",
    size: String(limit),
    page: String(page),
    fields: LIST_FIELDS,
    // Narrow to a time period when one is selected. Combines with the popularity
    // sort below so a filtered feed still shows that era's top paintings.
    ...(century ? { century } : {}),
    ...(query
      ? { q: query }
      : // Default feed: most-viewed paintings first — a real popularity signal.
        { sort: "totalpageviews", sortorder: "desc" }),
  });

  const res = await fetch(`${HARVARD_BASE}/object?${params}`);
  if (!res.ok) throw new Error(`Harvard fetch failed: ${res.status}`);
  const json: HarvardResponse = await res.json();

  // Drop records that normalized to no image so the gallery never shows blanks.
  const data: Artwork[] = (json.records ?? [])
    .map(normalizeArtwork)
    .filter((a) => a.imageBase);

  return {
    data,
    pagination: {
      total: json.info.totalrecords,
      total_pages: json.info.pages,
      current_page: json.info.page,
    },
  };
}

export async function fetchArtwork(
  id: number,
): Promise<{ data: ArtworkDetail }> {
  "use cache";
  cacheLife("hours");

  const params = new URLSearchParams({
    apikey: apiKey(),
    fields: DETAIL_FIELDS,
  });

  const res = await fetch(`${HARVARD_BASE}/object/${id}?${params}`);
  if (!res.ok) throw new Error(`Harvard fetch failed: ${res.status}`);
  const rec = await res.json();

  return { data: normalizeArtworkDetail(rec) };
}

// How many centuries to offer in the period dropdown. Kept short so every option
// returns a healthy number of results and the list stays scannable.
const CENTURY_LIMIT = 15;

// Fetch the time-period options for the gallery filter: the centuries with the most
// paintings, sorted newest era first. Scoped to the same feed as the gallery
// (paintings with images) so counts reflect what users actually browse.
export async function fetchCenturies(): Promise<Century[]> {
  "use cache";
  cacheLife("hours");

  const params = new URLSearchParams({
    apikey: apiKey(),
    hasimage: "1",
    classification: "Paintings",
    size: "100",
    fields: "id,name,objectcount,temporalorder",
    sort: "objectcount",
    sortorder: "desc",
  });

  const res = await fetch(`${HARVARD_BASE}/century?${params}`);
  if (!res.ok) throw new Error(`Harvard fetch failed: ${res.status}`);
  const json: HarvardCenturyResponse = await res.json();

  return (json.records ?? [])
    .map(normalizeCentury)
    .filter((c) => c.name && c.count > 0)
    .slice(0, CENTURY_LIMIT)
    .sort((a, b) => b.order - a.order);
}
