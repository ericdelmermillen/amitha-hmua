import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// AUDIT NOTE 1 (Secret Guarding - CRITICAL):
// guarding prevents a 0-byte key, which would otherwise allow anyone to forge valid JWTs signed with an empty string "".
// Note on Next.js Edge/Amplify: Ensure JWT_SECRET and JWT_REFRESH_SECRET are exposed to the Edge runtime at build/deploy time, and fail closed if missing or < 32 chars (256 bits).
// if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
//   throw new Error("FATAL: JWT_SECRET must be defined in environment and at least 32 characters long.");
// }

// if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
//   throw new Error("FATAL: JWT_REFRESH_SECRET must be defined in environment and at least 32 characters long.");
// }

// AUDIT NOTE 2 (TextEncoder Behavior): TextEncoder.prototype.encode() always returns a Uint8Array of UTF-8 encoded bytes.
// When passed `undefined`, JS coerces or treats it as empty input, returning `Uint8Array(0) []`.
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);


// AUDIT NOTE 4 (Route Prefix Matching): keep the route strings WITHOUT a trailing slash here (otherwise`/bio/edit/` would fail to match `/bio/edit`), and enforce the boundary in `.some()` below via `pathname === route || pathname.startsWith(`${route}/`)` so `/bio/editor` won't false-match.
const protectedRoutes = ["/bio/edit", "/shoot/add", "/shoot/edit"];

// helper function to check access or refresh tokens, returning a boolean
const verifyTokenEdge = async (token: string, secret: Uint8Array): Promise<boolean> => {
  // AUDIT NOTE 5 (Algorithm Pinning): Pass `{ algorithms: ["HS256"] }` as the 3rd argument to jwtVerify to explicitly pin the expected signing algorithm and prevent algorithm-confusion/downgrade edge cases.
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
};

const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // See AUDIT NOTE 4: update to `pathname === route || pathname.startsWith(`${route}/`)`
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (accessToken) {
    const isAccessValid = await verifyTokenEdge(accessToken, JWT_SECRET);
    if (isAccessValid) {
      return NextResponse.next();
    }
  }

  // AUDIT NOTE 6 (Incomplete Silent Refresh & Missing Revocation Check): if accessToken is expired/missing and refreshToken has a valid JWT signature, this simply calls NextResponse.next() WITHOUT:
  //   1. Issuing a new accessToken cookie (so downstream Server Components/Actions still see an expired accessToken),
  //   2. Rotating the refreshToken (breaking true sliding-window expiration & reuse detection), or
  //   3. Checking the DB to ensure the refreshToken wasn't revoked on logout.
  if (refreshToken) {
    const isRefreshValid = await verifyTokenEdge(refreshToken, JWT_REFRESH_SECRET);
    if (isRefreshValid) {
      return NextResponse.next();
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

// AUDIT NOTE 7 (Next.js 16+ Future-Proofing): When upgrading from Next.js 15 to 16+, rename this file to `src/proxy.ts` and rename
// `middleware` -> `proxy` (Next.js 16+ runs proxy.ts on Node.js runtime by default).
// config object required to be exported inline
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default middleware;



// getters
// const getJwtSecret = (): Uint8Array => {
//   const secret = process.env.JWT_SECRET;
//   if (!secret || secret.length < 32) {
//     throw new Error("FATAL: JWT_SECRET must be defined and at least 32 characters long.");
//   }
//   return new TextEncoder().encode(secret);
// };

// const getJwtRefreshSecret = (): Uint8Array => {
//   const secret = process.env.JWT_REFRESH_SECRET;
//   if (!secret || secret.length < 32) {
//     throw new Error("FATAL: JWT_REFRESH_SECRET must be defined and at least 32 characters long.");
//   }
//   return new TextEncoder().encode(secret);
// };