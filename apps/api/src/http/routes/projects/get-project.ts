import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "@/http/middlewares/auth";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { getUsersPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { and, eq } from "drizzle-orm";
import { NotFoundError } from "../_errors/not-found-error";

export function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:orgSlug/projects/:projectSlug",
      {
        schema: {
          tags: ["projects"],
          summary: "Get a project details",
          security: [{ bearerAuth: [] }],
          params: z.object({
            orgSlug: z.string(),
            projectSlug: z.uuid(),
          }),
          response: {
            200: z.object({
              project: z.object({
                id: z.uuid(),
                name: z.string(),
                description: z.string(),
                slug: z.string(),
                ownerId: z.uuid(),
                avatarUrl: z.string().nullable(),
                organizationId: z.string(),
                owner: z.object({
                  id: z.string(),
                  name: z.string().nullable(),
                  avatarUrl: z.string().nullable(),
                }),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { orgSlug, projectSlug } = request.params;

        const userId = await request.getCurrentUserId();

        const { organization, membership } =
          await request.getUserMembership(orgSlug);

        const { cannot } = getUsersPermissions(userId, membership.role);

        if (cannot("get", "Project")) {
          throw new UnauthorizedError(
            "You are not allowed to see this project."
          );
        }

        const [project] = await db
          .select({
            id: projects.id,
            name: projects.name,
            description: projects.description,
            slug: projects.slug,
            ownerId: projects.ownerId,
            avatarUrl: projects.avatarUrl,
            organizationId: projects.organizationId,

            owner: {
              id: users.id,
              name: users.name,
              avatarUrl: users.avatarUrl,
            },
          })
          .from(projects)
          .innerJoin(users, eq(projects.ownerId, userId))
          .where(
            and(
              eq(projects.slug, projectSlug),
              eq(projects.organizationId, organization.id)
            )
          );

        if (!project) {
          throw new NotFoundError("Project not found");
        }

        return reply.send({ project });
      }
    );
}
