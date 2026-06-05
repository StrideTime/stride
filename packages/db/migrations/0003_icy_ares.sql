-- @safety:reviewed pre-release source-mapping correction; renames preserve existing mapped priority/difficulty values while making source vs mapped fields explicit before production readers exist.
ALTER TABLE "specs" RENAME COLUMN "priority" TO "mapped_priority";--> statement-breakpoint
ALTER TABLE "actions" RENAME COLUMN "difficulty" TO "mapped_difficulty";--> statement-breakpoint
ALTER TABLE "actions" ADD COLUMN "source_difficulty" text;
