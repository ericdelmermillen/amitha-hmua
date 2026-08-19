"use server";

import { cookies } from "next/headers";
import type { AuthCredentials, AuthResponse, SessionResponse, UserRow } from "@/typing/interfaces";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { authSchema } from "@/validation/authValidation";
import { 
  generateAccessToken, 
  generateRefreshToken, 
  setAuthCookies, 
  verifyAccessToken, 
  verifyRefreshToken 
} from "@/utils/tokenUtils";
import { pool } from "@/db/dbClient";
import bcrypt from "bcrypt";

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
    const [ existingRows ] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (existingRows.length > 0) {
      return {
        success: false,
        message: "User with that email already exists",
      };
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    const [ insertResult ] = await pool.query<ResultSetHeader>(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [cleanEmail, hashedPassword]
    );

    return {
      success: true,
      message: "User created successfully",
      userId: insertResult.insertId,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: "Failed to create user",
    };
  }
};

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
    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, email, password FROM users WHERE email = ? LIMIT 1",
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

const checkUserSession = async (): Promise<SessionResponse> => {
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

const refreshToken = () => {
  console.log("Refreshing your token...");
};

const logout = () => {
  console.log("Logging you out...");
};

export {
  createUser,
  loginUser,
  checkUserSession,
  refreshToken,
  logout
};