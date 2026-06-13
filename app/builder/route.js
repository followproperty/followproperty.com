import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  // Redirect to standard builders directory page
  const targetUrl = new URL("/builders", request.url);

  // Preserve any query parameters present in request URL
  const { searchParams } = new URL(request.url);
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(targetUrl, 301); // 301 Moved Permanently
}
