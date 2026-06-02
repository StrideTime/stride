import { pgTable, text, jsonb, timestamp, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Account-wide preferences. Per-workspace personal settings live on `memberships`.
export type UserSettings = {
  appearance?: 'system' | 'light' | 'dark';
  locale?: string;
};

// Account-wide identity. Better Auth owns the credential/session tables separately; this is
// the Stride-side user profile that domain rows reference.
export const usersTable = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    image: text('image'),
    settings: jsonb('settings').$type<UserSettings>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [uniqueIndex('idx_users_email').on(table.email)],
);

export const insertUserSchema = createInsertSchema(usersTable);
export const selectUserSchema = createSelectSchema(usersTable);

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
