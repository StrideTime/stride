ALTER TABLE "team_members" ADD COLUMN "workspace_id" text;--> statement-breakpoint
UPDATE "team_members"
SET "workspace_id" = "teams"."workspace_id"
FROM "teams"
WHERE "team_members"."team_id" = "teams"."id";--> statement-breakpoint
-- @safety:reviewed team_members.workspace_id is backfilled from teams before enforcing NOT NULL.
ALTER TABLE "team_members" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "team_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "source_connections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "source_units" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "team_source_mappings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "specs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "spec_links" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "spec_activity" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "actions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "session_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "scheduled_event_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "scheduled_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_team_members_workspace" ON "team_members" USING btree ("workspace_id");--> statement-breakpoint
CREATE POLICY "workspaces_workspace_isolation" ON "workspaces" AS PERMISSIVE FOR ALL TO public USING ("workspaces"."id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("workspaces"."id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "memberships_workspace_isolation" ON "memberships" AS PERMISSIVE FOR ALL TO public USING ("memberships"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("memberships"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "teams_workspace_isolation" ON "teams" AS PERMISSIVE FOR ALL TO public USING ("teams"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("teams"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "team_members_workspace_isolation" ON "team_members" AS PERMISSIVE FOR ALL TO public USING ("team_members"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("team_members"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "source_connections_workspace_isolation" ON "source_connections" AS PERMISSIVE FOR ALL TO public USING ("source_connections"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("source_connections"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "source_units_workspace_isolation" ON "source_units" AS PERMISSIVE FOR ALL TO public USING ("source_units"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("source_units"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "team_source_mappings_workspace_isolation" ON "team_source_mappings" AS PERMISSIVE FOR ALL TO public USING ("team_source_mappings"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("team_source_mappings"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "specs_workspace_isolation" ON "specs" AS PERMISSIVE FOR ALL TO public USING ("specs"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("specs"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "spec_links_workspace_isolation" ON "spec_links" AS PERMISSIVE FOR ALL TO public USING ("spec_links"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("spec_links"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "spec_activity_workspace_isolation" ON "spec_activity" AS PERMISSIVE FOR ALL TO public USING ("spec_activity"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("spec_activity"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "actions_workspace_isolation" ON "actions" AS PERMISSIVE FOR ALL TO public USING ("actions"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("actions"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "sessions_workspace_isolation" ON "sessions" AS PERMISSIVE FOR ALL TO public USING ("sessions"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("sessions"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "session_notes_workspace_isolation" ON "session_notes" AS PERMISSIVE FOR ALL TO public USING ("session_notes"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("session_notes"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "scheduled_event_types_workspace_isolation" ON "scheduled_event_types" AS PERMISSIVE FOR ALL TO public USING ("scheduled_event_types"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("scheduled_event_types"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "scheduled_events_workspace_isolation" ON "scheduled_events" AS PERMISSIVE FOR ALL TO public USING ("scheduled_events"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("scheduled_events"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));--> statement-breakpoint
CREATE POLICY "notifications_workspace_isolation" ON "notifications" AS PERMISSIVE FOR ALL TO public USING ("notifications"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')) WITH CHECK ("notifications"."workspace_id" = nullif(current_setting('app.workspace_id', true), ''));
