import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { auth } from "@/http/middlewares/auth";
import { z } from "zod";
import { roleSchema } from "@saas/auth";
import { members, organizations } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export function getOrganizations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations",
      {
        schema: {
          tags: ["organizations"],
          summary: "Get organizations where user is a member",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              organizations: z.array(
                z.object({
                  id: z.uuid(),
                  name: z.string(),
                  slug: z.string(),
                  avatarUrl: z.url().nullable(),
                  role: roleSchema,
                })
              ),
            }),
          },
        },
      },
      async (request) => {
        const userId = await request.getCurrentUserId();

        const rows = await db
          .select({
            id: organizations.id,
            name: organizations.name,
            slug: organizations.slug,
            avatarUrl: organizations.avatarUrl,
            role: members.role,
          })
          .from(organizations)
          .innerJoin(members, eq(members.organizationId, organizations.id))
          .where(eq(members.userId, userId));

        return {
          organizations: rows,
        };
      }
    );
}
