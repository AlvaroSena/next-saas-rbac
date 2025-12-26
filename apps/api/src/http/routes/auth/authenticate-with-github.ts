import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { BadRequestError } from "../_errors/bad-request-error";
import { env } from "@saas/env";
import { db } from "@/db";
import { accounts, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function authenticateWithGithub(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sessions/github",
    {
      schema: {
        tags: ["auth"],
        summary: "Authenticate with Github",
        body: z.object({
          code: z.string(),
        }),
        // response: {
        //   201: z.object({
        //     token: z.string(),
        //   }),
        // },
      },
    },
    async (request, reply) => {
      const { code } = request.body;

      const githubOAuthURL = new URL(
        "https://github.com/login/oauth/access_token"
      );

      githubOAuthURL.searchParams.set("client_id", env.GITHUB_OAUTH_CLIENT_ID);
      githubOAuthURL.searchParams.set(
        "client_secret",
        env.GITHUB_OAUTH_CLIENT_SECRET
      );
      githubOAuthURL.searchParams.set(
        "redirect_uri",
        env.GITHUB_OAUTH_REDIRECT_URI
      );
      githubOAuthURL.searchParams.set("code", code);

      const githubAccessTokenResponse = await fetch(githubOAuthURL, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      const githubAccessTokenData = await githubAccessTokenResponse.json();

      const { access_token: githubAccessToken } = z
        .object({
          access_token: z.string(),
          token_type: z.literal("bearer"),
          scope: z.string(),
        })
        .parse(githubAccessTokenData);

      const githubUserResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
        },
      });

      const githubUserData = await githubUserResponse.json();

      const {
        id: githubId,
        name,
        email,
        avatar_url: avatarUrl,
      } = z
        .object({
          id: z.int().transform(String),
          avatar_url: z.url(),
          name: z.string().nullable(),
          email: z.string().nullable(),
        })
        .parse(githubUserData);

      if (email === null) {
        throw new BadRequestError(
          "Your github account must have an email to authenticate"
        );
      }

      let [user] = await db.select().from(users).where(eq(users.email, email));

      if (!user) {
        const [userCreated] = await db
          .insert(users)
          .values({
            name,
            email,
            avatarUrl,
          })
          .returning();

        user = userCreated;
      }

      let [account] = await db
        .select()
        .from(accounts)
        .where(
          and(eq(accounts.provider, "GITHUB"), eq(accounts.userId, user.id))
        )
        .limit(1);

      if (!account) {
        const [createdAccount] = await db
          .insert(accounts)
          .values({
            provider: "GITHUB",
            providerAccountId: githubId,
            userId: user.id,
          })
          .returning();

        account = createdAccount;
      }

      const token = await reply.jwtSign(
        {
          sub: user.id,
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
