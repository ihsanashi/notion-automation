import dotenv from 'dotenv';
import pg from 'pg';
import { PoolConfig } from 'pg';

import { logger } from '@utils/logger';

const { Pool } = pg;

dotenv.config();

const dbConfig: PoolConfig = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
};

const pool = new Pool(dbConfig);

pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error: ', err);
  process.exit(1);
});

export default pool;
