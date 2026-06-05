CREATE TABLE "scheduled_event_types" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"icon" text NOT NULL,
	"system_key" text,
	"order_key" text,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
-- @safety:reviewed pre-release schema correction; scheduled_events has no production readers yet and old enum/classification columns are replaced by type_id/external_metadata.
ALTER TABLE "scheduled_events" ADD COLUMN "type_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "scheduled_events" ADD COLUMN "external_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "scheduled_event_types" ADD CONSTRAINT "scheduled_event_types_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_scheduled_event_types_workspace" ON "scheduled_event_types" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_scheduled_event_types_workspace_system_key" ON "scheduled_event_types" USING btree ("workspace_id","system_key");--> statement-breakpoint
ALTER TABLE "scheduled_events" ADD CONSTRAINT "scheduled_events_type_id_scheduled_event_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."scheduled_event_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_scheduled_events_type" ON "scheduled_events" USING btree ("type_id");--> statement-breakpoint
ALTER TABLE "scheduled_events" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "scheduled_events" DROP COLUMN "external_classification";
