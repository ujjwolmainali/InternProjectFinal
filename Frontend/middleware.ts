import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value; // <-- important

  const { pathname } = req.nextUrl;

  // Protect /cp/*
  if (pathname.startsWith("/cp") && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cp/:path*"],
};
