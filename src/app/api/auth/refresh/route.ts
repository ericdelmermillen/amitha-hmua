import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/utils/tokenUtils";
import {
  isTokenRevoked,
  revokeToken,
  setAuthCookies,
} from "@/utils/sessionUtils";

const handleTokenRefresh = async (): Promise<NextResponse> => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }

  const refreshPayload = await verifyRefreshToken(refreshToken);

  if (!refreshPayload) {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }

  const isRevoked = await isTokenRevoked(refreshToken);

  if (isRevoked) {
    console.warn(`Security alert: Revoked refresh token replay attempt for userId=${refreshPayload.userId}`);
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }

  await revokeToken(refreshToken);

  const newAccessToken = await generateAccessToken({ userId: refreshPayload.userId });
  const newRefreshToken = await generateRefreshToken({ userId: refreshPayload.userId });

  await setAuthCookies(newAccessToken, newRefreshToken);

  return NextResponse.json({ isAuthenticated: true, userId: refreshPayload.userId });
};

export { handleTokenRefresh as POST };