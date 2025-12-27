import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "@/http/middlewares/auth";
import { db } from "@/db";
import { members } from "@/db/schema";
import { getUsersPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { and, eq } from "drizzle-orm";
import { roleSchema } from "@saas/auth";

export function updateMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      "/organizations/:slug/members/:memberId",
      {
        schema: {
          tags: ["members"],
          summary: "Update a member",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            memberId: z.uuid(),
          }),
          body: z.object({
            role: roleSchema,
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, memberId } = request.params;

        const userId = await request.getCurrentUserId();

        const { organization, membership } =
          await request.getUserMembership(slug);

        const { cannot } = getUsersPermissions(userId, membership.role);

        if (cannot("update", "User")) {
          throw new UnauthorizedError(
            "You are not allowed to update this member."
          );
        }

        const { role } = request.body;

        await db
          .update(members)
          .set({
            role,
          })
          .where(
            and(
              eq(members.id, memberId),
              eq(members.organizationId, organization.id)
            )
          );

        return reply.status(204).send();
      }
    );
}
