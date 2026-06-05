#!/usr/bin/env node
/**
 * Destructive-migration guard (runs in CI). Scans committed migration SQL for statements that
 * can break a running app or destroy data, and FAILS unless the file explicitly marks itself
 * expand/contract-safe with a marker line:
 *
 *   -- @safety:reviewed <reason>
 *
 * This makes the unsafe thing hard to do by accident. See the expand/contract rule in
 * docs/architecture/environments.md.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

// Patterns that are unsafe against a concurrently-running previous app version.
const RISKY = [
  { re: /\bDROP\s+TABLE\b/i, why: 'DROP TABLE' },
  { re: /\bDROP\s+COLUMN\b/i, why: 'DROP COLUMN' },
  { re: /\bALTER\s+COLUMN\b[\s\S]*?\bTYPE\b/i, why: 'ALTER COLUMN ... TYPE' },
  { re: /\bSET\s+NOT\s+NULL\b/i, why: 'SET NOT NULL' },
  { re: /\bDROP\s+(CONSTRAINT|INDEX)\b/i, why: 'DROP CONSTRAINT/INDEX' },
  { re: /\bRENAME\s+(COLUMN|TO)\b/i, why: 'RENAME' },
  { re: /\bTRUNCATE\b/i, why: 'TRUNCATE' },
];

const MARKER = /--\s*@safety:reviewed\b/i;

const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
const violations = [];

for (const file of files) {
  const sql = readFileSync(join(migrationsDir, file), 'utf8');
  if (MARKER.test(sql)) continue; // explicitly reviewed — operator vouched for it
  const hits = RISKY.filter(({ re }) => re.test(sql)).map(({ why }) => why);
  if (hits.length) violations.push({ file, hits });
}

if (violations.length) {
  console.error('Destructive migration(s) without a safety marker:\n');
  for (const { file, hits } of violations) {
    console.error(`  ${file}: ${hits.join(', ')}`);
  }
  console.error(
    '\nConfirm each is expand/contract-safe (does not break the currently-running app),\n' +
      'then add a marker line to the migration file, e.g.:\n' +
      '  -- @safety:reviewed dropping legacy_col; release N removed all reads (STRIDE-123)\n',
  );
  process.exit(1);
}

console.log(`Checked ${files.length} migration file(s) — no unreviewed destructive statements.`);
