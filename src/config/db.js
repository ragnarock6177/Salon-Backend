// src/config/db.js

import knex from 'knex';
import { development, production } from '../../knexfile.cjs';
import dotenv from 'dotenv';

dotenv.config();

const config = process.env.NODE_ENV === 'production' ? production : development;
const db = knex(config);

db.on('query', q => {
    q.__startTime = Date.now();
});

db.on('query-response', (response, q) => {
    console.log(
        `⏱️ Query Time: ${Date.now() - q.__startTime} ms`,
        q.sql
    );
});

async function testConnection() {
  db.client.pool.on('error', (err) => {
    console.error('Knex pool error:', err);
  });

  try {
    const result = await db.raw("SELECT NOW() as now");
  } catch (err) {
    console.error("❌ DB Connection failed:", err.message);
  } finally {
    // await db.destroy();
  }
}

testConnection();

export default db;
// npx knex --knexfile ./knexfile.cjs --env development migrate:make create_cities_table
// npx knex --knexfile ./knexfile.cjs --env development migrate:latest