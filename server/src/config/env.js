import dotenv from 'dotenv';

dotenv.config({ path: new URL('../../../.env', import.meta.url) });

const required = ['MONGO_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  mongoUri: process.env.MONGO_URI,
  mongoDb: process.env.MONGO_DB || 'r2r',
  jwtSecret: process.env.JWT_SECRET,
  port: Number(process.env.PORT) || 5000,
  clientOrigins,
  isProd: process.env.NODE_ENV === 'production',
};
