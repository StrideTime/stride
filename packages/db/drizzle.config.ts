import { defineConfig } from 'drizzle-kit';

// Schema is the single source of truth (snake_case SQL names are explicit in each
// table, so no `casing` transform is needed). `DATABASE_URL` is only consumed by the
// `migrate`/`push`/`studio` commands — `generate` works offline from the schema alone.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
