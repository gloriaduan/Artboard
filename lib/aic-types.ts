export type AICArtwork = {
  id: number;
  title: string;
  artist_display: string;
  image_id: string | null;
  date_display: string;
  medium_display: string;
};

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
