import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { CaptureKind } from '../enums/CaptureKind';
import { workspacesTable } from './workspaces';
import { usersTable } from './users';
import { actionsTable } from './actions';
import { specsTable } from './specs';

// Quick capture (⌥Space) — a frictionless note that can later convert into an Action or a
// Spec. The conversion targets are nullable until the capture is triaged.
export const capturesTable = pgTable(
  'captures',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id),
    text: text('text').notNull(),
    kind: text('kind').$type<CaptureKind>(), // nullable until triaged (insight | next)
    convertedToActionId: text('converted_to_action_id').references(() => actionsTable.id),
    convertedToSpecId: text('converted_to_spec_id').references(() => specsTable.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_captures_workspace').on(table.workspaceId),
    index('idx_captures_user').on(table.userId),
  ],
);

export const insertCaptureSchema = createInsertSchema(capturesTable);
export const selectCaptureSchema = createSelectSchema(capturesTable);

export type Capture = typeof capturesTable.$inferSelect;
export type InsertCapture = typeof capturesTable.$inferInsert;
