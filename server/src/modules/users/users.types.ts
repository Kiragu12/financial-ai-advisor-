/**
 * User shapes.
 *
 * UserRecord  = exactly what the `users` table row looks like (snake_case,
 *               includes the password hash). Never sent to the client.
 * PublicUser  = the safe, camelCase projection the API returns. No hash.
 */

export interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  preferred_currency: string;
  created_at: Date;
  updated_at: Date;
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  preferredCurrency: string;
  createdAt: string;
}

/** Strip secrets and convert to the client-facing shape. */
export function toPublicUser(record: UserRecord): PublicUser {
  return {
    id: record.id,
    fullName: record.full_name,
    email: record.email,
    preferredCurrency: record.preferred_currency,
    createdAt: record.created_at.toISOString(),
  };
}
