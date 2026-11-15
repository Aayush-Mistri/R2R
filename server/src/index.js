import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { createApp } from './app.js';

const here = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  await connectDb();

  const app = createApp();

  if (env.isProd) {
    const clientDist = path.resolve(here, '../../client/dist');
    app.use(express.static(clientDist));
    app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
