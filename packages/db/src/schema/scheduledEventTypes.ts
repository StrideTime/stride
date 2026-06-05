import { pgTable, text, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { ColorToken } from '../enums/ColorToken';
import type { IconToken } from '../enums/IconToken';
import type { ScheduledEventSystemKey } from '../enums/ScheduledEventSystemKey';
import { workspacesTable } from './workspaces';

export const defaultScheduledEventTypes = [
  { name: 'Actions', colorToken: 'blue', iconToken: 'check-circle', systemKey: 'actions', orderKey: '001' },
  { name: 'Meeting', colorToken: 'violet', iconToken: 'users', orderKey: '002' },
  { name: 'Break', colorToken: 'green', iconToken: 'coffee', orderKey: '003' },
  { name: 'Focus', colorToken: 'amber', iconToken: 'target', orderKey: '004' },
  { name: 'Personal', colorToken: 'rose', iconToken: 'user', orderKey: '005' },
  { name: 'Buffer', colorToken: 'slate', iconToken: 'timer', orderKey: '006' },
  {
    name: 'External calendar',
    colorToken: 'gray',
    iconToken: 'calendar',
    systemKey: 'external_calendar',
    orderKey: '007',
  },
] satisfies Array<{
  name: string;
  colorToken: ColorToken;
  iconToken: IconToken;
  systemKey?: ScheduledEventSystemKey;
  orderKey: string;
}>;

// Workspace schedule category preferences. Seed every workspace with defaults, then let the user
// add, rename, recolor, reorder, and archive non-system types.
export const scheduledEventTypesTable = pgTable(
  'scheduled_event_types',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    name: text('name').notNull(),
    colorToken: text('color_token').$type<ColorToken>().notNull(),
    iconToken: text('icon_token').$type<IconToken>().notNull(),
    systemKey: text('system_key').$type<ScheduledEventSystemKey>(),
    orderKey: text('order_key'),
    archived: boolean('archived').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_scheduled_event_types_workspace').on(table.workspaceId),
    uniqueIndex('idx_scheduled_event_types_workspace_system_key')
      .on(table.workspaceId, table.systemKey),
  ],
);

export const insertScheduledEventTypeSchema = createInsertSchema(scheduledEventTypesTable);
export const selectScheduledEventTypeSchema = createSelectSchema(scheduledEventTypesTable);

export type ScheduledEventType = typeof scheduledEventTypesTable.$inferSelect;
export type InsertScheduledEventType = typeof scheduledEventTypesTable.$inferInsert;
