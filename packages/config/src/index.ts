import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error(`❌ FATAL: DATABASE_URL is missing!`);
  console.error(`🔍 Looked for .env file at: ${envPath}`);
  process.exit(1); 
}

if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 64) {
  console.error(`❌ FATAL: ENCRYPTION_KEY is missing or invalid in .env! It must be exactly 64 hex characters.`);
  process.exit(1);
}

export const config = {
  backend: {
    port: parseInt(process.env.PORT || '3001', 10),
    jwtSecret: process.env.JWT_SECRET || 'supersecretkey',
    encryptionKey: process.env.ENCRYPTION_KEY,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: 'eventflux-engine',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  }
};