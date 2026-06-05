-- @safety:reviewed pre-release workspace settings correction; replaces placeholder workspaces.settings jsonb with explicit columns matching the Workspace Admin General controls before production readers exist.
ALTER TABLE "workspaces" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "workspaces"
SET "slug" = lower(regexp_replace(coalesce(nullif("name", ''), "id"), '[^a-zA-Z0-9]+', '-', 'g'));--> statement-breakpoint
UPDATE "workspaces"
SET "slug" = trim(both '-' from "slug");--> statement-breakpoint
UPDATE "workspaces"
SET "slug" = "id"
WHERE "slug" IS NULL OR "slug" = '';--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "invite_permission" text DEFAULT 'workspace-and-team-admins' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "grant_team_admin_permission" text DEFAULT 'workspace-admins' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "source_request_permission" text DEFAULT 'team-admins' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "unmapped_source_unit_behavior" text DEFAULT 'admin-review' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "cross_team_move_reviewer" text DEFAULT 'destination-team-admin' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "awaiting_approval_destination" text DEFAULT 'backlog-attention' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN "settings";
