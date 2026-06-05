import { pgTable, text, jsonb, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { SourceType } from '../enums/SourceType';
import { workspacesTable } from './workspaces';
import { usersTable } from './users';
import { teamsTable } from './teams';
import { sourceConnectionsTable } from './sourceConnections';
import { sourceUnitsTable } from './sourceUnits';

// Source-native cycle/scope (Jira Sprint / Linear Cycle / GitHub Milestone / Epic). Stored
// source-native — there is no unified Project/Sprint entity. Normalized at the display layer.
export type SourceCycle = {
  kind: 'sprint' | 'cycle';
  label: string;
  sourceId?: string;
};

export type SourceLabel = {
  sourceId?: string;
  name: string;
  kind?: 'label' | 'epic' | 'initiative' | 'milestone' | 'project' | 'component';
  color?: string;
};

// A ticket synced from a source. Always has a source system (no Stride-native Specs).
// Source fields keep the source-native label/key. Mapped fields keep the Team source-mapping
// key used for filtering, badge lookup, and derived views.
//
// `readiness` and the backlog view tabs (Breakdown / In Flight / Blocked / Next Up /
// Completed) are DERIVED in the query layer from these primitives — never stored here (Q4).
export const specsTable = pgTable(
  'specs',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    // Nullable — an uncategorized Spec (no team mapping yet) still appears, never hidden.
    teamId: text('team_id').references(() => teamsTable.id),
    sourceConnectionId: text('source_connection_id')
      .notNull()
      .references(() => sourceConnectionsTable.id),
    sourceUnitId: text('source_unit_id').references(() => sourceUnitsTable.id),
    sourceType: text('source_type').$type<SourceType>().notNull(),
    sourceId: text('source_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    sourceStatus: text('source_status').notNull(),
    mappedStatus: text('mapped_status').notNull(),
    sourcePriority: text('source_priority'),
    mappedPriority: text('mapped_priority'),
    sourceDifficulty: text('source_difficulty'),
    mappedDifficulty: text('mapped_difficulty'),
    assigneeUserId: text('assignee_user_id').references(() => usersTable.id),
    // When the current assignee was set — powers the "just landed" / "waiting Nd" surfaces
    // (the `just-landed` attention flag is derived from this, not stored).
    assignedAt: timestamp('assigned_at', { withTimezone: true }),
    reporter: text('reporter'),
    due: timestamp('due', { withTimezone: true }),
    labels: jsonb('labels').$type<SourceLabel[]>().notNull().default([]),
    sourceCycle: jsonb('source_cycle').$type<SourceCycle>(),
    sourceData: jsonb('source_data').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_specs_workspace').on(table.workspaceId),
    index('idx_specs_team').on(table.teamId),
    index('idx_specs_source').on(table.sourceType, table.sourceId),
    index('idx_specs_source_unit').on(table.sourceUnitId),
    index('idx_specs_assignee').on(table.assigneeUserId),
  ],
);

export const insertSpecSchema = createInsertSchema(specsTable);
export const selectSpecSchema = createSelectSchema(specsTable);

export type Spec = typeof specsTable.$inferSelect;
export type InsertSpec = typeof specsTable.$inferInsert;
