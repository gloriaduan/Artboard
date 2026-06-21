import { fetchArtwork } from "@/lib/aic";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<"/api/artworks/[id]">,
) {
  const { id } = await params;

  try {
    const result = await fetchArtwork(Number(id));
    return NextResponse.json(result);
  } catch (err) {
    console.error("AIC detail fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch artwork" }, { status: 502 });
  }
}
