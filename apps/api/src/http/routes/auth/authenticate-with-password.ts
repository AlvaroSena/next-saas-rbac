import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { compare } from "bcryptjs";
import { BadRequestError } from "../_errors/bad-request-error";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sessions/password",
    {
      schema: {
        tags: ["auth"],
        summary: "Authenticate with e-mail and password",
        body: z.object({
          email: z.email(),
          password: z.string().min(6),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const [userFromEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!userFromEmail) {
        throw new BadRequestError("Invalid credentials.");
      }

      if (userFromEmail.passwordHash === null) {
        throw new BadRequestError(
          "User does not have a password. Use social login."
        );
      }

      const isPasswordValid = await compare(
        password,
        userFromEmail.passwordHash
      );

      if (!isPasswordValid) {
        throw new BadRequestError("Invalid credentials.");
      }

      const token = await reply.jwtSign(
        {
          sub: userFromEmail.id,
        },
        {
          sign: {
            expiresIn: "7d",
          },
        }
      );

      return reply.status(201).send({ token });
    }
  );
}
