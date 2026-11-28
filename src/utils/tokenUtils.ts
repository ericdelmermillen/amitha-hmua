import { type EntityRow, type TokenDetails, type TokenPayload } from "@/typing/interfaces";
import { decodeJwt, jwtVerify, SignJWT } from "jose";
import { pool } from "@/db/dbClient";
import { parseDurationToSeconds } from "./utils";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRATION = process.env.JWT_ACCESS_TOKEN_EXPIRATION_INTERVAL ?? "15m";
const REFRESH_TOKEN_EXPIRATION = process.env.JWT_REFRESH_TOKEN_EXPIRATION_INTERVAL ?? "1d";

const accessTokenExpirationSeconds = parseDurationToSeconds(ACCESS_TOKEN_EXPIRATION, 15 * 60);
const refreshTokenExpirationSeconds = parseDurationToSeconds(REFRESH_TOKEN_EXPIRATION, 24 * 60 * 60);

// getJwtSecret
// guarding within the function so it doesn't throw on build when env vars aren't present
const getJwtSecret = (): Uint8Array => {
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be defined and at least 32 characters long.");
  }

  return new TextEncoder().encode(JWT_SECRET);
};

// getJwtRefreshSecret
// guarding within the function so it doesn't throw on build when env vars aren't present
const getJwtRefreshSecret = (): Uint8Array => {
  if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
    throw new Error("JWT_REFRESH_SECRET must be defined and at least 32 characters long.");
  }

  return new TextEncoder().encode(JWT_REFRESH_SECRET);
};

// generateAccessToken
// jti used to uniquely identify the token
const generateAccessToken = async (payload: TokenPayload): Promise<string> => {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
    .sign(getJwtSecret());
};

// generateRefreshToken
// jti used to uniquely identify the token
const generateRefreshToken = async (payload: TokenPayload): Promise<string> => {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRATION)
    .sign(getJwtRefreshSecret());
};

// verifyAccessToken
// specify algorithms array to prevent algorithm downgrade attacks
const verifyAccessToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ["HS256"] });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
};

// verifyRefreshToken
// specify algorithms array to prevent algorithm downgrade attacks
const verifyRefreshToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, getJwtRefreshSecret(), { algorithms: ["HS256"] });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
};

// extractTokenRevocationDetails
const extractTokenRevocationDetails = (token: string): TokenDetails | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const decoded = decodeJwt(token);

    if (!decoded.jti || !decoded.exp) {
      return null;
    }

    const expiresAt = new Date(decoded.exp * 1000);
    return { jti: decoded.jti, expiresAt };
  } catch {
    return null;
  }
};

// getTokenMaxAge
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
      "SELECT id FROM revoked_token WHERE jti = $1 LIMIT 1",
      [tokenDetails.jti]
    );

    return rows.length > 0;
  } catch (error) {
    console.error("Error checking token revocation:", error);
    return true;
  }
};

export {
  accessTokenExpirationSeconds,
  refreshTokenExpirationSeconds,
  getJwtSecret,
  getJwtRefreshSecret,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenRevocationDetails,
  getTokenMaxAge,
  cleanupExpiredTokens,
  revokeToken,
  isTokenRevoked,
};