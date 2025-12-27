import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "@/http/middlewares/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { createSlug } from "@/utils/create-slug";
import { getUsersPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export function createProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:slug/projects",
      {
        schema: {
          tags: ["projects"],
          summary: "Create a new project",
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            description: z.string(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              projectId: z.uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;

        const userId = await request.getCurrentUserId();

        const { organization, membership } =
          await request.getUserMembership(slug);

        const { cannot } = getUsersPermissions(userId, membership.role);

        if (cannot("create", "Project")) {
          throw new UnauthorizedError(
            "You are not allowed to create news projects."
          );
        }

        const { name, description } = request.body;

        const [project] = await db
          .insert(projects)
          .values({
            name,
            slug: createSlug(name),
            description,
            organizationId: organization.id,
            ownerId: userId,
          })
          .returning();

        return reply.status(201).send({
          projectId: project.id,
        });
      }
    );
}
