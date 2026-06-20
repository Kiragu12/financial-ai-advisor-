import bcrypt from 'bcryptjs';

/**
 * Password hashing — the only place in the codebase that knows about bcrypt.
 * If we ever switch algorithms (argon2, etc.) this is the single file to change.
 */

// Work factor. Higher = slower = harder to brute-force. 12 is a sensible 2025 default.
const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
