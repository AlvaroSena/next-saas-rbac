import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "@/http/middlewares/auth";
import { db } from "@/db";
import { invites } from "@/db/schema";
import { getUsersPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { and, eq } from "drizzle-orm";
import { NotFoundError } from "../_errors/not-found-error";

export function revokeInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/organizations/:slug/invites/:inviteId",
      {
        schema: {
          tags: ["invites"],
          summary: "Revoke an invite",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            inviteId: z.uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, inviteId } = request.params;

        const userId = await request.getCurrentUserId();

        const { organization, membership } =
          await request.getUserMembership(slug);

        const { cannot } = getUsersPermissions(userId, membership.role);

        if (cannot("delete", "Invite")) {
          throw new UnauthorizedError(
            "You are not allowed to revoke an invite."
          );
        }

        const [invite] = await db
          .select()
          .from(invites)
          .where(
            and(
              eq(invites.id, inviteId),
              eq(invites.organizationId, organization.id)
            )
          );

        if (!invite) {
          throw new NotFoundError("Invite not found");
        }

        await db.delete(invites).where(eq(invites.id, inviteId));

        return reply.status(204).send();
      }
    );
}
