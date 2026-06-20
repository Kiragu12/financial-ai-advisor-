import type { PublicUser } from '../users/users.types.js';

/**
 * The result of a successful authentication.
 * The service returns both pieces; the controller decides how to deliver them
 * (the user goes in the JSON body, the token goes into an HTTP-only cookie).
 */
export interface AuthResult {
  user: PublicUser;
  token: string;
}
