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
  // Optional so the server still boots without AI configured — only the
  // advisor module needs these. The advisor returns a clear error if the key
  // is missing at call time. Default model is the most capable Claude tier;
  // override with claude-sonnet-4-6 or claude-haiku-4-5 to trade quality for cost.
DEEPSEEK_API_KEY: z.string().optional(),
DEEPSEEK_MODEL : z.string().default('deepseek-v4-flash'),
DEEPSEEK_BASE_URL :z.string().url().default('https://api.deepseek.com/anthropic')
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
