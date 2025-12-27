import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "@/http/middlewares/auth";
import { db } from "@/db";
import { members, users } from "@/db/schema";
import { getUsersPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { asc, eq } from "drizzle-orm";
import { roleSchema } from "@saas/auth";

export function getMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations/:slug/members",
      {
        schema: {
          tags: ["members"],
          summary: "Get all organization members",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              members: z.array(
                z.object({
                  userId: z.uuid(),
                  id: z.uuid(),
                  role: roleSchema,
                  name: z.string().nullable(),
                  email: z.string(),
                  avatarUrl: z.url().nullable(),
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

        if (cannot("get", "User")) {
          throw new UnauthorizedError(
            "You are not allowed to see organization members."
          );
        }

        const rows = await db
          .select({
            id: members.id,
            role: members.role,
            user: {
              id: users.id,
              name: users.name,
              email: users.email,
              avatarUrl: users.avatarUrl,
            },
          })
          .from(members)
          .innerJoin(users, eq(users.id, members.userId))
          .where(eq(members.organizationId, organization.id))
          .orderBy(asc(members.role));

        const membersWithRoles = rows.map(
          ({ user: { id: userId, ...user }, ...member }) => {
            return {
              ...user,
              ...member,
              userId,
            };
          }
        );

        return reply.send({ members: membersWithRoles });
      }
    );
}
