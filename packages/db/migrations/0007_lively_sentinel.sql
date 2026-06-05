-- @safety:reviewed pre-release MVP schema cleanup; removes post-MVP capture/concept/offline tables, replaces embedded session notes with session_notes, and renames loose schedule/action fields before production readers exist.
CREATE TABLE "session_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text NOT NULL,
	"body" text NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DROP TABLE "captures" CASCADE;--> statement-breakpoint
DROP TABLE "processed_mutations" CASCADE;--> statement-breakpoint
DROP TABLE "concept_links" CASCADE;--> statement-breakpoint
ALTER TABLE "specs" RENAME COLUMN "source_grouping" TO "source_cycle";--> statement-breakpoint
ALTER TABLE "actions" RENAME COLUMN "mapped_difficulty" TO "difficulty";--> statement-breakpoint
ALTER TABLE "scheduled_event_types" RENAME COLUMN "color" TO "color_token";--> statement-breakpoint
ALTER TABLE "scheduled_event_types" RENAME COLUMN "icon" TO "icon_token";--> statement-breakpoint
ALTER TABLE "specs" ADD COLUMN "source_difficulty" text;--> statement-breakpoint
ALTER TABLE "specs" ADD COLUMN "mapped_difficulty" text;--> statement-breakpoint
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_session_notes_workspace" ON "session_notes" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_session_notes_session" ON "session_notes" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_session_notes_user" ON "session_notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_session_notes_occurred_at" ON "session_notes" USING btree ("occurred_at");--> statement-breakpoint
ALTER TABLE "actions" DROP COLUMN "source_difficulty";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "jots";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "end_note";--> statement-breakpoint
ALTER TABLE "scheduled_events" DROP COLUMN "fixed";
