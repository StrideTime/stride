import { z } from "@hono/zod-openapi";
import {
 pgTable,
 integer,
 text,
 boolean,
 timestamp,
 index,
 uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const tasks = pgTable(
 "tasks",
 {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  userId: text().notNull(), // e.g. from auth subject
  name: text().notNull(),
  nameNormalized: text().notNull(), // lowercased/trimmed for uniqueness
  notes: text(),
  dueAt: timestamp({ withTimezone: true }),
  done: boolean().notNull().default(false),
  completedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
 },
 (t) => ({
  userIdIdx: index("tasks_user_id_idx").on(t.userId),
  uniqueNamePerUser: uniqueIndex("tasks_user_name_unique").on(t.userId, t.nameNormalized),
 }),
);

export const selectTaskSchema = createSelectSchema(tasks);

// Body validation: shape + basic constraints only.
export const createTaskBodySchema = createInsertSchema(tasks, {
 name: (s) => s.min(1).max(200),
 notes: (s) => s.max(2000),
})
 .pick({ name: true, notes: true, dueAt: true })
 .strict(); // reject unknown keys

export const patchTaskBodySchema = z
 .object({
  name: z.string().min(1).max(200).optional(),
  notes: z.string().max(2000).nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
  done: z.boolean().optional(),
 })
 .strict()
 .refine((obj) => Object.keys(obj).length > 0, {
  message: "At least one field must be provided",
  path: [],
 });
