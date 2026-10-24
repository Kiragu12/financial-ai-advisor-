import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().url().default('http://localhost:5274'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_NAME: z.string().default('akiba_token'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('[config] Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

// Production sanity checks — fail fast on config that would silently break the
// deployed app rather than discovering it after release.
if (env.NODE_ENV === 'production') {
  const problems: string[] = [];
  if (env.CORS_ORIGIN.includes('localhost')) {
    problems.push('CORS_ORIGIN still points at localhost — set it to the deployed frontend URL.');
  }
  if (problems.length > 0) {
    console.error('[config] Invalid production configuration:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
}
