import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type SessionResponse } from "@/typing/interfaces";
import {
  accessTokenExpirationSeconds,
  getTokenMaxAge,
  isTokenRevoked,
  refreshTokenExpirationSeconds,
  revokeToken,
  verifyAccessToken,
} from "./tokenUtils";

const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV === "production";

// setAuthCookies
// sameSite: "lax" so cookies persist on top-level external navigations (e.g., links/bookmarks) while still blocking cross-site POST/subrequest CSRF; derives maxAge from JWT exp to stay in sync with token expiration.
const setAuthCookies = async (accessToken: string, refreshToken: string): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: getTokenMaxAge(accessToken, accessTokenExpirationSeconds),
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: getTokenMaxAge(refreshToken, refreshTokenExpirationSeconds),
    path: "/",
  });
};

// verifySession
const verifySession = async (): Promise<SessionResponse> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);

    if (payload) {
      const isRevoked = await isTokenRevoked(accessToken);

      if (!isRevoked) {
        return {
          isAuthenticated: true,
          userId: payload.userId,
        };
      }
    }

    await revokeToken(accessToken);
    cookieStore.delete("accessToken");
  }

  if (refreshToken) {
    await revokeToken(refreshToken);
    cookieStore.delete("refreshToken");
  }

  cookieStore.set("auth_flash", "expired", {
    path: "/",
    maxAge: 10,
    httpOnly: false,
    sameSite: "lax",
  });

  redirect("/work");
};

export {
  setAuthCookies,
  verifySession,
};