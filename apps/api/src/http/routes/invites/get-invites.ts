import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "@/http/middlewares/auth";
import { db } from "@/db";
import { invites, users } from "@/db/schema";
import { getUsersPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { roleSchema } from "@saas/auth";
import { desc, eq } from "drizzle-orm";

export function getInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations/:slug/invites",
      {
        schema: {
          tags: ["invites"],
          summary: "Get all organization invites",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              invites: z.array(
                z.object({
                  id: z.uuid(),
                  email: z.string(),
                  role: roleSchema,
                  createdAt: z.date(),
                  author: z.object({
                    id: z.uuid(),
                    name: z.string().nullable(),
                  }),
                })
              ),
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params;

        const userId = await request.getCurrentUserId();

        const { organization, membership } =
          await request.getUserMembership(slug);

        const { cannot } = getUsersPermissions(userId, membership.role);

        if (cannot("get", "Invite")) {
          throw new UnauthorizedError(
            "You are not allowed to get organizations invites"
          );
        }

        const rows = await db
          .select({
            id: invites.id,
            email: invites.email,
            role: invites.role,
            createdAt: invites.createdAt,
            author: {
              id: users.id,
              name: users.name,
            },
          })
          .from(invites)
          .where(eq(invites.organizationId, organization.id))
          .innerJoin(users, eq(users.id, userId))
          .orderBy(desc(invites.createdAt));

        return {
          invites: rows,
        };
      }
    );
}
