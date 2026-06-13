import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { builderSlug } = await params;

  // Resolve target URL pointing to standard builders plural profile page
  const targetUrl = new URL(`/builders/${builderSlug}`, request.url);

  // Preserve any watchlistId or search parameters present in request URL
  const { searchParams } = new URL(request.url);
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(targetUrl, 301); // 301 Moved Permanently
}
