import { FastifyInstance } from "fastify";
import { UnauthorizedError } from "../routes/_errors/unauthorized-error";
import { fastifyPlugin } from "fastify-plugin";
import { db } from "@/db";
import { members, organizations } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>();

        return sub;
      } catch {
        throw new UnauthorizedError("Invalid auth token");
      }
    };

    request.getUserMembership = async (slug: string) => {
      const userId = await request.getCurrentUserId();

      const [member] = await db
        .select({
          id: members.id,
          role: members.role,
          userId: members.userId,
          organizationId: members.organizationId,

          organization: {
            id: organizations.id,
            name: organizations.name,
            slug: organizations.slug,
            domain: organizations.domain,
            shouldAttachUsersByDomain: organizations.shouldAttachUsersByDomain,
            avatarUrl: organizations.avatarUrl,
            createdAt: organizations.createdAt,
            updatedAt: organizations.updatedAt,
            ownerId: organizations.ownerId,
          },
        })
        .from(members)
        .innerJoin(organizations, eq(members.organizationId, organizations.id))
        .where(and(eq(members.userId, userId), eq(organizations.slug, slug)))
        .limit(1);

      if (!member) {
        throw new UnauthorizedError(
          "You aren't a member of this organization."
        );
      }

      const { organization, ...membership } = member;

      return {
        organization,
        membership,
      };
    };
  });
});
