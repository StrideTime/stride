import { pgTable, text, integer, jsonb, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { workspacesTable } from './workspaces';
import { usersTable } from './users';
import { actionsTable } from './actions';
import { scheduledEventTypesTable } from './scheduledEventTypes';
import { workspaceIsolationPolicy } from './rls';

// A proper recurring schedule definition for Stride-owned events. `rrule` uses RFC 5545-style
// RRULE strings; exceptions skip dates/occurrences; overrides patch individual occurrences.
export type RecurrenceRule = {
  rrule: string;
  timezone: string;
  exceptions?: Array<{
    originalStartAt: string;
    reason?: string;
  }>;
  overrides?: Array<{
    originalStartAt: string;
    startAt?: string;
    endAt?: string;
    title?: string;
    typeId?: string;
  }>;
};

export type ExternalCalendarMetadata = Record<string, unknown>;

// The PLAN layer of the Schedule (the ACTUAL layer is Sessions). A planned time block — a
// workspace-configured category, an action-linked work block (system type `actions` + `actionId`),
// or an imported external calendar event (system type `external_calendar`, source-owned).
// Personal to a user.
export const scheduledEventsTable = pgTable(
  'scheduled_events',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id),
    typeId: text('type_id')
      .notNull()
      .references(() => scheduledEventTypesTable.id),
    actionId: text('action_id').references(() => actionsTable.id),
    title: text('title').notNull(),
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }).notNull(),
    durationMin: integer('duration_min').notNull(),
    // External calendar provenance — calendar sync is post-v1; these ship forward-compatible:
    source: text('source'),
    sourceEventId: text('source_event_id'),
    availability: text('availability').$type<'free' | 'busy'>(),
    externalMetadata: jsonb('external_metadata').$type<ExternalCalendarMetadata>(),
    recurrence: jsonb('recurrence').$type<RecurrenceRule>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_scheduled_events_workspace').on(table.workspaceId),
    index('idx_scheduled_events_user').on(table.userId),
    index('idx_scheduled_events_type').on(table.typeId),
    index('idx_scheduled_events_action').on(table.actionId),
    index('idx_scheduled_events_start').on(table.startAt),
    workspaceIsolationPolicy('scheduled_events', table.workspaceId),
  ],
).enableRLS();

export const insertScheduledEventSchema = createInsertSchema(scheduledEventsTable);
export const selectScheduledEventSchema = createSelectSchema(scheduledEventsTable);

export type ScheduledEvent = typeof scheduledEventsTable.$inferSelect;
export type InsertScheduledEvent = typeof scheduledEventsTable.$inferInsert;
