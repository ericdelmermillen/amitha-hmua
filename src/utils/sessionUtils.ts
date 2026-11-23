import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type EntityRow, type SessionResponse } from "@/typing/interfaces";
import { decodeJwt } from "jose";
import { pool } from "@/db/dbClient";
import { 
  extractTokenRevocationDetails, 
  verifyAccessToken, 
} from "./tokenUtils";


const getTokenMaxAge = (token: string, fallbackSeconds: number): number => {
  try {
    const { exp } = decodeJwt(token);
    if (!exp) {
      return fallbackSeconds;
    }

    const remainingSeconds = exp - Math.floor(Date.now() / 1000);
    return remainingSeconds > 0 ? remainingSeconds : 0;
  } catch {
    return fallbackSeconds;
  }
};


// setAuthCookies
// sameSite: "lax" so cookies persist on top-level external navigations (e.g., links/bookmarks) while still blocking cross-site POST/subrequest CSRF; derives maxAge from JWT exp to stay in sync with token expiration.
const setAuthCookies = async (accessToken: string, refreshToken: string): Promise<void> => {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: getTokenMaxAge(accessToken, 15 * 60),
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: getTokenMaxAge(refreshToken, 24 * 60 * 60),
    path: "/",
  });
};


// cleanupExpiredTokens
const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    await pool.query(
      "DELETE FROM revoked_token WHERE expires_at < CURRENT_TIMESTAMP"
    );
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
  }
};

// revokeToken
const revokeToken = async (token: string): Promise<void> => {
  const tokenDetails = extractTokenRevocationDetails(token);

  if (!tokenDetails) {
    return;
  }

  const { jti, expiresAt } = tokenDetails;

  try {
    await pool.query(
      "INSERT INTO revoked_token (jti, expires_at) VALUES ($1, $2) ON CONFLICT (jti) DO UPDATE SET expires_at = EXCLUDED.expires_at",
      [jti, expiresAt]
    );

    if (Math.random() < 0.1) {
      void cleanupExpiredTokens();
    }
  } catch (error) {
    console.error("Error revoking token:", error);
  }
};

// isTokenRevoked
const isTokenRevoked = async (token: string): Promise<boolean> => {
  const tokenDetails = extractTokenRevocationDetails(token);

  if (!tokenDetails) {
    return true;
  }

  try {
    const { rows } = await pool.query<EntityRow>(
      // *** change to jti afer db refactor
      "SELECT id FROM revoked_token WHERE jti = $1 LIMIT 1",
      [tokenDetails.jti]
    );

    return rows.length > 0;
  } catch (error) {
    console.error("Error checking token revocation:", error);
    return true;
  }
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
  cleanupExpiredTokens,
  getTokenMaxAge,
  isTokenRevoked,
  revokeToken,
  setAuthCookies,
  verifySession
};

