import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { db } from "@/db";
import { invites, members, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "../_errors/not-found-error";
import { auth } from "@/http/middlewares/auth";
import { BadRequestError } from "../_errors/bad-request-error";

export function acceptInvite(app: FastifyInstance) {
  app
    .register(auth)
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/invites/:inviteId/accept",
      {
        schema: {
          tags: ["invites"],
          summary: "Accept an invite",
          params: z.object({
            inviteId: z.uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { inviteId } = request.params;

        const [invite] = await db
          .select()
          .from(invites)
          .where(eq(invites.id, inviteId));

        if (!invite) {
          throw new NotFoundError("Invite not found or expired");
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId));

        if (!user) {
          throw new NotFoundError("User not found.");
        }

        if (invite.email !== user.email) {
          throw new BadRequestError("This invite belongs to another user.");
        }

        await db.transaction(async (tx) => {
          await tx.insert(members).values({
            userId,
            organizationId: invite.organizationId,
            role: invite.role,
          });

          await tx.delete(invites).where(eq(invites.id, inviteId));
        });

        return reply.status(204).send();
      }
    );
}
