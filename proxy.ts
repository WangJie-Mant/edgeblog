import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isStaticPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/CarouselPhotos") ||
    pathname.startsWith("/tutorials") ||
    pathname.startsWith("/favicon")
  );
}

export const runtime = "edge";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase() || "";
  if (!host.startsWith("dashboard.n4gasaki.icu")) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api") || isStaticPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/upblog") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/upblog";
  url.search = "";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/:path*"],
};
