import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
  backend: {
    port: parseInt(process.env.PORT || '3001', 10),
    jwtSecret: process.env.JWT_SECRET || 'supersecretkey',
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