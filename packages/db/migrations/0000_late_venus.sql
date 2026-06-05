CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"settings" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"settings" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"working_hours" jsonb,
	"notification_prefs" jsonb,
	"calendar_opt_in" boolean DEFAULT false NOT NULL,
	"presence_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"settings" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"source_type" text NOT NULL,
	"external_account_id" text NOT NULL,
	"display_name" text NOT NULL,
	"credentials" jsonb,
	"available_units" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_source_mappings" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"team_id" text NOT NULL,
	"source_connection_id" text NOT NULL,
	"external_unit_id" text NOT NULL,
	"unit_type" text NOT NULL,
	"status_mapping" jsonb,
	"priority_mapping" jsonb,
	"difficulty_mapping" jsonb,
	"import_scope" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specs" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"team_id" text,
	"source_connection_id" text NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'open' NOT NULL,
	"source_status" text NOT NULL,
	"priority" text,
	"source_priority" text,
	"assignee_user_id" text,
	"assigned_at" timestamp with time zone,
	"reporter" text,
	"due" timestamp with time zone,
	"labels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_grouping" jsonb,
	"source_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spec_links" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"source_spec_id" text NOT NULL,
	"target_spec_id" text NOT NULL,
	"relation" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spec_activity" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"spec_id" text NOT NULL,
	"type" text NOT NULL,
	"actor_user_id" text,
	"is_source_originated" boolean DEFAULT false NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "actions" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"spec_id" text,
	"title" text NOT NULL,
	"estimate_min" integer,
	"difficulty" text,
	"actual_min" integer DEFAULT 0 NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"order_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"action_id" text NOT NULL,
	"user_id" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"elapsed_min" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"jots" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"feeling" text,
	"end_note" text,
	"mark_done" boolean DEFAULT false NOT NULL,
	"content_signal" jsonb,
	"signal_source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_events" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"action_id" text,
	"title" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"duration_min" integer NOT NULL,
	"source" text,
	"source_event_id" text,
	"availability" text,
	"external_classification" text,
	"fixed" boolean DEFAULT false NOT NULL,
	"recurrence" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "captures" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"text" text NOT NULL,
	"kind" text,
	"converted_to_action_id" text,
	"converted_to_spec_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"spec_id" text,
	"actor_user_id" text,
	"payload" jsonb,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processed_mutations" (
	"id" text PRIMARY KEY NOT NULL,
	"result" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "concept_links" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text,
	"concept_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_connections" ADD CONSTRAINT "source_connections_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_source_mappings" ADD CONSTRAINT "team_source_mappings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_source_mappings" ADD CONSTRAINT "team_source_mappings_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_source_mappings" ADD CONSTRAINT "team_source_mappings_source_connection_id_source_connections_id_fk" FOREIGN KEY ("source_connection_id") REFERENCES "public"."source_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specs" ADD CONSTRAINT "specs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specs" ADD CONSTRAINT "specs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specs" ADD CONSTRAINT "specs_source_connection_id_source_connections_id_fk" FOREIGN KEY ("source_connection_id") REFERENCES "public"."source_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specs" ADD CONSTRAINT "specs_assignee_user_id_users_id_fk" FOREIGN KEY ("assignee_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spec_links" ADD CONSTRAINT "spec_links_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spec_links" ADD CONSTRAINT "spec_links_source_spec_id_specs_id_fk" FOREIGN KEY ("source_spec_id") REFERENCES "public"."specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spec_links" ADD CONSTRAINT "spec_links_target_spec_id_specs_id_fk" FOREIGN KEY ("target_spec_id") REFERENCES "public"."specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spec_activity" ADD CONSTRAINT "spec_activity_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spec_activity" ADD CONSTRAINT "spec_activity_spec_id_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spec_activity" ADD CONSTRAINT "spec_activity_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_spec_id_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_events" ADD CONSTRAINT "scheduled_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_events" ADD CONSTRAINT "scheduled_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_events" ADD CONSTRAINT "scheduled_events_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_converted_to_action_id_actions_id_fk" FOREIGN KEY ("converted_to_action_id") REFERENCES "public"."actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_converted_to_spec_id_specs_id_fk" FOREIGN KEY ("converted_to_spec_id") REFERENCES "public"."specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_spec_id_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_memberships_workspace" ON "memberships" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_memberships_user" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_teams_workspace" ON "teams" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_team_members_team" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_team_members_user" ON "team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_source_connections_workspace" ON "source_connections" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_team_source_mappings_team" ON "team_source_mappings" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_team_source_mappings_workspace" ON "team_source_mappings" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_specs_workspace" ON "specs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_specs_team" ON "specs" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_specs_source" ON "specs" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "idx_specs_assignee" ON "specs" USING btree ("assignee_user_id");--> statement-breakpoint
CREATE INDEX "idx_spec_links_source" ON "spec_links" USING btree ("source_spec_id");--> statement-breakpoint
CREATE INDEX "idx_spec_links_target" ON "spec_links" USING btree ("target_spec_id");--> statement-breakpoint
CREATE INDEX "idx_spec_activity_spec" ON "spec_activity" USING btree ("spec_id");--> statement-breakpoint
CREATE INDEX "idx_actions_workspace" ON "actions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_actions_spec" ON "actions" USING btree ("spec_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_workspace" ON "sessions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_action" ON "sessions" USING btree ("action_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_user" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_scheduled_events_workspace" ON "scheduled_events" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_scheduled_events_user" ON "scheduled_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_scheduled_events_action" ON "scheduled_events" USING btree ("action_id");--> statement-breakpoint
CREATE INDEX "idx_scheduled_events_start" ON "scheduled_events" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "idx_captures_workspace" ON "captures" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_captures_user" ON "captures" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_workspace" ON "notifications" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_concept_links_concept" ON "concept_links" USING btree ("concept_id");--> statement-breakpoint
CREATE INDEX "idx_concept_links_entity" ON "concept_links" USING btree ("entity_type","entity_id");