te:import { sql } from 'drizzle-orm';
import { pgPolicy } from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

const appWorkspaceId = sql`nullif(current_setting('app.workspace_id', true), '')`;

export function workspaceIsolationPolicy(tableName: string, workspaceId: AnyPgColumn) {
  return pgPolicy(`${tableName}_workspace_isolation`, {
    for: 'all',
    using: sql`${workspaceId} = ${appWorkspaceId}`,
    withCheck: sql`${workspaceId} = ${appWorkspaceId}`,
  });
}

export function workspaceRootIsolationPolicy(tableName: string, id: AnyPgColumn) {
  return pgPolicy(`${tableName}_workspace_isolation`, {
    for: 'all',
    using: sql`${id} = ${appWorkspaceId}`,
    withCheck: sql`${id} = ${appWorkspaceId}`,
  });
}
