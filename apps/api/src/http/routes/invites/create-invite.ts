import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "@/http/middlewares/auth";
import { db } from "@/db";
import { invites, members, organizations, users } from "@/db/schema";
import { getUsersPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { roleSchema } from "@saas/auth";
import { BadRequestError } from "../_errors/bad-request-error";
import { and, eq } from "drizzle-orm";

export function createInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:slug/invites",
      {
        schema: {
          tags: ["invites"],
          summary: "Create a new invite",
          security: [{ bearerAuth: [] }],
          body: z.object({
            email: z.email(),
            role: roleSchema,
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              inviteId: z.uuid(),
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

        if (cannot("create", "Invite")) {
          throw new UnauthorizedError(
            "You are not allowed to create new invites."
          );
        }

        const { email, role } = request.body;

        const [, domain] = email.split("@");

        if (
          organization.shouldAttachUsersByDomain &&
          organization.domain === domain
        ) {
          throw new BadRequestError(
            `Users with "${domain}" domain will join your automatically on login.`
          );
        }

        const [inviteWithSameEmail] = await db
          .select()
          .from(invites)
          .where(
            and(
              eq(invites.email, email),
              eq(invites.organizationId, organization.id)
            )
          );

        if (inviteWithSameEmail) {
          throw new BadRequestError(
            "Another invite with same e-mail already exists."
          );
        }

        // const [memberWithSameEmail] = await db
        //   .select()
        //   .from(members)
        //   .where(
        //     and(eq(users.email, email), eq(organizations.id, organization.id))
        //   );

        // if (memberWithSameEmail) {
        //   throw new BadRequestError(
        //     "A member with this e-mail already belongs to your organization."
        //   );
        // }

        const [invite] = await db
          .insert(invites)
          .values({
            organizationId: organization.id,
            email,
            role,
            authorId: userId,
          })
          .returning();

        return reply.status(201).send({
          inviteId: invite.id,
        });
      }
    );
}
