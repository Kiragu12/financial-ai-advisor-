import { config } from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

config({ path: 'server/.env' });

const apiKey = process.env.DEEPSEEK_API_KEY;
const baseURL = process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com/anthropic';
const model = process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash';



if (!apiKey) {
  console.error('Missing DEEPSEEK_API_KEY in the environment.');
  process.exit(1);
}

const client = new Anthropic({
  apiKey,
  baseURL,
});

async function main(): Promise<void> {
  const response = await client.messages.create({
    model,
    max_tokens: 120,
    thinking: { type: 'adaptive' },
    system: 'You are a concise API connection test assistant.',
    messages: [
      {
        role: 'user',
        content: 'Reply with one short sentence confirming the DeepSeek connection works.',
      },
    ],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();

  console.log(text || response.content);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
