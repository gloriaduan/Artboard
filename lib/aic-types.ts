export type AICArtwork = {
  id: number;
  title: string;
  artist_display: string;
  image_id: string | null;
  date_display: string;
  medium_display: string;
  is_boosted?: boolean;
  is_on_view?: boolean;
};

export type AICArtworkDetail = AICArtwork & {
  description: string | null; // HTML; may be null
  medium_display: string;
  dimensions: string;
  place_of_origin: string;
  credit_line: string;
};

export type AICArtworkResponse = { data: AICArtworkDetail };

export type AICResponse = {
  data: AICArtwork[];
  pagination: {
    total: number;
    total_pages: number;
    current_page: number;
  };
};

export function aicImageUrl(imageId: string, width = 400): string {
  return `https://www.artic.edu/iiif/2/${imageId}/full/${width},/0/default.jpg`;
}
