import { cookies } from "next/headers";
import { TokenPayload } from "@/typing/interfaces";
import jwt, { type SignOptions, type Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "";
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET ?? "";
const TOKEN_EXPIRATION_INTERVAL = (process.env.JWT_TOKEN_EXPIRATION_INTERVAL ?? "15m") as SignOptions["expiresIn"];
const REFRESH_TOKEN_EXPIRATION_INTERVAL = (process.env.JWT_REFRESH_TOKEN_EXPIRATION_INTERVAL ?? "7d") as SignOptions["expiresIn"];

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("Missing required JWT environment variables.");
}

const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION_INTERVAL,
  });
};

const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION_INTERVAL,
  });
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
    maxAge: 15 * 60, // 15 minutes in seconds
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
  });
};

export {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies
};