import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { db } from "@/db";
import { invites, organizations, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "../_errors/not-found-error";
import { auth } from "@/http/middlewares/auth";
import { roleSchema } from "@saas/auth";

export function getPendingInvites(app: FastifyInstance) {
  app
    .register(auth)
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/pending-invites",
      {
        schema: {
          tags: ["invites"],
          summary: "Get all user pending invites",
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
                    avatarUrl: z.string().nullable(),
                  }),
                  organization: z.object({
                    id: z.uuid(),
                    name: z.string(),
                  }),
                })
              ),
            }),
          },
        },
      },
      async (request) => {
        const userId = await request.getCurrentUserId();

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId));

        if (!user) {
          throw new NotFoundError("User not found.");
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
              avatarUrl: users.avatarUrl,
            },

            organization: {
              id: organizations.id,
              name: organizations.name,
            },
          })
          .from(invites)
          .innerJoin(users, eq(users.id, invites.authorId))
          .innerJoin(
            organizations,
            eq(organizations.id, invites.organizationId)
          )
          .where(eq(invites.email, user.email));

        return {
          invites: rows,
        };
      }
    );
}
