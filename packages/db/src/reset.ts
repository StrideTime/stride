/**
 * LOCAL-ONLY destructive reset: drop the public schema, re-run all migrations, reseed.
 *
 *   pnpm db:reset
 *
 * GUARDED: refuses to run unless DATABASE_URL points at localhost/127.0.0.1. The only override
 * is STRIDE_ALLOW_DESTRUCTIVE=1, which exists for the ephemeral E2E-database pipeline (a fresh
 * throwaway Neon branch off the seed baseline branch) — NEVER set it against staging/production.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { seed } from './seed';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required');

const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
if (!isLocal && process.env.STRIDE_ALLOW_DESTRUCTIVE !== '1') {
  console.error(
    'Refusing to reset a non-local database. DATABASE_URL is not localhost.\n' +
      'This command DROPS ALL DATA. If this is an ephemeral throwaway DB, set ' +
      'STRIDE_ALLOW_DESTRUCTIVE=1. Never set it for staging/production.',
  );
  process.exit(1);
}

const migrationsFolder = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

const sql = postgres(url, { max: 1 });
const db = drizzle(sql);

try {
  console.log('Dropping public schema…');
  await sql.unsafe('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  console.log('Running migrations…');
  await migrate(db, { migrationsFolder });
  console.log('Seeding…');
  await seed(db);
  console.log('Reset complete.');
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await sql.end();
}
