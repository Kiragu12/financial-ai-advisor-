import { AppError } from '../../shared/app-error.js';
import { hashPassword, verifyPassword } from '../../shared/password.js';
import { signToken } from '../../shared/jwt.js';
import * as usersRepo from '../users/users.repository.js';
import { toPublicUser, type UserRecord, type PublicUser } from '../users/users.types.js';
import type { RegisterInput, LoginInput } from './auth.schemas.js';
import type { AuthResult } from './auth.types.js';

/**
 * Auth business rules. This layer owns *what* should happen on register/login;
 * it knows nothing about HTTP (no req/res). It coordinates the users
 * repository, password hashing and token signing.
 */

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await usersRepo.findByEmail(input.email);
  if (existing) {
    throw AppError.conflict('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await usersRepo.createUser({
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    preferredCurrency: input.preferredCurrency ?? 'KES',
  });

  return buildResult(user);
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await usersRepo.findByEmail(input.email);

  // Use the same message whether the email or the password is wrong, so we
  // don't leak which emails have accounts.
  if (!user) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  const passwordOk = await verifyPassword(input.password, user.password_hash);
  if (!passwordOk) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  return buildResult(user);
}

/** Resolve the current user from a verified token's id (used by GET /me). */
export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await usersRepo.findById(userId);
  if (!user) {
    // Token was valid but the account is gone — treat as unauthenticated.
    throw AppError.unauthorized('Your account no longer exists.');
  }
  return toPublicUser(user);
}

function buildResult(user: UserRecord): AuthResult {
  const token = signToken({ sub: user.id, email: user.email });
  return { user: toPublicUser(user), token };
}
