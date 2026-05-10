import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client/index.js'; 
import { config } from '@eventflux/config';

const pool = new pg.Pool({
  connectionString: config.database.url,
});

const adapter = new PrismaPg(pool);
export const db = new PrismaClient({ adapter });

export * from './generated/client/index.js';