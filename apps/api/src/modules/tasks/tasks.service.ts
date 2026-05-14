import type { TasksRepo } from "./tasks.repo";
import type { DomainError } from "./domain-errors";
import { err } from "./domain-errors";

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function normalizeNameKey(name: string) {
  return normalizeName(name).toLowerCase();
}

type Result<T> = { ok: true; value: T } | { ok: false; error: DomainError };

export function makeTasksService(repo: TasksRepo) {
  return {
    async createTask(input: {
      userId: string;
      name: string;
      notes?: string | null;
      dueAt?: Date | null;
    }): Promise<Result<unknown>> {
      const now = new Date();

      // Cross-field/domain validation (Zod can’t know “now” policy you want)
      if (input.dueAt && input.dueAt.getTime() < now.getTime()) {
        return { ok: false, error: err("InvalidDueDate", { message: "dueAt must be in the future" }) };
      }

      const name = normalizeName(input.name);
      const nameKey = normalizeNameKey(name);

      // DB-backed invariant: unique per user
      if (await repo.existsNameForUser(input.userId, nameKey)) {
        return { ok: false, error: err("NameConflict") };
      }

      const created = await repo.create({
        userId: input.userId,
        name,
        nameNormalized: nameKey,
        notes: input.notes ?? null,
        dueAt: input.dueAt ?? null,
      });

      return { ok: true, value: created };
    },

    async patchTask(input: {
      userId: string;
      id: number;
      patch: {
        name?: string;
        notes?: string | null;
        dueAt?: Date | null;
        done?: boolean;
      };
    }): Promise<Result<unknown>> {
      const existing = await repo.findById(input.id);
      if (!existing) return { ok: false, error: err("NotFound") };
      if (existing.userId !== input.userId) return { ok: false, error: err("Forbidden") };

      // Example state transition rule:
      // - once done, name is immutable
      if (existing.done && input.patch.name !== undefined) {
        return { ok: false, error: err("InvalidTransition", { message: "Cannot rename a completed task" }) };
      }

      const changes: Record<string, unknown> = {};
      const now = new Date();

      if (input.patch.name !== undefined) {
        const name = normalizeName(input.patch.name);
        const nameKey = normalizeNameKey(name);

        if (await repo.existsNameForUser(input.userId, nameKey, existing.id)) {
          return { ok: false, error: err("NameConflict") };
        }

        changes.name = name;
        changes.nameNormalized = nameKey;
      }

      if (input.patch.notes !== undefined) changes.notes = input.patch.notes;
      if (input.patch.dueAt !== undefined) {
        if (input.patch.dueAt && input.patch.dueAt.getTime() < now.getTime()) {
          return { ok: false, error: err("InvalidDueDate", { message: "dueAt must be in the future" }) };
        }
        changes.dueAt = input.patch.dueAt;
      }

      if (input.patch.done !== undefined) {
        // done=true implies completedAt set; done=false implies cleared
        changes.done = input.patch.done;
        changes.completedAt = input.patch.done ? now : null;
      }

      const updated = await repo.update(existing.id, changes as any);
      if (!updated) return { ok: false, error: err("NotFound") }; // race condition fallback

      return { ok: true, value: updated };
    },
  };
}