import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/app-error.js';

/**
 * Claude API access — the only file in the codebase that imports the Anthropic
 * SDK. If we ever change provider or SDK, this is the single file to touch.
 *
 * The advisor is a grounded chatbot: one request per user message, carrying the
 * conversation history plus a system prompt built from the user's live finances
 * (see advisor.context.ts). Adaptive thinking lets Claude reason as much as the
 * question warrants; responses are short, so a non-streaming call is fine.
 */

// Akiba's persona and safety rails. The live financial snapshot is appended to
// this at call time.
const ADVISOR_PERSONA = `You are Akiba, a friendly, judgment-free personal finance advisor for university students in Kenya. Amounts are in Kenyan Shillings (KES) unless stated otherwise.

Your job: help the student understand their spending, budget realistically on a student income, build small savings habits, and reach their goals. Be warm, practical, and concise — a few short paragraphs or a tight list, not an essay. Refer to their actual numbers when relevant.

Boundaries: you are not a licensed financial advisor. For anything involving investments, loans, debt with legal consequences, or large/irreversible decisions, give general educational information and clearly recommend speaking to a qualified professional. Never invent figures that aren't in the data you're given; if you don't have the information, say so.`;

// Lazily constructed so the server can boot without an API key — only fails
// when the advisor is actually used without one configured.
let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!env.DEEPSEEK_API_KEY) {
    throw AppError.badRequest(
      'The AI advisor is not configured. Set DEEPSEEK_API_KEY on the server.',
    );
  }
  if (!client) {
    client = new Anthropic({
      apiKey: env.DEEPSEEK_API_KEY,
      baseURL: env.DEEPSEEK_BASE_URL,
    });
  }
  return client;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Send the conversation to Claude and return the assistant's reply text.
 * `financialContext` is appended to the system prompt for this request only.
 */
export async function generateReply(
  history: ChatTurn[],
  financialContext: string,
): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: env.DEEPSEEK_MODEL,
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    system: `${ADVISOR_PERSONA}\n\n${financialContext}`,
    messages: history.map((turn) => ({ role: turn.role, content: turn.content })),
  });

  // content is a list of blocks; with adaptive thinking it may include thinking
  // blocks (omitted text by default). Concatenate only the visible text blocks.
  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();

  if (!text) {
    throw AppError.badRequest('The advisor could not produce a response. Please try again.');
  }

  return text;
}
