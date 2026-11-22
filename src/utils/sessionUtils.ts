import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { pool } from "@/db/dbClient";
import { extractTokenRevocationDetails, generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "./tokenUtils";
import { EntityRow, SessionResponse } from "@/typing/interfaces";


// --- move to sessionUtils
  // setAuthCookies (updated with aligned maxAge and sameSite: "lax")
  // cleanupExpiredTokens
  // revokeToken
  // isTokenRevoked
  // // Session verification / rotation logic (replacing verifyAndRefreshSession with a clean split between read-only getSession/verifySession and cookie-mutating rotation)


// AUDIT NOTE 4 (Cookie `maxAge` Mismatch & `sameSite: "strict"` UX Trap):
// 1. `REFRESH_TOKEN_EXPIRATION` defaults to `"1d"` (86,400s) above, while `maxAge` here is
//    hardcoded to `7 * 24 * 60 * 60` (7 days). Cookie `maxAge` should be derived from the
//    same config constant so browser retention and JWT `exp` never drift out of sync.
// 2. `sameSite: "strict"` strips auth cookies whenever a user clicks an external link into
//    your site (e.g., from email, social media, or bookmarks), making them appear logged out
//    on initial arrival. Industry standard for session cookies is `sameSite: "lax"`.
const setAuthCookies = async (accessToken: string, refreshToken: string): Promise<void> => {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 15 * 60,
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
};

const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    await pool.query(
      "DELETE FROM revoked_token WHERE expires_at < CURRENT_TIMESTAMP"
    );
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
  }
};

const revokeToken = async (token: string): Promise<void> => {
  const tokenDetails = extractTokenRevocationDetails(token);

  if (!tokenDetails) {
    return;
  }

  const { signature, expiresAt } = tokenDetails;

  try {
    await pool.query(
      "INSERT INTO revoked_token (token_signature, expires_at) VALUES ($1, $2) ON CONFLICT (token_signature) DO UPDATE SET expires_at = EXCLUDED.expires_at",
      [signature, expiresAt]
    );

    if (Math.random() < 0.1) {
      void cleanupExpiredTokens();
    }
  } catch (error) {
    console.error("Error revoking token:", error);
  }
};

const isTokenRevoked = async (token: string): Promise<boolean> => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return true;
  }

  const signature = parts[2];

  try {
    const { rows } = await pool.query<EntityRow>(
      "SELECT id FROM revoked_token WHERE token_signature = $1 LIMIT 1",
      [signature]
    );

    return rows.length > 0;
  } catch (error) {
    console.error("Error checking token revocation:", error);
    return true;
  }
};


// AUDIT NOTE 6 (Duplicate Logic + Missing Rotation Revocation + RSC Mutation Trap):
// 1. This duplicates `checkUserSession` in `authActions.ts`, with the same bug: it generates
//    `newRefreshToken` without calling `await revokeToken(refreshToken)` on the old one.
// 2. If called from a Server Component (`page.tsx` / `layout.tsx`), `setAuthCookies` and
//    `cookieStore.delete(...)` will throw a Next.js runtime error because RSCs cannot modify
//    cookies.
// 3. Also misses setting the `auth_flash` cookie that `middleware.ts` sets on redirect,
//    creating inconsistent UX depending on which layer caught the expired session.
const verifyAndRefreshSession = async (): Promise<SessionResponse> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (accessToken) {
    const isRevoked = await isTokenRevoked(accessToken);

    if (!isRevoked) {
      const payload = await verifyAccessToken(accessToken);

      if (payload) {
        return {
          isAuthenticated: true,
          userId: payload.userId,
        };
      }
    }
  }

  if (refreshToken) {
    const isRevoked = await isTokenRevoked(refreshToken);

    if (!isRevoked) {
      const refreshPayload = await verifyRefreshToken(refreshToken);

      if (refreshPayload) {
        const newAccessToken = await generateAccessToken({ userId: refreshPayload.userId });
        const newRefreshToken = await generateRefreshToken({ userId: refreshPayload.userId });

        await setAuthCookies(newAccessToken, newRefreshToken);

        return {
          isAuthenticated: true,
          userId: refreshPayload.userId,
        };
      }
    }
  }

  if (accessToken) {
    await revokeToken(accessToken);
    cookieStore.delete("accessToken");
  }

  if (refreshToken) {
    await revokeToken(refreshToken);
    cookieStore.delete("refreshToken");
  }

  redirect("/work?auth=false");
};


export {
  setAuthCookies,
  cleanupExpiredTokens,
  revokeToken,
  isTokenRevoked,
  verifyAndRefreshSession,
};

