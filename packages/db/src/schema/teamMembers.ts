import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { TeamRole } from '../enums/TeamRole';
import { workspaceIsolationPolicy } from './rls';
import { teamsTable } from './teams';
import { usersTable } from './users';
import { workspacesTable } from './workspaces';

// Joins a User to a Team with a team-level role. Distinct from `memberships`, which is the
// workspace-level join. A user can belong to several teams and can be both a workspace admin
// and a team admin through separate rows.
export const teamMembersTable = pgTable(
  'team_members',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    teamId: text('team_id')
      .notNull()
      .references(() => teamsTable.id),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id),
    role: text('role').$type<TeamRole>().notNull().default('member'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_team_members_workspace').on(table.workspaceId),
    index('idx_team_members_team').on(table.teamId),
    index('idx_team_members_user').on(table.userId),
    workspaceIsolationPolicy('team_members', table.workspaceId),
  ],
).enableRLS();

export const insertTeamMemberSchema = createInsertSchema(teamMembersTable);
export const selectTeamMemberSchema = createSelectSchema(teamMembersTable);

export type TeamMember = typeof teamMembersTable.$inferSelect;
export type InsertTeamMember = typeof teamMembersTable.$inferInsert;
