import "fastify";

import type { InferSelectModel } from "drizzle-orm";
import { organizations, members } from "@/db/schema";

export type Organization = InferSelectModel<typeof organizations>;
export type Member = InferSelectModel<typeof members>;

declare module "fastify" {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>;
    getUserMembership(
      slug: string
    ): Promise<{ organization: Organization; membership: Member }>;
  }
}
