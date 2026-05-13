import { and, eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { tasks } from "@/db/schema/tasks";

export type TaskRow = typeof tasks.$inferSelect;

export type TasksRepo = {
  create(input: {
    userId: string;
    name: string;
    nameNormalized: string;
    notes?: string | null;
    dueAt?: Date | null;
  }): Promise<TaskRow>;

  findById(id: number): Promise<TaskRow | undefined>;
  existsNameForUser(userId: string, nameNormalized: string, excludeId?: number): Promise<boolean>;

  update(id: number, changes: Partial<Pick<TaskRow, "name" | "nameNormalized" | "notes" | "dueAt" | "done" | "completedAt">>): Promise<TaskRow | undefined>;
};

export function makeTasksRepo(db: PostgresJsDatabase<Record<string, never>>): TasksRepo {
  return {
    async create(input) {
      const [row] = await db.insert(tasks).values({
        userId: input.userId,
        name: input.name,
        nameNormalized: input.nameNormalized,
        notes: input.notes ?? null,
        dueAt: input.dueAt ?? null,
      }).returning();

      if (!row) throw new Error("Insert failed");
      return row;
    },

    async findById(id) {
      return db.query.tasks.findFirst({ where: (t, { eq }) => eq(t.id, id) });
    },

    async existsNameForUser(userId, nameNormalized, excludeId) {
      const row = await db.query.tasks.findFirst({
        where: (t, { eq, and, ne }) =>
          excludeId
            ? and(eq(t.userId, userId), eq(t.nameNormalized, nameNormalized), ne(t.id, excludeId))
            : and(eq(t.userId, userId), eq(t.nameNormalized, nameNormalized)),
      });
      return Boolean(row);
    },

    async update(id, changes) {
      const [row] = await db.update(tasks).set(changes).where(eq(tasks.id, id)).returning();
      return row;
    },
  };
}