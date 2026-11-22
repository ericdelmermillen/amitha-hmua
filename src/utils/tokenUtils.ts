import { type TokenDetails, type TokenPayload } from "@/typing/interfaces";
import { decodeJwt, jwtVerify, SignJWT } from "jose";

const ACCESS_TOKEN_EXPIRATION = process.env.JWT_ACCESS_TOKEN_EXPIRATION_INTERVAL ?? "15m";
const REFRESH_TOKEN_EXPIRATION = process.env.JWT_REFRESH_TOKEN_EXPIRATION_INTERVAL ?? "1d";

// getJwtSecret
// guarding within the function so it doesn't throw on build when env vars aren't present
const getJwtSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be defined and at least 32 characters long.");
  }

  return new TextEncoder().encode(secret);
};

// getJwtRefreshSecret
// guarding within the function so it doesn't throw on build when env vars aren't present
const getJwtRefreshSecret = (): Uint8Array => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_REFRESH_SECRET must be defined and at least 32 characters long.");
  }

  return new TextEncoder().encode(secret);
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
    // should get JWT_SECRET via getter to avoid build time issue
    const { payload } = await jwtVerify(token, getJwtSecret(), {algorithms: ["HS256"]});
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
};

// verifyRefreshToken
// specify algorithms array to prevent algorithm downgrade attacks
const verifyRefreshToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    // should get JWT_REFRESH_SECRET via getter to avoid build time issue
    const { payload } = await jwtVerify(token, getJwtRefreshSecret(), {algorithms: ["HS256"]});
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
  
export {
  getJwtSecret,
  getJwtRefreshSecret,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenRevocationDetails
};