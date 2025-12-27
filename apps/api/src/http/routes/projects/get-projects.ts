import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "@/http/middlewares/auth";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { getUsersPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { desc, eq } from "drizzle-orm";

export function getProjects(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations/:slug/projects",
      {
        schema: {
          tags: ["projects"],
          summary: "Get all organization projects",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              projects: z.array(
                z.object({
                  id: z.uuid(),
                  name: z.string(),
                  description: z.string(),
                  slug: z.string(),
                  ownerId: z.uuid(),
                  avatarUrl: z.string().nullable(),
                  organizationId: z.string(),
                  createdAt: z.date(),

                  owner: z.object({
                    id: z.string(),
                    name: z.string().nullable(),
                    avatarUrl: z.string().nullable(),
                  }),
                })
              ),
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

        if (cannot("get", "Project")) {
          throw new UnauthorizedError(
            "You are not allowed to see this projects."
          );
        }

        const rows = await db
          .select({
            id: projects.id,
            name: projects.name,
            description: projects.description,
            slug: projects.slug,
            ownerId: projects.ownerId,
            avatarUrl: projects.avatarUrl,
            organizationId: projects.organizationId,
            createdAt: projects.createdAt,

            owner: {
              id: users.id,
              name: users.name,
              avatarUrl: users.avatarUrl,
            },
          })
          .from(projects)
          .innerJoin(users, eq(users.id, projects.ownerId))
          .where(eq(projects.organizationId, organization.id))
          .orderBy(desc(projects.createdAt));

        return reply.send({ projects: rows });
      }
    );
}
