// Source-neutral artwork types. Currently backed by the Harvard Art Museums API
// (https://api.harvardartmuseums.org), but the UI only depends on this shape so the
// data source can change without touching components.

export type ArtworkThumbnail = {
  width: number;
  height: number;
  alt?: string;
};

export type Artwork = {
  id: number;
  title: string;
  artist: string;
  date: string;
  medium: string;
  // The provider's resolvable image base URL (Harvard's nrs.harvard.edu resolver,
  // which accepts ?width= / ?height= sizing). Null when the record has no usable image.
  imageBase: string | null;
  thumbnail?: ArtworkThumbnail | null;
};

export type ArtworkDetail = Artwork & {
  description: string | null;
  dimensions: string;
  culture: string;
  creditLine: string;
};

export type ArtworkResponse = {
  data: Artwork[];
  pagination: {
    total: number;
    total_pages: number;
    current_page: number;
  };
};

// A time period option for the gallery filter. Backed by Harvard's `/century`
// resource; `order` is Harvard's `temporalorder` (used to sort chronologically).
export type Century = {
  id: number;
  name: string;
  count: number;
  order: number;
};

// Build a sized image URL. Harvard's resolver (`...nrs.harvard.edu/...`) 303-redirects
// to its IIIF host and honors a `width`/`height` query param, so we just append one.
export function imageUrl(imageBase: string, width = 400): string {
  const sep = imageBase.includes("?") ? "&" : "?";
  return `${imageBase}${sep}width=${width}`;
}

// ---- Harvard API response shapes (only the fields we read) ----

type HarvardImage = {
  baseimageurl?: string | null;
  width?: number | null;
  height?: number | null;
  alttext?: string | null;
  displayorder?: number | null;
};

type HarvardPerson = {
  name?: string | null;
  displayname?: string | null;
  role?: string | null;
  displayorder?: number | null;
};

export type HarvardRecord = {
  objectid?: number;
  id?: number;
  title?: string | null;
  people?: HarvardPerson[] | null;
  dated?: string | null;
  medium?: string | null;
  culture?: string | null;
  classification?: string | null;
  description?: string | null;
  dimensions?: string | null;
  creditline?: string | null;
  primaryimageurl?: string | null;
  images?: HarvardImage[] | null;
};

export type HarvardResponse = {
  info: {
    totalrecords: number;
    pages: number;
    page: number;
  };
  records: HarvardRecord[];
};

// A record from Harvard's `/century` resource (only the fields we read).
export type HarvardCentury = {
  id?: number;
  name?: string | null;
  objectcount?: number | null;
  temporalorder?: number | null;
};

export type HarvardCenturyResponse = {
  info: {
    totalrecords: number;
    pages: number;
    page: number;
  };
  records: HarvardCentury[];
};

// Pick the artist display name: prefer the person whose role is "Artist", else the
// first listed person.
function pickArtist(people: HarvardPerson[] | null | undefined): string {
  if (!people || people.length === 0) return "";
  const artist =
    people.find((p) => p.role?.toLowerCase() === "artist") ?? people[0];
  return artist.name ?? artist.displayname ?? "";
}

// Pick the primary image (lowest displayorder, falling back to first) and return its
// base URL plus dimensions for the masonry aspect ratio.
function pickImage(rec: HarvardRecord): {
  imageBase: string | null;
  thumbnail: ArtworkThumbnail | null;
} {
  const images = (rec.images ?? []).filter((i) => i.baseimageurl);
  if (images.length === 0) {
    // Fall back to the record-level primary image URL if present.
    return { imageBase: rec.primaryimageurl || null, thumbnail: null };
  }
  const primary = [...images].sort(
    (a, b) => (a.displayorder ?? 99) - (b.displayorder ?? 99),
  )[0];
  const thumbnail =
    primary.width && primary.height
      ? {
          width: primary.width,
          height: primary.height,
          alt: primary.alttext ?? undefined,
        }
      : null;
  return { imageBase: primary.baseimageurl ?? null, thumbnail };
}

export function normalizeArtwork(rec: HarvardRecord): Artwork {
  const { imageBase, thumbnail } = pickImage(rec);
  return {
    id: rec.objectid ?? rec.id ?? 0,
    title: rec.title ?? "Untitled",
    artist: pickArtist(rec.people),
    date: rec.dated ?? "",
    medium: rec.medium ?? "",
    imageBase,
    thumbnail,
  };
}

export function normalizeArtworkDetail(rec: HarvardRecord): ArtworkDetail {
  return {
    ...normalizeArtwork(rec),
    description: rec.description ?? null,
    dimensions: rec.dimensions ?? "",
    culture: rec.culture ?? "",
    creditLine: rec.creditline ?? "",
  };
}

export function normalizeCentury(rec: HarvardCentury): Century {
  return {
    id: rec.id ?? 0,
    name: rec.name ?? "",
    count: rec.objectcount ?? 0,
    order: rec.temporalorder ?? 0,
  };
}
