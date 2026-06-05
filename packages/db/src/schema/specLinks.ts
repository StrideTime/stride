import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { SpecLinkRelation } from '../enums/SpecLinkRelation';
import { workspacesTable } from './workspaces';
import { specsTable } from './specs';

// A source-synced relationship between two Specs (Blocks / Blocked by / Related / Implements),
// rendered in the Spec view's linked-issues section.
export const specLinksTable = pgTable(
  'spec_links',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    sourceSpecId: text('source_spec_id')
      .notNull()
      .references(() => specsTable.id),
    targetSpecId: text('target_spec_id')
      .notNull()
      .references(() => specsTable.id),
    relation: text('relation').$type<SpecLinkRelation>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_spec_links_source').on(table.sourceSpecId),
    index('idx_spec_links_target').on(table.targetSpecId),
  ],
);

export const insertSpecLinkSchema = createInsertSchema(specLinksTable);
export const selectSpecLinkSchema = createSelectSchema(specLinksTable);

export type SpecLink = typeof specLinksTable.$inferSelect;
export type InsertSpecLink = typeof specLinksTable.$inferInsert;
