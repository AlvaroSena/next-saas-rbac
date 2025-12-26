import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { hash } from "bcryptjs";
import { BadRequestError } from "../_errors/bad-request-error";
import { db } from "@/db";
import { members, organizations, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        tags: ["auth"],
        summary: "Create a new account",
        body: z.object({
          name: z.string(),
          email: z.email(),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body;

      const [userWithSameEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (userWithSameEmail) {
        throw new BadRequestError("User with same email already exists.");
      }

      const [, domain] = email.split("@");

      const [autoJoinOrganization] = await db
        .select()
        .from(organizations)
        .where(
          and(
            eq(organizations.domain, domain),
            eq(organizations.shouldAttachUsersByDomain, true)
          )
        );

      const passwordHash = await hash(password, 6);

      await db.transaction(async (tx) => {
        const [user] = await tx
          .insert(users)
          .values({
            name,
            email,
            passwordHash,
          })
          .returning();

        if (autoJoinOrganization) {
          await tx.insert(members).values({
            userId: user.id,
            organizationId: autoJoinOrganization.id,
          });
        }
      });

      return reply.status(201).send();
    }
  );
}
