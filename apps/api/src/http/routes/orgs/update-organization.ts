import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { organizationSchema } from "@saas/auth";
import { auth } from "@/http/middlewares/auth";
import { z } from "zod";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { BadRequestError } from "../_errors/bad-request-error";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { getUsersPermissions } from "@/utils/get-user-permissions";

export function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:slug",
      {
        schema: {
          tags: ["organizations"],
          summary: "Update organization details",
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
          }),
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

        const { name, domain, shouldAttachUsersByDomain } = request.body;

        const authOrganization = organizationSchema.parse(organization);
        const { cannot } = getUsersPermissions(userId, membership.role);

        if (cannot("update", authOrganization)) {
          throw new UnauthorizedError(
            "You're not allowed to update this organization."
          );
        }

        if (domain) {
          const existingOrg = await db
            .select({ id: organizations.id })
            .from(organizations)
            .where(
              and(
                eq(organizations.domain, domain),
                ne(organizations.id, organization.id)
              )
            )
            .limit(1)
            .then((rows) => rows[0]);

          if (existingOrg) {
            throw new BadRequestError(
              "Another organization with same domain already exists."
            );
          }

          await db
            .update(organizations)
            .set({
              name,
              domain,
              shouldAttachUsersByDomain,
            })
            .where(eq(organizations.id, organization.id));

          return reply.status(204).send();
        }
      }
    );
}
