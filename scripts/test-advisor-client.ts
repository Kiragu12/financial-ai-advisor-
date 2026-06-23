import { config } from 'dotenv';

config({ path: 'server/.env' });

async function main(): Promise<void> {
  const { generateReply } = await import('../server/src/modules/advisor/advisor.client.js');

  const reply = await generateReply(
    [
      {
        role: 'user',
        content: 'In one short sentence, confirm the Akiba advisor client works.',
      },
    ],
    'Test financial context: total balance KES 1,000. No recent transactions.',
  );

  console.log(reply);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
