import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { db } from "@/db";
import { tokens, users } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export async function requestPasswordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/password/recover",
    {
      schema: {
        tags: ["auth"],
        summary: "Request password recover",
        body: z.object({
          email: z.email(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;

      const [userFromEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!userFromEmail) {
        // We don't want people to know if user really exists.
        return reply.status(201).send();
      }

      const [createdToken] = await db
        .insert(tokens)
        .values({
          type: "PASSWORD_RECOVER",
          userId: userFromEmail.id,
        })
        .returning();

      const code = createdToken.id;

      console.log("Recover password token ", code);

      return reply.status(201).send();
    }
  );
}
