UPDATE "memberships" SET "role" = 'admin' WHERE "role" = 'workspace_admin';--> statement-breakpoint
UPDATE "team_members" SET "role" = 'admin' WHERE "role" = 'team_admin';
