import { pgTable, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { Difficulty } from '../enums/Difficulty';
import { workspacesTable } from './workspaces';
import { specsTable } from './specs';

// A Stride-native execution step — a unit of focused work that serves Sessions. It has its
// own UUID PK (the prototype matched by (specId, actionId); the real schema gives Actions a
// global identity). `specId` nullable = a standalone personal task. Deliberately has no
// status workflow, assignee, or priority of its own — execution, not project management.
//
// `orderKey` carries the "work on this next" backlog intent — there is no ActionDayAssignment.
export const actionsTable = pgTable(
  'actions',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    specId: text('spec_id').references(() => specsTable.id),
    title: text('title').notNull(),
    estimateMin: integer('estimate_min'),
    difficulty: text('difficulty').$type<Difficulty>(),
    actualMin: integer('actual_min').notNull().default(0),
    done: boolean('done').notNull().default(false),
    orderKey: text('order_key'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_actions_workspace').on(table.workspaceId),
    index('idx_actions_spec').on(table.specId),
  ],
);

export const insertActionSchema = createInsertSchema(actionsTable);
export const selectActionSchema = createSelectSchema(actionsTable);

export type Action = typeof actionsTable.$inferSelect;
export type InsertAction = typeof actionsTable.$inferInsert;
