-- @safety:reviewed pre-release source sync schema correction; replaces loose available_units/external_unit_id fields with source_units before production source mappings exist.
CREATE TABLE "source_units" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"source_connection_id" text NOT NULL,
	"source_type" text NOT NULL,
	"unit_type" text NOT NULL,
	"external_id" text NOT NULL,
	"display_name" text NOT NULL,
	"url" text,
	"metadata" jsonb,
	"last_discovered_at" timestamp with time zone,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_source_mappings" RENAME COLUMN "external_unit_id" TO "source_unit_id";--> statement-breakpoint
ALTER TABLE "source_connections" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "specs" ADD COLUMN "source_unit_id" text;--> statement-breakpoint
ALTER TABLE "source_units" ADD CONSTRAINT "source_units_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_units" ADD CONSTRAINT "source_units_source_connection_id_source_connections_id_fk" FOREIGN KEY ("source_connection_id") REFERENCES "public"."source_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_source_units_workspace" ON "source_units" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_source_units_connection" ON "source_units" USING btree ("source_connection_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_source_units_connection_external" ON "source_units" USING btree ("source_connection_id","unit_type","external_id");--> statement-breakpoint
ALTER TABLE "team_source_mappings" ADD CONSTRAINT "team_source_mappings_source_unit_id_source_units_id_fk" FOREIGN KEY ("source_unit_id") REFERENCES "public"."source_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specs" ADD CONSTRAINT "specs_source_unit_id_source_units_id_fk" FOREIGN KEY ("source_unit_id") REFERENCES "public"."source_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_team_source_mappings_source_unit" ON "team_source_mappings" USING btree ("source_unit_id");--> statement-breakpoint
CREATE INDEX "idx_specs_source_unit" ON "specs" USING btree ("source_unit_id");--> statement-breakpoint
ALTER TABLE "source_connections" DROP COLUMN "external_account_id";--> statement-breakpoint
ALTER TABLE "source_connections" DROP COLUMN "available_units";--> statement-breakpoint
ALTER TABLE "team_source_mappings" DROP COLUMN "unit_type";
