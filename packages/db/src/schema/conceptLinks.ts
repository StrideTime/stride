import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Cross-cutting attachment point (forward-looking). Ships EMPTY and unsurfaced in v1 so a
// future "Concept" entity (features, modules, recurring problem patterns) can attach to any
// Stride entity without a schema retrofit. No soft delete — it is a pure junction
// (data-model.md; decisions.mdc 2026-05-21).
export const conceptLinksTable = pgTable(
  'concept_links',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id'),
    conceptId: text('concept_id').notNull(),
    entityType: text('entity_type').notNull(), // 'spec' | 'action' | 'session' | 'capture' | …
    entityId: text('entity_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    index('idx_concept_links_concept').on(table.conceptId),
    index('idx_concept_links_entity').on(table.entityType, table.entityId),
  ],
);

export const insertConceptLinkSchema = createInsertSchema(conceptLinksTable);
export const selectConceptLinkSchema = createSelectSchema(conceptLinksTable);

export type ConceptLink = typeof conceptLinksTable.$inferSelect;
export type InsertConceptLink = typeof conceptLinksTable.$inferInsert;
