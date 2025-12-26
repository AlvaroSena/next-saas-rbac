import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { organizationSchema } from "@saas/auth";
import { auth } from "@/http/middlewares/auth";
import { z } from "zod";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { getUsersPermissions } from "@/utils/get-user-permissions";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

export function shutdownOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/organizations/:slug",
      {
        schema: {
          tags: ["organizations"],
          summary: "Shutdown organization",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;
        const userId = await request.getCurrentUserId();
        const { membership, organization } =
          await request.getUserMembership(slug);

        const authOrganization = organizationSchema.parse(organization);

        const { cannot } = getUsersPermissions(userId, membership.role);

        if (cannot("delete", authOrganization)) {
          throw new UnauthorizedError(
            "You're not allowed to shutdown this organization."
          );
        }

        await db
          .delete(organizations)
          .where(eq(organizations.id, organization.id));

        return reply.status(204).send();
      }
    );
}
