import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { 
  type EntityRow, 
  type SessionResponse, 
  type TokenDetails, 
  type TokenPayload, 
} from "@/typing/interfaces";
import { decodeJwt, jwtVerify, SignJWT } from "jose";
import { pool } from "@/db/dbClient";

// AUDIT NOTE 1 (Module-Scope Env Guard & Length Check):
// Just like middleware.ts, evaluating `process.env.JWT_SECRET` at top-level module load time
// will throw during `next build` on AWS Amplify if runtime env vars aren't injected into the
// build container. Also missing the `length < 32` (256-bit minimum entropy) check.
// Fix: Move secret lookup + length validation into lazy getter functions (`getJwtSecret()`,
// `getJwtRefreshSecret()`) called inside the sign/verify helpers.
const JWT_SECRET_STRING = process.env.JWT_SECRET ?? "";
const JWT_REFRESH_SECRET_STRING = process.env.JWT_REFRESH_SECRET ?? "";
const ACCESS_TOKEN_EXPIRATION = process.env.JWT_ACCESS_TOKEN_EXPIRATION_INTERVAL ?? "15m";
const REFRESH_TOKEN_EXPIRATION = process.env.JWT_REFRESH_TOKEN_EXPIRATION_INTERVAL ?? "1d";

if (!JWT_SECRET_STRING || !JWT_REFRESH_SECRET_STRING) {
  throw new Error("Missing required JWT environment variables.");
}

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const JWT_REFRESH_SECRET = new TextEncoder().encode(JWT_REFRESH_SECRET_STRING);

// AUDIT NOTE 2 (Missing Unique Token ID / `jti`):
// Without a unique `jti` claim (`crypto.randomUUID()`), two tokens generated for the same
// `userId` within the exact same second produce identical `iat`/`exp` claims and therefore
// an identical JWT signature—causing collisions in `revoked_token(token_signature)` during
// rapid rotation or concurrent requests.
const generateAccessToken = async (payload: TokenPayload): Promise<string> => {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
    .sign(JWT_SECRET);
};

const generateRefreshToken = async (payload: TokenPayload): Promise<string> => {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRATION)
    .sign(JWT_REFRESH_SECRET);
};

// AUDIT NOTE 3 (Algorithm Pinning):
// Pass `{ algorithms: ["HS256"] }` as the 3rd argument to `jwtVerify` in both functions below.
const verifyAccessToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
};

const verifyRefreshToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
};

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

// AUDIT NOTE 5 (Storing Raw JWT Signature vs. SHA-256 Hash):
// Storing the raw JWT signature in `revoked_token` means anyone with read access to DB backups
// or logs sees valid signature material. Hashing the token/jti with SHA-256 before storing
// (or storing the `jti` UUID) is cleaner, fixed-length, and avoids storing raw token parts.
const extractTokenRevocationDetails = (token: string): TokenDetails | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const signature = parts[2];
    const decoded = decodeJwt(token);

    if (!decoded.exp) {
      return null;
    }

    const expiresAt = new Date(decoded.exp * 1000);
    return { signature, expiresAt };
  } catch {
    return null;
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
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setAuthCookies,
  verifyAndRefreshSession,
  extractTokenRevocationDetails,
  revokeToken,
  isTokenRevoked,
};