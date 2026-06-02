import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { WorkspacePlan } from '../enums/WorkspacePlan';

// The tenant root (solo or team). Every other domain row is workspace-scoped for RLS.
export const workspacesTable = pgTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  plan: text('plan').$type<WorkspacePlan>().notNull().default('free'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deleted: boolean('deleted').notNull().default(false),
});

export const insertWorkspaceSchema = createInsertSchema(workspacesTable);
export const selectWorkspaceSchema = createSelectSchema(workspacesTable);

export type Workspace = typeof workspacesTable.$inferSelect;
export type InsertWorkspace = typeof workspacesTable.$inferInsert;
