import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { TokenPayload, SessionResponse } from "@/typing/interfaces";

const JWT_SECRET_STRING = process.env.JWT_SECRET ?? "";
const JWT_REFRESH_SECRET_STRING = process.env.JWT_REFRESH_SECRET ?? "";
const ACCESS_TOKEN_EXPIRATION = process.env.JWT_ACCESS_TOKEN_EXPIRATION_INTERVAL ?? "15m";
const REFRESH_TOKEN_EXPIRATION = process.env.JWT_REFRESH_TOKEN_EXPIRATION_INTERVAL ?? "7d";

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

const setAuthCookies = async (
  accessToken: string,
  refreshToken: string
): Promise<void> => {
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

const verifyAndRefreshSession = async (): Promise<SessionResponse> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) {
      return {
        isAuthenticated: true,
        userId: payload.userId,
      };
    }
  }

  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
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

  return {
    isAuthenticated: false,
  };
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setAuthCookies,
  verifyAndRefreshSession
};