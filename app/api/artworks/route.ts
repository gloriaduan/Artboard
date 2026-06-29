import { fetchArtworks } from "@/lib/museum";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const query = searchParams.get("q") ?? undefined;

  try {
    const result = await fetchArtworks(page, limit, query);
    return NextResponse.json(result);
  } catch (err) {
    console.error("AIC fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch artworks" }, { status: 502 });
  }
}
