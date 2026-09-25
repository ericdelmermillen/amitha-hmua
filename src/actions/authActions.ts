"use server";

import { cookies } from "next/headers";
import { 
  type AuthCredentials, 
  type AuthResponse, 
  type SessionResponse, 
  type UserRow, 
  type EntityRow 
} from "@/typing/interfaces";
import { authSchema } from "@/validation/authValidation";
import { 
  extractTokenRevocationDetails,
  generateAccessToken, 
  generateRefreshToken, 
  isTokenRevoked, 
  setAuthCookies, 
  verifyAccessToken, 
  verifyRefreshToken 
} from "@/utils/tokenUtils";
import { pool } from "@/db/dbClient_pg";
import bcrypt from "bcrypt";

// createUser
const createUser = async ({ email, password }: AuthCredentials): Promise<AuthResponse> => {
  const result = authSchema.safeParse({ email, password });

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { email: cleanEmail, password: cleanPassword } = result.data;

  try {
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    const { rows: inserted } = await pool.query<EntityRow>(
      "INSERT INTO users (email, password) VALUES ($1, $2) ON CONFLICT (LOWER(email)) DO NOTHING RETURNING id",
      [cleanEmail, hashedPassword]
    );

    if (inserted.length === 0) {
      return {
        success: false,
        message: "User with that email already exists",
      };
    }

    return {
      success: true,
      message: "User created successfully",
      userId: inserted[0].id,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: "Failed to create user",
    };
  }
};

// loginUser
const loginUser = async ({ email, password }: AuthCredentials): Promise<AuthResponse> => {
  const result = authSchema.safeParse({ email, password });

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { email: cleanEmail, password: cleanPassword } = result.data;

  try {
    const { rows } = await pool.query<UserRow>(
      "SELECT id, email, password FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [cleanEmail]
    );

    if (rows.length === 0) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(cleanPassword, user.password);

    if (!passwordMatch) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    const accessToken = await generateAccessToken({ userId: user.id });
    const refreshToken = await generateRefreshToken({ userId: user.id });

    await setAuthCookies(accessToken, refreshToken);

    return {
      success: true,
      message: "Logged in successfully",
      userId: user.id,
    };
  } catch (error) {
    console.error("Error logging in:", error);
    return {
      success: false,
      message: "An unexpected error occurred during login",
    };
  }
};

// checkUserSession
const checkUserSession = async (): Promise<SessionResponse> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

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

  const refreshToken = cookieStore.get("refreshToken")?.value;

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

  return {
    isAuthenticated: false,
  };
};

// revokeToken
// add probalbistist clean up here
const revokeToken = async (token: string): Promise<void> => {
  const tokenDetails = extractTokenRevocationDetails(token);

  if (!tokenDetails) {
    return;
  }

  const { signature, expiresAt } = tokenDetails;

  const query = `
    INSERT INTO revoked_token (token_signature, expires_at)
    VALUES ($1, $2)
    ON CONFLICT (token_signature) DO UPDATE SET expires_at = EXCLUDED.expires_at
  `;

  await pool.query(query, [signature, expiresAt]);
};

// logoutUser
const logoutUser = async (message = ""): Promise<AuthResponse> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (accessToken) {
      await revokeToken(accessToken);
      cookieStore.delete("accessToken");
    }

    if (refreshToken) {
      await revokeToken(refreshToken);
      cookieStore.delete("refreshToken");
    }

    return {
      success: true,
      message: message || "Logged out successfully",
    };
  } catch (error) {
    console.error("Error logging out:", error);
    return {
      success: false,
      message: "Failed to log out",
    };
  }
};

export {
  createUser,
  loginUser,
  checkUserSession,
  revokeToken,
  logoutUser
};