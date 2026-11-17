import { NextResponse, type NextRequest } from "next/server";

/**
 * Quick gate for the operator area: anyone without a session cookie is sent to the sign-in page.
 * This only checks that the cookie is present. The real check (signature, expiry, active account)
 * runs in src/lib/desk/session.ts on every page and every server action.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === "/operators/sign-in" || req.cookies.has("phronem_operator")) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/operators/sign-in";
  url.search = pathname === "/operators" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/operators", "/operators/:path*"] };
