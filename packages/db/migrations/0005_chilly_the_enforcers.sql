-- @safety:reviewed pre-release team settings correction; replaces placeholder teams.settings jsonb with explicit columns matching the Team Admin General controls before production readers exist.
ALTER TABLE "teams" ADD COLUMN "new_spec_destination" text DEFAULT 'needs-breakdown' NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "triage_owner" text DEFAULT 'team-admins' NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "missing_estimates_behavior" text DEFAULT 'ask-during-breakdown' NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "unassigned_work_behavior" text DEFAULT 'team-inbox' NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "ready_to_schedule_rule" text DEFAULT 'one-action' NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "stale_breakdown_nudge" text DEFAULT '3-days' NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "settings";
