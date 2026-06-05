import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { WorkspacePlan } from '../enums/WorkspacePlan';
import { workspaceRootIsolationPolicy } from './rls';

export type InvitePermission = 'workspace-admins' | 'workspace-and-team-admins' | 'all-members';
export type GrantTeamAdminPermission = 'workspace-admins' | 'workspace-and-team-admins';
export type SourceRequestPermission = 'workspace-admins' | 'team-admins' | 'members';
export type UnmappedSourceUnitBehavior = 'admin-review' | 'inbox';
export type CrossTeamMoveReviewer = 'destination-team-admin' | 'workspace-admin';
export type AwaitingApprovalDestination = 'backlog-attention' | 'inbox';

// The tenant root (solo or team). Every other domain row is workspace-scoped for RLS.
export const workspacesTable = pgTable(
  'workspaces',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    logoUrl: text('logo_url'),
    plan: text('plan').$type<WorkspacePlan>().notNull().default('free'),
    invitePermission: text('invite_permission')
      .$type<InvitePermission>()
      .notNull()
      .default('workspace-and-team-admins'),
    grantTeamAdminPermission: text('grant_team_admin_permission')
      .$type<GrantTeamAdminPermission>()
      .notNull()
      .default('workspace-admins'),
    sourceRequestPermission: text('source_request_permission')
      .$type<SourceRequestPermission>()
      .notNull()
      .default('team-admins'),
    unmappedSourceUnitBehavior: text('unmapped_source_unit_behavior')
      .$type<UnmappedSourceUnitBehavior>()
      .notNull()
      .default('admin-review'),
    crossTeamMoveReviewer: text('cross_team_move_reviewer')
      .$type<CrossTeamMoveReviewer>()
      .notNull()
      .default('destination-team-admin'),
    awaitingApprovalDestination: text('awaiting_approval_destination')
      .$type<AwaitingApprovalDestination>()
      .notNull()
      .default('backlog-attention'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [workspaceRootIsolationPolicy('workspaces', table.id)],
).enableRLS();

export const insertWorkspaceSchema = createInsertSchema(workspacesTable);
export const selectWorkspaceSchema = createSelectSchema(workspacesTable);

export type Workspace = typeof workspacesTable.$inferSelect;
export type InsertWorkspace = typeof workspacesTable.$inferInsert;
