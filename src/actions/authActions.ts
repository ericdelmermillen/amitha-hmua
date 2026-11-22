"use server";

import { cookies } from "next/headers";
import { 
  type AuthCredentials, 
  type AuthResponse, 
  type EntityRow,
  type SessionResponse, 
  type UserRow
} from "@/typing/interfaces";
import { authSchema } from "@/validation/authValidation";
import { 
  generateAccessToken, 
  generateRefreshToken, 
  isTokenRevoked, 
  revokeToken, 
  setAuthCookies, 
  verifyAccessToken, 
  verifyRefreshToken 
} from "@/utils/tokenUtils";
import { pool } from "@/db/dbClient";
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
    // AUDIT NOTE 1 (Bcrypt Cost Factor): 10 rounds is minimum; 12 rounds is the modern industry standard baseline (~250ms) to resist brute-force attacks without hurting login UX.
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

    // AUDIT NOTE 2 (Timing Attack / User Enumeration): Returning early when `rows.length === 0` skips bcrypt (~2ms response vs ~60-100ms when user exists), leaking whether an email is registered via timing analysis. Standard practice: run `await bcrypt.compare(cleanPassword, DUMMY_BCRYPT_HASH)` before returning `"Invalid email or password"` so response times stay constant.

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
// AUDIT NOTE 3 (Server Action Misuse & Cookie Mutation Constraint): Server Actions ("use server") compile to HTTP POST endpoints—calling this on client mount triggers an uncached POST request on every page load. Furthermore, because it calls `setAuthCookies`, it CANNOT be used inside Server Components or Layouts (Next.js throws if cookies are mutated during RSC rendering).
// Standard split: - Read-only `getSession()` / `verifySession()` in a Data Access Layer (`dal.ts`) for RSCs & Actions; - Cookie-mutating token rotation inside `middleware.ts` (`proxy.ts`) or a `/api/auth/refresh` Route Handler.
const checkUserSession = async (): Promise<SessionResponse> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (accessToken) {
    // AUDIT NOTE 4 (Unnecessary DB Blacklist Lookup on Short-Lived Access Token):
    // Querying `isTokenRevoked(accessToken)` on every session check hits PostgreSQL for every
    // request, defeating the purpose of stateless JWTs. Keep `accessToken` short-lived (5-15 min)
    // and stateless (verify JWT signature/exp only), reserving DB revocation checks for `refreshToken`.
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
        // AUDIT NOTE 5 (Missing Refresh Token Revocation on Rotation - CRITICAL):
        // A new refreshToken is issued here, but `await revokeToken(refreshToken)` is NEVER called
        // on the old token! The old refreshToken stays valid until its `exp` timestamp, allowing
        // replay attacks if stolen and breaking single-use rotation / reuse detection.
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

// logoutUser
const logoutUser = async (message = ""): Promise<AuthResponse> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // See AUDIT NOTE 4: if accessToken is purely stateless (5-15 min TTL), only refreshToken needs DB revocation on logout while both cookies are deleted from the browser.
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
  logoutUser
};