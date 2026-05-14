import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { createTaskBodySchema, patchTaskBodySchema, selectTaskSchema } from "@/db/schema/tasks";

const tags = ["Tasks"];

export const create = createRoute({
  method: "post",
  path: "/tasks",
  tags,
  request: {
    body: jsonContentRequired(createTaskBodySchema, "Create task"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectTaskSchema, "Created task"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createTaskBodySchema),
      "Validation error(s)",
    ),
    [HttpStatusCodes.CONFLICT]: {
      description: "Task name already exists",
    },
  },
});

export const patch = createRoute({
  method: "patch",
  path: "/tasks/{id}",
  tags,
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(patchTaskBodySchema, "Update task"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectTaskSchema, "Updated task"),
    [HttpStatusCodes.NOT_FOUND]: { description: "Not found" },
    [HttpStatusCodes.FORBIDDEN]: { description: "Not your task" },
    [HttpStatusCodes.CONFLICT]: { description: "Name conflict / invalid transition" },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchTaskBodySchema).or(createErrorSchema(IdParamsSchema)),
      "Validation error(s)",
    ),
  },
});

export type CreateRoute = typeof create;
export type PatchRoute = typeof patch;