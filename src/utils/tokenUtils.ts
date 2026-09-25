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

const JWT_SECRET_STRING = process.env.JWT_SECRET ?? "";
const JWT_REFRESH_SECRET_STRING = process.env.JWT_REFRESH_SECRET ?? "";
const ACCESS_TOKEN_EXPIRATION = process.env.JWT_ACCESS_TOKEN_EXPIRATION_INTERVAL ?? "15m";
const REFRESH_TOKEN_EXPIRATION = process.env.JWT_REFRESH_TOKEN_EXPIRATION_INTERVAL ?? "1d";

if (!JWT_SECRET_STRING || !JWT_REFRESH_SECRET_STRING) {
  throw new Error("Missing required JWT environment variables.");
}

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const JWT_REFRESH_SECRET = new TextEncoder().encode(JWT_REFRESH_SECRET_STRING);

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