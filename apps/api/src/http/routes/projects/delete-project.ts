import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "@/http/middlewares/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getUsersPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { projectSchema } from "@saas/auth";
import { and, eq } from "drizzle-orm";
import { BadRequestError } from "../_errors/bad-request-error";

export function deleteProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/organizations/:slug/projects/:projectId",
      {
        schema: {
          tags: ["projects"],
          summary: "Delete a project",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            projectId: z.uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, projectId } = request.params;

        const userId = await request.getCurrentUserId();

        const { organization, membership } =
          await request.getUserMembership(slug);

        const project = await db
          .select()
          .from(projects)
          .where(
            and(
              eq(projects.id, projectId),
              eq(projects.organizationId, organization.id)
            )
          );

        if (!project) {
          throw new BadRequestError("Project not found");
        }

        const { cannot } = getUsersPermissions(userId, membership.role);

        const authProject = projectSchema.parse(project);

        if (cannot("delete", authProject)) {
          throw new UnauthorizedError(
            "You are not allowed to delete this project."
          );
        }

        await db.delete(projects).where(eq(projects.id, projectId));

        return reply.status(204).send();
      }
    );
}
