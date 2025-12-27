import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from "zod";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { hash } from "bcryptjs";
import { db } from "@/db";
import { tokens, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function resetPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/password/reset",
    {
      schema: {
        tags: ["auth"],
        summary: "Reset password",
        body: z.object({
          code: z.string(),
          password: z.string().min(6),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { code, password } = request.body;

      const [tokenFromCode] = await db
        .select()
        .from(tokens)
        .where(eq(tokens.id, code));

      if (!tokenFromCode) {
        throw new UnauthorizedError();
      }

      const passwordHash = await hash(password, 6);

      await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({
            passwordHash,
          })
          .where(eq(users.id, tokenFromCode.userId));

        await tx.delete(tokens).where(eq(tokens.id, code));
      });

      return reply.status(204).send();
    }
  );
}
