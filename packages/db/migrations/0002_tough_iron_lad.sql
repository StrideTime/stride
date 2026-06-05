-- @safety:reviewed pre-release schema correction; specs.status local lifecycle enum is replaced by mapped_status from team source mappings before production readers exist.
ALTER TABLE "specs" ADD COLUMN "mapped_status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "specs" DROP COLUMN "status";
