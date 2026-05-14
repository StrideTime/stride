import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";
import type { CreateRoute, PatchRoute } from "./tasks.routes";

import { makeTasksService } from "./tasks.service";

type TasksService = ReturnType<typeof makeTasksService>;

function mapDomainError(e: { type: string; message?: string }) {
  switch (e.type) {
    case "NotFound":
      return { status: HttpStatusCodes.NOT_FOUND as const, body: { message: "Not found" } };
    case "Forbidden":
      return { status: HttpStatusCodes.FORBIDDEN as const, body: { message: "Forbidden" } };
    case "NameConflict":
      return { status: HttpStatusCodes.CONFLICT as const, body: { message: "Task name already exists" } };
    case "InvalidTransition":
    case "InvalidDueDate":
      return { status: HttpStatusCodes.CONFLICT as const, body: { message: e.message ?? "Invalid operation" } };
    default:
      return { status: HttpStatusCodes.INTERNAL_SERVER_ERROR as const, body: { message: "Internal error" } };
  }
}

export function makeTasksHandlers(service: TasksService) {
  const create: AppRouteHandler<CreateRoute> = async (c) => {
    const userId = c.get("userId"); // assume auth middleware sets this
    const body = c.req.valid("json");

    const result = await service.createTask({
      userId,
      name: body.name,
      notes: body.notes ?? null,
      dueAt: body.dueAt ?? null,
    });

    if (!result.ok) {
      const mapped = mapDomainError(result.error);
      return c.json(mapped.body as any, mapped.status);
    }

    return c.json(result.value as any, HttpStatusCodes.OK);
  };

  const patch: AppRouteHandler<PatchRoute> = async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const patchBody = c.req.valid("json");

    const result = await service.patchTask({
      userId,
      id,
      patch: patchBody,
    });

    if (!result.ok) {
      const mapped = mapDomainError(result.error);
      return c.json(mapped.body as any, mapped.status);
    }

    return c.json(result.value as any, HttpStatusCodes.OK);
  };

  return { create, patch };
}