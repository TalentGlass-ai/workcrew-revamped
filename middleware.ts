import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/assessments",
  "/billing",
  "/dashboard",
  "/profile",
  "/applications",
  "/api/assessment",
  "/api/billing",
  "/api/assessments",
];

// API routes that have their own auth check — skip middleware to avoid double lookup
const API_SELF_AUTH = [
  "/api/auth",
  "/api/contact",
  "/api/jobs",
  "/api/categories",
  "/api/companies",
  "/api/candidates/recommended",
  "/api/jobs/recommendations",
  "/api/og",
  "/api/health",
  "/api/webhooks",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isSelfAuth(pathname: string): boolean {
  return API_SELF_AUTH.some((p) => pathname.startsWith(p));
}

export default auth(function middleware(req: NextRequest & { auth: any }) {
  const { pathname } = req.nextUrl;

  if (!isProtected(pathname) || isSelfAuth(pathname)) {
    return NextResponse.next();
  }

  if (!req.auth) {
    // API: return 401; pages: redirect to login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next.js internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|images|icons|fonts).*)",
  ],
};
