import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "@/http/middlewares/auth";
import { db } from "@/db";
import { organizations, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BadRequestError } from "../_errors/bad-request-error";
import { createSlug } from "@/utils/create-slug";

export function createOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations",
      {
        schema: {
          tags: ["organizations"],
          summary: "Create a new organization",
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
          }),
          response: {
            201: z.object({
              organizationId: z.uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { name, domain, shouldAttachUsersByDomain } = request.body;

        if (!domain) {
          throw new BadRequestError("Domain is required.");
        }

        const existingOrg = await db
          .select({ id: organizations.id })
          .from(organizations)
          .where(eq(organizations.domain, domain))
          .limit(1)
          .then((rows) => rows[0]);

        if (existingOrg) {
          throw new BadRequestError(
            "Another organization with same domain already exists."
          );
        }

        const organizationId = await db.transaction(async (tx) => {
          // cria organização
          const [organization] = await tx
            .insert(organizations)
            .values({
              name,
              slug: createSlug(name),
              domain,
              shouldAttachUsersByDomain,
              ownerId: userId,
            })
            .returning();

          // cria membro ADMIN
          await tx.insert(members).values({
            organizationId: organization.id,
            userId,
            role: "ADMIN",
          });

          return organization.id;
        });

        return reply.status(201).send({
          organizationId,
        });
      }
    );
}
