import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Idempotency ledger for the offline mutation queue. Before processing a queued mutation
// command, check this table by the client-generated `id`; if present, return the cached
// `result` without re-executing. No soft delete — rows are pruned by age via a CF Cron job.
export const processedMutationsTable = pgTable('processed_mutations', {
  id: text('id').primaryKey(),
  result: text('result').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
});

export const insertProcessedMutationSchema = createInsertSchema(processedMutationsTable);
export const selectProcessedMutationSchema = createSelectSchema(processedMutationsTable);

export type ProcessedMutation = typeof processedMutationsTable.$inferSelect;
export type InsertProcessedMutation = typeof processedMutationsTable.$inferInsert;
