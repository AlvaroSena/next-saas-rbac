import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { db } from "@/db";
import { invites, organizations, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "../_errors/not-found-error";
import { roleSchema } from "@saas/auth";

export function getInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/invites/:inviteId",
    {
      schema: {
        tags: ["invites"],
        summary: "Get invite",
        params: z.object({
          inviteId: z.uuid(),
        }),
        response: {
          200: z.object({
            invite: z.object({
              id: z.uuid(),
              email: z.string(),
              role: roleSchema,
              createdAt: z.date(),
              author: z.object({
                id: z.uuid(),
                name: z.string().nullable(),
                avatarUrl: z.string().nullable(),
              }),
              organization: z.object({
                id: z.uuid(),
                name: z.string(),
              }),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { inviteId } = request.params;

      const [invite] = await db
        .select({
          id: invites.id,
          email: invites.email,
          role: invites.role,
          createdAt: invites.createdAt,

          author: {
            id: users.id,
            name: users.name,
            avatarUrl: users.avatarUrl,
          },

          organization: {
            id: organizations.id,
            name: organizations.name,
          },
        })
        .from(invites)
        .innerJoin(users, eq(users.id, invites.authorId))
        .innerJoin(organizations, eq(organizations.id, invites.organizationId))
        .where(eq(invites.id, inviteId));

      if (!invite) {
        throw new NotFoundError("Invite not found");
      }

      return {
        invite,
      };
    }
  );
}
