import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/database.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Akiba API listening on http://localhost:${env.PORT}`);
});

/**
 * Graceful shutdown. Hosting platforms (Railway/Render/Fly) send SIGTERM on
 * redeploy or scale-down; we stop accepting new connections, let in-flight
 * requests finish, close the database pool, then exit. A hard timeout guards
 * against a hung connection keeping the process alive forever.
 */
function shutdown(signal: string): void {
  console.log(`[server] ${signal} received — shutting down gracefully...`);

  server.close(async () => {
    try {
      await pool.end();
      console.log('[server] database pool closed. Bye.');
      process.exit(0);
    } catch (err) {
      console.error('[server] error during shutdown:', err);
      process.exit(1);
    }
  });

  // Don't wait forever for stuck sockets.
  setTimeout(() => {
    console.error('[server] forced shutdown after timeout.');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
