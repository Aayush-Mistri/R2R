import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { createApp } from './app.js';

async function main() {
  await connectDb();

  const app = createApp({ serveClient: env.isProd });

  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
