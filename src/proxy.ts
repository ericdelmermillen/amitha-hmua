import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecret, getJwtRefreshSecret } from "./utils/tokenUtils";

// TextEncoder.prototype.encode() always returns a Uint8Array of UTF-8 encoded bytes: when passed `undefined`, JS coerces or treats it as empty input, returning `Uint8Array(0) []`.

const protectedRoutes = ["/bio/edit", "/shoot/add", "/shoot/edit"];

const verifyTokenEdge = async (token: string, secret: Uint8Array): Promise<boolean> => {
  try {
    await jwtVerify(token, secret, { algorithms: ["HS256"]});
    return true;
  } catch {
    return false;
  }
};

const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (accessToken) {
    const isAccessValid = await verifyTokenEdge(accessToken, getJwtSecret());

    if (isAccessValid) {
      return NextResponse.next();
    }
  }

  if (refreshToken) {
    const isRefreshValid = await verifyTokenEdge(refreshToken, getJwtRefreshSecret());

    if (isRefreshValid) {
      try {
        const refreshResponse = await fetch(new URL("/api/auth/refresh", request.url), {
          method: "POST",
          headers: {
            cookie: request.headers.get("cookie") ?? "",
          },
        });

        if (refreshResponse.ok) {
          const setCookies = refreshResponse.headers.getSetCookie();
          const requestHeaders = new Headers(request.headers);

          for (const cookieStr of setCookies) {
            const [nameValue, ...attributes] = cookieStr.split(";");
            const eqIndex = nameValue.indexOf("=");

            if (eqIndex !== -1) {
              const name = nameValue.slice(0, eqIndex).trim();
              const value = nameValue.slice(eqIndex + 1).trim();
              const isDeleted =
                value.length === 0 ||
                attributes.some(attr => attr.trim().toLowerCase() === "max-age=0");

              if (isDeleted) {
                request.cookies.delete(name);
              } else {
                request.cookies.set(name, value);
              }
            }
          }

          requestHeaders.set("cookie", request.cookies.toString());

          const response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });

          for (const cookieStr of setCookies) {
            response.headers.append("set-cookie", cookieStr);
          }

          return response;
        }
      } catch (error) {
        console.error("Middleware token refresh failed:", error);
      }
    }
  }

  // Tokens missing or invalid: redirect cleanly to /work
  const response = NextResponse.redirect(new URL("/work", request.url));

  response.cookies.set("auth_flash", "expired", {
    path: "/",
    maxAge: 10,       // Lives 10 seconds—just long enough for client hydration
    httpOnly: false,  // Must be accessible to document.cookie
    sameSite: "lax",
  });

  // Clear any invalid or expired session cookies immediately
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
};
// When upgrading from Next.js 15 to 16+, rename this file to `src/proxy.ts` and rename
// `middleware` -> `proxy` (Next.js 16+ runs proxy.ts on Node.js runtime by default).
// config object required to be exported inline
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default proxy;