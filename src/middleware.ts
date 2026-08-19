import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/bio/edit", "/shoot/add"];

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET ?? "");

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

  const isProtected = protectedRoutes.some((route) => {
    return pathname.startsWith(route);
  });

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

  const redirectUrl = new URL("/work", request.url);
  redirectUrl.searchParams.set("auth", "false");

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default middleware;