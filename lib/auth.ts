import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { JWTPayload } from "@/types";

function getJwtSecret(): string {
  return process.env.JWT_SECRET || "default_jwt_secret_office_attendance_fallback_key_2026";
}

/**
 * Hash a password using bcrypt with 12 rounds
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token with 7 days expiry
 */
export function generateToken(userId: string, email: string, role: string): string {
  const payload: JWTPayload = { userId, email, role: role as JWTPayload["role"] };
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, getJwtSecret(), options);
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}
