import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET ?? "");

const protectedRoutes = ["/bio/edit", "/shoot/add", "/shoot/edit"];

// helper function to check access or refresh tokens, returning a boolean
const verifyTokenEdge = async (token: string, secret: Uint8Array): Promise<boolean> => {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
};

const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

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

const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export { config };
export default middleware;