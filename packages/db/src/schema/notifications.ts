import { pgTable, text, jsonb, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { NotificationType } from '../enums/NotificationType';
import { workspaceIsolationPolicy } from './rls';
import { workspacesTable } from './workspaces';
import { usersTable } from './users';
import { specsTable } from './specs';

// An Inbox notification targeted at a user. The primary/secondary UI actions are derived from
// `type`, not stored. `readAt` tracks unread state; archiving uses the soft-delete flag.
export const notificationsTable = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id),
    type: text('type').$type<NotificationType>().notNull(),
    specId: text('spec_id').references(() => specsTable.id),
    actorUserId: text('actor_user_id').references(() => usersTable.id),
    payload: jsonb('payload').$type<Record<string, unknown>>(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_notifications_user').on(table.userId),
    index('idx_notifications_workspace').on(table.workspaceId),
    workspaceIsolationPolicy('notifications', table.workspaceId),
  ],
).enableRLS();

export const insertNotificationSchema = createInsertSchema(notificationsTable);
export const selectNotificationSchema = createSelectSchema(notificationsTable);

export type Notification = typeof notificationsTable.$inferSelect;
export type InsertNotification = typeof notificationsTable.$inferInsert;
